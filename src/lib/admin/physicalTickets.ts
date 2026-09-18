import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SeatTicketInventoryStatus } from "@/types/database";

export interface PhysicalTicketInventoryItem {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  ticketTypeCode: string;
  priceLkr: number;
  serialNumber: number;
  serialCode: string;
  ticketNumber: string;
  qrToken: string;
  status: SeatTicketInventoryStatus;
  seatId: string;
  seatLabel: string;
}

export interface PhysicalTicketInventoryCategory {
  id: string;
  code: string;
  name: string;
  priceLkr: number;
  capacity: number;
  available: number;
  soldPhysical: number;
  soldOnline: number;
  heldOnline: number;
}

export interface PhysicalTicketInventoryData {
  event: {
    id: string;
    name: string;
    startsAt: string;
    venueName: string;
  } | null;
  categories: PhysicalTicketInventoryCategory[];
  items: PhysicalTicketInventoryItem[];
}

export async function getPhysicalTicketInventory(): Promise<PhysicalTicketInventoryData> {
  const admin = createAdminClient();

  const { data: events, error: eventError } = await admin
    .from("events")
    .select("id,name,starts_at,venue_name,status")
    .in("status", ["ON_SALE", "SOLD_OUT"])
    .order("starts_at", { ascending: false })
    .limit(1);

  if (eventError) throw eventError;
  const event = events?.[0] ?? null;

  if (!event) {
    return { event: null, categories: [], items: [] };
  }

  const [
    { data: types, error: typesError },
    { data: inventory, error: inventoryError },
    { data: seats, error: seatsError },
  ] = await Promise.all([
    admin
      .from("ticket_types")
      .select("id,code,name,price_lkr,capacity,sort_order")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true }),
    admin
      .from("seat_ticket_inventory")
      .select(
        "id,ticket_type_id,seat_id,serial_number,serial_code,ticket_number,qr_token,status",
      )
      .eq("event_id", event.id)
      .order("serial_number", { ascending: true }),
    admin
      .from("event_seats")
      .select("id,label")
      .eq("event_id", event.id)
      .eq("is_active", true),
  ]);

  if (typesError) throw typesError;
  if (inventoryError) throw inventoryError;
  if (seatsError) throw seatsError;

  const typeMap = new Map((types ?? []).map((type) => [type.id, type]));
  const seatMap = new Map((seats ?? []).map((seat) => [seat.id, seat.label]));
  const rows = inventory ?? [];

  const categories: PhysicalTicketInventoryCategory[] = (types ?? []).map(
    (type) => {
      const typeRows = rows.filter((row) => row.ticket_type_id === type.id);

      return {
        id: type.id,
        code: type.code,
        name: type.name,
        priceLkr: type.price_lkr,
        capacity: type.capacity,
        available: typeRows.filter((row) => row.status === "AVAILABLE").length,
        soldPhysical: typeRows.filter((row) => row.status === "SOLD_PHYSICAL")
          .length,
        soldOnline: typeRows.filter((row) => row.status === "SOLD_ONLINE").length,
        heldOnline: typeRows.filter((row) => row.status === "HELD_ONLINE").length,
      };
    },
  );

  const items: PhysicalTicketInventoryItem[] = rows
    .map((row) => {
      const type = typeMap.get(row.ticket_type_id);
      if (!type) return null;

      return {
        id: row.id,
        ticketTypeId: type.id,
        ticketTypeName: type.name,
        ticketTypeCode: type.code,
        priceLkr: type.price_lkr,
        serialNumber: row.serial_number,
        serialCode: row.serial_code,
        ticketNumber: row.ticket_number,
        qrToken: row.qr_token,
        status: row.status,
        seatId: row.seat_id,
        seatLabel: seatMap.get(row.seat_id) ?? "Seat",
      };
    })
    .filter((item): item is PhysicalTicketInventoryItem => Boolean(item))
    .sort((a, b) => {
      const aIndex = categories.findIndex((category) => category.id === a.ticketTypeId);
      const bIndex = categories.findIndex((category) => category.id === b.ticketTypeId);
      return aIndex - bIndex || a.serialNumber - b.serialNumber;
    });

  return {
    event: {
      id: event.id,
      name: event.name,
      startsAt: event.starts_at,
      venueName: event.venue_name,
    },
    categories,
    items,
  };
}
