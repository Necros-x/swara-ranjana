import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type InventoryRow =
  Database["public"]["Tables"]["seat_ticket_inventory"]["Row"];

const PAGE_SIZE = 500;

export async function getAllSeatTicketInventory(
  eventId: string,
  columns:
    | "ticket_type_id,status"
    | "ticket_type_id,status,serial_number"
    | "id,ticket_type_id,seat_id,serial_number,serial_code,ticket_number,qr_token,status",
) {
  const admin = createAdminClient();
  const rows: Partial<InventoryRow>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await admin
      .from("seat_ticket_inventory")
      .select(columns)
      .eq("event_id", eventId)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = (data ?? []) as Partial<InventoryRow>[];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}
