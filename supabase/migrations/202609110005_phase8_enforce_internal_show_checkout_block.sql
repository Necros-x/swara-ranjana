-- Swara Ranjana — Phase 8 follow-up
-- Enforce public-vs-internal show separation at checkout RPC level.

create or replace function public.create_checkout_reservation(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer,
  p_full_name text,
  p_email text,
  p_phone text,
  p_notes text default null,
  p_request_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_event public.events%rowtype;
  v_ticket_type public.ticket_types%rowtype;
  v_existing public.orders%rowtype;
  v_customer_id uuid;
  v_order public.orders%rowtype;
  v_ticket_committed integer := 0;
  v_event_committed integer := 0;
  v_remaining integer := 0;
  v_normalized_email text := lower(btrim(coalesce(p_email, '')));
  v_normalized_name text := btrim(coalesce(p_full_name, ''));
  v_normalized_phone text := btrim(coalesce(p_phone, ''));
begin
  if p_request_id is null then
    return jsonb_build_object('ok', false, 'code', 'INVALID_REQUEST', 'message', 'A checkout request ID is required.');
  end if;

  select * into v_existing from public.orders where checkout_request_id = p_request_id limit 1;
  if found then
    return jsonb_build_object(
      'ok', true, 'reused', true, 'order_id', v_existing.id,
      'order_number', v_existing.order_number, 'access_token', v_existing.access_token,
      'subtotal_lkr', v_existing.subtotal_lkr, 'total_lkr', v_existing.total_lkr,
      'currency', v_existing.currency, 'expires_at', v_existing.expires_at
    );
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 20 then return jsonb_build_object('ok', false, 'code', 'INVALID_QUANTITY', 'message', 'Choose a valid ticket quantity.'); end if;
  if char_length(v_normalized_name) < 2 or char_length(v_normalized_name) > 120 then return jsonb_build_object('ok', false, 'code', 'INVALID_NAME', 'message', 'Enter the customer name.'); end if;
  if char_length(v_normalized_email) < 5 or char_length(v_normalized_email) > 254 or position('@' in v_normalized_email) < 2 then return jsonb_build_object('ok', false, 'code', 'INVALID_EMAIL', 'message', 'Enter a valid email address.'); end if;
  if char_length(v_normalized_phone) < 7 or char_length(v_normalized_phone) > 40 then return jsonb_build_object('ok', false, 'code', 'INVALID_PHONE', 'message', 'Enter a valid phone number.'); end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'EVENT_NOT_FOUND', 'message', 'This event is not available.'); end if;
  if not v_event.web_ticketing_enabled then return jsonb_build_object('ok', false, 'code', 'WEB_TICKETING_DISABLED', 'message', 'Online ticketing is not enabled for this show.'); end if;
  if v_event.status <> 'ON_SALE' then return jsonb_build_object('ok', false, 'code', 'EVENT_NOT_ON_SALE', 'message', 'Ticket sales are not open for this event.'); end if;

  select * into v_ticket_type from public.ticket_types where id = p_ticket_type_id and event_id = p_event_id for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'TICKET_TYPE_NOT_FOUND', 'message', 'That ticket category is no longer available.'); end if;
  if v_ticket_type.status <> 'AVAILABLE' then return jsonb_build_object('ok', false, 'code', 'TICKET_TYPE_UNAVAILABLE', 'message', 'That ticket category is currently unavailable.'); end if;
  if v_ticket_type.sale_starts_at is not null and v_ticket_type.sale_starts_at > now() then return jsonb_build_object('ok', false, 'code', 'SALE_NOT_STARTED', 'message', 'Sales for this ticket category have not started yet.'); end if;
  if v_ticket_type.sale_ends_at is not null and v_ticket_type.sale_ends_at < now() then return jsonb_build_object('ok', false, 'code', 'SALE_ENDED', 'message', 'Sales for this ticket category have ended.'); end if;
  if p_quantity > v_ticket_type.max_per_order then return jsonb_build_object('ok', false, 'code', 'MAX_PER_ORDER', 'message', format('A maximum of %s tickets can be reserved in one order.', v_ticket_type.max_per_order)); end if;

  select coalesce(sum(oi.quantity), 0)::integer into v_ticket_committed
    from public.order_items oi join public.orders o on o.id = oi.order_id
   where oi.ticket_type_id = v_ticket_type.id
     and ((o.status = 'CONFIRMED') or (o.status = 'PENDING' and o.payment_status = 'PENDING' and o.expires_at > now()));

  v_remaining := greatest(v_ticket_type.capacity - v_ticket_committed, 0);
  if p_quantity > v_remaining then
    return jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_INVENTORY', 'message', case when v_remaining = 0 then 'This ticket category has sold out.' when v_remaining = 1 then 'Only 1 ticket is currently available.' else format('Only %s tickets are currently available.', v_remaining) end, 'remaining', v_remaining);
  end if;

  select coalesce(sum(oi.quantity), 0)::integer into v_event_committed
    from public.order_items oi join public.orders o on o.id = oi.order_id
   where o.event_id = v_event.id
     and ((o.status = 'CONFIRMED') or (o.status = 'PENDING' and o.payment_status = 'PENDING' and o.expires_at > now()));

  if v_event_committed + p_quantity > v_event.total_capacity then return jsonb_build_object('ok', false, 'code', 'EVENT_CAPACITY_REACHED', 'message', 'The event has reached its current ticket capacity.'); end if;

  select id into v_customer_id from public.customers where lower(email) = v_normalized_email limit 1;
  if v_customer_id is null then
    begin
      insert into public.customers (full_name, email, phone) values (v_normalized_name, v_normalized_email, v_normalized_phone) returning id into v_customer_id;
    exception when unique_violation then select id into v_customer_id from public.customers where lower(email) = v_normalized_email limit 1; end;
  else
    update public.customers set full_name = v_normalized_name, phone = v_normalized_phone, updated_at = now() where id = v_customer_id;
  end if;

  insert into public.orders (event_id, customer_id, checkout_request_id, status, payment_status, subtotal_lkr, discount_lkr, total_lkr, currency, expires_at, notes, metadata)
  values (v_event.id, v_customer_id, p_request_id, 'PENDING', 'PENDING', v_ticket_type.price_lkr * p_quantity, 0, v_ticket_type.price_lkr * p_quantity, v_event.currency, now() + interval '10 minutes', nullif(btrim(coalesce(p_notes, '')), ''), jsonb_build_object('source', 'website_checkout'))
  returning * into v_order;

  insert into public.order_items (order_id, ticket_type_id, quantity, unit_price_lkr) values (v_order.id, v_ticket_type.id, p_quantity, v_ticket_type.price_lkr);

  return jsonb_build_object('ok', true, 'reused', false, 'order_id', v_order.id, 'order_number', v_order.order_number, 'access_token', v_order.access_token, 'subtotal_lkr', v_order.subtotal_lkr, 'total_lkr', v_order.total_lkr, 'currency', v_order.currency, 'expires_at', v_order.expires_at, 'ticket_type_id', v_ticket_type.id, 'ticket_type_name', v_ticket_type.name, 'quantity', p_quantity, 'remaining_after_hold', greatest(v_remaining - p_quantity, 0));
end;
$$;
