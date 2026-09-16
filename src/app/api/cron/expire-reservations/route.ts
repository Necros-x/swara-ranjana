import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReservationExpiredEmail } from "@/lib/email/reservationExpiredEmail";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const CRON_SCHEDULE = "*/5 * * * *";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");

  if (secret) {
    return authorization === `Bearer ${secret}`;
  }

  // Vercel adds this header to scheduled invocations. CRON_SECRET is still
  // preferred when configured, but this keeps the worker functional before a
  // secret is added to the project environment.
  return request.headers.get("x-vercel-cron-schedule") === CRON_SCHEDULE;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient() as any;

  const { data: expiredRows, error: expiryError } = await admin.rpc(
    "process_expired_reservations",
  );

  if (expiryError) {
    console.error("Expired reservation sweep failed:", expiryError);
    return NextResponse.json(
      { ok: false, error: "Unable to process expired reservations." },
      { status: 500 },
    );
  }

  // Retry unsent/failed expiry emails on subsequent runs. The mail helper is
  // idempotent and immediately skips rows that already have a SENT delivery.
  const { data: candidates, error: candidateError } = await admin
    .from("orders")
    .select("id")
    .eq("status", "CANCELLED")
    .eq("payment_status", "PENDING")
    .contains("metadata", { hold_expired: true })
    .order("updated_at", { ascending: false })
    .limit(100);

  if (candidateError) {
    console.error("Expired email candidate lookup failed:", candidateError);
    return NextResponse.json(
      {
        ok: false,
        expired: Array.isArray(expiredRows) ? expiredRows.length : 0,
        error: "Expired reservations were processed, but email delivery could not be queued.",
      },
      { status: 500 },
    );
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const order of candidates ?? []) {
    try {
      const result = await sendReservationExpiredEmail(order.id);
      if (result.ok && "skipped" in result && result.skipped) {
        skipped += 1;
      } else if (result.ok) {
        sent += 1;
      } else if ("skipped" in result && result.skipped) {
        skipped += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      failed += 1;
      console.error(`Expired reservation email failed for ${order.id}:`, error);
    }
  }

  return NextResponse.json({
    ok: true,
    expired: Array.isArray(expiredRows) ? expiredRows.length : 0,
    emailCandidates: candidates?.length ?? 0,
    sent,
    skipped,
    failed,
  });
}
