-- Swara Ranjana — Phase 12
-- Realtime admin refresh support + irreversible refund approval.
-- Already applied to the connected Supabase project; keep this file for history/reproducibility.

-- Admin refund screens are server-rendered, but their realtime subscriptions
-- still need permission to observe request rows through the authenticated
-- browser session.
drop policy if exists customer_order_requests_admin_read on public.customer_order_requests;
create policy customer_order_requests_admin_read
on public.customer_order_requests for select
to authenticated
using (
  public.has_staff_role(
    array['SUPER_ADMIN','ADMIN']::public.staff_role[]
  )
);

-- Publish the operational tables used by the Orders, Refunds and Scan History
-- realtime refresh wrappers. Keep this idempotent for restored environments.
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'orders',
    'tickets',
    'scan_logs',
    'customer_order_requests',
    'payment_submissions'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        v_table
      );
    end if;
  end loop;
end;
$$;

-- Once a refund has been approved it must move forward to completion rather
-- than being rejected afterwards. This protects the rule even if a client
-- bypasses the disabled admin button.
create or replace function public.prevent_approved_refund_rejection()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.kind = 'REFUND'
     and old.status = 'APPROVED'
     and new.status = 'REJECTED' then
    raise exception 'An approved refund cannot be rejected. Complete the refund instead.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists customer_order_requests_lock_approved_refund on public.customer_order_requests;
create trigger customer_order_requests_lock_approved_refund
before update on public.customer_order_requests
for each row
execute function public.prevent_approved_refund_rejection();
