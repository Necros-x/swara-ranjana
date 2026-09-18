import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type InventoryRow =
  Database["public"]["Tables"]["seat_ticket_inventory"]["Row"];

const PAGE_SIZE = 500;

export async function getAllSeatTicketInventory(
  eventId: string,
): Promise<InventoryRow[]> {
  const admin = createAdminClient();
  const rows: InventoryRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await admin
      .from("seat_ticket_inventory")
      .select("*")
      .eq("event_id", eventId)
      .order("ticket_type_id", { ascending: true })
      .order("serial_number", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

type EventSeatRow =
  Database["public"]["Tables"]["event_seats"]["Row"];

type TicketRow =
  Database["public"]["Tables"]["tickets"]["Row"];

export async function getAllEventSeats(
  eventId: string,
): Promise<EventSeatRow[]> {
  const admin = createAdminClient();
  const rows: EventSeatRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await admin
      .from("event_seats")
      .select("*")
      .eq("event_id", eventId)
      .order("block_id", { ascending: true })
      .order("row_number", { ascending: true })
      .order("seat_number", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

export async function getAllEventTickets(
  eventId: string,
): Promise<TicketRow[]> {
  const admin = createAdminClient();
  const rows: TicketRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await admin
      .from("tickets")
      .select("*")
      .eq("event_id", eventId)
      .order("issued_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}
