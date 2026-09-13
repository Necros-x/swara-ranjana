-- These privileged mutations are called only by trusted Next.js server actions.
-- Supabase default function grants can give anon/authenticated direct EXECUTE
-- privileges, so revoke every non-service role explicitly.
revoke execute on function public.create_checkout_reservation_with_seats(
  uuid,
  uuid,
  integer,
  text,
  text,
  text,
  text,
  uuid,
  text,
  uuid[]
) from public, anon, authenticated;

grant execute on function public.create_checkout_reservation_with_seats(
  uuid,
  uuid,
  integer,
  text,
  text,
  text,
  text,
  uuid,
  text,
  uuid[]
) to service_role;

revoke execute on function public.update_seat_pricing_server(
  uuid,
  uuid,
  text,
  integer,
  integer
) from public, anon, authenticated;

grant execute on function public.update_seat_pricing_server(
  uuid,
  uuid,
  text,
  integer,
  integer
) to service_role;
