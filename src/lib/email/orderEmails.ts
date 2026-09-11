import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendTransactionalEmail,
  type TransactionalEmailResult,
} from "@/lib/email/resend";

type EmailKind = "RESERVATION_CREATED" | "TICKETS_ISSUED";

interface EmailOrderItem {
  name: string;
  quantity: number;
  total: number;
}

interface EmailTicket {
  ticketNumber: string;
  ticketTypeName: string;
}

interface OrderEmailContext {
  orderId: string;
  orderNumber: string;
  accessToken: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  total: number;
  currency: string;
  expiresAt: string | null;
  customerName: string;
  customerEmail: string;
  eventName: string;
  startsAt: string;
  timezone: string;
  venueName: string;
  venueAddress: string | null;
  items: EmailOrderItem[];
  tickets: EmailTicket[];
}

type TrackedEmailResult =
  | TransactionalEmailResult
  | { ok: true; skipped: true; reason: "already-sent" };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function siteUrl() {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) {
    return `https://${production.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) {
    return `https://${deployment.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

function formatEventDate(value: string, timezone: string) {
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

function formatExpiry(value: string | null, timezone: string) {
  if (!value) return "No expiry";
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function money(currency: string, value: number) {
  return `${currency} ${value.toLocaleString("en-LK")}`;
}

async function loadOrderEmailContext(
  orderId: string,
): Promise<OrderEmailContext | null> {
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,event_id,customer_id,order_number,access_token,status,payment_status,payment_method,total_lkr,currency,expires_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.error("Email order lookup failed:", orderError);
    return null;
  }

  const [
    { data: customer, error: customerError },
    { data: event, error: eventError },
    { data: rawItems, error: itemsError },
    { data: rawTickets, error: ticketsError },
  ] = await Promise.all([
    admin
      .from("customers")
      .select("full_name,email")
      .eq("id", order.customer_id)
      .maybeSingle(),
    admin
      .from("events")
      .select("name,starts_at,timezone,venue_name,venue_address")
      .eq("id", order.event_id)
      .maybeSingle(),
    admin
      .from("order_items")
      .select("ticket_type_id,quantity,total_price_lkr")
      .eq("order_id", order.id),
    admin
      .from("tickets")
      .select("ticket_number,ticket_type_id")
      .eq("order_id", order.id)
      .order("ticket_number"),
  ]);

  if (
    customerError ||
    eventError ||
    itemsError ||
    ticketsError ||
    !customer ||
    !event
  ) {
    console.error("Email context lookup failed:", {
      customerError,
      eventError,
      itemsError,
      ticketsError,
    });
    return null;
  }

  const typeIds = [
    ...new Set([
      ...(rawItems ?? []).map((item) => item.ticket_type_id),
      ...(rawTickets ?? []).map((ticket) => ticket.ticket_type_id),
    ]),
  ];

  const { data: ticketTypes, error: typesError } = typeIds.length
    ? await admin
        .from("ticket_types")
        .select("id,name")
        .in("id", typeIds)
    : { data: [], error: null };

  if (typesError) {
    console.error("Email ticket type lookup failed:", typesError);
    return null;
  }

  const typeMap = new Map(
    (ticketTypes ?? []).map((ticketType) => [
      ticketType.id,
      ticketType.name,
    ]),
  );

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    accessToken: order.access_token,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    total: order.total_lkr,
    currency: order.currency,
    expiresAt: order.expires_at,
    customerName: customer.full_name,
    customerEmail: customer.email,
    eventName: event.name,
    startsAt: event.starts_at,
    timezone: event.timezone,
    venueName: event.venue_name,
    venueAddress: event.venue_address,
    items: (rawItems ?? []).map((item) => ({
      name: typeMap.get(item.ticket_type_id) ?? "Admission",
      quantity: item.quantity,
      total: item.total_price_lkr,
    })),
    tickets: (rawTickets ?? []).map((ticket) => ({
      ticketNumber: ticket.ticket_number,
      ticketTypeName:
        typeMap.get(ticket.ticket_type_id) ?? "Admission",
    })),
  };
}

async function alreadySent(orderId: string, kind: EmailKind) {
  const admin = createAdminClient();

  // email_deliveries was added in Phase 7B. The temporary cast keeps this
  // helper compatible until the generated Database type is refreshed later.
  const deliveryDb = admin as any;

  const { data } = await deliveryDb
    .from("email_deliveries")
    .select("status")
    .eq("order_id", orderId)
    .eq("kind", kind)
    .maybeSingle();

  return data?.status === "SENT";
}

async function recordAttempt(
  orderId: string,
  kind: EmailKind,
  recipient: string,
  result: TransactionalEmailResult,
) {
  const admin = createAdminClient();
  const deliveryDb = admin as any;

  const { data: existing } = await deliveryDb
    .from("email_deliveries")
    .select("id,attempt_count")
    .eq("order_id", orderId)
    .eq("kind", kind)
    .maybeSingle();

  const payload = {
    order_id: orderId,
    kind,
    recipient_email: recipient,
    status: result.ok ? "SENT" : "FAILED",
    attempt_count: (existing?.attempt_count ?? 0) + 1,
    provider_message_id: result.ok ? result.id : null,
    last_error: result.ok ? null : result.error,
    sent_at: result.ok ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await deliveryDb
      .from("email_deliveries")
      .update(payload)
      .eq("id", existing.id);
  } else {
    await deliveryDb.from("email_deliveries").insert(payload);
  }
}

function shell(content: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#0E1721;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#FEFFFF;border:1px solid #d8dee3;">
        <div style="padding:26px 28px;border-bottom:1px solid #e4e8eb;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:.04em;">SWARA RANJANA</div>
          <div style="margin-top:7px;color:#2271B1;font-size:10px;letter-spacing:.24em;text-transform:uppercase;">2026 Live Concert</div>
        </div>
        ${content}
        <div style="padding:22px 28px;border-top:1px solid #e4e8eb;color:#7D8A95;font-size:11px;line-height:1.6;">
          Keep ticket links and QR codes private. Swara Ranjana staff will never ask you to send your login code.
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function itemRows(context: OrderEmailContext) {
  return context.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#31465A;font-size:13px;">${escapeHtml(item.name)} × ${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;font-size:13px;">${escapeHtml(money(context.currency, item.total))}</td>
        </tr>`,
    )
    .join("");
}

async function sendTracked(
  context: OrderEmailContext,
  kind: EmailKind,
  input: {
    subject: string;
    html: string;
    text: string;
  },
): Promise<TrackedEmailResult> {
  if (await alreadySent(context.orderId, kind)) {
    return {
      ok: true,
      skipped: true,
      reason: "already-sent",
    };
  }

  const result = await sendTransactionalEmail({
    to: context.customerEmail,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  await recordAttempt(
    context.orderId,
    kind,
    context.customerEmail,
    result,
  ).catch((error) => {
    console.error("Email delivery log update failed:", error);
  });

  if (!result.ok && !result.skipped) {
    console.error(`Transactional email failed (${kind}):`, result.error);
  }

  return result;
}

export async function sendReservationCreatedEmail(orderId: string) {
  const context = await loadOrderEmailContext(orderId);
  if (!context) {
    return {
      ok: false as const,
      error: "Unable to load reservation email data.",
    };
  }

  const base = siteUrl();
  const paymentUrl = `${base}/payment/${encodeURIComponent(
    context.orderNumber,
  )}?token=${encodeURIComponent(context.accessToken)}`;
  const accountUrl = `${base}/account/login`;
  const eventDate = formatEventDate(
    context.startsAt,
    context.timezone,
  );
  const expiry = formatExpiry(context.expiresAt, context.timezone);

  const html = shell(`
    <div style="padding:30px 28px;">
      <div style="font-size:11px;color:#2271B1;letter-spacing:.2em;text-transform:uppercase;">Reservation received</div>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;margin:10px 0 8px;">Your seats are being held.</h1>
      <p style="margin:0;color:#7D8A95;font-size:14px;line-height:1.7;">Hi ${escapeHtml(context.customerName)}, your Swara Ranjana reservation has been created. Complete your payment choice before the hold expires.</p>

      <div style="margin:24px 0;padding:18px;background:#f7f9fa;border-left:4px solid #2271B1;">
        <div style="font-size:10px;color:#7D8A95;letter-spacing:.16em;text-transform:uppercase;">Order reference</div>
        <div style="font-family:monospace;font-size:20px;font-weight:700;margin-top:5px;">${escapeHtml(context.orderNumber)}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:18px 0;">
        ${itemRows(context)}
        <tr>
          <td style="padding:14px 0 0;border-top:1px solid #d8dee3;font-weight:700;">Total</td>
          <td style="padding:14px 0 0;border-top:1px solid #d8dee3;text-align:right;font-weight:700;">${escapeHtml(money(context.currency, context.total))}</td>
        </tr>
      </table>

      <div style="margin-top:20px;color:#31465A;font-size:13px;line-height:1.7;">
        <div><strong>Date:</strong> ${escapeHtml(eventDate)}</div>
        <div><strong>Venue:</strong> ${escapeHtml(context.venueName)}</div>
        <div><strong>Hold expires:</strong> ${escapeHtml(expiry)}</div>
      </div>

      <a href="${escapeHtml(paymentUrl)}" style="display:inline-block;margin-top:26px;background:#0E1721;color:#fff;text-decoration:none;padding:14px 22px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">Continue to payment</a>

      <p style="margin:24px 0 0;color:#7D8A95;font-size:12px;line-height:1.7;">A My Tickets account is available for this reservation email. You can sign in later using a one-time email code: <a href="${escapeHtml(accountUrl)}" style="color:#2271B1;">open My Tickets</a>.</p>
    </div>
  `);

  const text = [
    `Swara Ranjana reservation ${context.orderNumber}`,
    "",
    `Hi ${context.customerName}, your reservation has been created.`,
    `Event: ${context.eventName}`,
    `Date: ${eventDate}`,
    `Venue: ${context.venueName}`,
    `Total: ${money(context.currency, context.total)}`,
    `Hold expires: ${expiry}`,
    "",
    `Continue to payment: ${paymentUrl}`,
    `My Tickets: ${accountUrl}`,
  ].join("\n");

  return sendTracked(context, "RESERVATION_CREATED", {
    subject: `Reservation ${context.orderNumber} — Swara Ranjana`,
    html,
    text,
  });
}

export async function sendTicketsIssuedEmail(orderId: string) {
  const context = await loadOrderEmailContext(orderId);
  if (!context) {
    return {
      ok: false as const,
      error: "Unable to load ticket email data.",
    };
  }

  if (!context.tickets.length) {
    return {
      ok: false as const,
      error: "No tickets have been issued for this order yet.",
    };
  }

  const base = siteUrl();
  const directTicketsUrl = `${base}/tickets/${encodeURIComponent(
    context.orderNumber,
  )}?token=${encodeURIComponent(context.accessToken)}`;
  const accountUrl = `${base}/account/login`;
  const eventDate = formatEventDate(
    context.startsAt,
    context.timezone,
  );
  const paymentDue =
    context.paymentMethod === "ON_ARRIVAL" &&
    context.paymentStatus !== "PAID";

  const ticketsHtml = context.tickets
    .map(
      (ticket, index) => `
        <div style="margin-top:10px;padding:14px 16px;border:1px solid #d8dee3;background:#fff;">
          <div style="font-size:10px;color:#7D8A95;letter-spacing:.15em;text-transform:uppercase;">Ticket ${index + 1}</div>
          <div style="font-family:monospace;font-size:16px;font-weight:700;margin-top:5px;">${escapeHtml(ticket.ticketNumber)}</div>
          <div style="font-size:12px;color:#31465A;margin-top:4px;">${escapeHtml(ticket.ticketTypeName)}</div>
        </div>`,
    )
    .join("");

  const html = shell(`
    <div style="padding:30px 28px;">
      <div style="font-size:11px;color:#2271B1;letter-spacing:.2em;text-transform:uppercase;">Admission tickets issued</div>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;margin:10px 0 8px;">Your tickets are ready.</h1>
      <p style="margin:0;color:#7D8A95;font-size:14px;line-height:1.7;">Hi ${escapeHtml(context.customerName)}, your ${context.tickets.length === 1 ? "ticket is" : "tickets are"} ready for Swara Ranjana.</p>

      ${
        paymentDue
          ? `<div style="margin:22px 0;padding:15px 16px;background:#fff7e6;border:1px solid #f0cf8f;color:#8a5700;font-size:13px;line-height:1.6;"><strong>Payment due at entry.</strong> Your reservation is confirmed, but payment must be completed at the entrance before admission.</div>`
          : `<div style="margin:22px 0;padding:15px 16px;background:#ecfdf3;border:1px solid #b8e7cb;color:#047857;font-size:13px;"><strong>Payment confirmed.</strong> Keep each QR private until entry.</div>`
      }

      <div style="margin:22px 0;">
        ${ticketsHtml}
      </div>

      <div style="color:#31465A;font-size:13px;line-height:1.7;">
        <div><strong>Date:</strong> ${escapeHtml(eventDate)}</div>
        <div><strong>Venue:</strong> ${escapeHtml(context.venueName)}</div>
        ${
          context.venueAddress
            ? `<div><strong>Address:</strong> ${escapeHtml(context.venueAddress)}</div>`
            : ""
        }
      </div>

      <a href="${escapeHtml(directTicketsUrl)}" style="display:inline-block;margin-top:26px;background:#0E1721;color:#fff;text-decoration:none;padding:14px 22px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">Open digital tickets</a>

      <p style="margin:24px 0 0;color:#7D8A95;font-size:12px;line-height:1.7;">You can also access these tickets at any time through your customer profile using a one-time login code: <a href="${escapeHtml(accountUrl)}" style="color:#2271B1;">My Tickets account</a>.</p>
    </div>
  `);

  const text = [
    `Your Swara Ranjana tickets - ${context.orderNumber} has arrived`,
    "",
    `Hi ${context.customerName}, your tickets are ready.`,
    `Event: ${context.eventName}`,
    `Date: ${eventDate}`,
    `Venue: ${context.venueName}`,
    paymentDue ? "Payment: due at entry" : "Payment: confirmed",
    "",
    ...context.tickets.map(
      (ticket, index) =>
        `Ticket ${index + 1}: ${ticket.ticketNumber} — ${ticket.ticketTypeName}`,
    ),
    "",
    `Open tickets: ${directTicketsUrl}`,
    `My Tickets account: ${accountUrl}`,
  ].join("\n");

  return sendTracked(context, "TICKETS_ISSUED", {
    subject: `Your Swara Ranjana tickets - ${context.orderNumber} has arrived`,
    html,
    text,
  });
}
