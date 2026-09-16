import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  EventStatus,
  Json,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ScanResult,
  TicketStatus,
  TicketTypeStatus,
} from "@/types/database";

export type AdminTicketSource = "WEBSITE" | "INTERNAL";

export interface AdminTicketListItem {
  id: string;
  ticketNumber: string;
  eventId: string;
  eventName: string;
  orderId: string;
  orderNumber: string;
  holderName: string;
  ticketTypeId: string;
  ticketTypeName: string;
  seatLabel: string | null;
  source: AdminTicketSource;
  status: TicketStatus;
  issuedAt: string;
  checkedInAt: string | null;
}

export interface InternalIssueEvent {
  id: string;
  name: string;
  startsAt: string;
  status: EventStatus;
}

export interface InternalIssueTicketType {
  id: string;
  eventId: string;
  code: string;
  name: string;
  status: TicketTypeStatus;
  capacity: number;
}

export interface InternalIssueCatalog {
  events: InternalIssueEvent[];
  ticketTypes: InternalIssueTicketType[];
}

export interface InternalBatchTicket {
  id: string;
  ticketNumber: string;
  qrToken: string;
  status: TicketStatus;
  ticketTypeName: string;
  holderName: string;
}

export interface InternalTicketBatch {
  orderId: string;
  orderNumber: string;
  eventName: string;
  startsAt: string;
  venueName: string;
  holderLabel: string;
  note: string | null;
  tickets: InternalBatchTicket[];
}

export interface AdminTicketScanHistoryItem {
  id: number;
  result: ScanResult;
  gate: string | null;
  scannedAt: string;
  staffName: string;
}

export interface AdminTicketDetail {
  id: string;
  ticketNumber: string;
  qrToken: string;
  seatLabel: string | null;
  holderName: string;
  source: AdminTicketSource;
  status: TicketStatus;
  issuedAt: string;
  checkedInAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  event: {
    id: string;
    name: string;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
  };
  ticketType: {
    id: string;
    code: string;
    name: string;
    seatingZone: string | null;
    priceLkr: number;
  };
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    paymentReference: string | null;
    totalLkr: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
    notes: string | null;
  };
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  scanHistory: AdminTicketScanHistoryItem[];
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function sourceFromMetadata(metadata: Json): AdminTicketSource {
  if (
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata) &&
    metadata.source === "internal_admin"
  ) {
    return "INTERNAL";
  }

  return "WEBSITE";
}

function holderFromMetadata(metadata: Json) {
  if (
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata) &&
    typeof metadata.holder_label === "string"
  ) {
    return metadata.holder_label;
  }

  return "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function getAdminTickets(
  limit = 1000,
): Promise<AdminTicketListItem[]> {
  const admin = createAdminClient();

  const { data: tickets, error } = await admin
    .from("tickets")
    .select(
      "id,event_id,order_id,ticket_type_id,ticket_number,attendee_name,status,issued_at,checked_in_at,seat_label",
    )
    .order("issued_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load admin tickets:", error);
    return [];
  }

  if (!tickets?.length) return [];

  const eventIds = unique(tickets.map((ticket) => ticket.event_id));
  const orderIds = unique(tickets.map((ticket) => ticket.order_id));
  const typeIds = unique(tickets.map((ticket) => ticket.ticket_type_id));

  const [
    { data: events },
    { data: orders },
    { data: ticketTypes },
  ] = await Promise.all([
    admin.from("events").select("id,name").in("id", eventIds),
    admin
      .from("orders")
      .select("id,order_number,metadata")
      .in("id", orderIds),
    admin
      .from("ticket_types")
      .select("id,name")
      .in("id", typeIds),
  ]);

  const eventMap = new Map(
    (events ?? []).map((event) => [event.id, event.name]),
  );
  const orderMap = new Map(
    (orders ?? []).map((order) => [order.id, order]),
  );
  const typeMap = new Map(
    (ticketTypes ?? []).map((type) => [type.id, type.name]),
  );

  return tickets.map((ticket) => {
    const order = orderMap.get(ticket.order_id);
    const metadata = order?.metadata ?? {};

    return {
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      eventId: ticket.event_id,
      eventName: eventMap.get(ticket.event_id) ?? "Unknown show",
      orderId: ticket.order_id,
      orderNumber: order?.order_number ?? "—",
      holderName:
        ticket.attendee_name || holderFromMetadata(metadata) || "Guest",
      ticketTypeId: ticket.ticket_type_id,
      ticketTypeName: typeMap.get(ticket.ticket_type_id) ?? "Admission",
      seatLabel: ticket.seat_label,
      source: sourceFromMetadata(metadata),
      status: ticket.status,
      issuedAt: ticket.issued_at,
      checkedInAt: ticket.checked_in_at,
    };
  });
}

export async function getAdminTicketDetail(
  ticketId: string,
): Promise<AdminTicketDetail | null> {
  if (!isUuid(ticketId)) return null;

  const admin = createAdminClient();
  const { data: ticket, error } = await admin
    .from("tickets")
    .select(
      "id,event_id,order_id,ticket_type_id,customer_id,ticket_number,qr_token,attendee_name,status,issued_at,checked_in_at,revoked_at,revoke_reason,seat_label",
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load ticket detail:", error);
    return null;
  }

  if (!ticket) return null;

  const [eventResult, orderResult, typeResult, customerResult, scansResult] =
    await Promise.all([
      admin
        .from("events")
        .select("id,name,starts_at,venue_name,venue_address")
        .eq("id", ticket.event_id)
        .maybeSingle(),
      admin
        .from("orders")
        .select(
          "id,order_number,status,payment_status,payment_method,payment_reference,total_lkr,currency,paid_at,created_at,metadata,notes",
        )
        .eq("id", ticket.order_id)
        .maybeSingle(),
      admin
        .from("ticket_types")
        .select("id,code,name,seating_zone,price_lkr")
        .eq("id", ticket.ticket_type_id)
        .maybeSingle(),
      admin
        .from("customers")
        .select("id,full_name,email,phone")
        .eq("id", ticket.customer_id)
        .maybeSingle(),
      admin
        .from("scan_logs")
        .select("id,result,gate,staff_user_id,scanned_at")
        .eq("ticket_id", ticket.id)
        .order("scanned_at", { ascending: false })
        .limit(50),
    ]);

  const event = eventResult.data;
  const order = orderResult.data;
  const ticketType = typeResult.data;
  const customer = customerResult.data;
  const scans = scansResult.data ?? [];

  if (!event || !order || !ticketType || !customer) {
    console.error("Ticket detail is missing related records:", ticket.id);
    return null;
  }

  const staffIds = unique(scans.map((scan) => scan.staff_user_id));
  let staffMap = new Map<string, string>();

  if (staffIds.length) {
    const { data: staff } = await admin
      .from("staff_profiles")
      .select("user_id,display_name")
      .in("user_id", staffIds);

    staffMap = new Map(
      (staff ?? []).map((profile) => [profile.user_id, profile.display_name]),
    );
  }

  const source = sourceFromMetadata(order.metadata);
  const holderName =
    ticket.attendee_name ||
    holderFromMetadata(order.metadata) ||
    customer.full_name ||
    "Guest";

  return {
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    qrToken: ticket.qr_token,
    seatLabel: ticket.seat_label,
    holderName,
    source,
    status: ticket.status,
    issuedAt: ticket.issued_at,
    checkedInAt: ticket.checked_in_at,
    revokedAt: ticket.revoked_at,
    revokeReason: ticket.revoke_reason,
    event: {
      id: event.id,
      name: event.name,
      startsAt: event.starts_at,
      venueName: event.venue_name,
      venueAddress: event.venue_address,
    },
    ticketType: {
      id: ticketType.id,
      code: ticketType.code,
      name: ticketType.name,
      seatingZone: ticketType.seating_zone,
      priceLkr: ticketType.price_lkr,
    },
    order: {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      paymentReference: order.payment_reference,
      totalLkr: order.total_lkr,
      currency: order.currency,
      paidAt: order.paid_at,
      createdAt: order.created_at,
      notes: order.notes,
    },
    customer: {
      id: customer.id,
      fullName: customer.full_name,
      email: customer.email,
      phone: customer.phone,
    },
    scanHistory: scans.map((scan) => ({
      id: scan.id,
      result: scan.result,
      gate: scan.gate,
      scannedAt: scan.scanned_at,
      staffName: staffMap.get(scan.staff_user_id) ?? "Staff",
    })),
  };
}

export async function getInternalIssueCatalog(): Promise<InternalIssueCatalog> {
  const admin = createAdminClient();

  const { data: events, error } = await admin
    .from("events")
    .select("id,name,starts_at,status")
    .in("status", ["DRAFT", "ON_SALE", "SOLD_OUT"])
    .order("starts_at", { ascending: true });

  if (error || !events?.length) {
    if (error) console.error("Failed to load issue events:", error);
    return { events: [], ticketTypes: [] };
  }

  const eventIds = events.map((event) => event.id);
  const { data: ticketTypes } = await admin
    .from("ticket_types")
    .select("id,event_id,code,name,status,capacity")
    .in("event_id", eventIds)
    .order("sort_order", { ascending: true });

  return {
    events: events.map((event) => ({
      id: event.id,
      name: event.name,
      startsAt: event.starts_at,
      status: event.status,
    })),
    ticketTypes: (ticketTypes ?? []).map((type) => ({
      id: type.id,
      eventId: type.event_id,
      code: type.code,
      name: type.name,
      status: type.status,
      capacity: type.capacity,
    })),
  };
}

export async function getInternalTicketBatch(
  orderId: string,
): Promise<InternalTicketBatch | null> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id,event_id,order_number,metadata,notes")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || sourceFromMetadata(order.metadata) !== "INTERNAL") {
    return null;
  }

  const [{ data: event }, { data: tickets }] = await Promise.all([
    admin
      .from("events")
      .select("name,starts_at,venue_name")
      .eq("id", order.event_id)
      .maybeSingle(),
    admin
      .from("tickets")
      .select(
        "id,ticket_number,qr_token,status,ticket_type_id,attendee_name",
      )
      .eq("order_id", order.id)
      .order("ticket_number", { ascending: true }),
  ]);

  if (!event || !tickets?.length) return null;

  const typeIds = unique(tickets.map((ticket) => ticket.ticket_type_id));
  const { data: types } = await admin
    .from("ticket_types")
    .select("id,name")
    .in("id", typeIds);

  const typeMap = new Map(
    (types ?? []).map((type) => [type.id, type.name]),
  );
  const holderLabel =
    holderFromMetadata(order.metadata) ||
    tickets[0]?.attendee_name ||
    "Internal admission";

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    eventName: event.name,
    startsAt: event.starts_at,
    venueName: event.venue_name,
    holderLabel,
    note: order.notes,
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      qrToken: ticket.qr_token,
      status: ticket.status,
      ticketTypeName: typeMap.get(ticket.ticket_type_id) ?? "Admission",
      holderName: ticket.attendee_name || holderLabel,
    })),
  };
}
