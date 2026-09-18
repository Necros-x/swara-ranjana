
update public.ticket_types
set
  code = 'BALCONY',
  name = 'Balcony',
  description = 'Balcony seating',
  seating_zone = 'Auditorium Balcony · Blocks F–H',
  price_lkr = 1500,
  benefits = '{}'::text[],
  recommended = false,
  updated_at = now()
where event_id = (select id from public.events where slug = 'swara-ranjana-2026')
  and code = 'GENERAL';

update public.ticket_types
set
  code = 'STANDARD',
  name = 'Standard',
  description = 'Standard seating',
  seating_zone = 'Auditorium ODC · Blocks A & E',
  price_lkr = 3000,
  benefits = '{}'::text[],
  recommended = false,
  updated_at = now()
where event_id = (select id from public.events where slug = 'swara-ranjana-2026')
  and code = 'PREMIUM';

update public.ticket_types
set
  name = 'VIP',
  description = 'VIP seating',
  seating_zone = 'Auditorium ODC · Blocks B–D',
  price_lkr = 5000,
  benefits = '{}'::text[],
  recommended = false,
  updated_at = now()
where event_id = (select id from public.events where slug = 'swara-ranjana-2026')
  and code = 'VIP';

create table if not exists public.seat_ticket_inventory (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  seat_id uuid not null unique references public.event_seats(id) on delete restrict,
  serial_number integer not null check (serial_number > 0),
  serial_code text not null,
  base_ticket_number text not null,
  ticket_number text not null,
  revision integer not null default 0 check (revision >= 0),
  qr_token text not null default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'AVAILABLE'
    check (status in ('AVAILABLE','HELD_ONLINE','SOLD_ONLINE','SOLD_PHYSICAL')),
  order_id uuid references public.orders(id) on delete set null,
  issued_ticket_id uuid references public.tickets(id) on delete set null,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, ticket_type_id, serial_number),
  unique(event_id, serial_code),
  unique(base_ticket_number),
  unique(ticket_number),
  unique(qr_token)
);

create index if not exists seat_ticket_inventory_availability_idx
  on public.seat_ticket_inventory(event_id, ticket_type_id, status, serial_number);

create index if not exists seat_ticket_inventory_order_idx
  on public.seat_ticket_inventory(order_id)
  where order_id is not null;

create index if not exists seat_ticket_inventory_ticket_idx
  on public.seat_ticket_inventory(issued_ticket_id)
  where issued_ticket_id is not null;

alter table public.seat_ticket_inventory enable row level security;

revoke all on table public.seat_ticket_inventory from public, anon, authenticated;
grant select, insert, update, delete on table public.seat_ticket_inventory to service_role;

drop trigger if exists seat_ticket_inventory_set_updated_at on public.seat_ticket_inventory;
create trigger seat_ticket_inventory_set_updated_at
before update on public.seat_ticket_inventory
for each row execute function public.set_updated_at();

with ranked as (
  select
    s.id as seat_id,
    s.event_id,
    b.ticket_type_id,
    tt.code,
    e.starts_at,
    e.timezone,
    row_number() over (
      partition by s.event_id, b.ticket_type_id
      order by b.sort_order, s.row_number, s.seat_number
    )::integer as serial_number
  from public.event_seats s
  join public.seat_blocks b on b.id = s.block_id
  join public.ticket_types tt on tt.id = b.ticket_type_id
  join public.events e on e.id = s.event_id
  where e.slug = 'swara-ranjana-2026'
    and s.is_active
),
prepared as (
  select
    r.*,
    case r.code
      when 'BALCONY' then 'BAL'
      when 'STANDARD' then 'STD'
      when 'VIP' then 'VIP'
      else upper(left(r.code, 3))
    end as prefix
  from ranked r
),
active_ticket as (
  select distinct on (t.seat_id)
    t.seat_id,
    t.id as ticket_id,
    t.order_id,
    t.ticket_number,
    t.qr_token,
    t.issued_at
  from public.tickets t
  where t.seat_id is not null
    and t.status in ('VALID','USED')
  order by t.seat_id, t.issued_at desc
),
active_allocation as (
  select distinct on (os.seat_id)
    os.seat_id,
    os.order_id,
    os.status,
    os.held_until,
    os.created_at
  from public.order_seats os
  join public.orders o on o.id = os.order_id
  where os.status = 'CONFIRMED'
     or (os.status = 'HOLD' and os.held_until > now())
  order by
    os.seat_id,
    case when os.status = 'CONFIRMED' then 0 else 1 end,
    os.created_at desc
)
insert into public.seat_ticket_inventory (
  event_id,
  ticket_type_id,
  seat_id,
  serial_number,
  serial_code,
  base_ticket_number,
  ticket_number,
  qr_token,
  status,
  order_id,
  issued_ticket_id,
  claimed_at
)
select
  p.event_id,
  p.ticket_type_id,
  p.seat_id,
  p.serial_number,
  p.prefix || '-' || lpad(p.serial_number::text, 3, '0'),
  'SR' ||
    to_char(p.starts_at at time zone p.timezone, 'YY') ||
    '-' || p.prefix || '-' || lpad(p.serial_number::text, 3, '0'),
  coalesce(
    at.ticket_number,
    'SR' ||
      to_char(p.starts_at at time zone p.timezone, 'YY') ||
      '-' || p.prefix || '-' || lpad(p.serial_number::text, 3, '0')
  ),
  coalesce(at.qr_token, encode(gen_random_bytes(32), 'hex')),
  case
    when at.ticket_id is not null then 'SOLD_ONLINE'
    when aa.status = 'CONFIRMED' then 'SOLD_ONLINE'
    when aa.status = 'HOLD' then 'HELD_ONLINE'
    else 'AVAILABLE'
  end,
  coalesce(at.order_id, aa.order_id),
  at.ticket_id,
  coalesce(at.issued_at, aa.created_at)
from prepared p
left join active_ticket at on at.seat_id = p.seat_id
left join active_allocation aa on aa.seat_id = p.seat_id
on conflict (seat_id) do nothing;
