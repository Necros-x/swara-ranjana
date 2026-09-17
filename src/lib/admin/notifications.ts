import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole } from "@/types/database";

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  tone: "info" | "warning" | "urgent";
  read: boolean;
}

type PendingSlip = {
  id: string;
  order_id: string;
  submitted_at: string;
};

type PendingRequest = {
  id: string;
  order_id: string;
  kind: string;
  created_at: string;
};

type ExpiringOrder = {
  id: string;
  order_number: string;
  expires_at: string | null;
};

type OrderLookup = {
  id: string;
  order_number: string;
};

function canReviewSlips(role: StaffRole) {
  return ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE"].includes(role);
}

function canReviewRequests(role: StaffRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

function canSeeOrders(role: StaffRole) {
  return role !== "SCANNER";
}

export async function getAdminNotifications(
  role: StaffRole,
  userId: string,
): Promise<AdminNotificationItem[]> {
  const admin = createAdminClient() as unknown as SupabaseClient;
  const now = new Date();
  const soon = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

  const [slipResult, requestResult, expiringResult] = await Promise.all([
    canReviewSlips(role)
      ? admin
          .from("payment_submissions")
          .select("id,order_id,submitted_at")
          .eq("status", "PENDING")
          .order("submitted_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] as PendingSlip[], error: null }),
    canReviewRequests(role)
      ? admin
          .from("customer_order_requests")
          .select("id,order_id,kind,created_at")
          .eq("status", "PENDING")
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] as PendingRequest[], error: null }),
    canSeeOrders(role)
      ? admin
          .from("orders")
          .select("id,order_number,expires_at")
          .eq("status", "PENDING")
          .eq("payment_status", "PENDING")
          .gt("expires_at", now.toISOString())
          .lte("expires_at", soon)
          .order("expires_at", { ascending: true })
          .limit(8)
      : Promise.resolve({ data: [] as ExpiringOrder[], error: null }),
  ]);

  if (slipResult.error) console.error("Notification slip lookup failed:", slipResult.error);
  if (requestResult.error) console.error("Notification request lookup failed:", requestResult.error);
  if (expiringResult.error) console.error("Notification order lookup failed:", expiringResult.error);

  const slips = (slipResult.data ?? []) as PendingSlip[];
  const requests = (requestResult.data ?? []) as PendingRequest[];
  const expiringOrders = (expiringResult.data ?? []) as ExpiringOrder[];

  const orderIds = [
    ...new Set([
      ...slips.map((item) => item.order_id),
      ...requests.map((item) => item.order_id),
    ]),
  ];

  let orderNumbers = new Map<string, string>();
  if (orderIds.length > 0) {
    const { data, error } = await admin
      .from("orders")
      .select("id,order_number")
      .in("id", orderIds);

    if (error) console.error("Notification order-number lookup failed:", error);
    orderNumbers = new Map(
      ((data ?? []) as OrderLookup[]).map((order) => [order.id, order.order_number]),
    );
  }

  const items: Omit<AdminNotificationItem, "read">[] = [];

  for (const slip of slips) {
    const orderNumber = orderNumbers.get(slip.order_id) ?? "reservation";
    items.push({
      id: `slip:${slip.id}`,
      title: "Payment slip awaiting review",
      message: `${orderNumber} has a new bank-transfer proof to verify.`,
      href: `/admin/orders/${slip.order_id}`,
      createdAt: slip.submitted_at,
      tone: "warning",
    });
  }

  for (const request of requests) {
    const orderNumber = orderNumbers.get(request.order_id) ?? "reservation";
    const requestLabel = request.kind === "CANCEL" ? "Cancellation" : "Refund";
    items.push({
      id: `request:${request.id}`,
      title: `${requestLabel} request pending`,
      message: `${orderNumber} needs staff review.`,
      href: `/admin/requests/${request.id}`,
      createdAt: request.created_at,
      tone: request.kind === "REFUND" ? "urgent" : "warning",
    });
  }

  for (const order of expiringOrders) {
    items.push({
      id: `expiry:${order.id}`,
      title: "Reservation hold expiring soon",
      message: `${order.order_number} is still unpaid and is within 15 minutes of expiry.`,
      href: `/admin/orders/${order.id}`,
      createdAt: order.expires_at ?? now.toISOString(),
      tone: "info",
    });
  }

  const activeItems = items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 12);

  if (activeItems.length === 0) return [];

  const activeIds = activeItems.map((item) => item.id);
  const { data: readRows, error: readError } = await admin
    .from("admin_notification_reads")
    .select("notification_id")
    .eq("user_id", userId)
    .in("notification_id", activeIds);

  if (readError) {
    console.error("Notification read-state lookup failed:", readError);
  }

  const readIds = new Set(
    (readRows ?? []).map((row) => String(row.notification_id)),
  );

  return activeItems.map((item) => ({
    ...item,
    read: readIds.has(item.id),
  }));
}
