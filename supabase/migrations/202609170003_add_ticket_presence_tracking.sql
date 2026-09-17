alter type public.scan_result add value if not exists 'EXITED';

alter table public.tickets
  add column if not exists is_inside boolean not null default false,
  add column if not exists last_exited_at timestamptz;

update public.tickets
set is_inside = true
where status = 'USED'
  and is_inside = false;
