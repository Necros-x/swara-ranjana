-- Cover foreign keys used by joins/cascades and avoid repeated auth.uid()
-- evaluation in customer/self RLS policies. These changes do not expand access.

create index if not exists customer_order_requests_reviewed_by_idx
  on public.customer_order_requests (reviewed_by);
create index if not exists event_seats_block_id_idx
  on public.event_seats (block_id);
create index if not exists internal_ticket_batches_created_by_idx
  on public.internal_ticket_batches (created_by);
create index if not exists internal_ticket_batches_ticket_type_id_idx
  on public.internal_ticket_batches (ticket_type_id);
create index if not exists order_items_ticket_type_id_idx
  on public.order_items (ticket_type_id);
create index if not exists order_seats_order_item_id_idx
  on public.order_seats (order_item_id);
create index if not exists order_seats_ticket_id_idx
  on public.order_seats (ticket_id);
create index if not exists payment_submissions_reviewed_by_idx
  on public.payment_submissions (reviewed_by);
create index if not exists scan_logs_ticket_id_idx
  on public.scan_logs (ticket_id);
create index if not exists seat_blocks_ticket_type_id_idx
  on public.seat_blocks (ticket_type_id);
create index if not exists tickets_checked_in_by_idx
  on public.tickets (checked_in_by);
create index if not exists tickets_order_item_id_idx
  on public.tickets (order_item_id);
create index if not exists tickets_revoked_by_idx
  on public.tickets (revoked_by);
create index if not exists tickets_seat_id_idx
  on public.tickets (seat_id);
create index if not exists tickets_ticket_type_id_idx
  on public.tickets (ticket_type_id);

alter policy staff_profiles_self_read
  on public.staff_profiles
  using (user_id = (select auth.uid()));

alter policy customers_self_read
  on public.customers
  using (auth_user_id = (select auth.uid()));

alter policy orders_customer_read
  on public.orders
  using (
    exists (
      select 1
      from public.customers c
      where c.id = orders.customer_id
        and c.auth_user_id = (select auth.uid())
    )
  );

alter policy order_items_customer_read
  on public.order_items
  using (
    exists (
      select 1
      from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_items.order_id
        and c.auth_user_id = (select auth.uid())
    )
  );

alter policy tickets_customer_read
  on public.tickets
  using (
    exists (
      select 1
      from public.customers c
      where c.id = tickets.customer_id
        and c.auth_user_id = (select auth.uid())
    )
  );

alter policy payment_submissions_customer_read
  on public.payment_submissions
  using (
    exists (
      select 1
      from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = payment_submissions.order_id
        and c.auth_user_id = (select auth.uid())
    )
  );

alter policy events_customer_order_read
  on public.events
  using (
    exists (
      select 1
      from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.event_id = events.id
        and c.auth_user_id = (select auth.uid())
    )
  );

alter policy ticket_types_customer_order_read
  on public.ticket_types
  using (
    exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      join public.customers c on c.id = o.customer_id
      where oi.ticket_type_id = ticket_types.id
        and c.auth_user_id = (select auth.uid())
    )
  );

alter policy customer_order_requests_self_read
  on public.customer_order_requests
  using (
    exists (
      select 1
      from public.customers c
      where c.id = customer_order_requests.customer_id
        and c.auth_user_id = (select auth.uid())
    )
  );

alter policy customer_request_tickets_select_own
  on public.customer_order_request_tickets
  using (
    exists (
      select 1
      from public.customer_order_requests r
      join public.customers c on c.id = r.customer_id
      where r.id = customer_order_request_tickets.request_id
        and c.auth_user_id = (select auth.uid())
    )
  );
