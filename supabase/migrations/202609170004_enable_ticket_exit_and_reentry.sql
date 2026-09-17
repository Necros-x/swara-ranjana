create or replace function public.redeem_ticket(
  p_token text,
  p_event_id uuid,
  p_gate text default null::text,
  p_device jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth', 'extensions'
as $function$
declare
  current_staff public.staff_profiles%rowtype;
  found_ticket record;
  result public.scan_result;
  response jsonb;
  v_now timestamptz := now();
  v_is_reentry boolean := false;
begin
  select * into current_staff
  from public.staff_profiles
  where user_id = auth.uid() and status = 'ACTIVE';

  if not found or current_staff.role not in ('SUPER_ADMIN','ADMIN','BOX_OFFICE','SCANNER') then
    raise exception 'Staff access required' using errcode = '42501';
  end if;

  select
    t.id,
    t.event_id,
    t.order_id,
    t.ticket_number,
    t.status,
    t.checked_in_at,
    t.is_inside,
    t.last_exited_at,
    c.full_name as customer_name,
    tt.name as ticket_type_name,
    o.payment_method,
    o.payment_status,
    o.total_lkr,
    o.currency
  into found_ticket
  from public.tickets t
  join public.customers c on c.id = t.customer_id
  join public.ticket_types tt on tt.id = t.ticket_type_id
  join public.orders o on o.id = t.order_id
  where t.qr_token = btrim(p_token)
  for update of t;

  if not found then
    insert into public.scan_logs(event_id,ticket_id,staff_user_id,result,gate,metadata)
    values(
      p_event_id,
      null,
      auth.uid(),
      'INVALID',
      p_gate,
      jsonb_build_object('device',coalesce(p_device,'{}'::jsonb))
    );

    return jsonb_build_object('ok',false,'result','INVALID','message','Unknown ticket');
  end if;

  if found_ticket.event_id <> p_event_id then
    result := 'WRONG_EVENT';
  elsif found_ticket.status = 'REVOKED' then
    result := 'REVOKED';
  elsif found_ticket.status = 'REFUNDED' then
    result := 'REFUNDED';
  elsif found_ticket.payment_method = 'ON_ARRIVAL' and found_ticket.payment_status <> 'PAID' then
    result := 'PAYMENT_DUE';
  elsif found_ticket.status = 'USED' and coalesce(found_ticket.is_inside, false) then
    result := 'EXITED';
    update public.tickets
    set is_inside = false,
        last_exited_at = v_now,
        updated_at = v_now
    where id = found_ticket.id;
  elsif found_ticket.status = 'USED' then
    result := 'ADMITTED';
    v_is_reentry := true;
    update public.tickets
    set is_inside = true,
        updated_at = v_now
    where id = found_ticket.id;
  elsif found_ticket.status = 'VALID' then
    result := 'ADMITTED';
    update public.tickets
    set status = 'USED',
        checked_in_at = v_now,
        checked_in_by = auth.uid(),
        is_inside = true,
        updated_at = v_now
    where id = found_ticket.id;
  else
    result := 'DUPLICATE';
  end if;

  insert into public.scan_logs(
    event_id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,metadata
  ) values (
    p_event_id,
    found_ticket.id,
    auth.uid(),
    result,
    p_gate,
    found_ticket.ticket_number,
    jsonb_build_object(
      'device',coalesce(p_device,'{}'::jsonb),
      'payment_method',found_ticket.payment_method,
      'payment_status',found_ticket.payment_status,
      'attendance_state',case when result = 'EXITED' then 'OUTSIDE' else 'INSIDE' end,
      'reentry',v_is_reentry
    )
  );

  response := jsonb_build_object(
    'ok', result in ('ADMITTED','EXITED'),
    'result', result,
    'ticketId', found_ticket.id,
    'ticketNumber', found_ticket.ticket_number,
    'customerName', found_ticket.customer_name,
    'ticketType', found_ticket.ticket_type_name,
    'firstUsedAt', found_ticket.checked_in_at,
    'paymentMethod', found_ticket.payment_method,
    'paymentStatus', found_ticket.payment_status,
    'amountDue', found_ticket.total_lkr,
    'currency', found_ticket.currency
  );

  if result = 'ADMITTED' then
    response := response || jsonb_build_object(
      'checkedInAt',v_now,
      'isInside',true,
      'reentry',v_is_reentry,
      'message',case when v_is_reentry then 'Guest re-admitted' else 'Ticket admitted' end
    );
  elsif result = 'EXITED' then
    response := response || jsonb_build_object(
      'isInside',false,
      'exitedAt',v_now,
      'message','Guest exit recorded. Scan the same ticket again when they return.'
    );
  elsif result='PAYMENT_DUE' then
    response := response || jsonb_build_object('message','Payment is due before admission');
  elsif result='DUPLICATE' then
    response := response || jsonb_build_object('message','Ticket cannot be admitted in its current state');
  elsif result='WRONG_EVENT' then
    response := response || jsonb_build_object('message','Ticket belongs to another event');
  elsif result='REVOKED' then
    response := response || jsonb_build_object('message','Ticket has been revoked');
  elsif result='REFUNDED' then
    response := response || jsonb_build_object('message','Ticket has been refunded');
  end if;

  return response;
end;
$function$;
