-- Swara Ranjana — Phase 8
-- Public-vs-internal shows and staff-issued Practice / School tickets.

alter table public.events
  add column if not exists web_ticketing_enabled boolean not null default false;

update public.events
set web_ticketing_enabled = true,
    updated_at = now()
where slug = 'swara-ranjana-2026';

create or replace function public.get_public_event_catalog(
  p_slug text default 'swara-ranjana-2026'
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
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
          'remaining', greatest(
            catalogue.capacity - catalogue.sold - catalogue.reserved,
            0
          )
        )
        order by catalogue.sort_order, catalogue.price_lkr, catalogue.name
      )
      from (
        select
          tt.*,
          coalesce((
            select sum(oi.quantity)::integer
            from public.order_items oi
            join public.orders o on o.id = oi.order_id
            where oi.ticket_type_id = tt.id
              and o.status = 'CONFIRMED'
          ), 0) as sold,
          coalesce((
            select sum(oi.quantity)::integer
            from public.order_items oi
            join public.orders o on o.id = oi.order_id
            where oi.ticket_type_id = tt.id
              and o.status = 'PENDING'
              and o.payment_status = 'PENDING'
              and o.expires_at > now()
          ), 0) as reserved
        from public.ticket_types tt
        where tt.event_id = e.id
          and tt.status in ('AVAILABLE', 'SOLD_OUT')
          and (tt.sale_starts_at is null or tt.sale_starts_at <= now())
          and (tt.sale_ends_at is null or tt.sale_ends_at >= now())
      ) catalogue
    ), '[]'::jsonb)
  )
  from public.events e
  where e.slug = p_slug
    and e.web_ticketing_enabled = true
    and e.status in ('ON_SALE', 'SOLD_OUT')
  limit 1;
$$;

revoke all on function public.get_public_event_catalog(text) from public;
grant execute on function public.get_public_event_catalog(text)
  to anon, authenticated;

create or replace function public.issue_internal_ticket_batch(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer,
  p_holder_label text,
  p_note text default null,
  p_issued_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_event public.events%rowtype;
  v_ticket_type public.ticket_types%rowtype;
  v_customer_id uuid;
  v_order public.orders%rowtype;
  v_order_item_id uuid;
  v_committed_type integer := 0;
  v_committed_event integer := 0;
  v_remaining_type integer := 0;
  v_holder text := btrim(coalesce(p_holder_label, ''));
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_created integer := 0;
  v_internal_email constant text :=
    'internal-admissions@swara-ranjana.invalid';
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 500 then
    return jsonb_build_object(
      'ok', false,
      'code', 'INVALID_QUANTITY',
      'message', 'Choose between 1 and 500 tickets for one batch.'
    );
  end if;

  if char_length(v_holder) < 2 or char_length(v_holder) > 160 then
    return jsonb_build_object(
      'ok', false,
      'code', 'INVALID_HOLDER',
      'message', 'Enter the school, group or holder name for this batch.'
    );
  end if;

  select * into v_event
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

  if v_event.status in ('CANCELLED', 'COMPLETED') then
    return jsonb_build_object(
      'ok', false,
      'code', 'EVENT_CLOSED',
      'message', 'Tickets cannot be issued for a cancelled or completed show.'
    );
  end if;

  select * into v_ticket_type
  from public.ticket_types
  where id = p_ticket_type_id
    and event_id = p_event_id
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'TICKET_TYPE_NOT_FOUND',
      'message', 'Ticket category not found for this show.'
    );
  end if;

  select coalesce(sum(oi.quantity), 0)::integer
  into v_committed_type
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.ticket_type_id = v_ticket_type.id
    and (
      o.status = 'CONFIRMED'
      or (
        o.status = 'PENDING'
        and o.payment_status = 'PENDING'
        and o.expires_at > now()
      )
    );

  v_remaining_type :=
    greatest(v_ticket_type.capacity - v_committed_type, 0);

  if p_quantity > v_remaining_type then
    return jsonb_build_object(
      'ok', false,
      'code', 'INSUFFICIENT_INVENTORY',
      'message', case
        when v_remaining_type = 0
          then 'This ticket category has no remaining capacity.'
        else format(
          'Only %s tickets remain in this category.',
          v_remaining_type
        )
      end,
      'remaining', v_remaining_type
    );
  end if;

  select coalesce(sum(oi.quantity), 0)::integer
  into v_committed_event
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.event_id = v_event.id
    and (
      o.status = 'CONFIRMED'
      or (
        o.status = 'PENDING'
        and o.payment_status = 'PENDING'
        and o.expires_at > now()
      )
    );

  if v_committed_event + p_quantity > v_event.total_capacity then
    return jsonb_build_object(
      'ok', false,
      'code', 'EVENT_CAPACITY_REACHED',
      'message', 'This show does not have enough remaining capacity.'
    );
  end if;

  select id into v_customer_id
  from public.customers
  where lower(email) = v_internal_email
  limit 1;

  if v_customer_id is null then
    begin
      insert into public.customers(full_name, email, phone)
      values('Internal Admissions', v_internal_email, null)
      returning id into v_customer_id;
    exception when unique_violation then
      select id into v_customer_id
      from public.customers
      where lower(email) = v_internal_email
      limit 1;
    end;
  end if;

  insert into public.orders(
    event_id,
    customer_id,
    status,
    payment_status,
    subtotal_lkr,
    discount_lkr,
    total_lkr,
    currency,
    payment_provider,
    payment_reference,
    expires_at,
    paid_at,
    notes,
    metadata
  ) values (
    v_event.id,
    v_customer_id,
    'CONFIRMED',
    'PAID',
    0,
    0,
    0,
    v_event.currency,
    'INTERNAL',
    null,
    null,
    now(),
    v_note,
    jsonb_build_object(
      'source', 'internal_admin',
      'holder_label', v_holder,
      'issued_by', p_issued_by
    )
  )
  returning * into v_order;

  update public.orders
  set payment_reference = 'INTERNAL-' || v_order.order_number,
      updated_at = now()
  where id = v_order.id;

  insert into public.order_items(
    order_id,
    ticket_type_id,
    quantity,
    unit_price_lkr
  ) values (
    v_order.id,
    v_ticket_type.id,
    p_quantity,
    0
  )
  returning id into v_order_item_id;

  v_created := public.issue_order_tickets(v_order.id);

  update public.tickets
  set attendee_name = v_holder,
      updated_at = now()
  where order_id = v_order.id;

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'event_id', v_event.id,
    'event_name', v_event.name,
    'ticket_type_id', v_ticket_type.id,
    'ticket_type_name', v_ticket_type.name,
    'holder_label', v_holder,
    'quantity', p_quantity,
    'tickets_created', v_created
  );
end;
$$;

revoke all on function public.issue_internal_ticket_batch(
  uuid,uuid,integer,text,text,uuid
) from public;
revoke all on function public.issue_internal_ticket_batch(
  uuid,uuid,integer,text,text,uuid
) from anon;
revoke all on function public.issue_internal_ticket_batch(
  uuid,uuid,integer,text,text,uuid
) from authenticated;
grant execute on function public.issue_internal_ticket_batch(
  uuid,uuid,integer,text,text,uuid
) to service_role;
