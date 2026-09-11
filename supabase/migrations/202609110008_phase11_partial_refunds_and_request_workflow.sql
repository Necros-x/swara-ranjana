-- Swara Ranjana — Phase 11
-- Partial refunds, admin request workflow, and bank-slip cancellation race guard.
-- Already applied to the connected Supabase project; keep this file for history/reproducibility.

alter table public.customer_order_requests
  add column if not exists scope text not null default 'FULL',
  add column if not exists requested_amount_lkr integer,
  add column if not exists approved_amount_lkr integer,
  add column if not exists refund_reference text,
  add column if not exists completed_at timestamptz;

alter table public.customer_order_requests drop constraint if exists customer_order_requests_scope_check;
alter table public.customer_order_requests add constraint customer_order_requests_scope_check check (scope in ('FULL','PARTIAL'));
alter table public.customer_order_requests drop constraint if exists customer_order_requests_requested_amount_check;
alter table public.customer_order_requests add constraint customer_order_requests_requested_amount_check check (requested_amount_lkr is null or requested_amount_lkr >= 0);
alter table public.customer_order_requests drop constraint if exists customer_order_requests_approved_amount_check;
alter table public.customer_order_requests add constraint customer_order_requests_approved_amount_check check (approved_amount_lkr is null or approved_amount_lkr >= 0);
alter table public.customer_order_requests drop constraint if exists customer_order_requests_status_check;
alter table public.customer_order_requests add constraint customer_order_requests_status_check check (status in ('PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED'));

create table if not exists public.customer_order_request_tickets (
  request_id uuid not null references public.customer_order_requests(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  amount_lkr integer not null check (amount_lkr >= 0),
  created_at timestamptz not null default now(),
  primary key (request_id, ticket_id)
);

create index if not exists customer_order_request_tickets_ticket_idx on public.customer_order_request_tickets(ticket_id);
alter table public.customer_order_request_tickets enable row level security;
revoke all on public.customer_order_request_tickets from anon;
revoke insert, update, delete on public.customer_order_request_tickets from authenticated;
grant select on public.customer_order_request_tickets to authenticated;
grant all on public.customer_order_request_tickets to service_role;

drop policy if exists customer_request_tickets_select_own on public.customer_order_request_tickets;
create policy customer_request_tickets_select_own
on public.customer_order_request_tickets for select to authenticated
using (
  exists (
    select 1
    from public.customer_order_requests r
    join public.customers c on c.id = r.customer_id
    where r.id = customer_order_request_tickets.request_id
      and c.auth_user_id = auth.uid()
  )
);

drop index if exists public.customer_order_requests_one_pending_idx;
create unique index customer_order_requests_one_active_idx
  on public.customer_order_requests(order_id)
  where status in ('PENDING','APPROVED');

drop function if exists public.customer_order_action_server(uuid,uuid,text);

create function public.customer_order_action_server(
  p_auth_user_id uuid,
  p_order_id uuid,
  p_reason text default null,
  p_ticket_ids uuid[] default null
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
  v_active_request public.customer_order_requests%rowtype;
  v_request public.customer_order_requests%rowtype;
  v_pending_slip_count integer := 0;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_selected_count integer := 0;
  v_valid_count integer := 0;
  v_requested_count integer := 0;
  v_requested_amount integer := 0;
  v_scope text := 'FULL';
begin
  if p_auth_user_id is null then
    raise exception 'Authenticated customer required' using errcode = '42501';
  end if;

  if v_reason is not null and char_length(v_reason) > 1000 then
    return jsonb_build_object('ok', false, 'code', 'REASON_TOO_LONG', 'message', 'Please keep your reason under 1000 characters.');
  end if;

  select * into v_customer from public.customers where auth_user_id = p_auth_user_id;
  if not found then raise exception 'Customer account required' using errcode = '42501'; end if;

  select * into v_order from public.orders where id = p_order_id and customer_id = v_customer.id for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Order not found.'); end if;

  select * into v_event from public.events where id = v_order.event_id;
  if not found then return jsonb_build_object('ok', false, 'code', 'EVENT_NOT_FOUND', 'message', 'Event not found.'); end if;

  if v_order.status in ('CANCELLED','REFUNDED') then
    return jsonb_build_object('ok', false, 'code', 'ORDER_CLOSED', 'message', 'This order is already closed.');
  end if;

  if v_event.starts_at <= now() then
    return jsonb_build_object('ok', false, 'code', 'REFUND_WINDOW_CLOSED', 'message', 'Cancellations and refunds are no longer available once the show begins.');
  end if;

  select * into v_active_request
  from public.customer_order_requests
  where order_id = v_order.id and status in ('PENDING','APPROVED')
  order by created_at desc limit 1;

  if found then
    return jsonb_build_object(
      'ok', true,
      'reused', true,
      'action', case when v_active_request.kind = 'REFUND' then 'REFUND_REQUESTED' else 'CANCEL_REQUESTED' end,
      'request_id', v_active_request.id,
      'message', case
        when v_active_request.kind = 'REFUND' and v_active_request.status = 'APPROVED' then 'Your refund is approved and awaiting completion.'
        when v_active_request.kind = 'REFUND' then 'Your refund request is already awaiting review.'
        else 'Your cancellation request is already awaiting review.'
      end
    );
  end if;

  select count(*)::integer into v_pending_slip_count
  from public.payment_submissions
  where order_id = v_order.id and status = 'PENDING';

  if v_order.payment_status in ('PAID','PARTIALLY_REFUNDED') then
    select count(*)::integer into v_valid_count from public.tickets where order_id = v_order.id and status = 'VALID';
    if v_valid_count = 0 then return jsonb_build_object('ok', false, 'code', 'NO_REFUNDABLE_TICKETS', 'message', 'There are no refundable tickets remaining on this order.'); end if;

    if p_ticket_ids is null or cardinality(p_ticket_ids) = 0 then
      select array_agg(id order by ticket_number) into p_ticket_ids from public.tickets where order_id = v_order.id and status = 'VALID';
    end if;

    select count(*)::integer into v_requested_count from (select distinct unnest(p_ticket_ids) as id) requested;

    select count(*)::integer,
           coalesce(sum(case when v_order.subtotal_lkr > 0
             then round(oi.unit_price_lkr::numeric * v_order.total_lkr::numeric / v_order.subtotal_lkr::numeric)::integer
             else oi.unit_price_lkr end), 0)::integer
      into v_selected_count, v_requested_amount
    from public.tickets t
    join public.order_items oi on oi.id = t.order_item_id
    where t.order_id = v_order.id and t.status = 'VALID'
      and t.id in (select distinct unnest(p_ticket_ids));

    if v_selected_count = 0 or v_selected_count <> v_requested_count then
      return jsonb_build_object('ok', false, 'code', 'INVALID_REFUND_SELECTION', 'message', 'One or more selected tickets are not eligible for refund. Refresh your account and try again.');
    end if;

    v_scope := case when v_selected_count = v_valid_count then 'FULL' else 'PARTIAL' end;

    insert into public.customer_order_requests(order_id,customer_id,kind,scope,reason,requested_amount_lkr)
    values(v_order.id,v_customer.id,'REFUND',v_scope,v_reason,v_requested_amount)
    returning * into v_request;

    insert into public.customer_order_request_tickets(request_id,ticket_id,amount_lkr)
    select v_request.id,t.id,
           case when v_order.subtotal_lkr > 0
             then round(oi.unit_price_lkr::numeric * v_order.total_lkr::numeric / v_order.subtotal_lkr::numeric)::integer
             else oi.unit_price_lkr end
    from public.tickets t
    join public.order_items oi on oi.id=t.order_item_id
    where t.order_id=v_order.id and t.status='VALID'
      and t.id in (select distinct unnest(p_ticket_ids));

    return jsonb_build_object(
      'ok', true, 'reused', false, 'action', 'REFUND_REQUESTED', 'request_id', v_request.id,
      'scope', v_scope, 'ticket_count', v_selected_count, 'requested_amount_lkr', v_requested_amount,
      'message', format('%s refund request submitted for %s ticket%s. Tickets remain active until the refund is completed.', initcap(lower(v_scope)), v_selected_count, case when v_selected_count = 1 then '' else 's' end)
    );
  end if;

  if v_pending_slip_count > 0 then
    insert into public.customer_order_requests(order_id,customer_id,kind,scope,reason,requested_amount_lkr)
    values(v_order.id,v_customer.id,'CANCEL','FULL',v_reason,0)
    returning * into v_request;
    return jsonb_build_object('ok',true,'reused',false,'action','CANCEL_REQUESTED','request_id',v_request.id,'message','Cancellation request submitted. Because a payment slip is awaiting review, staff must resolve the cancellation before approving that payment.');
  end if;

  update public.orders set status='CANCELLED',expires_at=now(),updated_at=now() where id=v_order.id;
  update public.tickets set status='REVOKED',revoked_at=now(),revoked_by=null,revoke_reason='Cancelled by customer',updated_at=now() where order_id=v_order.id and status='VALID';
  return jsonb_build_object('ok',true,'reused',false,'action','CANCELLED','message','Your reservation has been cancelled.');
end;
$$;

revoke all on function public.customer_order_action_server(uuid,uuid,text,uuid[]) from public;
revoke all on function public.customer_order_action_server(uuid,uuid,text,uuid[]) from anon;
revoke all on function public.customer_order_action_server(uuid,uuid,text,uuid[]) from authenticated;
grant execute on function public.customer_order_action_server(uuid,uuid,text,uuid[]) to service_role;

create or replace function public.review_customer_order_request_server(
  p_staff_user_id uuid,
  p_request_id uuid,
  p_action text,
  p_staff_note text default null,
  p_refund_reference text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_request public.customer_order_requests%rowtype;
  v_order public.orders%rowtype;
  v_event public.events%rowtype;
  v_action text := upper(btrim(coalesce(p_action,'')));
  v_note text := nullif(btrim(coalesce(p_staff_note,'')), '');
  v_reference text := nullif(btrim(coalesce(p_refund_reference,'')), '');
  v_selected_count integer := 0;
  v_invalid_count integer := 0;
  v_all_count integer := 0;
  v_refunded_count integer := 0;
begin
  if not exists (
    select 1 from public.staff_profiles
    where user_id=p_staff_user_id and status='ACTIVE' and role in ('SUPER_ADMIN','ADMIN')
  ) then raise exception 'Administrator access required' using errcode='42501'; end if;

  select * into v_request from public.customer_order_requests where id=p_request_id for update;
  if not found then return jsonb_build_object('ok',false,'code','NOT_FOUND','message','Request not found.'); end if;
  select * into v_order from public.orders where id=v_request.order_id for update;
  select * into v_event from public.events where id=v_order.event_id;

  if v_action='REJECT' then
    if v_request.status not in ('PENDING','APPROVED') then return jsonb_build_object('ok',false,'code','REQUEST_CLOSED','message','This request has already been resolved.'); end if;
    update public.customer_order_requests set status='REJECTED',staff_note=v_note,reviewed_at=now(),reviewed_by=p_staff_user_id,updated_at=now() where id=v_request.id;
    return jsonb_build_object('ok',true,'action','REJECTED','message','Request rejected.');
  end if;

  if v_request.kind='CANCEL' then
    if v_action<>'APPROVE' then return jsonb_build_object('ok',false,'code','INVALID_ACTION','message','Cancellation requests can only be approved or rejected.'); end if;
    if v_request.status<>'PENDING' then return jsonb_build_object('ok',false,'code','REQUEST_CLOSED','message','This cancellation request has already been resolved.'); end if;
    if v_order.payment_status in ('PAID','PARTIALLY_REFUNDED') then return jsonb_build_object('ok',false,'code','PAYMENT_ALREADY_ACCEPTED','message','Payment has already been accepted. Reject this cancellation and use the refund workflow instead.'); end if;

    update public.payment_submissions set status='REJECTED',reviewed_at=now(),reviewed_by=p_staff_user_id,rejection_reason=coalesce(v_note,'Reservation cancelled before payment approval') where order_id=v_order.id and status='PENDING';
    update public.orders set status='CANCELLED',expires_at=now(),updated_at=now() where id=v_order.id;
    update public.tickets set status='REVOKED',revoked_at=now(),revoked_by=p_staff_user_id,revoke_reason='Cancellation approved by staff',updated_at=now() where order_id=v_order.id and status='VALID';
    update public.customer_order_requests set status='COMPLETED',staff_note=v_note,reviewed_at=now(),reviewed_by=p_staff_user_id,completed_at=now(),updated_at=now() where id=v_request.id;
    return jsonb_build_object('ok',true,'action','CANCELLATION_COMPLETED','message','Cancellation approved and reservation closed.');
  end if;

  if v_request.kind<>'REFUND' then return jsonb_build_object('ok',false,'code','INVALID_REQUEST','message','Unsupported request type.'); end if;
  if v_event.starts_at<=now() then return jsonb_build_object('ok',false,'code','REFUND_WINDOW_CLOSED','message','Refunds cannot be approved or completed once the show begins.'); end if;

  select count(*)::integer into v_selected_count from public.customer_order_request_tickets where request_id=v_request.id;
  if v_selected_count=0 then return jsonb_build_object('ok',false,'code','NO_TICKETS','message','This refund request has no selected tickets.'); end if;
  select count(*)::integer into v_invalid_count from public.customer_order_request_tickets rt join public.tickets t on t.id=rt.ticket_id where rt.request_id=v_request.id and t.status<>'VALID';
  if v_invalid_count>0 then return jsonb_build_object('ok',false,'code','TICKET_NOT_REFUNDABLE','message','One or more requested tickets are no longer valid for refund. Review the ticket status before continuing.'); end if;

  if v_action='APPROVE' then
    if v_request.status<>'PENDING' then return jsonb_build_object('ok',false,'code','REQUEST_CLOSED','message','This refund request is not awaiting approval.'); end if;
    update public.customer_order_requests set status='APPROVED',approved_amount_lkr=requested_amount_lkr,staff_note=v_note,reviewed_at=now(),reviewed_by=p_staff_user_id,updated_at=now() where id=v_request.id;
    return jsonb_build_object('ok',true,'action','REFUND_APPROVED','amount_lkr',v_request.requested_amount_lkr,'message','Refund approved. Tickets remain active until the refund is marked completed.');
  end if;

  if v_action='COMPLETE_REFUND' then
    if v_request.status<>'APPROVED' then return jsonb_build_object('ok',false,'code','NOT_APPROVED','message','Approve the refund before marking it completed.'); end if;
    if v_reference is null then return jsonb_build_object('ok',false,'code','REFERENCE_REQUIRED','message','Enter the bank/provider refund reference before completing the refund.'); end if;

    update public.tickets t set status='REFUNDED',revoked_at=now(),revoked_by=p_staff_user_id,revoke_reason='Refund completed: '||v_reference,updated_at=now()
    from public.customer_order_request_tickets rt
    where rt.request_id=v_request.id and rt.ticket_id=t.id and t.status='VALID';

    update public.customer_order_requests set status='COMPLETED',approved_amount_lkr=coalesce(approved_amount_lkr,requested_amount_lkr),refund_reference=v_reference,staff_note=coalesce(v_note,staff_note),completed_at=now(),updated_at=now() where id=v_request.id;
    select count(*)::integer into v_all_count from public.tickets where order_id=v_order.id;
    select count(*)::integer into v_refunded_count from public.tickets where order_id=v_order.id and status='REFUNDED';
    update public.orders set
      payment_status=case when v_refunded_count=v_all_count and v_all_count>0 then 'REFUNDED'::public.payment_status else 'PARTIALLY_REFUNDED'::public.payment_status end,
      status=case when v_refunded_count=v_all_count and v_all_count>0 then 'REFUNDED'::public.order_status else status end,
      updated_at=now()
    where id=v_order.id;

    return jsonb_build_object('ok',true,'action',case when v_refunded_count=v_all_count then 'FULL_REFUND_COMPLETED' else 'PARTIAL_REFUND_COMPLETED' end,'amount_lkr',coalesce(v_request.approved_amount_lkr,v_request.requested_amount_lkr),'ticket_count',v_selected_count,'message',case when v_refunded_count=v_all_count then 'Full refund completed and all tickets refunded.' else 'Partial refund completed. Selected tickets are now refunded.' end);
  end if;

  return jsonb_build_object('ok',false,'code','INVALID_ACTION','message','Unsupported request action.');
end;
$$;

revoke all on function public.review_customer_order_request_server(uuid,uuid,text,text,text) from public;
revoke all on function public.review_customer_order_request_server(uuid,uuid,text,text,text) from anon;
revoke all on function public.review_customer_order_request_server(uuid,uuid,text,text,text) from authenticated;
grant execute on function public.review_customer_order_request_server(uuid,uuid,text,text,text) to service_role;

create or replace function public.review_bank_slip(
  p_submission_id uuid,
  p_approve boolean,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_submission public.payment_submissions%rowtype;
  v_order public.orders%rowtype;
  v_cancel_request public.customer_order_requests%rowtype;
  v_created integer := 0;
begin
  if not public.has_staff_role(array['SUPER_ADMIN','ADMIN','BOX_OFFICE']::public.staff_role[]) then raise exception 'Staff access required' using errcode='42501'; end if;
  select * into v_submission from public.payment_submissions where id=p_submission_id for update;
  if not found then return jsonb_build_object('ok',false,'code','NOT_FOUND','message','Payment submission not found.'); end if;
  if v_submission.status<>'PENDING' then return jsonb_build_object('ok',false,'code','ALREADY_REVIEWED','message','This payment slip has already been reviewed.'); end if;
  select * into v_order from public.orders where id=v_submission.order_id for update;
  select * into v_cancel_request from public.customer_order_requests where order_id=v_order.id and kind='CANCEL' and status in ('PENDING','APPROVED') order by created_at desc limit 1;

  if p_approve and found then return jsonb_build_object('ok',false,'code','CANCELLATION_PENDING','message','This customer has a pending cancellation request. Resolve the cancellation before approving the payment slip.'); end if;

  if p_approve then
    update public.payment_submissions set status='APPROVED',reviewed_at=now(),reviewed_by=auth.uid(),rejection_reason=null where id=v_submission.id;
    update public.orders set payment_method='BANK_SLIP',payment_provider='BANK_TRANSFER',status='CONFIRMED',payment_status='PAID',paid_at=now(),expires_at=null,updated_at=now() where id=v_order.id;
    select public.issue_order_tickets(v_order.id) into v_created;
    return jsonb_build_object('ok',true,'status','APPROVED','tickets_created',v_created);
  end if;

  update public.payment_submissions set status='REJECTED',reviewed_at=now(),reviewed_by=auth.uid(),rejection_reason=nullif(btrim(coalesce(p_reason,'')),'') where id=v_submission.id;
  update public.orders set status='CANCELLED',payment_status='FAILED',expires_at=now(),updated_at=now() where id=v_order.id;

  if found then
    update public.customer_order_requests set status='COMPLETED',staff_note=coalesce(nullif(btrim(coalesce(p_reason,'')),''),'Payment slip rejected; cancellation completed.'),reviewed_at=now(),reviewed_by=auth.uid(),completed_at=now(),updated_at=now() where id=v_cancel_request.id;
  end if;

  return jsonb_build_object('ok',true,'status','REJECTED');
end;
$$;
