import Events, { type LiveAdminEvent } from "@/admin-site/pages/Events";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function Page() {
  const { supabase } = await requireStaff(["SUPER_ADMIN", "ADMIN"]);

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  if (eventsError) throw new Error(eventsError.message);

  const soldCounts = await Promise.all(
    (events ?? []).map(async (event) => {
      const { count, error } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .in("status", ["VALID", "USED"]);

      if (error) throw new Error(error.message);
      return [event.id, count ?? 0] as const;
    }),
  );

  const soldByEvent = new Map<string, number>(soldCounts);

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
      schoolShowStartsAt: event.school_show_starts_at,
      schoolShowEndsAt: event.school_show_ends_at,
      admissionTimeEnforced: event.admission_time_enforced,
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
