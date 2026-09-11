-- Swara Ranjana — Phase 9B
-- Separate on-arrival payment collection from gate admission.

create or replace function public.collect_on_arrival_payment_server(
  p_staff_user_id uuid,
  p_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_staff public.staff_profiles%rowtype;
  v_order public.orders%rowtype;
  v_customer public.customers%rowtype;
  v_event public.events%rowtype;
  v_now timestamptz := now();
begin
  if p_staff_user_id is null then
    raise exception 'Box office access required' using errcode = '42501';
  end if;

  select * into v_staff
  from public.staff_profiles
  where user_id = p_staff_user_id
    and status = 'ACTIVE';

  if not found or v_staff.role not in ('SUPER_ADMIN','ADMIN','BOX_OFFICE') then
    raise exception 'Box office access required' using errcode = '42501';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'ORDER_NOT_FOUND',
      'message', 'Reservation not found.'
    );
  end if;

  if v_order.payment_method <> 'ON_ARRIVAL' then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_ON_ARRIVAL',
      'message', 'This reservation is not configured for on-arrival payment.'
    );
  end if;

  if v_order.status <> 'CONFIRMED' then
    return jsonb_build_object(
      'ok', false,
      'code', 'ORDER_NOT_CONFIRMED',
      'message', 'This reservation is not active.'
    );
  end if;

  select * into v_customer from public.customers where id = v_order.customer_id;
  select * into v_event from public.events where id = v_order.event_id;

  if v_order.payment_status = 'PAID' then
    return jsonb_build_object(
      'ok', true,
      'reused', true,
      'message', 'Payment was already recorded.',
      'orderId', v_order.id,
      'orderNumber', v_order.order_number,
      'customerName', coalesce(v_customer.full_name, 'Guest'),
      'eventName', coalesce(v_event.name, 'Event'),
      'paymentStatus', 'PAID',
      'amount', v_order.total_lkr,
      'currency', v_order.currency,
      'paidAt', v_order.paid_at
    );
  end if;

  if v_order.payment_status <> 'PENDING' then
    return jsonb_build_object(
      'ok', false,
      'code', 'PAYMENT_NOT_PENDING',
      'message', 'This payment cannot be collected from the counter.'
    );
  end if;

  update public.orders
  set payment_status = 'PAID',
      paid_at = v_now,
      payment_provider = 'ON_ARRIVAL',
      payment_reference = coalesce(payment_reference, 'ARRIVAL-' || v_order.order_number),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'arrival_payment_collected_by', p_staff_user_id,
        'arrival_payment_collected_at', v_now
      ),
      updated_at = v_now
  where id = v_order.id
  returning * into v_order;

  return jsonb_build_object(
    'ok', true,
    'reused', false,
    'message', 'Payment recorded. Send the guest to the gate for admission.',
    'orderId', v_order.id,
    'orderNumber', v_order.order_number,
    'customerName', coalesce(v_customer.full_name, 'Guest'),
    'eventName', coalesce(v_event.name, 'Event'),
    'paymentStatus', 'PAID',
    'amount', v_order.total_lkr,
    'currency', v_order.currency,
    'paidAt', v_order.paid_at
  );
end;
$$;

revoke all on function public.collect_on_arrival_payment_server(uuid, uuid) from public;
revoke all on function public.collect_on_arrival_payment_server(uuid, uuid) from anon;
revoke all on function public.collect_on_arrival_payment_server(uuid, uuid) from authenticated;
grant execute on function public.collect_on_arrival_payment_server(uuid, uuid) to service_role;
