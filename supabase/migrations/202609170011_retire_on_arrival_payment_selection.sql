create or replace function public.select_payment_method(
  p_order_number text,
  p_access_token text,
  p_method text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order public.orders%rowtype;
begin
  if p_method = 'ON_ARRIVAL' then
    return jsonb_build_object(
      'ok', false,
      'code', 'METHOD_RETIRED',
      'message', 'Pay on arrival is no longer available for new reservations.'
    );
  end if;

  if p_method not in ('CARD', 'BANK_SLIP') then
    return jsonb_build_object('ok', false, 'code', 'INVALID_METHOD', 'message', 'Choose a valid payment method.');
  end if;

  select * into v_order
    from public.orders
   where order_number = btrim(p_order_number)
     and access_token = btrim(p_access_token)
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Reservation not found.');
  end if;

  if v_order.status <> 'PENDING' then
    return jsonb_build_object('ok', false, 'code', 'ORDER_CLOSED', 'message', 'This reservation is already finalized.');
  end if;

  if v_order.expires_at is not null and v_order.expires_at <= now() then
    return jsonb_build_object('ok', false, 'code', 'HOLD_EXPIRED', 'message', 'This reservation hold has expired.');
  end if;

  update public.orders
     set payment_method = p_method,
         updated_at = now()
   where id = v_order.id;

  return jsonb_build_object('ok', true, 'payment_method', p_method);
end;
$function$;
