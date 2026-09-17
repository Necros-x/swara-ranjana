create table if not exists public.admin_notification_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id text not null,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_id)
);

alter table public.admin_notification_reads enable row level security;

revoke all on table public.admin_notification_reads from anon, authenticated;
grant select, insert, update, delete on table public.admin_notification_reads to service_role;

create index if not exists admin_notification_reads_read_at_idx
  on public.admin_notification_reads (read_at desc);
