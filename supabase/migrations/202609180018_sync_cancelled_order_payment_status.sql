create or replace function public.sync_cancelled_order_payment_status()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.status = 'CANCELLED' and new.payment_status = 'PENDING' then
    new.payment_status := 'CANCELLED';
  end if;

  return new;
end;
$function$;

drop trigger if exists orders_sync_cancelled_payment_status on public.orders;

create trigger orders_sync_cancelled_payment_status
before insert or update on public.orders
for each row
execute function public.sync_cancelled_order_payment_status();

revoke execute on function public.sync_cancelled_order_payment_status()
from public, anon, authenticated;

grant execute on function public.sync_cancelled_order_payment_status()
to service_role;

update public.orders
set payment_status = 'CANCELLED'
where status = 'CANCELLED'
  and payment_status = 'PENDING';
