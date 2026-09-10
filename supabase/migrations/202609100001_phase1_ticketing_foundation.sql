-- Swara Ranjana — Phase 1 ticketing foundation
-- Run this once in the Supabase SQL Editor for a new project, or use
-- `supabase db push` when using the Supabase CLI.

create extension if not exists pgcrypto with schema extensions;

create type public.event_status as enum (
  'DRAFT',
  'ON_SALE',
  'SOLD_OUT',
  'COMPLETED',
  'CANCELLED'
);

create type public.ticket_type_status as enum (
  'DRAFT',
  'AVAILABLE',
  'PAUSED',
  'SOLD_OUT'
);

create type public.order_status as enum (
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'REFUNDED'
);

create type public.payment_status as enum (
  'PENDING',
  'PAID',
  'FAILED',
  'PARTIALLY_REFUNDED',
  'REFUNDED'
);

create type public.ticket_status as enum (
  'VALID',
  'USED',
  'REVOKED',
  'REFUNDED'
);

create type public.staff_role as enum (
  'SUPER_ADMIN',
  'ADMIN',
  'BOX_OFFICE',
  'SCANNER'
);

create type public.staff_status as enum ('ACTIVE', 'DISABLED');

create type public.scan_result as enum (
  'ADMITTED',
  'DUPLICATE',
  'INVALID',
  'REVOKED',
  'REFUNDED',
  'WRONG_EVENT'
);

create sequence public.order_number_seq start with 1001;
create sequence public.ticket_number_seq start with 1001;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  doors_open_at timestamptz,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Asia/Colombo',
  venue_name text not null,
  venue_address text,
  hero_artwork_url text,
  status public.event_status not null default 'DRAFT',
  total_capacity integer not null check (total_capacity >= 0),
  currency text not null default 'LKR' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_time_order check (
    ends_at is null or ends_at > starts_at
  ),
  constraint events_doors_before_start check (
    doors_open_at is null or doors_open_at <= starts_at
  )
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  seating_zone text,
  price_lkr integer not null check (price_lkr >= 0),
  capacity integer not null check (capacity >= 0),
  max_per_order smallint not null default 6 check (max_per_order between 1 and 20),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  status public.ticket_type_status not null default 'DRAFT',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, code),
  constraint ticket_types_sale_window check (
    sale_ends_at is null
    or sale_starts_at is null
    or sale_ends_at > sale_starts_at
  )
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index customers_email_lower_idx
  on public.customers (lower(email));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  order_number text not null unique,
  access_token text not null default encode(extensions.gen_random_bytes(24), 'hex') unique,
  status public.order_status not null default 'PENDING',
  payment_status public.payment_status not null default 'PENDING',
  subtotal_lkr integer not null default 0 check (subtotal_lkr >= 0),
  discount_lkr integer not null default 0 check (discount_lkr >= 0),
  total_lkr integer not null default 0 check (total_lkr >= 0),
  currency text not null default 'LKR' check (char_length(currency) = 3),
  payment_provider text,
  payment_reference text,
  expires_at timestamptz,
  paid_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_discount_not_above_subtotal check (discount_lkr <= subtotal_lkr)
);

create unique index orders_payment_reference_idx
  on public.orders (payment_provider, payment_reference)
  where payment_reference is not null;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_lkr integer not null check (unit_price_lkr >= 0),
  total_price_lkr integer generated always as (quantity * unit_price_lkr) stored,
  created_at timestamptz not null default now(),
  unique (order_id, ticket_type_id)
);

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.staff_role not null default 'SCANNER',
  status public.staff_status not null default 'ACTIVE',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  ticket_number text not null unique,
  qr_token text not null default encode(extensions.gen_random_bytes(32), 'hex') unique,
  attendee_name text,
  status public.ticket_status not null default 'VALID',
  issued_at timestamptz not null default now(),
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revoke_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scan_logs (
  id bigint generated by default as identity primary key,
  event_id uuid not null references public.events(id) on delete restrict,
  ticket_id uuid references public.tickets(id) on delete set null,
  staff_user_id uuid not null references auth.users(id) on delete restrict,
  result public.scan_result not null,
  gate text,
  ticket_number_snapshot text,
  metadata jsonb not null default '{}'::jsonb,
  scanned_at timestamptz not null default now()
);

create index ticket_types_event_idx on public.ticket_types(event_id, status);
create index orders_event_idx on public.orders(event_id, created_at desc);
create index orders_customer_idx on public.orders(customer_id, created_at desc);
create index orders_payment_status_idx on public.orders(payment_status, created_at desc);
create index tickets_event_status_idx on public.tickets(event_id, status);
create index tickets_order_idx on public.tickets(order_id);
create index tickets_customer_idx on public.tickets(customer_id);
create index scan_logs_event_time_idx on public.scan_logs(event_id, scanned_at desc);
create index scan_logs_staff_time_idx on public.scan_logs(staff_user_id, scanned_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger ticket_types_set_updated_at
before update on public.ticket_types
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger staff_profiles_set_updated_at
before update on public.staff_profiles
for each row execute function public.set_updated_at();

create trigger tickets_set_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

create or replace function public.assign_order_number()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  event_year text;
begin
  if new.order_number is null or btrim(new.order_number) = '' then
    select to_char(e.starts_at at time zone e.timezone, 'YY')
      into event_year
      from public.events e
      where e.id = new.event_id;

    if event_year is null then
      raise exception 'Cannot create order number: event % does not exist', new.event_id;
    end if;

    new.order_number :=
      'SR' || event_year || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;

  return new;
end;
$$;

create trigger orders_assign_order_number
before insert on public.orders
for each row execute function public.assign_order_number();

create or replace function public.assign_ticket_number()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  event_year text;
begin
  if new.ticket_number is null or btrim(new.ticket_number) = '' then
    select to_char(e.starts_at at time zone e.timezone, 'YY')
      into event_year
      from public.events e
      where e.id = new.event_id;

    if event_year is null then
      raise exception 'Cannot create ticket number: event % does not exist', new.event_id;
    end if;

    new.ticket_number :=
      'SR' || event_year || '-T' || lpad(nextval('public.ticket_number_seq')::text, 7, '0');
  end if;

  return new;
end;
$$;

create trigger tickets_assign_ticket_number
before insert on public.tickets
for each row execute function public.assign_ticket_number();

-- Helper functions intentionally run as SECURITY DEFINER so RLS policies can
-- check staff membership without recursively invoking staff_profiles policies.
create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles s
    where s.user_id = auth.uid()
      and s.status = 'ACTIVE'
  );
$$;

create or replace function public.has_staff_role(allowed_roles public.staff_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles s
    where s.user_id = auth.uid()
      and s.status = 'ACTIVE'
      and s.role = any(allowed_roles)
  );
$$;

revoke all on function public.is_active_staff() from public;
revoke all on function public.has_staff_role(public.staff_role[]) from public;
grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.has_staff_role(public.staff_role[]) to authenticated;

alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.scan_logs enable row level security;

-- Public concert catalogue. Only sale-visible events/categories are exposed.
create policy events_public_read
on public.events for select
to anon, authenticated
using (status in ('ON_SALE', 'SOLD_OUT', 'COMPLETED'));

create policy ticket_types_public_read
on public.ticket_types for select
to anon, authenticated
using (
  status in ('AVAILABLE', 'SOLD_OUT')
  and exists (
    select 1
    from public.events e
    where e.id = ticket_types.event_id
      and e.status in ('ON_SALE', 'SOLD_OUT', 'COMPLETED')
  )
);

-- Staff can read operational data according to role. Scanner-only users do not
-- get direct access to customer/order tables; the redeem RPC reveals only the
-- fields needed at the gate.
create policy events_staff_read
on public.events for select
to authenticated
using (public.is_active_staff());

create policy ticket_types_staff_read
on public.ticket_types for select
to authenticated
using (public.is_active_staff());

create policy customers_staff_read
on public.customers for select
to authenticated
using (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE']::public.staff_role[])
);

create policy orders_staff_read
on public.orders for select
to authenticated
using (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE']::public.staff_role[])
);

create policy order_items_staff_read
on public.order_items for select
to authenticated
using (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE']::public.staff_role[])
);

create policy tickets_staff_read
on public.tickets for select
to authenticated
using (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE']::public.staff_role[])
);

create policy staff_profiles_self_read
on public.staff_profiles for select
to authenticated
using (user_id = auth.uid());

create policy staff_profiles_admin_read
on public.staff_profiles for select
to authenticated
using (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN']::public.staff_role[])
);

create policy scan_logs_staff_read
on public.scan_logs for select
to authenticated
using (public.is_active_staff());

-- Admin/editor writes. Checkout/order creation will use a protected server
-- action in a later phase rather than opening public INSERT policies here.
create policy events_admin_insert
on public.events for insert
to authenticated
with check (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN']::public.staff_role[])
);

create policy events_admin_update
on public.events for update
to authenticated
using (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN']::public.staff_role[])
)
with check (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN']::public.staff_role[])
);

create policy ticket_types_admin_insert
on public.ticket_types for insert
to authenticated
with check (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN']::public.staff_role[])
);

create policy ticket_types_admin_update
on public.ticket_types for update
to authenticated
using (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN']::public.staff_role[])
)
with check (
  public.has_staff_role(array['SUPER_ADMIN', 'ADMIN']::public.staff_role[])
);

-- Atomic admission RPC. This is created in Phase 1 so the ticket model cannot
-- later drift away from the validation model. The scanner UI will call it in a
-- later phase.
create or replace function public.redeem_ticket(
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
  current_staff public.staff_profiles%rowtype;
  found_ticket record;
  result public.scan_result;
  response jsonb;
begin
  select *
    into current_staff
    from public.staff_profiles
    where user_id = auth.uid()
      and status = 'ACTIVE';

  if not found or current_staff.role not in ('SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE', 'SCANNER') then
    raise exception 'Staff access required' using errcode = '42501';
  end if;

  select
    t.id,
    t.event_id,
    t.ticket_number,
    t.status,
    t.checked_in_at,
    c.full_name as customer_name,
    tt.name as ticket_type_name
  into found_ticket
  from public.tickets t
  join public.customers c on c.id = t.customer_id
  join public.ticket_types tt on tt.id = t.ticket_type_id
  where t.qr_token = p_token
  for update of t;

  if not found then
    insert into public.scan_logs (
      event_id,
      ticket_id,
      staff_user_id,
      result,
      gate,
      metadata
    ) values (
      p_event_id,
      null,
      auth.uid(),
      'INVALID',
      p_gate,
      jsonb_build_object('device', coalesce(p_device, '{}'::jsonb))
    );

    return jsonb_build_object(
      'ok', false,
      'result', 'INVALID',
      'message', 'Unknown ticket'
    );
  end if;

  if found_ticket.event_id <> p_event_id then
    result := 'WRONG_EVENT';
  elsif found_ticket.status = 'USED' then
    result := 'DUPLICATE';
  elsif found_ticket.status = 'REVOKED' then
    result := 'REVOKED';
  elsif found_ticket.status = 'REFUNDED' then
    result := 'REFUNDED';
  else
    result := 'ADMITTED';

    update public.tickets
    set
      status = 'USED',
      checked_in_at = now(),
      checked_in_by = auth.uid()
    where id = found_ticket.id;
  end if;

  insert into public.scan_logs (
    event_id,
    ticket_id,
    staff_user_id,
    result,
    gate,
    ticket_number_snapshot,
    metadata
  ) values (
    p_event_id,
    found_ticket.id,
    auth.uid(),
    result,
    p_gate,
    found_ticket.ticket_number,
    jsonb_build_object('device', coalesce(p_device, '{}'::jsonb))
  );

  response := jsonb_build_object(
    'ok', result = 'ADMITTED',
    'result', result,
    'ticketId', found_ticket.id,
    'ticketNumber', found_ticket.ticket_number,
    'customerName', found_ticket.customer_name,
    'ticketType', found_ticket.ticket_type_name,
    'firstUsedAt', found_ticket.checked_in_at
  );

  if result = 'ADMITTED' then
    response := response || jsonb_build_object('checkedInAt', now());
  end if;

  return response;
end;
$$;

revoke all on function public.redeem_ticket(text, uuid, text, jsonb) from public;
grant execute on function public.redeem_ticket(text, uuid, text, jsonb) to authenticated;

comment on column public.orders.access_token is
  'High-entropy guest access secret. Never expose through unrestricted client queries.';
comment on column public.tickets.qr_token is
  'High-entropy QR admission token. Return only through protected ticket-delivery endpoints.';
comment on function public.redeem_ticket(text, uuid, text, jsonb) is
  'Atomically validates and consumes a ticket for authenticated active staff.';
