
create or replace function public.record_physical_ticket_sale(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer,
  p_sold_by uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v_staff public.staff_profiles%rowtype;
  v_event public.events%rowtype;
  v_type public.ticket_types%rowtype;
  v_customer_id uuid;
  v_customer_email text;
  v_order public.orders%rowtype;
  v_item public.order_items%rowtype;
  v_inv record;
  v_order_seat_id uuid;
  v_ticket_id uuid;
  v_available integer := 0;
  v_created integer := 0;
  v_first_serial integer;
  v_last_serial integer;
  v_first_code text;
  v_last_code text;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 100 then
    return jsonb_build_object(
      'ok', false,
      'code', 'INVALID_QUANTITY',
      'message', 'Enter a ticket quantity between 1 and 100.'
    );
  end if;

  select *
  into v_staff
  from public.staff_profiles
  where user_id = p_sold_by
    and status = 'ACTIVE';

  if not found or v_staff.role not in ('SUPER_ADMIN', 'ADMIN', 'SELLER') then
    raise exception 'Physical sales access required' using errcode = '42501';
  end if;

  select *
  into v_event
  from public.events
  where id = p_event_id
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'EVENT_NOT_FOUND',
      'message', 'Show not found.'
    );
  end if;

  if v_event.status not in ('ON_SALE', 'SOLD_OUT') then
    return jsonb_build_object(
      'ok', false,
      'code', 'EVENT_NOT_ON_SALE',
      'message', 'Physical ticket sales are not open for this show.'
    );
  end if;

  select *
  into v_type
  from public.ticket_types
  where id = p_ticket_type_id
    and event_id = p_event_id
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'TICKET_TYPE_NOT_FOUND',
      'message', 'Ticket category not found.'
    );
  end if;

  if v_type.status not in ('AVAILABLE', 'SOLD_OUT') then
    return jsonb_build_object(
      'ok', false,
      'code', 'TICKET_TYPE_UNAVAILABLE',
      'message', 'This ticket category is not open for sale.'
    );
  end if;

  select count(*)::integer
  into v_available
  from public.seat_ticket_inventory i
  join public.event_seats s on s.id = i.seat_id
  where i.event_id = p_event_id
    and i.ticket_type_id = p_ticket_type_id
    and i.status = 'AVAILABLE'
    and s.is_active;

  if p_quantity > v_available then
    return jsonb_build_object(
      'ok', false,
      'code', 'INSUFFICIENT_INVENTORY',
      'message', case
        when v_available = 0 then 'SOLD OUT — notify the sales team that this category is full.'
        when v_available = 1 then 'Only 1 ticket remains in this category.'
        else format('Only %s tickets remain in this category.', v_available)
      end,
      'remaining', v_available
    );
  end if;

  v_customer_email :=
    'physical-sales+' || replace(v_event.id::text, '-', '') || '@swara-ranjana.invalid';

  select id
  into v_customer_id
  from public.customers
  where lower(email) = lower(v_customer_email)
  limit 1;

  if v_customer_id is null then
    begin
      insert into public.customers(full_name, email, phone)
      values('Physical Ticket Sales', v_customer_email, null)
      returning id into v_customer_id;
    exception when unique_violation then
      select id
      into v_customer_id
      from public.customers
      where lower(email) = lower(v_customer_email)
      limit 1;
    end;
  end if;

  insert into public.orders (
    event_id,
    customer_id,
    status,
    payment_status,
    subtotal_lkr,
    discount_lkr,
    total_lkr,
    currency,
    payment_provider,
    expires_at,
    paid_at,
    notes,
    metadata
  )
  values (
    v_event.id,
    v_customer_id,
    'CONFIRMED',
    'PAID',
    v_type.price_lkr * p_quantity,
    0,
    v_type.price_lkr * p_quantity,
    v_event.currency,
    'PHYSICAL',
    null,
    now(),
    'Physical ticket sale recorded by ' || v_staff.display_name,
    jsonb_build_object(
      'source', 'physical_seller',
      'sold_by', p_sold_by,
      'sold_by_name', v_staff.display_name,
      'allocation_direction', 'ascending'
    )
  )
  returning * into v_order;

  update public.orders
  set
    payment_reference = 'PHYSICAL-' || v_order.order_number,
    updated_at = now()
  where id = v_order.id;

  insert into public.order_items (
    order_id,
    ticket_type_id,
    quantity,
    unit_price_lkr
  )
  values (
    v_order.id,
    v_type.id,
    p_quantity,
    v_type.price_lkr
  )
  returning * into v_item;

  for v_inv in
    select
      i.id,
      i.seat_id,
      i.serial_number,
      i.serial_code,
      i.ticket_number,
      i.qr_token,
      s.label as seat_label
    from public.seat_ticket_inventory i
    join public.event_seats s on s.id = i.seat_id
    where i.event_id = p_event_id
      and i.ticket_type_id = p_ticket_type_id
      and i.status = 'AVAILABLE'
      and s.is_active
    order by i.serial_number asc
    limit p_quantity
    for update of i skip locked
  loop
    if v_first_serial is null then
      v_first_serial := v_inv.serial_number;
      v_first_code := v_inv.serial_code;
    end if;

    v_last_serial := v_inv.serial_number;
    v_last_code := v_inv.serial_code;

    insert into public.order_seats (
      order_id,
      order_item_id,
      seat_id,
      status,
      held_until
    )
    values (
      v_order.id,
      v_item.id,
      v_inv.seat_id,
      'CONFIRMED',
      null
    )
    returning id into v_order_seat_id;

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
      v_event.id,
      v_order.id,
      v_item.id,
      v_type.id,
      v_customer_id,
      v_inv.ticket_number,
      v_inv.qr_token,
      'Physical Ticket',
      'VALID',
      v_inv.seat_id,
      v_inv.seat_label
    )
    returning id into v_ticket_id;

    update public.order_seats
    set
      ticket_id = v_ticket_id,
      updated_at = now()
    where id = v_order_seat_id;

    update public.seat_ticket_inventory
    set
      status = 'SOLD_PHYSICAL',
      order_id = v_order.id,
      issued_ticket_id = v_ticket_id,
      claimed_by = p_sold_by,
      claimed_at = now()
    where id = v_inv.id;

    v_created := v_created + 1;
  end loop;

  if v_created <> p_quantity then
    raise exception 'Could not claim the requested physical ticket quantity';
  end if;

  update public.orders
  set metadata = metadata || jsonb_build_object(
    'serial_start', v_first_code,
    'serial_end', v_last_code,
    'quantity', v_created
  )
  where id = v_order.id;

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'ticket_type_id', v_type.id,
    'ticket_type_name', v_type.name,
    'quantity', v_created,
    'serial_start', v_first_serial,
    'serial_end', v_last_serial,
    'serial_code_start', v_first_code,
    'serial_code_end', v_last_code,
    'remaining', greatest(v_available - v_created, 0),
    'sold_out', (v_available - v_created) = 0,
    'message', case
      when (v_available - v_created) = 0
        then format('%s ticket(s) recorded. SOLD OUT — notify the sales team.', v_created)
      else format('%s ticket(s) recorded: %s to %s.', v_created, v_first_code, v_last_code)
    end
  );
end;
$function$;

revoke all on function public.record_physical_ticket_sale(uuid, uuid, integer, uuid)
from public, anon, authenticated;
grant execute on function public.record_physical_ticket_sale(uuid, uuid, integer, uuid)
to service_role;

create or replace function public.get_public_event_catalog(
  p_slug text default 'swara-ranjana-2026'::text
)
returns jsonb
language sql
stable
set search_path to 'public'
as $function$
  select jsonb_build_object(
    'event', jsonb_build_object(
      'id', e.id,
      'name', e.name,
      'slug', e.slug,
      'description', e.description,
      'doors_open_at', e.doors_open_at,
      'starts_at', e.starts_at,
      'ends_at', e.ends_at,
      'timezone', e.timezone,
      'venue_name', e.venue_name,
      'venue_address', e.venue_address,
      'hero_artwork_url', e.hero_artwork_url,
      'status', e.status,
      'total_capacity', e.total_capacity,
      'currency', e.currency
    ),
    'ticket_types', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', catalogue.id,
          'event_id', catalogue.event_id,
          'code', catalogue.code,
          'name', catalogue.name,
          'description', catalogue.description,
          'seating_zone', catalogue.seating_zone,
          'price_lkr', catalogue.price_lkr,
          'capacity', catalogue.capacity,
          'max_per_order', catalogue.max_per_order,
          'sale_starts_at', catalogue.sale_starts_at,
          'sale_ends_at', catalogue.sale_ends_at,
          'status', catalogue.status,
          'sort_order', catalogue.sort_order,
          'benefits', catalogue.benefits,
          'recommended', catalogue.recommended,
          'sold', catalogue.sold,
          'reserved', catalogue.reserved,
          'physical_sold', catalogue.physical_sold,
          'online_sold', catalogue.online_sold,
          'remaining', catalogue.remaining
        )
        order by catalogue.sort_order, catalogue.price_lkr, catalogue.name
      )
      from (
        select
          tt.*,
          count(i.id) filter (
            where i.status in ('SOLD_ONLINE', 'SOLD_PHYSICAL')
          )::integer as sold,
          count(i.id) filter (
            where i.status = 'SOLD_ONLINE'
          )::integer as online_sold,
          count(i.id) filter (
            where i.status = 'SOLD_PHYSICAL'
          )::integer as physical_sold,
          count(i.id) filter (
            where i.status = 'HELD_ONLINE'
          )::integer as reserved,
          count(i.id) filter (
            where i.status = 'AVAILABLE'
          )::integer as remaining
        from public.ticket_types tt
        left join public.seat_ticket_inventory i
          on i.ticket_type_id = tt.id
         and i.event_id = tt.event_id
        where tt.event_id = e.id
          and tt.status in ('AVAILABLE', 'SOLD_OUT')
          and (tt.sale_starts_at is null or tt.sale_starts_at <= now())
          and (tt.sale_ends_at is null or tt.sale_ends_at >= now())
        group by tt.id
      ) catalogue
    ), '[]'::jsonb)
  )
  from public.events e
  where e.slug = p_slug
    and e.web_ticketing_enabled = true
    and e.status in ('ON_SALE', 'SOLD_OUT')
  limit 1;
$function$;
