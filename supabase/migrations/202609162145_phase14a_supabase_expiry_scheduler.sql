-- Swara Ranjana — Phase 14A
-- Five-minute reservation expiry worker using Supabase Cron.
-- This replaces a Vercel Cron configuration because the current Vercel Hobby
-- plan only supports daily scheduled invocations.
-- Already applied to the connected Supabase project.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if not exists (
    select 1 from vault.secrets where name = 'sr_expiry_scheduler_token'
  ) then
    perform vault.create_secret(
      gen_random_uuid()::text || gen_random_uuid()::text,
      'sr_expiry_scheduler_token',
      'Authenticates the five-minute Swara Ranjana reservation expiry worker.'
    );
  end if;
end;
$$;

create or replace function public.verify_expiry_scheduler_token(p_token text)
returns boolean
language sql
stable
security definer
set search_path = public, vault
as $$
  select exists (
    select 1
    from vault.decrypted_secrets
    where name = 'sr_expiry_scheduler_token'
      and decrypted_secret = p_token
  );
$$;

revoke all on function public.verify_expiry_scheduler_token(text) from public;
grant execute on function public.verify_expiry_scheduler_token(text) to service_role;

do $$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id
  from cron.job
  where jobname = 'sr-expire-reservations'
  limit 1;

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;
end;
$$;

select cron.schedule(
  'sr-expire-reservations',
  '*/5 * * * *',
  $cron$
    select net.http_get(
      url := 'https://swara-ranjana.vercel.app/api/cron/expire-reservations',
      headers := jsonb_build_object(
        'x-sr-scheduler-token',
        (select decrypted_secret from vault.decrypted_secrets where name = 'sr_expiry_scheduler_token')
      ),
      timeout_milliseconds := 10000
    ) as request_id;
  $cron$
);
