import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentMethod, PaymentStatus, TicketStatus } from "@/types/database";

export type CustomerRequestKind = "CANCEL" | "REFUND";
export type CustomerRequestScope = "FULL" | "PARTIAL";
export type CustomerRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface AdminRequestListItem {
  id: string;
  kind: CustomerRequestKind;
  scope: CustomerRequestScope;
  status: CustomerRequestStatus;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  eventName: string;
  requestedAmount: number;
  currency: string;
  ticketCount: number;
  createdAt: string;
}

export interface AdminRequestTicket {
  id: string;
  ticketNumber: string;
  ticketTypeName: string;
  status: TicketStatus;
  amount: number;
}

export interface AdminRequestDetail extends AdminRequestListItem {
  reason: string | null;
  staffNote: string | null;
  approvedAmount: number | null;
  refundReference: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  completedAt: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  paymentProvider: string | null;
  paymentReference: string | null;
  eventStartsAt: string;
  eventTimezone: string;
  selectedTickets: AdminRequestTicket[];
  orderTickets: AdminRequestTicket[];
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export async function getAdminRequests(): Promise<AdminRequestListItem[]> {
  const admin = createAdminClient();
  const db = admin as any;

  const { data: requests, error } = await db
    .from("customer_order_requests")
    .select(
      "id,order_id,customer_id,kind,scope,status,requested_amount_lkr,created_at",
    )
    .order("created_at", { ascending: false });

  if (error || !requests?.length) {
    if (error) console.error("Failed to load customer requests:", error);
    return [];
  }

  const orderIds = unique(requests.map((request: any) => request.order_id));
  const customerIds = unique(
    requests.map((request: any) => request.customer_id),
  );
  const requestIds = requests.map((request: any) => request.id);

  const [ordersResult, customersResult, requestTicketsResult] =
    await Promise.all([
      admin
        .from("orders")
        .select("id,order_number,event_id,currency")
        .in("id", orderIds),
      admin
        .from("customers")
        .select("id,full_name,email")
        .in("id", customerIds),
      db
        .from("customer_order_request_tickets")
        .select("request_id,ticket_id")
        .in("request_id", requestIds),
    ]);

  const orders = ordersResult.data ?? [];
  const customers = customersResult.data ?? [];
  const requestTickets = requestTicketsResult.data ?? [];
  const eventIds = unique(orders.map((order) => order.event_id));
  const events = eventIds.length
    ? ((await admin
        .from("events")
        .select("id,name")
        .in("id", eventIds)).data ?? [])
    : [];

  const orderMap = new Map(orders.map((order) => [order.id, order]));
  const customerMap = new Map(
    customers.map((customer) => [customer.id, customer]),
  );
  const eventMap = new Map(events.map((event) => [event.id, event]));

  return requests.map((request: any) => {
    const order = orderMap.get(request.order_id);
    const customer = customerMap.get(request.customer_id);
    const event = order ? eventMap.get(order.event_id) : null;
    const ticketCount = requestTickets.filter(
      (ticket: any) => ticket.request_id === request.id,
    ).length;

    return {
      id: request.id,
      kind: request.kind,
      scope: request.scope,
      status: request.status,
      orderId: request.order_id,
      orderNumber: order?.order_number ?? "—",
      customerName: customer?.full_name ?? "Unknown customer",
      customerEmail: customer?.email ?? "",
      eventName: event?.name ?? "Unknown show",
      requestedAmount: request.requested_amount_lkr ?? 0,
      currency: order?.currency ?? "LKR",
      ticketCount,
      createdAt: request.created_at,
    };
  });
}

export async function getAdminRequestDetail(
  requestId: string,
): Promise<AdminRequestDetail | null> {
  const admin = createAdminClient();
  const db = admin as any;

  const { data: request, error } = await db
    .from("customer_order_requests")
    .select(
      "id,order_id,customer_id,kind,scope,status,reason,staff_note,requested_amount_lkr,approved_amount_lkr,refund_reference,created_at,reviewed_at,reviewed_by,completed_at",
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !request) {
    if (error) console.error("Failed to load request detail:", error);
    return null;
  }

  const [orderResult, customerResult, requestTicketsResult] =
    await Promise.all([
      admin
        .from("orders")
        .select(
          "id,order_number,event_id,currency,payment_method,payment_status,payment_provider,payment_reference",
        )
        .eq("id", request.order_id)
        .maybeSingle(),
      admin
        .from("customers")
        .select("full_name,email")
        .eq("id", request.customer_id)
        .maybeSingle(),
      db
        .from("customer_order_request_tickets")
        .select("ticket_id,amount_lkr")
        .eq("request_id", request.id),
    ]);

  const order = orderResult.data;
  const customer = customerResult.data;
  if (!order || !customer) return null;

  const [eventResult, ticketsResult, reviewerResult] = await Promise.all([
    admin
      .from("events")
      .select("name,starts_at,timezone")
      .eq("id", order.event_id)
      .maybeSingle(),
    admin
      .from("tickets")
      .select("id,ticket_number,ticket_type_id,status,order_item_id")
      .eq("order_id", order.id)
      .order("ticket_number"),
    request.reviewed_by
      ? admin
          .from("staff_profiles")
          .select("display_name")
          .eq("user_id", request.reviewed_by)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const event = eventResult.data;
  if (!event) return null;

  const tickets = ticketsResult.data ?? [];
  const typeIds = unique(tickets.map((ticket) => ticket.ticket_type_id));
  const types = typeIds.length
    ? ((await admin
        .from("ticket_types")
        .select("id,name")
        .in("id", typeIds)).data ?? [])
    : [];
  const typeMap = new Map(types.map((type) => [type.id, type.name]));
  const selectedAmounts = new Map(
    (requestTicketsResult.data ?? []).map((row: any) => [
      row.ticket_id,
      row.amount_lkr,
    ]),
  );

  const orderTickets: AdminRequestTicket[] = tickets.map((ticket) => ({
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    ticketTypeName: typeMap.get(ticket.ticket_type_id) ?? "Admission",
    status: ticket.status,
    amount: selectedAmounts.get(ticket.id) ?? 0,
  }));
  const selectedTickets = orderTickets.filter((ticket) =>
    selectedAmounts.has(ticket.id),
  );

  return {
    id: request.id,
    kind: request.kind,
    scope: request.scope,
    status: request.status,
    orderId: order.id,
    orderNumber: order.order_number,
    customerName: customer.full_name,
    customerEmail: customer.email,
    eventName: event.name,
    requestedAmount: request.requested_amount_lkr ?? 0,
    currency: order.currency,
    ticketCount:
      request.kind === "REFUND" ? selectedTickets.length : orderTickets.length,
    createdAt: request.created_at,
    reason: request.reason,
    staffNote: request.staff_note,
    approvedAmount: request.approved_amount_lkr,
    refundReference: request.refund_reference,
    reviewedAt: request.reviewed_at,
    reviewedByName: reviewerResult.data?.display_name ?? null,
    completedAt: request.completed_at,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    paymentProvider: order.payment_provider,
    paymentReference: order.payment_reference,
    eventStartsAt: event.starts_at,
    eventTimezone: event.timezone,
    selectedTickets,
    orderTickets,
  };
}
