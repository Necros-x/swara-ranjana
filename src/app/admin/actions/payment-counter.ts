"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/requireStaff";
import type { Json, StaffRole } from "@/types/database";

const PAYMENT_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "BOX_OFFICE",
];

export interface PaymentCounterOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  eventName: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  total: number;
  currency: string;
  paidAt: string | null;
  ticketNumber?: string;
}

export interface PaymentCounterResult {
  ok: boolean;
  message: string;
  order?: PaymentCounterOrder;
}

type RpcResponse = {
  data: Json | null;
  error: { message?: string } | null;
};

function isRecord(value: Json | null): value is Record<string, Json | undefined> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function findPaymentCounterOrder(
  identifierInput: string,
): Promise<PaymentCounterResult> {
  await requireStaff(PAYMENT_ROLES);

  const identifier = identifierInput.trim().toUpperCase();
  if (!identifier) {
    return { ok: false, message: "Enter an order or ticket number." };
  }

  const admin = createAdminClient();
  let orderId: string | null = null;
  let ticketNumber: string | undefined;

  if (/^SR\d{2}-T\d{7}$/i.test(identifier)) {
    const { data: ticket, error } = await admin
      .from("tickets")
      .select("order_id,ticket_number")
      .ilike("ticket_number", identifier)
      .maybeSingle();

    if (error) {
      console.error("Payment counter ticket lookup failed:", error);
      return { ok: false, message: "Unable to look up that ticket." };
    }

    orderId = ticket?.order_id ?? null;
    ticketNumber = ticket?.ticket_number;
  } else {
    const { data: order, error } = await admin
      .from("orders")
      .select("id")
      .ilike("order_number", identifier)
      .maybeSingle();

    if (error) {
      console.error("Payment counter order lookup failed:", error);
      return { ok: false, message: "Unable to look up that reservation." };
    }

    orderId = order?.id ?? null;
  }

  if (!orderId) {
    return { ok: false, message: "No matching reservation was found." };
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,event_id,customer_id,order_number,status,payment_status,payment_method,total_lkr,currency,paid_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.error("Payment counter reservation load failed:", orderError);
    return { ok: false, message: "Reservation could not be loaded." };
  }

  const [{ data: customer }, { data: event }] = await Promise.all([
    admin
      .from("customers")
      .select("full_name")
      .eq("id", order.customer_id)
      .maybeSingle(),
    admin
      .from("events")
      .select("name")
      .eq("id", order.event_id)
      .maybeSingle(),
  ]);

  return {
    ok: true,
    message:
      order.payment_status === "PAID"
        ? "Payment is already recorded."
        : "Reservation loaded.",
    order: {
      id: order.id,
      orderNumber: order.order_number,
      customerName: customer?.full_name ?? "Guest",
      eventName: event?.name ?? "Event",
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      total: order.total_lkr,
      currency: order.currency,
      paidAt: order.paid_at,
      ticketNumber,
    },
  };
}

export async function collectOnArrivalPayment(
  orderId: string,
): Promise<PaymentCounterResult> {
  if (!orderId) {
    return { ok: false, message: "Reservation not found." };
  }

  const { user } = await requireStaff(PAYMENT_ROLES);
  const admin = createAdminClient();
  const rpc = admin.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<RpcResponse>;

  const { data, error } = await rpc("collect_on_arrival_payment_server", {
    p_staff_user_id: user.id,
    p_order_id: orderId,
  });

  if (error || !isRecord(data) || data.ok !== true) {
    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : error?.message || "Payment could not be recorded.";

    return { ok: false, message };
  }

  revalidatePath("/admin/payment-counter");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/scanner");

  return {
    ok: true,
    message:
      typeof data.message === "string"
        ? data.message
        : "Payment recorded. Send the guest to the gate.",
  };
}
