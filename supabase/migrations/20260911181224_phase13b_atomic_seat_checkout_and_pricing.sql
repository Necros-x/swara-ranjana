create or replace function public.get_public_seat_map(p_event_id uuid,p_ticket_type_id uuid default null)
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'eventId',p_event_id,
    'capacity',coalesce(sum(block_capacity),0),
    'blocks',coalesce(jsonb_agg(block_payload order by block_sort),'[]'::jsonb)
  )
  from (
    select b.sort_order block_sort,
           count(s.id)::integer block_capacity,
           jsonb_build_object(
             'id',b.id,'code',b.code,'level',b.level,'name',b.display_name,
             'ticketTypeId',b.ticket_type_id,'manualFeeLkr',b.manual_fee_lkr,
             'seats',coalesce(jsonb_agg(
               jsonb_build_object(
                 'id',s.id,'rowNumber',s.row_number,'seatNumber',s.seat_number,'label',s.label,
                 'manualFeeLkr',s.manual_fee_lkr,
                 'status',case
                   when exists(select 1 from public.order_seats os where os.seat_id=s.id and os.status='CONFIRMED') then 'SOLD'
                   when exists(select 1 from public.order_seats os where os.seat_id=s.id and os.status='HOLD' and os.held_until>now()) then 'HELD'
                   else 'AVAILABLE' end
               ) order by s.row_number,s.seat_number
             ) filter(where s.id is not null),'[]'::jsonb)
           ) block_payload
    from public.seat_blocks b
    left join public.event_seats s on s.block_id=b.id and s.is_active
    where b.event_id=p_event_id and (p_ticket_type_id is null or b.ticket_type_id=p_ticket_type_id)
    group by b.id,b.code,b.level,b.display_name,b.ticket_type_id,b.manual_fee_lkr,b.sort_order
  ) q;
$$;
revoke all on function public.get_public_seat_map(uuid,uuid) from public;
grant execute on function public.get_public_seat_map(uuid,uuid) to anon,authenticated,service_role;

create or replace function public.create_checkout_reservation_with_seats(
  p_event_id uuid,p_ticket_type_id uuid,p_quantity integer,p_full_name text,p_email text,p_phone text,
  p_notes text default null,p_request_id uuid default gen_random_uuid(),p_selection_mode text default 'RANDOM',p_selected_seat_ids uuid[] default null
)
returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare
  v_event public.events%rowtype; v_ticket_type public.ticket_types%rowtype; v_existing public.orders%rowtype;
  v_customer_id uuid; v_order public.orders%rowtype; v_item public.order_items%rowtype;
  v_mode text:=upper(btrim(coalesce(p_selection_mode,'RANDOM'))); v_seat_ids uuid[]; v_seat_count integer:=0;
  v_selection_fee integer:=0; v_remaining integer:=0; v_seat_id uuid;
  v_email text:=lower(btrim(coalesce(p_email,''))); v_name text:=btrim(coalesce(p_full_name,'')); v_phone text:=btrim(coalesce(p_phone,''));
begin
  if p_request_id is null then return jsonb_build_object('ok',false,'code','INVALID_REQUEST','message','A checkout request ID is required.'); end if;
  select * into v_existing from public.orders where checkout_request_id=p_request_id limit 1;
  if found then
    return jsonb_build_object('ok',true,'reused',true,'order_id',v_existing.id,'order_number',v_existing.order_number,'access_token',v_existing.access_token,
      'subtotal_lkr',v_existing.subtotal_lkr,'total_lkr',v_existing.total_lkr,'currency',v_existing.currency,'expires_at',v_existing.expires_at,
      'selection_mode',coalesce(v_existing.metadata->>'seat_selection_mode','RANDOM'),
      'seat_selection_fee_lkr',coalesce((v_existing.metadata->>'seat_selection_fee_lkr')::integer,0),
      'selected_seats',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'label',s.label,'manualFeeLkr',os.surcharge_lkr) order by s.label)
        from public.order_seats os join public.event_seats s on s.id=os.seat_id where os.order_id=v_existing.id and os.status in('HOLD','CONFIRMED')),'[]'::jsonb));
  end if;
  if p_quantity is null or p_quantity<1 or p_quantity>20 then return jsonb_build_object('ok',false,'code','INVALID_QUANTITY','message','Choose a valid ticket quantity.'); end if;
  if v_mode not in('RANDOM','MANUAL') then return jsonb_build_object('ok',false,'code','INVALID_SELECTION_MODE','message','Choose random seats or select seats manually.'); end if;
  if char_length(v_name)<2 or char_length(v_name)>120 then return jsonb_build_object('ok',false,'code','INVALID_NAME','message','Enter the customer name.'); end if;
  if char_length(v_email)<5 or char_length(v_email)>254 or position('@' in v_email)<2 then return jsonb_build_object('ok',false,'code','INVALID_EMAIL','message','Enter a valid email address.'); end if;
  if char_length(v_phone)<7 or char_length(v_phone)>40 then return jsonb_build_object('ok',false,'code','INVALID_PHONE','message','Enter a valid phone number.'); end if;

  select * into v_event from public.events where id=p_event_id for update;
  if not found then return jsonb_build_object('ok',false,'code','EVENT_NOT_FOUND','message','This event is not available.'); end if;
  if not v_event.web_ticketing_enabled then return jsonb_build_object('ok',false,'code','WEB_TICKETING_DISABLED','message','Online ticketing is not enabled for this show.'); end if;
  if v_event.status<>'ON_SALE' then return jsonb_build_object('ok',false,'code','EVENT_NOT_ON_SALE','message','Ticket sales are not open for this event.'); end if;
  select * into v_ticket_type from public.ticket_types where id=p_ticket_type_id and event_id=p_event_id for update;
  if not found then return jsonb_build_object('ok',false,'code','TICKET_TYPE_NOT_FOUND','message','That ticket category is no longer available.'); end if;
  if v_ticket_type.status<>'AVAILABLE' then return jsonb_build_object('ok',false,'code','TICKET_TYPE_UNAVAILABLE','message','That ticket category is currently unavailable.'); end if;
  if p_quantity>v_ticket_type.max_per_order then return jsonb_build_object('ok',false,'code','MAX_PER_ORDER','message',format('A maximum of %s tickets can be reserved in one order.',v_ticket_type.max_per_order)); end if;

  update public.order_seats os set status='RELEASED',updated_at=now() from public.event_seats s
  where os.seat_id=s.id and s.event_id=p_event_id and os.status='HOLD' and os.held_until<=now();

  select count(*)::integer into v_remaining from public.event_seats s join public.seat_blocks b on b.id=s.block_id
  where s.event_id=p_event_id and b.ticket_type_id=p_ticket_type_id and s.is_active and not exists(
    select 1 from public.order_seats os where os.seat_id=s.id and (os.status='CONFIRMED' or (os.status='HOLD' and os.held_until>now())));
  if p_quantity>v_remaining then return jsonb_build_object('ok',false,'code','INSUFFICIENT_INVENTORY','message',case when v_remaining=0 then 'This ticket category has sold out.' when v_remaining=1 then 'Only 1 seat is currently available.' else format('Only %s seats are currently available.',v_remaining) end,'remaining',v_remaining); end if;

  if v_mode='MANUAL' then
    if coalesce(array_length(p_selected_seat_ids,1),0)<>p_quantity then return jsonb_build_object('ok',false,'code','SEAT_COUNT_MISMATCH','message','Select exactly the requested number of seats.'); end if;
    select count(*)::integer,coalesce(sum(s.manual_fee_lkr),0)::integer,array_agg(s.id order by s.label)
      into v_seat_count,v_selection_fee,v_seat_ids
    from public.event_seats s join public.seat_blocks b on b.id=s.block_id
    where s.id=any(p_selected_seat_ids) and s.event_id=p_event_id and b.ticket_type_id=p_ticket_type_id and s.is_active
      and not exists(select 1 from public.order_seats os where os.seat_id=s.id and (os.status='CONFIRMED' or (os.status='HOLD' and os.held_until>now())));
    if v_seat_count<>p_quantity then return jsonb_build_object('ok',false,'code','SEAT_UNAVAILABLE','message','One or more selected seats were just reserved. Choose another seat.'); end if;
  else
    select array_agg(id order by label),count(*)::integer into v_seat_ids,v_seat_count from (
      select s.id,s.label from public.event_seats s join public.seat_blocks b on b.id=s.block_id
      where s.event_id=p_event_id and b.ticket_type_id=p_ticket_type_id and s.is_active and not exists(
        select 1 from public.order_seats os where os.seat_id=s.id and (os.status='CONFIRMED' or (os.status='HOLD' and os.held_until>now())))
      order by random() limit p_quantity
    ) q;
    if v_seat_count<>p_quantity then return jsonb_build_object('ok',false,'code','SEAT_UNAVAILABLE','message','We could not secure enough seats right now. Please try again.'); end if;
  end if;

  select id into v_customer_id from public.customers where lower(email)=v_email limit 1;
  if v_customer_id is null then
    begin insert into public.customers(full_name,email,phone) values(v_name,v_email,v_phone) returning id into v_customer_id;
    exception when unique_violation then select id into v_customer_id from public.customers where lower(email)=v_email limit 1; end;
  else update public.customers set full_name=v_name,phone=v_phone,updated_at=now() where id=v_customer_id; end if;

  insert into public.orders(event_id,customer_id,checkout_request_id,status,payment_status,subtotal_lkr,discount_lkr,total_lkr,currency,expires_at,notes,metadata)
  values(v_event.id,v_customer_id,p_request_id,'PENDING','PENDING',v_ticket_type.price_lkr*p_quantity+v_selection_fee,0,v_ticket_type.price_lkr*p_quantity+v_selection_fee,v_event.currency,now()+interval '10 minutes',nullif(btrim(coalesce(p_notes,'')),''),jsonb_build_object('source','website_checkout','seat_selection_mode',v_mode,'seat_selection_fee_lkr',v_selection_fee)) returning * into v_order;
  insert into public.order_items(order_id,ticket_type_id,quantity,unit_price_lkr,seat_selection_fee_lkr)
  values(v_order.id,v_ticket_type.id,p_quantity,v_ticket_type.price_lkr,v_selection_fee) returning * into v_item;
  foreach v_seat_id in array v_seat_ids loop
    insert into public.order_seats(order_id,order_item_id,seat_id,selection_mode,surcharge_lkr,status,held_until)
    select v_order.id,v_item.id,s.id,v_mode,case when v_mode='MANUAL' then s.manual_fee_lkr else 0 end,'HOLD',v_order.expires_at from public.event_seats s where s.id=v_seat_id;
  end loop;
  return jsonb_build_object('ok',true,'reused',false,'order_id',v_order.id,'order_number',v_order.order_number,'access_token',v_order.access_token,
    'subtotal_lkr',v_order.subtotal_lkr,'total_lkr',v_order.total_lkr,'currency',v_order.currency,'expires_at',v_order.expires_at,
    'ticket_type_id',v_ticket_type.id,'ticket_type_name',v_ticket_type.name,'quantity',p_quantity,'remaining_after_hold',greatest(v_remaining-p_quantity,0),
    'selection_mode',v_mode,'seat_selection_fee_lkr',v_selection_fee,
    'selected_seats',(select jsonb_agg(jsonb_build_object('id',s.id,'label',s.label,'manualFeeLkr',os.surcharge_lkr) order by s.label) from public.order_seats os join public.event_seats s on s.id=os.seat_id where os.order_id=v_order.id and os.status='HOLD'));
exception when unique_violation then
  return jsonb_build_object('ok',false,'code','SEAT_UNAVAILABLE','message','One of those seats was just reserved. Please choose again.');
end; $$;
revoke all on function public.create_checkout_reservation_with_seats(uuid,uuid,integer,text,text,text,text,uuid,text,uuid[]) from public;
grant execute on function public.create_checkout_reservation_with_seats(uuid,uuid,integer,text,text,text,text,uuid,text,uuid[]) to service_role;

create or replace function public.issue_order_tickets(p_order_id uuid)
returns integer language plpgsql security definer set search_path=public,extensions as $$
declare v_order public.orders%rowtype; v_item public.order_items%rowtype; v_customer public.customers%rowtype; v_existing integer; v_i integer; v_created integer:=0; v_alloc record; v_ticket_id uuid;
begin
  select * into v_order from public.orders where id=p_order_id for update; if not found then raise exception 'Order not found'; end if;
  if v_order.status<>'CONFIRMED' then raise exception 'Order must be confirmed before ticket issuance'; end if;
  select * into v_customer from public.customers where id=v_order.customer_id;
  for v_item in select * from public.order_items where order_id=v_order.id order by created_at loop
    select count(*)::integer into v_existing from public.tickets where order_item_id=v_item.id;
    if exists(select 1 from public.order_seats where order_item_id=v_item.id and status in('HOLD','CONFIRMED')) then
      for v_alloc in select os.id allocation_id,os.seat_id,s.label from public.order_seats os join public.event_seats s on s.id=os.seat_id where os.order_item_id=v_item.id and os.status in('HOLD','CONFIRMED') order by s.label loop
        if not exists(select 1 from public.tickets where order_item_id=v_item.id and seat_id=v_alloc.seat_id) then
          insert into public.tickets(event_id,order_id,order_item_id,ticket_type_id,customer_id,ticket_number,attendee_name,status,seat_id,seat_label)
          values(v_order.event_id,v_order.id,v_item.id,v_item.ticket_type_id,v_order.customer_id,'',v_customer.full_name,'VALID',v_alloc.seat_id,v_alloc.label) returning id into v_ticket_id;
          update public.order_seats set status='CONFIRMED',ticket_id=v_ticket_id,held_until=null,updated_at=now() where id=v_alloc.allocation_id; v_created:=v_created+1;
        end if;
      end loop;
    elsif v_existing<v_item.quantity then
      for v_i in (v_existing+1)..v_item.quantity loop
        insert into public.tickets(event_id,order_id,order_item_id,ticket_type_id,customer_id,ticket_number,attendee_name,status)
        values(v_order.event_id,v_order.id,v_item.id,v_item.ticket_type_id,v_order.customer_id,'',v_customer.full_name,'VALID'); v_created:=v_created+1;
      end loop;
    end if;
  end loop; return v_created;
end; $$;

create or replace function public.release_order_seats_on_order_close() returns trigger language plpgsql set search_path=public as $$
begin if new.status in('CANCELLED','REFUNDED') and new.status is distinct from old.status then update public.order_seats set status='RELEASED',held_until=null,updated_at=now() where order_id=new.id and status in('HOLD','CONFIRMED'); end if; return new; end; $$;
drop trigger if exists orders_release_seats_on_close on public.orders;
create trigger orders_release_seats_on_close after update of status on public.orders for each row execute function public.release_order_seats_on_order_close();

create or replace function public.release_order_seat_on_ticket_refund() returns trigger language plpgsql set search_path=public as $$
begin if new.status='REFUNDED' and new.status is distinct from old.status then update public.order_seats set status='RELEASED',held_until=null,updated_at=now() where ticket_id=new.id and status='CONFIRMED'; end if; return new; end; $$;
drop trigger if exists tickets_release_seat_on_refund on public.tickets;
create trigger tickets_release_seat_on_refund after update of status on public.tickets for each row execute function public.release_order_seat_on_ticket_refund();

create or replace function public.update_seat_pricing_server(p_staff_user_id uuid,p_event_id uuid,p_block_code text,p_row_number integer,p_fee_lkr integer)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare v_block public.seat_blocks%rowtype; v_count integer;
begin
  if not exists(select 1 from public.staff_profiles where user_id=p_staff_user_id and status='ACTIVE' and role in('SUPER_ADMIN','ADMIN')) then raise exception 'Administrator access required' using errcode='42501'; end if;
  if p_fee_lkr is null or p_fee_lkr<0 or p_fee_lkr>100000 then return jsonb_build_object('ok',false,'message','Enter a valid manual-selection fee.'); end if;
  select * into v_block from public.seat_blocks where event_id=p_event_id and code=upper(btrim(p_block_code)) for update;
  if not found then return jsonb_build_object('ok',false,'message','Seat block not found.'); end if;
  if p_row_number is null then
    update public.seat_blocks set manual_fee_lkr=p_fee_lkr,updated_at=now() where id=v_block.id;
    update public.event_seats set manual_fee_lkr=p_fee_lkr,updated_at=now() where block_id=v_block.id; get diagnostics v_count=row_count;
  else
    update public.event_seats set manual_fee_lkr=p_fee_lkr,updated_at=now() where block_id=v_block.id and row_number=p_row_number; get diagnostics v_count=row_count;
  end if;
  return jsonb_build_object('ok',true,'updated',v_count,'message',case when p_row_number is null then 'Block fee updated.' else 'Row fee updated.' end);
end; $$;
revoke all on function public.update_seat_pricing_server(uuid,uuid,text,integer,integer) from public;
grant execute on function public.update_seat_pricing_server(uuid,uuid,text,integer,integer) to service_role;
