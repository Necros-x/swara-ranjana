"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/requireStaff";
import type { EventStatus, TicketTypeStatus } from "@/types/database";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function nullableText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value || null;
}

function number(formData: FormData, name: string, fallback = 0) {
  const parsed = Number(formData.get(name));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function colomboDateTime(value: string | null) {
  if (!value) return null;
  if (/Z$|[+-]\d{2}:\d{2}$/.test(value)) return new Date(value).toISOString();
  return new Date(`${value}:00+05:30`).toISOString();
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/tickets");
  revalidatePath("/admin/events");
  revalidatePath("/admin/ticket-types");
}

export async function saveEvent(formData: FormData) {
  const { supabase } = await requireStaff([...ADMIN_ROLES]);
  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = text(formData, "slug");
  const startsAt = colomboDateTime(text(formData, "startsAt"));

  if (!name || !slug || !startsAt) {
    throw new Error("Event name, slug and start date/time are required.");
  }

  const payload = {
    name,
    slug,
    description: nullableText(formData, "description"),
    doors_open_at: colomboDateTime(nullableText(formData, "doorsOpenAt")),
    starts_at: startsAt,
    ends_at: colomboDateTime(nullableText(formData, "endsAt")),
    timezone: "Asia/Colombo",
    venue_name: text(formData, "venueName") || "Venue TBA",
    venue_address: nullableText(formData, "venueAddress"),
    total_capacity: Math.max(0, Math.floor(number(formData, "totalCapacity"))),
    currency: (text(formData, "currency") || "LKR").toUpperCase().slice(0, 3),
    status: (text(formData, "status") || "DRAFT") as EventStatus,
  };

  const result = id
    ? await supabase.from("events").update(payload).eq("id", id)
    : await supabase.from("events").insert(payload);

  if (result.error) throw new Error(result.error.message);
  revalidateCatalog();
}

export async function saveTicketType(formData: FormData) {
  const { supabase } = await requireStaff([...ADMIN_ROLES]);
  const id = text(formData, "id");
  const benefits = text(formData, "benefits")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const payload = {
    event_id: text(formData, "eventId"),
    code: text(formData, "code").toUpperCase().replace(/\s+/g, "_"),
    name: text(formData, "name"),
    description: nullableText(formData, "description"),
    seating_zone: nullableText(formData, "seatingZone"),
    price_lkr: Math.max(0, Math.floor(number(formData, "priceLkr"))),
    capacity: Math.max(0, Math.floor(number(formData, "capacity"))),
    max_per_order: Math.min(20, Math.max(1, Math.floor(number(formData, "maxPerOrder", 6)))),
    sale_starts_at: colomboDateTime(nullableText(formData, "saleStartsAt")),
    sale_ends_at: colomboDateTime(nullableText(formData, "saleEndsAt")),
    status: (text(formData, "status") || "DRAFT") as TicketTypeStatus,
    sort_order: Math.max(0, Math.floor(number(formData, "sortOrder"))),
    benefits,
    recommended: formData.get("recommended") === "on",
  };

  if (!payload.event_id || !payload.code || !payload.name) {
    throw new Error("Event, code and ticket type name are required.");
  }

  const result = id
    ? await supabase.from("ticket_types").update(payload).eq("id", id)
    : await supabase.from("ticket_types").insert(payload);

  if (result.error) throw new Error(result.error.message);
  revalidateCatalog();
}

export async function setTicketTypeStatus(formData: FormData) {
  const { supabase } = await requireStaff([...ADMIN_ROLES]);
  const id = text(formData, "id");
  const status = text(formData, "status") as TicketTypeStatus;

  if (!id || !["DRAFT", "AVAILABLE", "PAUSED", "SOLD_OUT"].includes(status)) {
    throw new Error("Invalid ticket type status.");
  }

  const { error } = await supabase.from("ticket_types").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}
