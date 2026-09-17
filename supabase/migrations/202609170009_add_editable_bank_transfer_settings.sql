create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.app_settings enable row level security;

revoke all on table public.app_settings from anon, authenticated;
grant select, insert, update, delete on table public.app_settings to service_role;

create index if not exists app_settings_updated_by_idx
  on public.app_settings(updated_by);

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

insert into public.app_settings(key, value)
values (
  'bank_transfer',
  jsonb_build_object(
    'bankName', 'DEMO BANK',
    'accountName', 'SWARA RANJANA 2026 - DEMO',
    'accountNumber', '0000000000',
    'branch', 'KANDY - DEMO',
    'isMock', true
  )
)
on conflict (key) do nothing;