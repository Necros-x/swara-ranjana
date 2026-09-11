-- Swara Ranjana — Phase 7C
-- Customer cancellation/refund requests + robust on-arrival payment collection.

create table if not exists public.customer_order_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  kind text not null check (kind in ('CANCEL', 'REFUND')),
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  reason text,
  staff_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create index if not exists customer_order_requests_order_idx on public.customer_order_requests(order_id, created_at desc);
create index if not exists customer_order_requests_customer_idx on public.customer_order_requests(customer_id, created_at desc);
create unique index if not exists customer_order_requests_one_pending_idx on public.customer_order_requests(order_id) where status = 'PENDING';

alter table public.customer_order_requests enable row level security;
revoke all on table public.customer_order_requests from anon;
revoke insert, update, delete on table public.customer_order_requests from authenticated;
grant select on table public.customer_order_requests to authenticated;

drop policy if exists customer_order_requests_self_read on public.customer_order_requests;
create policy customer_order_requests_self_read on public.customer_order_requests for select to authenticated using (exists (select 1 from public.customers c where c.id = customer_order_requests.customer_id and c.auth_user_id = auth.uid()));

create or replace function public.customer_order_action(p_order_id uuid,p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare
  v_uid uuid := auth.uid(); v_customer public.customers%rowtype; v_order public.orders%rowtype; v_event public.events%rowtype;
  v_pending_request public.customer_order_requests%rowtype; v_request public.customer_order_requests%rowtype;
  v_used_count integer := 0; v_pending_slip_count integer := 0; v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if v_reason is not null and char_length(v_reason) > 1000 then return jsonb_build_object('ok',false,'code','REASON_TOO_LONG','message','Please keep your reason under 1000 characters.'); end if;
  select * into v_customer from public.customers where auth_user_id = v_uid;
  if not found then raise exception 'Customer account required' using errcode = '42501'; end if;
  select * into v_order from public.orders where id=p_order_id and customer_id=v_customer.id for update;
  if not found then return jsonb_build_object('ok',false,'code','NOT_FOUND','message','Order not found.'); end if;
  select * into v_event from public.events where id=v_order.event_id;
  if v_order.status in ('CANCELLED','REFUNDED') then return jsonb_build_object('ok',false,'code','ORDER_CLOSED','message','This order is already closed.'); end if;
  if v_event.starts_at <= now() then return jsonb_build_object('ok',false,'code','EVENT_STARTED','message','Online cancellation and refund requests close once the event begins. Please contact the box office.'); end if;
  select count(*)::integer into v_used_count from public.tickets where order_id=v_order.id and status='USED';
  if v_used_count>0 then return jsonb_build_object('ok',false,'code','TICKET_USED','message','This order contains an already-used ticket and cannot be changed online.'); end if;
  select * into v_pending_request from public.customer_order_requests where order_id=v_order.id and status='PENDING' order by created_at desc limit 1;
  if found then return jsonb_build_object('ok',true,'reused',true,'action',case when v_pending_request.kind='REFUND' then 'REFUND_REQUESTED' else 'CANCEL_REQUESTED' end,'request_id',v_pending_request.id,'message',case when v_pending_request.kind='REFUND' then 'Your refund request is already awaiting review.' else 'Your cancellation request is already awaiting review.' end); end if;
  select count(*)::integer into v_pending_slip_count from public.payment_submissions where order_id=v_order.id and status='PENDING';
  if v_order.payment_status='PAID' then insert into public.customer_order_requests(order_id,customer_id,kind,reason) values(v_order.id,v_customer.id,'REFUND',v_reason) returning * into v_request; return jsonb_build_object('ok',true,'reused',false,'action','REFUND_REQUESTED','request_id',v_request.id,'message','Refund request submitted. Your tickets remain active until the refund is approved and completed.'); end if;
  if v_pending_slip_count>0 then insert into public.customer_order_requests(order_id,customer_id,kind,reason) values(v_order.id,v_customer.id,'CANCEL',v_reason) returning * into v_request; return jsonb_build_object('ok',true,'reused',false,'action','CANCEL_REQUESTED','request_id',v_request.id,'message','Cancellation request submitted. Because a payment slip is awaiting review, staff must confirm it first.'); end if;
  update public.orders set status='CANCELLED',expires_at=now(),updated_at=now() where id=v_order.id;
  update public.tickets set status='REVOKED',revoked_at=now(),revoked_by=null,revoke_reason='Cancelled by customer',updated_at=now() where order_id=v_order.id and status='VALID';
  return jsonb_build_object('ok',true,'reused',false,'action','CANCELLED','message','Your reservation has been cancelled.');
end; $$;
revoke all on function public.customer_order_action(uuid,text) from public;
revoke all on function public.customer_order_action(uuid,text) from anon;
grant execute on function public.customer_order_action(uuid,text) to authenticated;

create or replace function public.collect_on_arrival_and_redeem(p_token text,p_event_id uuid,p_gate text default null,p_device jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public, auth, extensions as $$
declare v_staff public.staff_profiles%rowtype; v_ticket record; v_now timestamptz:=now();
begin
 select * into v_staff from public.staff_profiles where user_id=auth.uid() and status='ACTIVE';
 if not found or v_staff.role not in ('SUPER_ADMIN','ADMIN','BOX_OFFICE') then raise exception 'Box office access required' using errcode='42501'; end if;
 select t.id as ticket_id,t.event_id,t.order_id,t.ticket_number,t.status as ticket_status,t.checked_in_at,c.full_name as customer_name,tt.name as ticket_type_name,o.payment_method,o.payment_status,o.status as order_status,o.total_lkr,o.currency,o.order_number into v_ticket from public.tickets t join public.customers c on c.id=t.customer_id join public.ticket_types tt on tt.id=t.ticket_type_id join public.orders o on o.id=t.order_id where t.qr_token=btrim(p_token) for update of t,o;
 if not found then insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,metadata) values(p_event_id,null,auth.uid(),'INVALID',p_gate,jsonb_build_object('device',coalesce(p_device,'{}'::jsonb))); return jsonb_build_object('ok',false,'result','INVALID','message','Unknown ticket'); end if;
 if v_ticket.event_id<>p_event_id then insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,metadata) values(p_event_id,v_ticket.ticket_id,auth.uid(),'WRONG_EVENT',p_gate,v_ticket.ticket_number,jsonb_build_object('device',coalesce(p_device,'{}'::jsonb))); return jsonb_build_object('ok',false,'result','WRONG_EVENT','message','Ticket belongs to another event','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name); end if;
 if v_ticket.ticket_status='USED' then insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,metadata) values(p_event_id,v_ticket.ticket_id,auth.uid(),'DUPLICATE',p_gate,v_ticket.ticket_number,jsonb_build_object('device',coalesce(p_device,'{}'::jsonb))); return jsonb_build_object('ok',false,'result','DUPLICATE','message','Ticket has already been used','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name,'firstUsedAt',v_ticket.checked_in_at); end if;
 if v_ticket.ticket_status='REVOKED' then return jsonb_build_object('ok',false,'result','REVOKED','message','Ticket has been revoked','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name); end if;
 if v_ticket.ticket_status='REFUNDED' then return jsonb_build_object('ok',false,'result','REFUNDED','message','Ticket has been refunded','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name); end if;
 if v_ticket.payment_method<>'ON_ARRIVAL' then return jsonb_build_object('ok',false,'result','INVALID','message','This order is not configured for on-arrival payment','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name); end if;
 if v_ticket.order_status<>'CONFIRMED' then return jsonb_build_object('ok',false,'result','INVALID','message','This reservation is not active','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name); end if;
 if v_ticket.payment_status<>'PAID' then update public.orders set payment_status='PAID',paid_at=v_now,payment_provider='ON_ARRIVAL',payment_reference=coalesce(payment_reference,'ARRIVAL-'||v_ticket.order_number),updated_at=v_now where id=v_ticket.order_id; end if;
 update public.tickets set status='USED',checked_in_at=v_now,checked_in_by=auth.uid(),updated_at=v_now where id=v_ticket.ticket_id;
 insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,metadata) values(p_event_id,v_ticket.ticket_id,auth.uid(),'ADMITTED',p_gate,v_ticket.ticket_number,jsonb_build_object('device',coalesce(p_device,'{}'::jsonb),'payment_method','ON_ARRIVAL','payment_status','PAID','payment_collected',true));
 return jsonb_build_object('ok',true,'result','ADMITTED','message','Payment received and ticket admitted','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name,'checkedInAt',v_now,'paymentMethod','ON_ARRIVAL','paymentStatus','PAID','amountDue',0,'currency',v_ticket.currency);
end; $$;
revoke all on function public.collect_on_arrival_and_redeem(text,uuid,text,jsonb) from public;
revoke all on function public.collect_on_arrival_and_redeem(text,uuid,text,jsonb) from anon;
grant execute on function public.collect_on_arrival_and_redeem(text,uuid,text,jsonb) to authenticated;
