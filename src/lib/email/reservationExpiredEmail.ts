import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendTransactionalEmail,
  type TransactionalEmailResult,
} from "@/lib/email/resend";

const EMAIL_KIND = "RESERVATION_EXPIRED";

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
  if (explicit) return explicit.replace(/\/+$/, "");

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

async function recordAttempt(
  orderId: string,
  recipient: string,
  result: TransactionalEmailResult,
) {
  const admin = createAdminClient() as any;
  const { data: existing } = await admin
    .from("email_deliveries")
    .select("id,attempt_count")
    .eq("order_id", orderId)
    .eq("kind", EMAIL_KIND)
    .maybeSingle();

  const payload = {
    order_id: orderId,
    kind: EMAIL_KIND,
    recipient_email: recipient,
    status: result.ok ? "SENT" : "FAILED",
    attempt_count: (existing?.attempt_count ?? 0) + 1,
    provider_message_id: result.ok ? result.id : null,
    last_error: result.ok ? null : result.error,
    sent_at: result.ok ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await admin.from("email_deliveries").update(payload).eq("id", existing.id);
  } else {
    await admin.from("email_deliveries").insert(payload);
  }
}

export async function sendReservationExpiredEmail(orderId: string) {
  const admin = createAdminClient() as any;

  const { data: sent } = await admin
    .from("email_deliveries")
    .select("status")
    .eq("order_id", orderId)
    .eq("kind", EMAIL_KIND)
    .maybeSingle();

  if (sent?.status === "SENT") {
    return { ok: true as const, skipped: true as const };
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,event_id,customer_id,order_number,status,payment_status,total_lkr,currency,metadata",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false as const, error: "Unable to load expired reservation." };
  }

  if (
    order.status !== "CANCELLED" ||
    order.payment_status !== "PENDING" ||
    order.metadata?.hold_expired !== true
  ) {
    return { ok: false as const, skipped: true as const, error: "Order is not an expired reservation." };
  }

  const [
    { data: customer, error: customerError },
    { data: event, error: eventError },
  ] = await Promise.all([
    admin
      .from("customers")
      .select("full_name,email")
      .eq("id", order.customer_id)
      .maybeSingle(),
    admin
      .from("events")
      .select("name,starts_at,timezone,venue_name")
      .eq("id", order.event_id)
      .maybeSingle(),
  ]);

  if (customerError || eventError || !customer || !event) {
    return { ok: false as const, error: "Unable to load reservation recipient." };
  }

  const ticketsUrl = `${siteUrl()}/tickets`;
  const eventDate = formatEventDate(event.starts_at, event.timezone || "Asia/Colombo");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#0E1721;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#FEFFFF;border:1px solid #d8dee3;">
        <div style="padding:26px 28px;border-bottom:1px solid #e4e8eb;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:.04em;">SWARA RANJANA</div>
          <div style="margin-top:7px;color:#2271B1;font-size:10px;letter-spacing:.24em;text-transform:uppercase;">Reservation update</div>
        </div>
        <div style="padding:30px 28px;">
          <div style="font-size:11px;color:#2271B1;letter-spacing:.2em;text-transform:uppercase;">Reservation expired</div>
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;margin:10px 0 8px;">Your seat hold has ended.</h1>
          <p style="margin:0;color:#7D8A95;font-size:14px;line-height:1.7;">Hi ${escapeHtml(customer.full_name)}, the 30-minute hold for reservation <strong style="color:#0E1721;">${escapeHtml(order.order_number)}</strong> expired before the reservation was confirmed. The held seats have now been released back into availability.</p>

          <div style="margin:24px 0;padding:18px;background:#f7f9fa;border-left:4px solid #2271B1;color:#31465A;font-size:13px;line-height:1.75;">
            <div><strong>Event:</strong> ${escapeHtml(event.name)}</div>
            <div><strong>Date:</strong> ${escapeHtml(eventDate)}</div>
            <div><strong>Venue:</strong> ${escapeHtml(event.venue_name)}</div>
            <div><strong>Previous total:</strong> ${escapeHtml(`${order.currency} ${Number(order.total_lkr).toLocaleString("en-LK")}`)}</div>
          </div>

          <p style="margin:0;color:#31465A;font-size:13px;line-height:1.7;">No payment was recorded for this expired reservation. If seats are still available, you can create a fresh reservation below.</p>

          <a href="${escapeHtml(ticketsUrl)}" style="display:inline-block;margin-top:26px;background:#0E1721;color:#fff;text-decoration:none;padding:14px 22px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">Reserve again</a>
        </div>
        <div style="padding:22px 28px;border-top:1px solid #e4e8eb;color:#7D8A95;font-size:11px;line-height:1.6;">
          Need help? Contact Swara Ranjana through the website or reply to this email if a reply address is configured.
        </div>
      </div>
    </div>
  </body>
</html>`;

  const text = [
    `Swara Ranjana reservation ${order.order_number} expired`,
    "",
    `Hi ${customer.full_name}, your 30-minute seat hold expired before the reservation was confirmed.`,
    "The held seats have been released back into availability.",
    `Event: ${event.name}`,
    `Date: ${eventDate}`,
    `Venue: ${event.venue_name}`,
    "No payment was recorded for this expired reservation.",
    "",
    `Reserve again: ${ticketsUrl}`,
  ].join("\n");

  const result = await sendTransactionalEmail({
    to: customer.email,
    subject: `Reservation ${order.order_number} expired — Swara Ranjana`,
    html,
    text,
  });

  await recordAttempt(order.id, customer.email, result).catch((error) => {
    console.error("Expired reservation delivery log failed:", error);
  });

  return result;
}
