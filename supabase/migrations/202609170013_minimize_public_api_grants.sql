-- Existing application tables are read through RLS, while writes are routed
-- through vetted server actions / service-only RPCs. Remove unnecessary direct
-- client mutation privileges without disturbing SELECT needed by customer/staff
-- reads and Realtime subscriptions.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public
  from anon, authenticated;

revoke all privileges
  on all sequences in schema public
  from anon, authenticated;

-- Trigger helpers should never be invoked directly through the Data API.
revoke execute on function public.assign_order_number() from public, anon, authenticated;
revoke execute on function public.assign_ticket_number() from public, anon, authenticated;
revoke execute on function public.prevent_approved_refund_rejection() from public, anon, authenticated;
revoke execute on function public.release_order_seat_on_ticket_refund() from public, anon, authenticated;
revoke execute on function public.release_order_seats_on_order_close() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Preserve server-side capability explicitly.
grant execute on function public.assign_order_number() to service_role;
grant execute on function public.assign_ticket_number() to service_role;
grant execute on function public.prevent_approved_refund_rejection() to service_role;
grant execute on function public.release_order_seat_on_ticket_refund() to service_role;
grant execute on function public.release_order_seats_on_order_close() to service_role;
grant execute on function public.set_updated_at() to service_role;

-- New app objects should not silently regain broad client write / function
-- execution rights through Supabase's legacy public-schema defaults.
alter default privileges for role postgres in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
