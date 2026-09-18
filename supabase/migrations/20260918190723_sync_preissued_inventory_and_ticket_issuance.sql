
create or replace function public.sync_seat_ticket_inventory_from_order_seat()
returns trigger
language plpgsql
set search_path to 'public', 'extensions'
as $function$
declare
  v_ticket_status public.ticket_status;
  v_source text;
  v_next_revision integer;
begin
  select case
    when o.metadata ->> 'source' = 'physical_seller' then 'physical_seller'
    else coalesce(o.metadata ->> 'source', 'website_checkout')
  end
  into v_source
  from public.orders o
  where o.id = new.order_id;

  if new.status = 'HOLD' and new.held_until > now() then
    update public.seat_ticket_inventory
    set
      status = 'HELD_ONLINE',
      order_id = new.order_id,
      claimed_at = coalesce(claimed_at, now())
    where seat_id = new.seat_id
      and status = 'AVAILABLE';

    return new;
  end if;

  if new.status = 'CONFIRMED' then
    update public.seat_ticket_inventory
    set
      status = case
        when v_source = 'physical_seller' then 'SOLD_PHYSICAL'
        else 'SOLD_ONLINE'
      end,
      order_id = new.order_id,
      issued_ticket_id = coalesce(new.ticket_id, issued_ticket_id),
      claimed_at = coalesce(claimed_at, now())
    where seat_id = new.seat_id;

    return new;
  end if;

  if new.status = 'RELEASED' then
    if new.ticket_id is null then
      update public.seat_ticket_inventory
      set
        status = 'AVAILABLE',
        order_id = null,
        claimed_by = null,
        claimed_at = null
      where seat_id = new.seat_id
        and order_id = new.order_id
        and status = 'HELD_ONLINE';

      return new;
    end if;

    select t.status
    into v_ticket_status
    from public.tickets t
    where t.id = new.ticket_id;

    if v_ticket_status in ('REFUNDED', 'REVOKED') then
      select revision + 1
      into v_next_revision
      from public.seat_ticket_inventory
      where seat_id = new.seat_id
      for update;

      update public.seat_ticket_inventory
      set
        status = 'AVAILABLE',
        order_id = null,
        issued_ticket_id = null,
        claimed_by = null,
        claimed_at = null,
        revision = v_next_revision,
        ticket_number = base_ticket_number || '-R' || v_next_revision::text,
        qr_token = encode(gen_random_bytes(32), 'hex')
      where seat_id = new.seat_id;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists order_seats_sync_ticket_inventory on public.order_seats;
create trigger order_seats_sync_ticket_inventory
after insert or update of status, ticket_id, held_until
on public.order_seats
for each row
execute function public.sync_seat_ticket_inventory_from_order_seat();

revoke execute on function public.sync_seat_ticket_inventory_from_order_seat()
from public, anon, authenticated;
grant execute on function public.sync_seat_ticket_inventory_from_order_seat()
to service_role;

create or replace function public.issue_order_tickets(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v_order public.orders%rowtype;
  v_item public.order_items%rowtype;
  v_customer public.customers%rowtype;
  v_existing integer;
  v_i integer;
  v_created integer := 0;
  v_alloc record;
  v_ticket_id uuid;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.status <> 'CONFIRMED' then
    raise exception 'Order must be confirmed before ticket issuance';
  end if;

  select *
  into v_customer
  from public.customers
  where id = v_order.customer_id;

  for v_item in
    select *
    from public.order_items
    where order_id = v_order.id
    order by created_at
  loop
    select count(*)::integer
    into v_existing
    from public.tickets
    where order_item_id = v_item.id;

    if exists (
      select 1
      from public.order_seats
      where order_item_id = v_item.id
        and status in ('HOLD', 'CONFIRMED')
    ) then
      for v_alloc in
        select
          os.id as allocation_id,
          os.seat_id,
          s.label,
          i.ticket_number as inventory_ticket_number,
          i.qr_token as inventory_qr_token
        from public.order_seats os
        join public.event_seats s on s.id = os.seat_id
        left join public.seat_ticket_inventory i on i.seat_id = os.seat_id
        where os.order_item_id = v_item.id
          and os.status in ('HOLD', 'CONFIRMED')
        order by coalesce(i.serial_number, 2147483647), s.label
      loop
        if not exists (
          select 1
          from public.tickets
          where order_item_id = v_item.id
            and seat_id = v_alloc.seat_id
        ) then
          if v_alloc.inventory_ticket_number is not null
             and v_alloc.inventory_qr_token is not null then
            insert into public.tickets (
              event_id,
              order_id,
              order_item_id,
              ticket_type_id,
              customer_id,
              ticket_number,
              qr_token,
              attendee_name,
              status,
              seat_id,
              seat_label
            )
            values (
              v_order.event_id,
              v_order.id,
              v_item.id,
              v_item.ticket_type_id,
              v_order.customer_id,
              v_alloc.inventory_ticket_number,
              v_alloc.inventory_qr_token,
              v_customer.full_name,
              'VALID',
              v_alloc.seat_id,
              v_alloc.label
            )
            returning id into v_ticket_id;
          else
            insert into public.tickets (
              event_id,
              order_id,
              order_item_id,
              ticket_type_id,
              customer_id,
              ticket_number,
              attendee_name,
              status,
              seat_id,
              seat_label
            )
            values (
              v_order.event_id,
              v_order.id,
              v_item.id,
              v_item.ticket_type_id,
              v_order.customer_id,
              '',
              v_customer.full_name,
              'VALID',
              v_alloc.seat_id,
              v_alloc.label
            )
            returning id into v_ticket_id;
          end if;

          update public.order_seats
          set
            status = 'CONFIRMED',
            ticket_id = v_ticket_id,
            held_until = null,
            updated_at = now()
          where id = v_alloc.allocation_id;

          v_created := v_created + 1;
        end if;
      end loop;
    elsif v_existing < v_item.quantity then
      for v_i in (v_existing + 1)..v_item.quantity loop
        insert into public.tickets (
          event_id,
          order_id,
          order_item_id,
          ticket_type_id,
          customer_id,
          ticket_number,
          attendee_name,
          status
        )
        values (
          v_order.event_id,
          v_order.id,
          v_item.id,
          v_item.ticket_type_id,
          v_order.customer_id,
          '',
          v_customer.full_name,
          'VALID'
        );

        v_created := v_created + 1;
      end loop;
    end if;
  end loop;

  return v_created;
end;
$function$;
