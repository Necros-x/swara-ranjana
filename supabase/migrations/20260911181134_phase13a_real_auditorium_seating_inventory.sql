alter table public.order_items add column if not exists seat_selection_fee_lkr integer not null default 0 check (seat_selection_fee_lkr >= 0);

create table if not exists public.seat_blocks (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  code text not null, level text not null check (level in ('ODC','BALCONY')), display_name text not null,
  manual_fee_lkr integer not null default 0 check (manual_fee_lkr >= 0), sort_order smallint not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(event_id,code)
);
create table if not exists public.event_seats (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
  block_id uuid not null references public.seat_blocks(id) on delete cascade,
  row_number smallint not null check(row_number>0), seat_number smallint not null check(seat_number>0), label text not null,
  manual_fee_lkr integer not null default 0 check(manual_fee_lkr>=0), is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(event_id,block_id,row_number,seat_number), unique(event_id,label)
);
create table if not exists public.order_seats (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  seat_id uuid not null references public.event_seats(id) on delete restrict,
  ticket_id uuid references public.tickets(id) on delete set null,
  selection_mode text not null check(selection_mode in ('RANDOM','MANUAL')),
  surcharge_lkr integer not null default 0 check(surcharge_lkr>=0),
  status text not null default 'HOLD' check(status in ('HOLD','CONFIRMED','RELEASED')),
  held_until timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists order_seats_active_seat_idx on public.order_seats(seat_id) where status in ('HOLD','CONFIRMED');
create index if not exists order_seats_order_idx on public.order_seats(order_id);
create index if not exists event_seats_event_block_idx on public.event_seats(event_id,block_id,row_number,seat_number);

alter table public.tickets add column if not exists seat_id uuid references public.event_seats(id) on delete set null;
alter table public.tickets add column if not exists seat_label text;

drop trigger if exists seat_blocks_set_updated_at on public.seat_blocks;
create trigger seat_blocks_set_updated_at before update on public.seat_blocks for each row execute function public.set_updated_at();
drop trigger if exists event_seats_set_updated_at on public.event_seats;
create trigger event_seats_set_updated_at before update on public.event_seats for each row execute function public.set_updated_at();
drop trigger if exists order_seats_set_updated_at on public.order_seats;
create trigger order_seats_set_updated_at before update on public.order_seats for each row execute function public.set_updated_at();

alter table public.seat_blocks enable row level security; alter table public.event_seats enable row level security; alter table public.order_seats enable row level security;
drop policy if exists seat_blocks_staff_read on public.seat_blocks;
create policy seat_blocks_staff_read on public.seat_blocks for select to authenticated using(public.is_active_staff());
drop policy if exists event_seats_staff_read on public.event_seats;
create policy event_seats_staff_read on public.event_seats for select to authenticated using(public.is_active_staff());
drop policy if exists order_seats_staff_read on public.order_seats;
create policy order_seats_staff_read on public.order_seats for select to authenticated using(public.has_staff_role(array['SUPER_ADMIN','ADMIN','BOX_OFFICE']::public.staff_role[]));

update public.events set venue_name='Mahinda Rajapaksha Auditorium, Polgolla', venue_address='Polgolla, Kandy, Sri Lanka', total_capacity=1120,
 description='Swara Ranjana 2026, conducted by St. Sylvester''s College, Kandy.', updated_at=now()
where slug='swara-ranjana-2026';
update public.ticket_types tt set capacity=case tt.code when 'GENERAL' then 407 when 'PREMIUM' then 335 when 'VIP' then 378 else tt.capacity end,
 seating_zone=case tt.code when 'GENERAL' then 'Auditorium Balcony · Blocks F–H' when 'PREMIUM' then 'Auditorium ODC · Blocks A & E' when 'VIP' then 'Auditorium ODC · Blocks B–D' else tt.seating_zone end, updated_at=now()
from public.events e where tt.event_id=e.id and e.slug='swara-ranjana-2026' and tt.code in ('GENERAL','PREMIUM','VIP');

delete from public.order_seats os using public.event_seats s, public.events e where os.seat_id=s.id and s.event_id=e.id and e.slug='swara-ranjana-2026';
delete from public.event_seats s using public.events e where s.event_id=e.id and e.slug='swara-ranjana-2026';
delete from public.seat_blocks b using public.events e where b.event_id=e.id and e.slug='swara-ranjana-2026';

with block_seed(code,level,display_name,ticket_code,manual_fee_lkr,sort_order) as (
 values ('A','ODC','Block A','PREMIUM',500,1),('B','ODC','Block B','VIP',650,2),('C','ODC','Block C','VIP',750,3),('D','ODC','Block D','VIP',650,4),('E','ODC','Block E','PREMIUM',500,5),('F','BALCONY','Block F','GENERAL',250,6),('G','BALCONY','Block G','GENERAL',350,7),('H','BALCONY','Block H','GENERAL',250,8)
)
insert into public.seat_blocks(event_id,ticket_type_id,code,level,display_name,manual_fee_lkr,sort_order)
select e.id,tt.id,s.code,s.level,s.display_name,s.manual_fee_lkr,s.sort_order from block_seed s join public.events e on e.slug='swara-ranjana-2026' join public.ticket_types tt on tt.event_id=e.id and tt.code=s.ticket_code;

with row_seed(code,row_counts) as (
 values ('A',array[8,10,11,10,11,11,12,12,12,5,13,13,13,11,11]::integer[]),('B',array[2,3,4,4,5,5,6,7,8,8,9]::integer[]),('C',array[11,13,13,13,14,14,15,15,16,17,18,17,18,14,14,17,17]::integer[]),('D',array[2,3,4,4,5,5,6,7,8,8,9]::integer[]),('E',array[9,10,11,10,11,11,12,12,12,12,13,13,13,11,12]::integer[]),('F',array[17,18,18,20,21,21,17]::integer[]),('G',array[15,16,16,18,19,20,21,23]::integer[]),('H',array[17,18,18,18,19,21,16]::integer[])
), expanded as (
 select r.code,row_index::integer row_number,r.row_counts[row_index]::integer seat_count from row_seed r,generate_subscripts(r.row_counts,1) row_index
)
insert into public.event_seats(event_id,block_id,row_number,seat_number,label,manual_fee_lkr)
select b.event_id,b.id,x.row_number,seat_no,b.code||'-R'||lpad(x.row_number::text,2,'0')||'-S'||lpad(seat_no::text,2,'0'),b.manual_fee_lkr+((x.row_number-1)*25)
from expanded x join public.seat_blocks b on b.code=x.code join public.events e on e.id=b.event_id and e.slug='swara-ranjana-2026'
cross join lateral generate_series(1,x.seat_count) seat_no;

with ranked_tickets as (
 select t.id,t.order_id,t.order_item_id,t.ticket_type_id,row_number() over(partition by t.ticket_type_id order by t.ticket_number) rn
 from public.tickets t join public.events e on e.id=t.event_id where e.slug='swara-ranjana-2026' and t.status in ('VALID','USED') and t.seat_id is null
), ranked_seats as (
 select s.id,s.label,b.ticket_type_id,row_number() over(partition by b.ticket_type_id order by b.sort_order,s.row_number,s.seat_number) rn
 from public.event_seats s join public.seat_blocks b on b.id=s.block_id where s.is_active
), matched as (
 select rt.id ticket_id,rt.order_id,rt.order_item_id,rs.id seat_id,rs.label from ranked_tickets rt join ranked_seats rs on rs.ticket_type_id=rt.ticket_type_id and rs.rn=rt.rn
)
update public.tickets t set seat_id=m.seat_id,seat_label=m.label,updated_at=now() from matched m where t.id=m.ticket_id;

insert into public.order_seats(order_id,order_item_id,seat_id,ticket_id,selection_mode,surcharge_lkr,status,held_until)
select t.order_id,t.order_item_id,t.seat_id,t.id,'RANDOM',0,'CONFIRMED',null from public.tickets t join public.events e on e.id=t.event_id
where e.slug='swara-ranjana-2026' and t.seat_id is not null and t.status in ('VALID','USED') and not exists(select 1 from public.order_seats os where os.ticket_id=t.id);

do $$ begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='order_seats') then alter publication supabase_realtime add table public.order_seats; end if; end $$;
