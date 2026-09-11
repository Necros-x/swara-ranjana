import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/resend";

type RequestEmailEvent =
  | "RECEIVED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

type RequestContext = {
  requestId: string;
  kind: "CANCEL" | "REFUND";
  scope: "FULL" | "PARTIAL";
  status: string;
  reason: string | null;
  staffNote: string | null;
  requestedAmount: number;
  approvedAmount: number | null;
  refundReference: string | null;
  orderNumber: string;
  currency: string;
  customerName: string;
  customerEmail: string;
  eventName: string;
  startsAt: string;
  timezone: string;
  ticketNumbers: string[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(currency: string, value: number) {
  return `${currency} ${value.toLocaleString("en-LK")}`;
}

function date(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-LK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));
}

function shell(content: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#0E1721;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#FEFFFF;border:1px solid #d8dee3;">
        <div style="padding:26px 28px;background:#0E1721;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:.04em;color:#FEFFFF;">SWARA RANJANA</div>
          <div style="margin-top:7px;color:#62B6F3;font-size:10px;letter-spacing:.24em;text-transform:uppercase;">Tickets & Reservations</div>
        </div>
        ${content}
      </div>
    </div>
  </body>
</html>`;
}

async function loadRequestContext(
  requestId: string,
): Promise<RequestContext | null> {
  const admin = createAdminClient();
  const db = admin as any;

  const { data: request, error } = await db
    .from("customer_order_requests")
    .select(
      "id,order_id,customer_id,kind,scope,status,reason,staff_note,requested_amount_lkr,approved_amount_lkr,refund_reference",
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !request) {
    console.error("Request email lookup failed:", error);
    return null;
  }

  const [orderResult, customerResult, requestTicketsResult] =
    await Promise.all([
      admin
        .from("orders")
        .select("order_number,event_id,currency")
        .eq("id", request.order_id)
        .maybeSingle(),
      admin
        .from("customers")
        .select("full_name,email")
        .eq("id", request.customer_id)
        .maybeSingle(),
      db
        .from("customer_order_request_tickets")
        .select("ticket_id")
        .eq("request_id", request.id),
    ]);

  const order = orderResult.data;
  const customer = customerResult.data;
  if (!order || !customer) return null;

  const event = (
    await admin
      .from("events")
      .select("name,starts_at,timezone")
      .eq("id", order.event_id)
      .maybeSingle()
  ).data;

  if (!event) return null;

  const ticketIds = (requestTicketsResult.data ?? []).map(
    (item: { ticket_id: string }) => item.ticket_id,
  );

  const tickets = ticketIds.length
    ? ((await admin
        .from("tickets")
        .select("id,ticket_number")
        .in("id", ticketIds)).data ?? [])
    : [];

  return {
    requestId: request.id,
    kind: request.kind,
    scope: request.scope,
    status: request.status,
    reason: request.reason,
    staffNote: request.staff_note,
    requestedAmount: request.requested_amount_lkr ?? 0,
    approvedAmount: request.approved_amount_lkr,
    refundReference: request.refund_reference,
    orderNumber: order.order_number,
    currency: order.currency,
    customerName: customer.full_name,
    customerEmail: customer.email,
    eventName: event.name,
    startsAt: event.starts_at,
    timezone: event.timezone,
    ticketNumbers: tickets.map((ticket) => ticket.ticket_number),
  };
}

export async function sendCustomerRequestEmail(
  requestId: string,
  event: RequestEmailEvent,
) {
  const context = await loadRequestContext(requestId);
  if (!context) {
    return { ok: false as const, error: "Unable to load request email data." };
  }

  const isRefund = context.kind === "REFUND";
  const amount = context.approvedAmount ?? context.requestedAmount;
  const ticketText = context.ticketNumbers.length
    ? context.ticketNumbers.join(", ")
    : "Entire reservation";

  let heading = "Request received";
  let body = "We received your request and our team will review it.";
  let subject = `Request received — ${context.orderNumber}`;

  if (event === "APPROVED") {
    heading = isRefund ? "Refund approved" : "Cancellation approved";
    body = isRefund
      ? "Your refund has been approved. The selected tickets remain active until the money is actually refunded and the request is completed."
      : "Your cancellation has been approved and the reservation has been closed.";
    subject = `${heading} — ${context.orderNumber}`;
  } else if (event === "REJECTED") {
    heading = isRefund ? "Refund request declined" : "Cancellation request declined";
    body = "Your request was reviewed but could not be approved. Please contact the box office if you need clarification.";
    subject = `${heading} — ${context.orderNumber}`;
  } else if (event === "COMPLETED") {
    heading = isRefund ? "Refund completed" : "Cancellation completed";
    body = isRefund
      ? "Your refund has been completed. The refunded ticket(s) are no longer valid for admission."
      : "Your cancellation is complete and the reservation is closed.";
    subject = `${heading} — ${context.orderNumber}`;
  }

  const details = [
    `<div><strong>Order:</strong> ${escapeHtml(context.orderNumber)}</div>`,
    `<div><strong>Show:</strong> ${escapeHtml(context.eventName)}</div>`,
    `<div><strong>Date:</strong> ${escapeHtml(date(context.startsAt, context.timezone))}</div>`,
    isRefund
      ? `<div><strong>Refund:</strong> ${escapeHtml(money(context.currency, amount))} • ${escapeHtml(context.scope)}</div>`
      : "",
    isRefund
      ? `<div><strong>Ticket(s):</strong> ${escapeHtml(ticketText)}</div>`
      : "",
    context.refundReference
      ? `<div><strong>Refund reference:</strong> ${escapeHtml(context.refundReference)}</div>`
      : "",
    context.staffNote
      ? `<div><strong>Staff note:</strong> ${escapeHtml(context.staffNote)}</div>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const html = shell(`
    <div style="padding:30px 28px;">
      <div style="font-size:10px;color:#2271B1;letter-spacing:.2em;text-transform:uppercase;">${escapeHtml(context.kind)} • ${escapeHtml(context.scope)}</div>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;margin:10px 0 8px;">${escapeHtml(heading)}</h1>
      <p style="margin:0;color:#7D8A95;font-size:14px;line-height:1.7;">Hi ${escapeHtml(context.customerName)}, ${escapeHtml(body)}</p>
      <div style="margin-top:24px;padding:18px;background:#f7f9fa;border-left:4px solid #2271B1;color:#31465A;font-size:13px;line-height:1.9;">${details}</div>
    </div>
  `);

  const text = [
    `Swara Ranjana — ${heading}`,
    "",
    `Hi ${context.customerName}, ${body}`,
    `Order: ${context.orderNumber}`,
    `Show: ${context.eventName}`,
    `Date: ${date(context.startsAt, context.timezone)}`,
    ...(isRefund
      ? [
          `Refund: ${money(context.currency, amount)} (${context.scope})`,
          `Ticket(s): ${ticketText}`,
        ]
      : []),
    ...(context.refundReference
      ? [`Refund reference: ${context.refundReference}`]
      : []),
    ...(context.staffNote ? [`Staff note: ${context.staffNote}`] : []),
  ].join("\n");

  return sendTransactionalEmail({
    to: context.customerEmail,
    subject,
    html,
    text,
  });
}
