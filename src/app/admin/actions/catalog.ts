"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/requireStaff";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const doorsOpenAt = colomboDateTime(nullableText(formData, "doorsOpenAt"));
  const startsAt = colomboDateTime(text(formData, "startsAt"));
  const endsAt = colomboDateTime(nullableText(formData, "endsAt"));
  const schoolShowStartsAt = colomboDateTime(
    nullableText(formData, "schoolShowStartsAt"),
  );
  const schoolShowEndsAt = colomboDateTime(
    nullableText(formData, "schoolShowEndsAt"),
  );

  if (!name || !slug || !startsAt) {
    throw new Error("Event name, slug and start date/time are required.");
  }

  if (doorsOpenAt && new Date(doorsOpenAt) > new Date(startsAt)) {
    throw new Error("Public doors-open time cannot be after the public show start.");
  }

  if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
    throw new Error("Public show end must be after the public show start.");
  }

  if (Boolean(schoolShowStartsAt) !== Boolean(schoolShowEndsAt)) {
    throw new Error("Set both School show start and end times, or leave both empty.");
  }

  const admissionTimeEnforced =
    formData.get("admissionTimeEnforced") === "on";

  if (
    admissionTimeEnforced &&
    (!endsAt || !schoolShowStartsAt || !schoolShowEndsAt)
  ) {
    throw new Error(
      "Gate time enforcement requires a Public show end plus both School show start and end times.",
    );
  }

  if (
    schoolShowStartsAt &&
    schoolShowEndsAt &&
    new Date(schoolShowEndsAt) <= new Date(schoolShowStartsAt)
  ) {
    throw new Error("School show end must be after the School show start.");
  }

  const publicAdmissionStart = doorsOpenAt ?? startsAt;
  if (
    schoolShowStartsAt &&
    schoolShowEndsAt &&
    endsAt &&
    new Date(schoolShowStartsAt) < new Date(endsAt) &&
    new Date(schoolShowEndsAt) > new Date(publicAdmissionStart)
  ) {
    throw new Error(
      "School and public admission windows cannot overlap. Keep the School show completely before or after the public show.",
    );
  }

  const payload = {
    name,
    slug,
    description: nullableText(formData, "description"),
    doors_open_at: doorsOpenAt,
    starts_at: startsAt,
    ends_at: endsAt,
    school_show_starts_at: schoolShowStartsAt,
    school_show_ends_at: schoolShowEndsAt,
    admission_time_enforced: admissionTimeEnforced,
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

async function recalculatePhysicalCapacity(
  admin: any,
  ticketTypeId: string,
  forceZeroWhenUnassigned: boolean,
) {
  const { data: blocks, error: blocksError } = await admin
    .from("seat_blocks")
    .select("id")
    .eq("ticket_type_id", ticketTypeId);

  if (blocksError) throw new Error(blocksError.message);

  const blockIds = (blocks ?? []).map((block: { id: string }) => block.id);
  if (blockIds.length === 0) {
    if (forceZeroWhenUnassigned) {
      const { error } = await admin
        .from("ticket_types")
        .update({ capacity: 0, status: "PAUSED", recommended: false })
        .eq("id", ticketTypeId);
      if (error) throw new Error(error.message);
    }
    return;
  }

  const { count, error: countError } = await admin
    .from("event_seats")
    .select("id", { count: "exact", head: true })
    .in("block_id", blockIds)
    .eq("is_active", true);

  if (countError) throw new Error(countError.message);

  const { error: updateError } = await admin
    .from("ticket_types")
    .update({ capacity: count ?? 0 })
    .eq("id", ticketTypeId);

  if (updateError) throw new Error(updateError.message);
}

export async function saveTicketType(formData: FormData) {
  await requireStaff([...ADMIN_ROLES]);
  const admin = createAdminClient() as any;

  const id = text(formData, "id");
  const eventId = text(formData, "eventId");
  const selectedBlockIds = [
    ...new Set(
      formData
        .getAll("blockIds")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  ];
  const benefits = text(formData, "benefits")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const payload = {
    event_id: eventId,
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
    archived_at: null,
  };

  if (!payload.event_id || !payload.code || !payload.name) {
    throw new Error("Event, code and ticket type name are required.");
  }

  let previousEventId: string | null = null;
  let previousBlockIds: string[] = [];

  if (id) {
    const { data: existing, error: existingError } = await admin
      .from("ticket_types")
      .select("id,event_id,archived_at")
      .eq("id", id)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);
    if (!existing || existing.archived_at) {
      throw new Error("This ticket category is no longer available to edit.");
    }

    previousEventId = existing.event_id;

    if (existing.event_id !== eventId) {
      const { count: usageCount, error: usageError } = await admin
        .from("order_items")
        .select("id", { count: "exact", head: true })
        .eq("ticket_type_id", id);

      if (usageError) throw new Error(usageError.message);
      if ((usageCount ?? 0) > 0) {
        throw new Error(
          "A ticket category that has already been ordered cannot be moved to another event.",
        );
      }
    }

    const { data: currentBlocks, error: currentBlocksError } = await admin
      .from("seat_blocks")
      .select("id")
      .eq("ticket_type_id", id);

    if (currentBlocksError) throw new Error(currentBlocksError.message);
    previousBlockIds = (currentBlocks ?? []).map((block: { id: string }) => block.id);
  }

  const { data: validBlocks, error: validBlocksError } = await admin
    .from("seat_blocks")
    .select("id,event_id,ticket_type_id")
    .eq("event_id", eventId);

  if (validBlocksError) throw new Error(validBlocksError.message);

  const validBlockIds = new Set(
    (validBlocks ?? []).map((block: { id: string }) => block.id),
  );

  if (selectedBlockIds.some((blockId) => !validBlockIds.has(blockId))) {
    throw new Error("One or more selected auditorium blocks do not belong to this event.");
  }

  const priorCategoryIds = new Set<string>();
  for (const block of validBlocks ?? []) {
    if (
      selectedBlockIds.includes(block.id) &&
      block.ticket_type_id &&
      block.ticket_type_id !== id
    ) {
      priorCategoryIds.add(block.ticket_type_id);
    }
  }

  let ticketTypeId = id;

  if (id) {
    const { error } = await admin.from("ticket_types").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await admin
      .from("ticket_types")
      .insert(payload)
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    ticketTypeId = data.id;
  }

  if (payload.recommended) {
    const { error } = await admin
      .from("ticket_types")
      .update({ recommended: false })
      .eq("event_id", eventId)
      .neq("id", ticketTypeId)
      .is("archived_at", null);
    if (error) throw new Error(error.message);
  }

  const blocksToUnassign = previousBlockIds.filter(
    (blockId) => !selectedBlockIds.includes(blockId),
  );

  if (blocksToUnassign.length > 0) {
    const { error } = await admin
      .from("seat_blocks")
      .update({ ticket_type_id: null })
      .in("id", blocksToUnassign);
    if (error) throw new Error(error.message);
  }

  if (selectedBlockIds.length > 0) {
    const { error } = await admin
      .from("seat_blocks")
      .update({ ticket_type_id: ticketTypeId })
      .in("id", selectedBlockIds);
    if (error) throw new Error(error.message);
  }

  const hadPhysicalBlocks = previousBlockIds.length > 0 || selectedBlockIds.length > 0;
  await recalculatePhysicalCapacity(admin, ticketTypeId, hadPhysicalBlocks);

  for (const previousCategoryId of priorCategoryIds) {
    await recalculatePhysicalCapacity(admin, previousCategoryId, true);
  }

  if (previousEventId && previousEventId !== eventId) {
    revalidatePath(`/admin/events`);
  }

  revalidateCatalog();
}

export async function archiveTicketType(formData: FormData) {
  await requireStaff([...ADMIN_ROLES]);
  const admin = createAdminClient() as any;
  const id = text(formData, "id");

  if (!id) throw new Error("Ticket category ID is required.");

  const { data: ticketType, error: lookupError } = await admin
    .from("ticket_types")
    .select("id,name,archived_at")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) throw new Error(lookupError.message);
  if (!ticketType || ticketType.archived_at) {
    revalidateCatalog();
    return;
  }

  const { error: archiveError } = await admin
    .from("ticket_types")
    .update({
      archived_at: new Date().toISOString(),
      status: "PAUSED",
      recommended: false,
    })
    .eq("id", id);

  if (archiveError) throw new Error(archiveError.message);

  // Physical blocks are preserved as part of the hall map but become
  // unassigned so a replacement category can claim them later.
  const { error: blocksError } = await admin
    .from("seat_blocks")
    .update({ ticket_type_id: null })
    .eq("ticket_type_id", id);

  if (blocksError) throw new Error(blocksError.message);
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
