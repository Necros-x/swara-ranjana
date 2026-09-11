-- Swara Ranjana — Phase 7D
-- Service-role bridge for customer cancellation/refund actions.
-- The server action authenticates the user first, then calls this function
-- with the verified auth user id. This avoids relying on the browser RPC
-- request's JWT context for the mutation itself.

create or replace function public.customer_order_action_server(
  p_auth_user_id uuid,
  p_order_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_customer public.customers%rowtype;
  v_order public.orders%rowtype;
  v_event public.events%rowtype;
  v_pending_request public.customer_order_requests%rowtype;
  v_request public.customer_order_requests%rowtype;
  v_used_count integer := 0;
  v_pending_slip_count integer := 0;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if p_auth_user_id is null then
    raise exception 'Authenticated customer required' using errcode = '42501';
  end if;

  if v_reason is not null and char_length(v_reason) > 1000 then
    return jsonb_build_object(
      'ok', false,
      'code', 'REASON_TOO_LONG',
      'message', 'Please keep your reason under 1000 characters.'
    );
  end if;

  select * into v_customer
    from public.customers
   where auth_user_id = p_auth_user_id;

  if not found then
    raise exception 'Customer account required' using errcode = '42501';
  end if;

  select * into v_order
    from public.orders
   where id = p_order_id
     and customer_id = v_customer.id
   for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_FOUND',
      'message', 'Order not found.'
    );
  end if;

  select * into v_event
    from public.events
   where id = v_order.event_id;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'EVENT_NOT_FOUND',
      'message', 'Event not found.'
    );
  end if;

  if v_order.status in ('CANCELLED', 'REFUNDED') then
    return jsonb_build_object(
      'ok', false,
      'code', 'ORDER_CLOSED',
      'message', 'This order is already closed.'
    );
  end if;

  if v_event.starts_at <= now() then
    return jsonb_build_object(
      'ok', false,
      'code', 'EVENT_STARTED',
      'message', 'Online cancellation and refund requests close once the event begins. Please contact the box office.'
    );
  end if;

  select count(*)::integer into v_used_count
    from public.tickets
   where order_id = v_order.id
     and status = 'USED';

  if v_used_count > 0 then
    return jsonb_build_object(
      'ok', false,
      'code', 'TICKET_USED',
      'message', 'This order contains an already-used ticket and cannot be changed online.'
    );
  end if;

  select * into v_pending_request
    from public.customer_order_requests
   where order_id = v_order.id
     and status = 'PENDING'
   order by created_at desc
   limit 1;

  if found then
    return jsonb_build_object(
      'ok', true,
      'reused', true,
      'action', case when v_pending_request.kind = 'REFUND' then 'REFUND_REQUESTED' else 'CANCEL_REQUESTED' end,
      'request_id', v_pending_request.id,
      'message', case when v_pending_request.kind = 'REFUND'
        then 'Your refund request is already awaiting review.'
        else 'Your cancellation request is already awaiting review.' end
    );
  end if;

  select count(*)::integer into v_pending_slip_count
    from public.payment_submissions
   where order_id = v_order.id
     and status = 'PENDING';

  if v_order.payment_status = 'PAID' then
    insert into public.customer_order_requests(order_id, customer_id, kind, reason)
    values(v_order.id, v_customer.id, 'REFUND', v_reason)
    returning * into v_request;

    return jsonb_build_object(
      'ok', true,
      'reused', false,
      'action', 'REFUND_REQUESTED',
      'request_id', v_request.id,
      'message', 'Refund request submitted. Your tickets remain active until the refund is approved and completed.'
    );
  end if;

  if v_pending_slip_count > 0 then
    insert into public.customer_order_requests(order_id, customer_id, kind, reason)
    values(v_order.id, v_customer.id, 'CANCEL', v_reason)
    returning * into v_request;

    return jsonb_build_object(
      'ok', true,
      'reused', false,
      'action', 'CANCEL_REQUESTED',
      'request_id', v_request.id,
      'message', 'Cancellation request submitted. Because a payment slip is awaiting review, staff must confirm it first.'
    );
  end if;

  update public.orders
     set status = 'CANCELLED',
         expires_at = now(),
         updated_at = now()
   where id = v_order.id;

  update public.tickets
     set status = 'REVOKED',
         revoked_at = now(),
         revoked_by = null,
         revoke_reason = 'Cancelled by customer',
         updated_at = now()
   where order_id = v_order.id
     and status = 'VALID';

  return jsonb_build_object(
    'ok', true,
    'reused', false,
    'action', 'CANCELLED',
    'message', 'Your reservation has been cancelled.'
  );
end;
$$;

revoke all on function public.customer_order_action_server(uuid,uuid,text) from public;
revoke all on function public.customer_order_action_server(uuid,uuid,text) from anon;
revoke all on function public.customer_order_action_server(uuid,uuid,text) from authenticated;
grant execute on function public.customer_order_action_server(uuid,uuid,text) to service_role;
