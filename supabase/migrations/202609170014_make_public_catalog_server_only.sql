alter function public.get_public_event_catalog(text) security invoker;
revoke all on function public.get_public_event_catalog(text) from public, anon, authenticated;
grant execute on function public.get_public_event_catalog(text) to service_role;
