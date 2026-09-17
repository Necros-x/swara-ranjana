do $$
declare
  v_sql text;
begin
  select pg_get_functiondef(
    'public.collect_on_arrival_payment_server(uuid,uuid)'::regprocedure
  ) into v_sql;

  v_sql := replace(
    v_sql,
    'Box office access required',
    'Swara Ranjana staff access required'
  );

  execute v_sql;
end $$;
