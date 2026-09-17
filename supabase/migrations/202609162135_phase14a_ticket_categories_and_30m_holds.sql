-- Swara Ranjana — Phase 14A
-- Admin-managed ticket categories + 30-minute reservation holds.
-- Already applied to the connected Supabase project; kept here for history/reproducibility.

alter table public.ticket_types
  add column if not exists archived_at timestamptz;

-- A hall block may be temporarily unassigned while an admin reorganises
-- categories. The seats themselves remain in the auditorium map.
alter table public.seat_blocks
  alter column ticket_type_id drop not null;

create index if not exists ticket_types_active_event_sort_idx
  on public.ticket_types(event_id, sort_order, price_lkr)
  where archived_at is null;

create index if not exists orders_pending_expiry_idx
  on public.orders(expires_at)
  where status = 'PENDING'
    and payment_status = 'PENDING'
    and expires_at is not null;

-- Track the expiry notification in the same idempotent delivery log used by
-- reservation and ticket emails.
alter table public.email_deliveries
  drop constraint if exists email_deliveries_kind_check;

alter table public.email_deliveries
  add constraint email_deliveries_kind_check
  check (kind = any (array[
    'RESERVATION_CREATED'::text,
    'TICKETS_ISSUED'::text,
    'RESERVATION_EXPIRED'::text
  ]));

-- Preserve the latest checkout implementation and only change its initial
-- automatic hold window from 10 to 30 minutes.
do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(p.oid)
    into v_definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'create_checkout_reservation'
  limit 1;

  if v_definition is null then
    raise exception 'create_checkout_reservation function not found';
  end if;

  if position('10 minutes' in v_definition) > 0 then
    v_definition := replace(v_definition, '10 minutes', '30 minutes');
    execute v_definition;
  end if;
end;
$$;

-- Called by the scheduled expiry worker. Existing order-status triggers release
-- any held physical seats when these orders become CANCELLED.
create or replace function public.process_expired_reservations()
returns table(order_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with expired as (
    update public.orders o
       set status = 'CANCELLED',
           metadata = coalesce(o.metadata, '{}'::jsonb)
             || jsonb_build_object(
                  'hold_expired', true,
                  'hold_expired_at', now(),
                  'hold_expired_reason', 'RESERVATION_HOLD_EXPIRED'
                ),
           updated_at = now()
     where o.status = 'PENDING'
       and o.payment_status = 'PENDING'
       and o.expires_at is not null
       and o.expires_at <= now()
     returning o.id
  )
  select expired.id from expired;
end;
$$;

revoke all on function public.process_expired_reservations() from public;
grant execute on function public.process_expired_reservations() to service_role;
