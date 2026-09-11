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

export interface AdminTicketMutationResult {
  ok: boolean;
  message: string;
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
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
  const rpc = admin.rpc.bind(admin) as unknown as (
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
    typeof payload.order_id === "string" ? payload.order_id : undefined;
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

export async function revokeAdminTicket(input: {
  ticketId: string;
  reason: string;
}): Promise<AdminTicketMutationResult> {
  const { user } = await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  const ticketId = input.ticketId.trim();
  const reason = input.reason.trim();

  if (!isUuid(ticketId)) {
    return { ok: false, message: "The ticket ID is invalid." };
  }

  if (reason.length < 3 || reason.length > 500) {
    return {
      ok: false,
      message: "Enter a revocation reason between 3 and 500 characters.",
    };
  }

  const admin = createAdminClient();
  const { data: ticket, error: loadError } = await admin
    .from("tickets")
    .select("id,status")
    .eq("id", ticketId)
    .maybeSingle();

  if (loadError || !ticket) {
    return {
      ok: false,
      message: loadError?.message || "Ticket not found.",
    };
  }

  if (ticket.status === "USED") {
    return {
      ok: false,
      message: "A ticket that has already been admitted cannot be revoked.",
    };
  }

  if (ticket.status === "REFUNDED") {
    return {
      ok: false,
      message: "This ticket is already refunded and cannot be revoked.",
    };
  }

  if (ticket.status === "REVOKED") {
    return { ok: true, message: "This ticket is already revoked." };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await admin
    .from("tickets")
    .update({
      status: "REVOKED",
      revoked_at: now,
      revoked_by: user.id,
      revoke_reason: reason,
      updated_at: now,
    })
    .eq("id", ticketId)
    .eq("status", "VALID");

  if (updateError) {
    return {
      ok: false,
      message: updateError.message || "The ticket could not be revoked.",
    };
  }

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/scanner");
  revalidatePath("/admin/scan-history");

  return {
    ok: true,
    message: "Ticket revoked. It will now be rejected at the gate.",
  };
}
