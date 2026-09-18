import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export interface PhysicalSalesCategory {
  id: string;
  code: string;
  name: string;
  priceLkr: number;
  capacity: number;
  available: number;
  heldOnline: number;
  soldOnline: number;
  soldPhysical: number;
  nextPhysicalSerial: number | null;
  highestAvailableSerial: number | null;
  soldOut: boolean;
}

export interface RecentPhysicalSale {
  id: string;
  orderNumber: string;
  ticketTypeName: string;
  quantity: number;
  totalLkr: number;
  sellerName: string;
  serialStart: string | null;
  serialEnd: string | null;
  createdAt: string;
}

export interface PhysicalSalesDashboardData {
  event: {
    id: string;
    name: string;
    status: string;
    currency: string;
  } | null;
  categories: PhysicalSalesCategory[];
  recentSales: RecentPhysicalSale[];
}

function jsonRecord(value: Json) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

export async function getPhysicalSalesDashboard(): Promise<PhysicalSalesDashboardData> {
  const admin = createAdminClient();

  const { data: events, error: eventError } = await admin
    .from("events")
    .select("id,name,status,currency,starts_at")
    .in("status", ["ON_SALE", "SOLD_OUT"])
    .order("starts_at", { ascending: false })
    .limit(1);

  if (eventError) throw eventError;

  const event = events?.[0] ?? null;

  if (!event) {
    return { event: null, categories: [], recentSales: [] };
  }

  const [
    { data: types, error: typesError },
    { data: inventory, error: inventoryError },
    { data: recentOrders, error: ordersError },
  ] = await Promise.all([
    admin
      .from("ticket_types")
      .select("id,code,name,price_lkr,capacity,sort_order")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true }),
    admin
      .from("seat_ticket_inventory")
      .select("ticket_type_id,status,serial_number")
      .eq("event_id", event.id),
    admin
      .from("orders")
      .select("id,order_number,total_lkr,created_at,metadata")
      .eq("event_id", event.id)
      .eq("payment_provider", "PHYSICAL")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (typesError) throw typesError;
  if (inventoryError) throw inventoryError;
  if (ordersError) throw ordersError;

  const rows = inventory ?? [];
  const categories: PhysicalSalesCategory[] = (types ?? []).map((type) => {
    const categoryRows = rows.filter(
      (row) => row.ticket_type_id === type.id,
    );
    const availableRows = categoryRows
      .filter((row) => row.status === "AVAILABLE")
      .sort((a, b) => a.serial_number - b.serial_number);

    return {
      id: type.id,
      code: type.code,
      name: type.name,
      priceLkr: type.price_lkr,
      capacity: type.capacity,
      available: availableRows.length,
      heldOnline: categoryRows.filter((row) => row.status === "HELD_ONLINE").length,
      soldOnline: categoryRows.filter((row) => row.status === "SOLD_ONLINE").length,
      soldPhysical: categoryRows.filter((row) => row.status === "SOLD_PHYSICAL").length,
      nextPhysicalSerial: availableRows[0]?.serial_number ?? null,
      highestAvailableSerial:
        availableRows[availableRows.length - 1]?.serial_number ?? null,
      soldOut: availableRows.length === 0,
    };
  });

  const recentIds = (recentOrders ?? []).map((order) => order.id);
  const { data: items, error: itemsError } = recentIds.length
    ? await admin
        .from("order_items")
        .select("order_id,ticket_type_id,quantity")
        .in("order_id", recentIds)
    : { data: [], error: null };

  if (itemsError) throw itemsError;

  const typeMap = new Map(
    (types ?? []).map((type) => [type.id, type.name]),
  );
  const itemMap = new Map(
    (items ?? []).map((item) => [item.order_id, item]),
  );

  const recentSales: RecentPhysicalSale[] = (recentOrders ?? []).map((order) => {
    const metadata = jsonRecord(order.metadata);
    const item = itemMap.get(order.id);

    return {
      id: order.id,
      orderNumber: order.order_number,
      ticketTypeName: item
        ? typeMap.get(item.ticket_type_id) ?? "Admission"
        : "Admission",
      quantity: item?.quantity ?? 0,
      totalLkr: order.total_lkr,
      sellerName:
        typeof metadata?.sold_by_name === "string"
          ? metadata.sold_by_name
          : "Seller",
      serialStart:
        typeof metadata?.serial_start === "string"
          ? metadata.serial_start
          : null,
      serialEnd:
        typeof metadata?.serial_end === "string"
          ? metadata.serial_end
          : null,
      createdAt: order.created_at,
    };
  });

  return {
    event: {
      id: event.id,
      name: event.name,
      status: event.status,
      currency: event.currency,
    },
    categories,
    recentSales,
  };
}
