import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { TicketTier } from "@/public-site/types";
import type { PublicTicketCatalog } from "./types";

type JsonRecord = Record<string, Json | undefined>;

function isRecord(value: Json | undefined): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asString(value: Json | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: Json | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: Json | undefined, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function formatDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-LK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(value));
}

function formatTime(value: string | null, timezone: string) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));
}

function availabilityLabel(status: string, capacity: number, remaining: number): TicketTier["availability"] {
  if (status === "SOLD_OUT" || remaining <= 0) return "Sold Out";
  if (remaining <= Math.max(5, Math.ceil(capacity * 0.1))) return "Limited Seats";
  if (remaining <= Math.ceil(capacity * 0.25)) return "Selling Fast";
  return "Available";
}

export async function getPublicTicketCatalog(
  slug = "swara-ranjana-2026",
): Promise<PublicTicketCatalog | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_event_catalog", {
      p_slug: slug,
    });

    if (error || !isRecord(data)) return null;

    const event = data.event;
    const ticketTypes = data.ticket_types;
    if (!isRecord(event) || !Array.isArray(ticketTypes)) return null;

    const timezone = asString(event.timezone, "Asia/Colombo");
    const startsAt = asString(event.starts_at);
    if (!startsAt) return null;

    const endsAt = asString(event.ends_at);
    const doorsOpenAt = asString(event.doors_open_at);
    const venue = asString(event.venue_name, "Venue TBA");
    const address = asString(event.venue_address, "Sri Lanka");

    const tiers: TicketTier[] = ticketTypes
      .filter(isRecord)
      .map((tier) => {
        const capacity = asNumber(tier.capacity);
        const remaining = asNumber(tier.remaining, capacity);
        const price = asNumber(tier.price_lkr);
        const rawBenefits = Array.isArray(tier.benefits) ? tier.benefits : [];

        return {
          id: asString(tier.id),
          code: asString(tier.code),
          tierName: asString(tier.name, "Ticket"),
          subtitle: asString(tier.description, "Swara Ranjana 2026 admission"),
          priceLKR: price,
          formattedPrice: price.toLocaleString("en-LK"),
          availability: availabilityLabel(asString(tier.status), capacity, remaining),
          seatingZone: asString(tier.seating_zone, "General admission"),
          benefits: rawBenefits.filter((item): item is string => typeof item === "string"),
          recommended: asBoolean(tier.recommended),
          maxPerOrder: asNumber(tier.max_per_order, 6),
          remainingSeats: remaining,
        };
      })
      .filter((tier) => tier.id);

    return {
      concertMeta: {
        id: asString(event.id),
        slug: asString(event.slug),
        name: asString(event.name, "Swara Ranjana"),
        date: formatDate(startsAt, timezone),
        doorsOpen: formatTime(doorsOpenAt || null, timezone),
        time: endsAt
          ? `${formatTime(startsAt, timezone)} – ${formatTime(endsAt, timezone)}`
          : formatTime(startsAt, timezone),
        venue,
        hall: venue,
        city: address,
        currency: asString(event.currency, "LKR"),
      },
      ticketTiers: tiers,
    };
  } catch {
    // Keep the current static UI usable before Supabase env/data is configured.
    return null;
  }
}
