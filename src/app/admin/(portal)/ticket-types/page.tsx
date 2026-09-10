import TicketTypes, {
  type LiveAdminTicketType,
  type TicketTypeEventOption,
} from "@/admin-site/pages/TicketTypes";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function Page() {
  const { supabase } = await requireStaff(["SUPER_ADMIN", "ADMIN"]);

  const [
    { data: ticketTypes, error: ticketTypesError },
    { data: events, error: eventsError },
    { data: tickets, error: ticketsError },
  ] = await Promise.all([
    supabase.from("ticket_types").select("*").order("sort_order", { ascending: true }),
    supabase.from("events").select("id, name").order("starts_at", { ascending: false }),
    supabase.from("tickets").select("ticket_type_id, status"),
  ]);

  if (ticketTypesError) throw new Error(ticketTypesError.message);
  if (eventsError) throw new Error(eventsError.message);
  if (ticketsError) throw new Error(ticketsError.message);

  const eventNames = new Map((events ?? []).map((event) => [event.id, event.name]));
  const soldByType = new Map<string, number>();
  for (const ticket of tickets ?? []) {
    if (ticket.status === "VALID" || ticket.status === "USED") {
      soldByType.set(ticket.ticket_type_id, (soldByType.get(ticket.ticket_type_id) ?? 0) + 1);
    }
  }

  const liveTicketTypes: LiveAdminTicketType[] = (ticketTypes ?? []).map((ticketType) => {
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
    };
  });

  const eventOptions: TicketTypeEventOption[] = (events ?? []).map((event) => ({
    id: event.id,
    name: event.name,
  }));

  return <TicketTypes ticketTypes={liveTicketTypes} events={eventOptions} />;
}
