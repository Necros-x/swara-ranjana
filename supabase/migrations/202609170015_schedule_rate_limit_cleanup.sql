create index if not exists server_rate_limit_events_created_at_idx
  on private.server_rate_limit_events (created_at);

select cron.schedule(
  'sr-rate-limit-cleanup',
  '17 * * * *',
  $$delete from private.server_rate_limit_events where created_at < now() - interval '24 hours'$$
);
