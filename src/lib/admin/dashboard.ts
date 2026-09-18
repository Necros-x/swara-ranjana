import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminOrders, type AdminOrderListItem } from "@/lib/admin/orders";
import {
  getAdminScanHistory,
  type AdminScanHistoryItem,
} from "@/lib/admin/scans";
import type { EventStatus } from "@/types/database";

export interface AdminDashboardCategory {
  id: string;
  name: string;
  capacity: number;
  sold: number;
  reserved: number;
  remaining: number;
}

export interface AdminDashboardDay {
  key: string;
  label: string;
  orders: number;
  tickets: number;
}

export interface AdminDashboardData {
  event: {
    id: string;
    name: string;
    status: EventStatus;
    startsAt: string;
    venueName: string;
    totalCapacity: number;
    currency: string;
  } | null;
  fullyPaidOrderValue: number;
  totalOrders: number;
  activeTickets: number;
  insideNow: number;
  categories: AdminDashboardCategory[];
  salesSeries: AdminDashboardDay[];
  recentOrders: AdminOrderListItem[];
  recentScans: AdminScanHistoryItem[];
}

function colomboDayKey(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof value === "string" ? new Date(value) : value);
}

function dayLabel(key: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const admin = createAdminClient();

  const { data: events, error: eventsError } = await admin
    .from("events")
    .select("id,name,status,starts_at,venue_name,total_capacity,currency")
    .order("starts_at", { ascending: false });

  if (eventsError) throw eventsError;

  const event =
    events?.find((candidate) =>
      ["ON_SALE", "SOLD_OUT"].includes(candidate.status),
    ) ??
    events?.[0] ??
    null;

  const [allOrders, recentScans] = await Promise.all([
    getAdminOrders(),
    getAdminScanHistory(5),
  ]);

  if (!event) {
    return {
      event: null,
      fullyPaidOrderValue: 0,
      totalOrders: 0,
      activeTickets: 0,
      insideNow: 0,
      categories: [],
      salesSeries: [],
      recentOrders: allOrders.slice(0, 5),
      recentScans,
    };
  }

  const [ordersResult, typesResult, ticketsResult] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id,status,payment_status,total_lkr,created_at,expires_at,event_id",
      )
      .eq("event_id", event.id)
      .order("created_at", { ascending: false }),
    admin
      .from("ticket_types")
      .select("id,name,capacity,sort_order")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true }),
    admin
      .from("tickets")
      .select("id,event_id,ticket_type_id,status,is_inside")
      .eq("event_id", event.id),
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (typesResult.error) throw typesResult.error;
  if (ticketsResult.error) throw ticketsResult.error;

  const eventOrders = ordersResult.data ?? [];
  const orderIds = eventOrders.map((order) => order.id);
  const { data: items, error: itemsError } = orderIds.length
    ? await admin
        .from("order_items")
        .select("order_id,ticket_type_id,quantity")
        .in("order_id", orderIds)
    : { data: [], error: null };

  if (itemsError) throw itemsError;

  const orderMap = new Map(eventOrders.map((order) => [order.id, order]));
  const now = Date.now();
  const soldByType = new Map<string, number>();
  const reservedByType = new Map<string, number>();

  for (const item of items ?? []) {
    const order = orderMap.get(item.order_id);
    if (!order) continue;

    if (order.status === "CONFIRMED") {
      soldByType.set(
        item.ticket_type_id,
        (soldByType.get(item.ticket_type_id) ?? 0) + item.quantity,
      );
      continue;
    }

    const holdActive =
      order.status === "PENDING" &&
      order.payment_status === "PENDING" &&
      Boolean(order.expires_at) &&
      new Date(order.expires_at as string).getTime() > now;

    if (holdActive) {
      reservedByType.set(
        item.ticket_type_id,
        (reservedByType.get(item.ticket_type_id) ?? 0) + item.quantity,
      );
    }
  }

  const categories: AdminDashboardCategory[] = (typesResult.data ?? []).map(
    (type) => {
      const sold = soldByType.get(type.id) ?? 0;
      const reserved = reservedByType.get(type.id) ?? 0;
      return {
        id: type.id,
        name: type.name,
        capacity: type.capacity,
        sold,
        reserved,
        remaining: Math.max(type.capacity - sold - reserved, 0),
      };
    },
  );

  const activeTicketRows = (ticketsResult.data ?? []).filter(
    (ticket) => ticket.status === "VALID" || ticket.status === "USED",
  );
  const activeTickets = activeTicketRows.length;
  const insideNow = activeTicketRows.filter((ticket) => ticket.is_inside).length;

  const fullyPaidOrderValue = eventOrders
    .filter(
      (order) =>
        order.payment_status === "PAID" &&
        order.status !== "CANCELLED" &&
        order.status !== "REFUNDED",
    )
    .reduce((sum, order) => sum + order.total_lkr, 0);

  const dayMap = new Map<string, AdminDashboardDay>();

  const ensureDay = (key: string) => {
    const existing = dayMap.get(key);
    if (existing) return existing;

    const created: AdminDashboardDay = {
      key,
      label: dayLabel(key),
      orders: 0,
      tickets: 0,
    };
    dayMap.set(key, created);
    return created;
  };

  for (const order of eventOrders) {
    ensureDay(colomboDayKey(order.created_at)).orders += 1;
  }

  for (const item of items ?? []) {
    const order = orderMap.get(item.order_id);
    if (!order || order.status !== "CONFIRMED") continue;
    ensureDay(colomboDayKey(order.created_at)).tickets += item.quantity;
  }

  const salesSeries = Array.from(dayMap.values()).sort((a, b) =>
    a.key.localeCompare(b.key),
  );

  const eventOrderIds = new Set(eventOrders.map((order) => order.id));
  const recentOrders = allOrders
    .filter((order) => eventOrderIds.has(order.id))
    .slice(0, 5);

  return {
    event: {
      id: event.id,
      name: event.name,
      status: event.status,
      startsAt: event.starts_at,
      venueName: event.venue_name,
      totalCapacity: event.total_capacity,
      currency: event.currency,
    },
    fullyPaidOrderValue,
    totalOrders: eventOrders.length,
    activeTickets,
    insideNow,
    categories,
    salesSeries,
    recentOrders,
    recentScans,
  };
}
