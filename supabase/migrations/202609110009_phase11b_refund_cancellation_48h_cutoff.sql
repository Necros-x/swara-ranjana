-- Swara Ranjana — Phase 11B
-- Customer-initiated cancellations/refunds close exactly 48 hours before showtime.
-- Existing requests submitted before the cutoff may still be reviewed/completed by staff.
-- Already applied to the connected Supabase project; keep this file for history/reproducibility.

-- The app no longer uses the legacy authenticated customer RPC. Revoke it so it
-- cannot bypass the newer server bridge and ticket-level refund rules.
revoke execute on function public.customer_order_action(uuid,text) from authenticated;

-- Preserve the Phase 11 implementation behind a server-only wrapper so this
-- policy change stays small and auditable.
alter function public.customer_order_action_server(uuid,uuid,text,uuid[])
  rename to customer_order_action_server_phase11_legacy;

revoke all on function public.customer_order_action_server_phase11_legacy(uuid,uuid,text,uuid[]) from public;
revoke all on function public.customer_order_action_server_phase11_legacy(uuid,uuid,text,uuid[]) from anon;
revoke all on function public.customer_order_action_server_phase11_legacy(uuid,uuid,text,uuid[]) from authenticated;
grant execute on function public.customer_order_action_server_phase11_legacy(uuid,uuid,text,uuid[]) to service_role;

create function public.customer_order_action_server(
  p_auth_user_id uuid,
  p_order_id uuid,
  p_reason text default null,
  p_ticket_ids uuid[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
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
      'message', 'Online cancellations and refund requests close 48 hours before showtime. For an urgent exception, contact the Box Office at concierge@swararanjana.lk or +94 11 268 9000.'
    );
  end if;

  return public.customer_order_action_server_phase11_legacy(
    p_auth_user_id,
    p_order_id,
    p_reason,
    p_ticket_ids
  );
end;
$$;

revoke all on function public.customer_order_action_server(uuid,uuid,text,uuid[]) from public;
revoke all on function public.customer_order_action_server(uuid,uuid,text,uuid[]) from anon;
revoke all on function public.customer_order_action_server(uuid,uuid,text,uuid[]) from authenticated;
grant execute on function public.customer_order_action_server(uuid,uuid,text,uuid[]) to service_role;
