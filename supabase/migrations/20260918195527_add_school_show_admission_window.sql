
alter table public.events
  add column if not exists school_show_starts_at timestamptz,
  add column if not exists school_show_ends_at timestamptz;

alter type public.scan_result add value if not exists 'NOT_YET_VALID';
alter type public.scan_result add value if not exists 'EXPIRED';
