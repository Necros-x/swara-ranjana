"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/requireStaff";
import type { Json } from "@/types/database";

export interface InternalTicketIssueInput {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  holderLabel: string;
  note?: string;
}

export interface InternalTicketIssueResult {
  ok: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
  quantity?: number;
}

type RpcResponse = {
  data: Json | null;
  error: { message?: string } | null;
};

function record(value: Json | null) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

export async function issueInternalTicketBatch(
  input: InternalTicketIssueInput,
): Promise<InternalTicketIssueResult> {
  const { user } = await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
  ]);

  const quantity = Math.floor(Number(input.quantity));
  const holderLabel = input.holderLabel.trim();
  const note = input.note?.trim() || null;

  if (!input.eventId || !input.ticketTypeId) {
    return {
      ok: false,
      message: "Choose the show and ticket category.",
    };
  }

  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 500) {
    return {
      ok: false,
      message: "Choose between 1 and 500 tickets.",
    };
  }

  if (holderLabel.length < 2 || holderLabel.length > 160) {
    return {
      ok: false,
      message: "Enter the school, group or holder name.",
    };
  }

  const admin = createAdminClient();
  const rpc = admin.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<RpcResponse>;

  const { data, error } = await rpc("issue_internal_ticket_batch", {
    p_event_id: input.eventId,
    p_ticket_type_id: input.ticketTypeId,
    p_quantity: quantity,
    p_holder_label: holderLabel,
    p_note: note,
    p_issued_by: user.id,
  });

  const payload = record(data);

  if (error || !payload || payload.ok !== true) {
    return {
      ok: false,
      message:
        (payload && typeof payload.message === "string"
          ? payload.message
          : error?.message) ||
        "Internal tickets could not be issued.",
    };
  }

  const orderId =
    typeof payload.order_id === "string"
      ? payload.order_id
      : undefined;
  const orderNumber =
    typeof payload.order_number === "string"
      ? payload.order_number
      : undefined;
  const created =
    typeof payload.tickets_created === "number"
      ? payload.tickets_created
      : quantity;

  revalidatePath("/admin/tickets");
  revalidatePath("/admin/events");
  revalidatePath("/admin/scanner");

  return {
    ok: true,
    message: `${created} ticket${created === 1 ? "" : "s"} issued.`,
    orderId,
    orderNumber,
    quantity: created,
  };
}
