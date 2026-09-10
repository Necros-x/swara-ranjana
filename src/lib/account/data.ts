import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentSubmissionStatus,
  TicketStatus,
} from "@/types/database";
import type { CustomerProfile } from "@/lib/auth/requireCustomer";

export interface AccountOrderItem {
  id: string;
  ticketTypeName: string;
  quantity: number;
  totalPrice: number;
}

export interface AccountTicketSummary {
  id: string;
  ticketNumber: string;
  ticketTypeName: string;
  status: TicketStatus;
}

export interface AccountPendingRequest {
  kind: "CANCEL" | "REFUND";
  status: "PENDING";
  createdAt: string;
}

export interface AccountOrder {
  id: string;
  orderNumber: string;
  accessToken: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  total: number;
  currency: string;
  createdAt: string;
  expiresAt: string | null;
  eventName: string;
  eventStartsAt: string;
  eventTimezone: string;
  venueName: string;
  items: AccountOrderItem[];
  tickets: AccountTicketSummary[];
  slipStatus: PaymentSubmissionStatus | null;
  pendingRequest: AccountPendingRequest | null;
}

export interface CustomerAccountData {
  customer: CustomerProfile;
  orders: AccountOrder[];
}

export interface AccountDigitalTicket {
  id: string;
  ticketNumber: string;
  qrToken: string;
  status: TicketStatus;
  attendeeName: string | null;
  ticketTypeName: string;
  seatingZone: string | null;
  checkedInAt: string | null;
}

export interface AccountTicketBundle {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  total: number;
  currency: string;
  customerName: string;
  eventName: string;
  startsAt: string;
  timezone: string;
  venueName: string;
  venueAddress: string | null;
  tickets: AccountDigitalTicket[];
}

const unique = (values: string[]) => [
  ...new Set(values.filter(Boolean)),
];

type RequestRow = {
  order_id: string;
  kind: "CANCEL" | "REFUND";
  status: "PENDING";
  created_at: string;
};

export async function getCustomerAccountData(
  supabase: SupabaseClient<Database>,
  customer: CustomerProfile,
): Promise<CustomerAccountData> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id,event_id,order_number,access_token,status,payment_status,payment_method,total_lkr,currency,created_at,expires_at",
    )
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  if (error || !orders?.length) {
    return { customer, orders: [] };
  }

  const orderIds = orders.map((order) => order.id);
  const eventIds = unique(orders.map((order) => order.event_id));

  const [eventsResult, itemsResult, ticketsResult, submissionsResult] =
    await Promise.all([
      supabase
        .from("events")
        .select("id,name,starts_at,timezone,venue_name")
        .in("id", eventIds),
      supabase
        .from("order_items")
        .select(
          "id,order_id,ticket_type_id,quantity,total_price_lkr",
        )
        .in("order_id", orderIds),
      supabase
        .from("tickets")
        .select(
          "id,order_id,ticket_type_id,ticket_number,status",
        )
        .in("order_id", orderIds)
        .order("ticket_number"),
      supabase
        .from("payment_submissions")
        .select("order_id,status,submitted_at")
        .in("order_id", orderIds)
        .order("submitted_at", { ascending: false }),
    ]);

  const events = eventsResult.data ?? [];
  const items = itemsResult.data ?? [];
  const tickets = ticketsResult.data ?? [];
  const submissions = submissionsResult.data ?? [];

  const requestDb = supabase as any;
  const requestResult = await requestDb
    .from("customer_order_requests")
    .select("order_id,kind,status,created_at")
    .in("order_id", orderIds)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });
  const requests = (requestResult.data ?? []) as RequestRow[];

  const typeIds = unique([
    ...items.map((item) => item.ticket_type_id),
    ...tickets.map((ticket) => ticket.ticket_type_id),
  ]);

  const types = typeIds.length
    ? ((await supabase
        .from("ticket_types")
        .select("id,name")
        .in("id", typeIds)).data ?? [])
    : [];

  const eventMap = new Map(events.map((event) => [event.id, event]));
  const typeMap = new Map(types.map((type) => [type.id, type.name]));

  return {
    customer,
    orders: orders.map((order) => {
      const event = eventMap.get(order.event_id);
      const orderItems = items
        .filter((item) => item.order_id === order.id)
        .map((item) => ({
          id: item.id,
          ticketTypeName:
            typeMap.get(item.ticket_type_id) ?? "Admission",
          quantity: item.quantity,
          totalPrice: item.total_price_lkr,
        }));
      const orderTickets = tickets
        .filter((ticket) => ticket.order_id === order.id)
        .map((ticket) => ({
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          ticketTypeName:
            typeMap.get(ticket.ticket_type_id) ?? "Admission",
          status: ticket.status,
        }));
      const slip = submissions.find(
        (submission) => submission.order_id === order.id,
      );
      const request = requests.find(
        (item) => item.order_id === order.id,
      );

      return {
        id: order.id,
        orderNumber: order.order_number,
        accessToken: order.access_token,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        total: order.total_lkr,
        currency: order.currency,
        createdAt: order.created_at,
        expiresAt: order.expires_at,
        eventName: event?.name ?? "Swara Ranjana",
        eventStartsAt: event?.starts_at ?? "",
        eventTimezone: event?.timezone ?? "Asia/Colombo",
        venueName: event?.venue_name ?? "Venue TBA",
        items: orderItems,
        tickets: orderTickets,
        slipStatus: slip?.status ?? null,
        pendingRequest: request
          ? {
              kind: request.kind,
              status: request.status,
              createdAt: request.created_at,
            }
          : null,
      };
    }),
  };
}

export async function getCustomerTicketBundle(
  supabase: SupabaseClient<Database>,
  customer: CustomerProfile,
  orderId: string,
): Promise<AccountTicketBundle | null> {
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id,event_id,order_number,status,payment_status,payment_method,total_lkr,currency",
    )
    .eq("id", orderId)
    .eq("customer_id", customer.id)
    .maybeSingle();

  if (!order) return null;

  const event = (
    await supabase
      .from("events")
      .select("name,starts_at,timezone,venue_name,venue_address")
      .eq("id", order.event_id)
      .maybeSingle()
  ).data;

  const tickets =
    (
      await supabase
        .from("tickets")
        .select(
          "id,ticket_number,qr_token,status,attendee_name,ticket_type_id,checked_in_at",
        )
        .eq("order_id", order.id)
        .eq("customer_id", customer.id)
        .order("ticket_number")
    ).data ?? [];

  if (!event) return null;

  const typeIds = unique(
    tickets.map((ticket) => ticket.ticket_type_id),
  );
  const types = typeIds.length
    ? ((await supabase
        .from("ticket_types")
        .select("id,name,seating_zone")
        .in("id", typeIds)).data ?? [])
    : [];
  const typeMap = new Map(types.map((type) => [type.id, type]));

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    orderStatus: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    total: order.total_lkr,
    currency: order.currency,
    customerName: customer.full_name,
    eventName: event.name,
    startsAt: event.starts_at,
    timezone: event.timezone,
    venueName: event.venue_name,
    venueAddress: event.venue_address,
    tickets: tickets.map((ticket) => {
      const type = typeMap.get(ticket.ticket_type_id);
      return {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        qrToken: ticket.qr_token,
        status: ticket.status,
        attendeeName: ticket.attendee_name,
        ticketTypeName: type?.name ?? "Admission",
        seatingZone: type?.seating_zone ?? null,
        checkedInAt: ticket.checked_in_at,
      };
    }),
  };
}
