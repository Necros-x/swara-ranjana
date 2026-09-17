import TicketTypes, {
  type LiveAdminTicketType,
  type SeatBlockOption,
  type TicketTypeEventOption,
} from "@/admin-site/pages/TicketTypes";
import { requireStaff } from "@/lib/auth/requireStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const { supabase } = await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  const db = supabase as any;

  const [
    { data: ticketTypes, error: ticketTypesError },
    { data: events, error: eventsError },
    { data: tickets, error: ticketsError },
    { data: seatBlocks, error: seatBlocksError },
    { data: eventSeats, error: eventSeatsError },
  ] = await Promise.all([
    db
      .from("ticket_types")
      .select("*")
      .is("archived_at", null)
      .order("sort_order", { ascending: true }),
    db.from("events").select("id, name").order("starts_at", { ascending: false }),
    db.from("tickets").select("ticket_type_id, status"),
    db
      .from("seat_blocks")
      .select("id,event_id,code,display_name,ticket_type_id,sort_order")
      .order("sort_order", { ascending: true }),
    db.from("event_seats").select("id,block_id,is_active"),
  ]);

  if (ticketTypesError) throw new Error(ticketTypesError.message);
  if (eventsError) throw new Error(eventsError.message);
  if (ticketsError) throw new Error(ticketsError.message);
  if (seatBlocksError) throw new Error(seatBlocksError.message);
  if (eventSeatsError) throw new Error(eventSeatsError.message);

  const eventNames = new Map(
    (events ?? []).map((event: { id: string; name: string }) => [event.id, event.name]),
  );

  const soldByType = new Map<string, number>();
  for (const ticket of tickets ?? []) {
    if (ticket.status === "VALID" || ticket.status === "USED") {
      soldByType.set(
        ticket.ticket_type_id,
        (soldByType.get(ticket.ticket_type_id) ?? 0) + 1,
      );
    }
  }

  const blockCapacity = new Map<string, number>();
  for (const seat of eventSeats ?? []) {
    if (!seat.is_active) continue;
    blockCapacity.set(seat.block_id, (blockCapacity.get(seat.block_id) ?? 0) + 1);
  }

  const blockIdsByType = new Map<string, string[]>();
  for (const block of seatBlocks ?? []) {
    if (!block.ticket_type_id) continue;
    const ids = blockIdsByType.get(block.ticket_type_id) ?? [];
    ids.push(block.id);
    blockIdsByType.set(block.ticket_type_id, ids);
  }

  const liveTicketTypes: LiveAdminTicketType[] = (ticketTypes ?? []).map(
    (ticketType: any) => {
      const sold = soldByType.get(ticketType.id) ?? 0;
      return {
        id: ticketType.id,
        eventId: ticketType.event_id,
        eventName: eventNames.get(ticketType.event_id) ?? "Unknown event",
        code: ticketType.code,
        name: ticketType.name,
        description: ticketType.description,
        seatingZone: ticketType.seating_zone,
        priceLkr: ticketType.price_lkr,
        capacity: ticketType.capacity,
        quantitySold: sold,
        quantityRemaining: Math.max(ticketType.capacity - sold, 0),
        maxPerOrder: ticketType.max_per_order,
        saleStartsAt: ticketType.sale_starts_at,
        saleEndsAt: ticketType.sale_ends_at,
        status: ticketType.status,
        sortOrder: ticketType.sort_order,
        benefits: ticketType.benefits,
        recommended: ticketType.recommended,
        blockIds: blockIdsByType.get(ticketType.id) ?? [],
      };
    },
  );

  const eventOptions: TicketTypeEventOption[] = (events ?? []).map(
    (event: { id: string; name: string }) => ({
      id: event.id,
      name: event.name,
    }),
  );

  const blockOptions: SeatBlockOption[] = (seatBlocks ?? []).map((block: any) => ({
    id: block.id,
    eventId: block.event_id,
    code: block.code,
    displayName: block.display_name,
    capacity: blockCapacity.get(block.id) ?? 0,
    assignedTicketTypeId: block.ticket_type_id,
  }));

  return (
    <TicketTypes
      ticketTypes={liveTicketTypes}
      events={eventOptions}
      seatBlocks={blockOptions}
    />
  );
}
