create or replace function public.customer_order_action_server(
  p_auth_user_id uuid,
  p_order_id uuid,
  p_reason text default null::text,
  p_ticket_ids uuid[] default null::uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_starts_at timestamptz;
begin
  if p_auth_user_id is null then
    raise exception 'Authenticated customer required' using errcode = '42501';
  end if;

  select e.starts_at
    into v_starts_at
    from public.orders o
    join public.customers c on c.id = o.customer_id
    join public.events e on e.id = o.event_id
   where o.id = p_order_id
     and c.auth_user_id = p_auth_user_id;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_FOUND',
      'message', 'Order not found.'
    );
  end if;

  if now() >= v_starts_at - interval '48 hours' then
    return jsonb_build_object(
      'ok', false,
      'code', 'REFUND_WINDOW_CLOSED',
      'message', 'Online cancellations and refund requests close 48 hours before showtime. For an urgent exception, contact Swara Ranjana support for assistance.'
    );
  end if;

  return public.customer_order_action_server_phase11_legacy(
    p_auth_user_id,
    p_order_id,
    p_reason,
    p_ticket_ids
  );
end;
$function$;
