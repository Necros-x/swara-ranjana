import Events, { type LiveAdminEvent } from "@/admin-site/pages/Events";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function Page() {
  const { supabase } = await requireStaff(["SUPER_ADMIN", "ADMIN"]);

  const [{ data: events, error: eventsError }, { data: tickets, error: ticketsError }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: false }),
    supabase.from("tickets").select("event_id, status"),
  ]);

  if (eventsError) throw new Error(eventsError.message);
  if (ticketsError) throw new Error(ticketsError.message);

  const soldByEvent = new Map<string, number>();
  for (const ticket of tickets ?? []) {
    if (ticket.status === "VALID" || ticket.status === "USED") {
      soldByEvent.set(ticket.event_id, (soldByEvent.get(ticket.event_id) ?? 0) + 1);
    }
  }

  const liveEvents: LiveAdminEvent[] = (events ?? []).map((event) => {
    const ticketsSold = soldByEvent.get(event.id) ?? 0;
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      doorsOpenAt: event.doors_open_at,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      venueName: event.venue_name,
      venueAddress: event.venue_address,
      totalCapacity: event.total_capacity,
      ticketsSold,
      remaining: Math.max(event.total_capacity - ticketsSold, 0),
      currency: event.currency,
      status: event.status,
    };
  });

  return <Events events={liveEvents} />;
}
