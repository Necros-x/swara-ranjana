
create index if not exists seat_ticket_inventory_ticket_type_idx
  on public.seat_ticket_inventory(ticket_type_id);

create index if not exists seat_ticket_inventory_claimed_by_idx
  on public.seat_ticket_inventory(claimed_by)
  where claimed_by is not null;
