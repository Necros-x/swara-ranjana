import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentSubmissionStatus,
  TicketStatus,
} from "@/types/database";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  ticketQuantity: number;
  ticketTypes: string[];
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  expiresAt: string | null;
}

export interface AdminOrderDetailItem {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminOrderDetailTicket {
  id: string;
  ticketNumber: string;
  ticketTypeName: string;
  status: TicketStatus;
}

export interface AdminOrderDetailData extends AdminOrderListItem {
  subtotal: number;
  discount: number;
  notes: string | null;
  paymentProvider: string | null;
  paymentReference: string | null;
  paymentMethod: PaymentMethod | null;
  paymentSubmission: {
    id: string;
    status: PaymentSubmissionStatus;
    originalFilename: string;
    submittedAt: string;
    signedUrl: string | null;
    rejectionReason: string | null;
  } | null;
  paidAt: string | null;
  items: AdminOrderDetailItem[];
  tickets: AdminOrderDetailTicket[];
}

type CustomerLite = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

type OrderItemLite = {
  id: string;
  order_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price_lkr: number;
  total_price_lkr: number;
};

type TicketTypeLite = {
  id: string;
  name: string;
};

type TicketLite = {
  id: string;
  order_id: string;
  ticket_type_id: string;
  ticket_number: string;
  status: TicketStatus;
};

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const supabase = await createClient();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, customer_id, order_number, status, payment_status, total_lkr, currency, created_at, expires_at",
    )
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Failed to load admin orders:", ordersError);
    return [];
  }

  if (!orders?.length) return [];

  const customerIds = unique(orders.map((order) => order.customer_id));
  const orderIds = orders.map((order) => order.id);

  const [{ data: customers }, { data: items }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, email, phone")
      .in("id", customerIds),
    supabase
      .from("order_items")
      .select(
        "id, order_id, ticket_type_id, quantity, unit_price_lkr, total_price_lkr",
      )
      .in("order_id", orderIds),
  ]);

  const customerRows = (customers ?? []) as CustomerLite[];
  const itemRows = (items ?? []) as OrderItemLite[];
  const ticketTypeIds = unique(itemRows.map((item) => item.ticket_type_id));

  let ticketTypeRows: TicketTypeLite[] = [];
  if (ticketTypeIds.length) {
    const { data: ticketTypes } = await supabase
      .from("ticket_types")
      .select("id, name")
      .in("id", ticketTypeIds);

    ticketTypeRows = (ticketTypes ?? []) as TicketTypeLite[];
  }

  const customerMap = new Map(
    customerRows.map((customer) => [customer.id, customer]),
  );
  const ticketTypeMap = new Map(
    ticketTypeRows.map((ticketType) => [ticketType.id, ticketType]),
  );

  return orders.map((order) => {
    const customer = customerMap.get(order.customer_id);
    const orderItems = itemRows.filter((item) => item.order_id === order.id);

    return {
      id: order.id,
      orderNumber: order.order_number,
      customerName: customer?.full_name ?? "Unknown customer",
      customerEmail: customer?.email ?? "",
      customerPhone: customer?.phone ?? null,
      ticketQuantity: orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      ticketTypes: unique(
        orderItems.map(
          (item) =>
            ticketTypeMap.get(item.ticket_type_id)?.name ?? "Ticket",
        ),
      ),
      total: order.total_lkr,
      currency: order.currency,
      paymentStatus: order.payment_status,
      orderStatus: order.status,
      createdAt: order.created_at,
      expiresAt: order.expires_at,
    };
  });
}

export async function getAdminOrderDetail(
  orderId: string,
): Promise<AdminOrderDetailData | null> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, customer_id, order_number, status, payment_status, payment_method, subtotal_lkr, discount_lkr, total_lkr, currency, payment_provider, payment_reference, expires_at, paid_at, notes, created_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    console.error("Failed to load order detail:", orderError);
    return null;
  }

  if (!order) return null;

  const [
    { data: customer },
    { data: rawItems },
    { data: rawTickets },
    { data: submissions },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, email, phone")
      .eq("id", order.customer_id)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select(
        "id, order_id, ticket_type_id, quantity, unit_price_lkr, total_price_lkr",
      )
      .eq("order_id", order.id),
    supabase
      .from("tickets")
      .select(
        "id, order_id, ticket_type_id, ticket_number, status",
      )
      .eq("order_id", order.id)
      .order("issued_at", { ascending: true }),
    supabase
      .from("payment_submissions")
      .select("id, status, storage_path, original_filename, submitted_at, rejection_reason")
      .eq("order_id", order.id)
      .order("submitted_at", { ascending: false })
      .limit(1),
  ]);

  const itemRows = (rawItems ?? []) as OrderItemLite[];
  const ticketRows = (rawTickets ?? []) as TicketLite[];
  const ticketTypeIds = unique([
    ...itemRows.map((item) => item.ticket_type_id),
    ...ticketRows.map((ticket) => ticket.ticket_type_id),
  ]);

  let ticketTypeRows: TicketTypeLite[] = [];
  if (ticketTypeIds.length) {
    const { data: ticketTypes } = await supabase
      .from("ticket_types")
      .select("id, name")
      .in("id", ticketTypeIds);

    ticketTypeRows = (ticketTypes ?? []) as TicketTypeLite[];
  }

  const ticketTypeMap = new Map(
    ticketTypeRows.map((ticketType) => [ticketType.id, ticketType]),
  );

  const items: AdminOrderDetailItem[] = itemRows.map((item) => ({
    id: item.id,
    ticketTypeId: item.ticket_type_id,
    ticketTypeName:
      ticketTypeMap.get(item.ticket_type_id)?.name ?? "Ticket",
    quantity: item.quantity,
    unitPrice: item.unit_price_lkr,
    totalPrice: item.total_price_lkr,
  }));

  const tickets: AdminOrderDetailTicket[] = ticketRows.map((ticket) => ({
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    ticketTypeName:
      ticketTypeMap.get(ticket.ticket_type_id)?.name ?? "Ticket",
    status: ticket.status,
  }));

  const customerRow = customer as CustomerLite | null;

  const latestSubmission = submissions?.[0] ?? null;
  let signedUrl: string | null = null;
  if (latestSubmission?.storage_path) {
    const admin = createAdminClient();
    const { data } = await admin.storage
      .from("payment-slips")
      .createSignedUrl(latestSubmission.storage_path, 300);
    signedUrl = data?.signedUrl ?? null;
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: customerRow?.full_name ?? "Unknown customer",
    customerEmail: customerRow?.email ?? "",
    customerPhone: customerRow?.phone ?? null,
    ticketQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    ticketTypes: unique(items.map((item) => item.ticketTypeName)),
    subtotal: order.subtotal_lkr,
    discount: order.discount_lkr,
    total: order.total_lkr,
    currency: order.currency,
    paymentStatus: order.payment_status,
    orderStatus: order.status,
    paymentProvider: order.payment_provider,
    paymentReference: order.payment_reference,
    paymentMethod: (order.payment_method as PaymentMethod | null) ?? null,
    paymentSubmission: latestSubmission
      ? {
          id: latestSubmission.id,
          status: latestSubmission.status as PaymentSubmissionStatus,
          originalFilename: latestSubmission.original_filename,
          submittedAt: latestSubmission.submitted_at,
          signedUrl,
          rejectionReason: latestSubmission.rejection_reason,
        }
      : null,
    expiresAt: order.expires_at,
    paidAt: order.paid_at,
    notes: order.notes,
    createdAt: order.created_at,
    items,
    tickets,
  };
}