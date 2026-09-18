"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/requireStaff";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export interface RecordPhysicalSaleInput {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export interface RecordPhysicalSaleResult {
  ok: boolean;
  message: string;
  orderNumber?: string;
  quantity?: number;
  serialCodeStart?: string;
  serialCodeEnd?: string;
  remaining?: number;
  soldOut?: boolean;
}

function record(value: Json | null) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function recordPhysicalSale(
  input: RecordPhysicalSaleInput,
): Promise<RecordPhysicalSaleResult> {
  const { user } = await requireStaff(["SUPER_ADMIN", "ADMIN", "SELLER"]);

  const eventId = input.eventId.trim();
  const ticketTypeId = input.ticketTypeId.trim();
  const quantity = Math.floor(Number(input.quantity));

  if (!isUuid(eventId) || !isUuid(ticketTypeId)) {
    return { ok: false, message: "Choose a valid ticket category." };
  }

  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100) {
    return {
      ok: false,
      message: "Enter a ticket quantity between 1 and 100.",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_physical_ticket_sale", {
    p_event_id: eventId,
    p_ticket_type_id: ticketTypeId,
    p_quantity: quantity,
    p_sold_by: user.id,
  });

  const payload = record(data);

  if (error || !payload || payload.ok !== true) {
    return {
      ok: false,
      message:
        (payload && typeof payload.message === "string"
          ? payload.message
          : error?.message) ||
        "The physical ticket sale could not be recorded.",
      remaining:
        payload && typeof payload.remaining === "number"
          ? payload.remaining
          : undefined,
      soldOut:
        payload && typeof payload.remaining === "number"
          ? payload.remaining === 0
          : undefined,
    };
  }

  revalidatePath("/admin/sales");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/physical-tickets");
  revalidatePath("/tickets");
  revalidatePath("/");

  return {
    ok: true,
    message:
      typeof payload.message === "string"
        ? payload.message
        : "Physical ticket sale recorded.",
    orderNumber:
      typeof payload.order_number === "string"
        ? payload.order_number
        : undefined,
    quantity:
      typeof payload.quantity === "number"
        ? payload.quantity
        : quantity,
    serialCodeStart:
      typeof payload.serial_code_start === "string"
        ? payload.serial_code_start
        : undefined,
    serialCodeEnd:
      typeof payload.serial_code_end === "string"
        ? payload.serial_code_end
        : undefined,
    remaining:
      typeof payload.remaining === "number"
        ? payload.remaining
        : undefined,
    soldOut:
      typeof payload.sold_out === "boolean"
        ? payload.sold_out
        : undefined,
  };
}
