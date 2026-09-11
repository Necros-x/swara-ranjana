-- Swara Ranjana — scanner payment reliability
-- Server-authenticated, service-role-only bridge for on-arrival payment + admit.

create or replace function public.collect_on_arrival_and_redeem_server(
  p_staff_user_id uuid,
  p_token text,
  p_event_id uuid,
  p_gate text default null,
  p_device jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_staff public.staff_profiles%rowtype;
  v_ticket record;
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

  select
    t.id as ticket_id,
    t.event_id,
    t.order_id,
    t.ticket_number,
    t.status as ticket_status,
    t.checked_in_at,
    c.full_name as customer_name,
    tt.name as ticket_type_name,
    o.payment_method,
    o.payment_status,
    o.status as order_status,
    o.total_lkr,
    o.currency,
    o.order_number
  into v_ticket
  from public.tickets t
  join public.customers c on c.id = t.customer_id
  join public.ticket_types tt on tt.id = t.ticket_type_id
  join public.orders o on o.id = t.order_id
  where t.qr_token = btrim(p_token)
  for update of t, o;

  if not found then
    insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,metadata)
    values(p_event_id,null,p_staff_user_id,'INVALID',p_gate,jsonb_build_object('device',coalesce(p_device,'{}'::jsonb)));
    return jsonb_build_object('ok',false,'result','INVALID','message','Unknown ticket');
  end if;

  if v_ticket.event_id <> p_event_id then
    insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,metadata)
    values(p_event_id,v_ticket.ticket_id,p_staff_user_id,'WRONG_EVENT',p_gate,v_ticket.ticket_number,jsonb_build_object('device',coalesce(p_device,'{}'::jsonb)));
    return jsonb_build_object('ok',false,'result','WRONG_EVENT','message','Ticket belongs to another event','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name);
  end if;

  if v_ticket.ticket_status = 'USED' then
    insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,metadata)
    values(p_event_id,v_ticket.ticket_id,p_staff_user_id,'DUPLICATE',p_gate,v_ticket.ticket_number,jsonb_build_object('device',coalesce(p_device,'{}'::jsonb)));
    return jsonb_build_object('ok',false,'result','DUPLICATE','message','Ticket has already been used','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name,'firstUsedAt',v_ticket.checked_in_at);
  end if;

  if v_ticket.ticket_status = 'REVOKED' then
    return jsonb_build_object('ok',false,'result','REVOKED','message','Ticket has been revoked','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name);
  end if;

  if v_ticket.ticket_status = 'REFUNDED' then
    return jsonb_build_object('ok',false,'result','REFUNDED','message','Ticket has been refunded','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name);
  end if;

  if v_ticket.payment_method <> 'ON_ARRIVAL' then
    return jsonb_build_object('ok',false,'result','INVALID','message','This order is not configured for on-arrival payment','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name);
  end if;

  if v_ticket.order_status <> 'CONFIRMED' then
    return jsonb_build_object('ok',false,'result','INVALID','message','This reservation is not active','ticketId',v_ticket.ticket_id,'ticketNumber',v_ticket.ticket_number,'customerName',v_ticket.customer_name,'ticketType',v_ticket.ticket_type_name);
  end if;

  if v_ticket.payment_status <> 'PAID' then
    update public.orders
       set payment_status = 'PAID',
           paid_at = v_now,
           payment_provider = 'ON_ARRIVAL',
           payment_reference = coalesce(payment_reference, 'ARRIVAL-' || v_ticket.order_number),
           updated_at = v_now
     where id = v_ticket.order_id;
  end if;

  update public.tickets
     set status = 'USED',
         checked_in_at = v_now,
         checked_in_by = p_staff_user_id,
         updated_at = v_now
   where id = v_ticket.ticket_id;

  insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,metadata)
  values(
    p_event_id,
    v_ticket.ticket_id,
    p_staff_user_id,
    'ADMITTED',
    p_gate,
    v_ticket.ticket_number,
    jsonb_build_object(
      'device',coalesce(p_device,'{}'::jsonb),
      'payment_method','ON_ARRIVAL',
      'payment_status','PAID',
      'payment_collected',true
    )
  );

  return jsonb_build_object(
    'ok',true,
    'result','ADMITTED',
    'message','Payment received and ticket admitted',
    'ticketId',v_ticket.ticket_id,
    'ticketNumber',v_ticket.ticket_number,
    'customerName',v_ticket.customer_name,
    'ticketType',v_ticket.ticket_type_name,
    'checkedInAt',v_now,
    'paymentMethod','ON_ARRIVAL',
    'paymentStatus','PAID',
    'amountDue',0,
    'currency',v_ticket.currency
  );
end;
$$;

revoke all on function public.collect_on_arrival_and_redeem_server(uuid,text,uuid,text,jsonb) from public;
revoke all on function public.collect_on_arrival_and_redeem_server(uuid,text,uuid,text,jsonb) from anon;
revoke all on function public.collect_on_arrival_and_redeem_server(uuid,text,uuid,text,jsonb) from authenticated;
grant execute on function public.collect_on_arrival_and_redeem_server(uuid,text,uuid,text,jsonb) to service_role;
