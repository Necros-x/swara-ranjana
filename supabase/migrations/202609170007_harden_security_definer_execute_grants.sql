-- Restrict SECURITY DEFINER functions to the roles that actually use them.

-- Customer account claiming requires a signed-in user because the function
-- binds the current auth.uid() to the customer row matching the JWT email.
revoke execute on function public.claim_customer_account() from anon;
grant execute on function public.claim_customer_account() to authenticated, service_role;

-- Expiry processing and Vault token verification are called only from the
-- server-side cron route through the service-role Supabase client.
revoke execute on function public.process_expired_reservations() from public, anon, authenticated;
grant execute on function public.process_expired_reservations() to service_role;

revoke execute on function public.verify_expiry_scheduler_token(text) from public, anon, authenticated;
grant execute on function public.verify_expiry_scheduler_token(text) to service_role;

-- Legacy combined payment + admission RPC. The current architecture separates
-- payment collection from gate admission, so no application role should call it.
revoke execute on function public.collect_on_arrival_and_redeem(text, uuid, text, jsonb)
  from public, anon, authenticated, service_role;

-- The current admin action uses the newer six-argument service-only overload.
-- Keep the older four-argument overload inaccessible to authenticated clients.
revoke execute on function public.issue_internal_ticket_batch(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.issue_internal_ticket_batch(uuid, uuid, integer, text)
  to service_role;
