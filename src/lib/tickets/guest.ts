import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  TicketStatus,
} from "@/types/database";

export interface GuestDigitalTicket {
  id: string;
  ticketNumber: string;
  qrToken: string;
  status: TicketStatus;
  attendeeName: string | null;
  issuedAt: string;
  checkedInAt: string | null;
  ticketTypeName: string;
  seatingZone: string | null;
  seatLabel: string | null;
}

export interface GuestTicketBundle {
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  total: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  eventName: string;
  startsAt: string;
  timezone: string;
  venueName: string;
  venueAddress: string | null;
  tickets: GuestDigitalTicket[];
}

export async function getGuestTicketBundle(
  orderNumber: string,
  accessToken: string,
): Promise<GuestTicketBundle | null> {
  if (!orderNumber || !accessToken) return null;

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,event_id,customer_id,order_number,status,payment_status,payment_method,total_lkr,currency",
    )
    .eq("order_number", orderNumber)
    .eq("access_token", accessToken)
    .maybeSingle();

  if (orderError || !order) return null;

  const [
    { data: customer, error: customerError },
    { data: event, error: eventError },
    { data: ticketRows, error: ticketError },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("full_name,email")
      .eq("id", order.customer_id)
      .maybeSingle(),
    supabase
      .from("events")
      .select("name,starts_at,timezone,venue_name,venue_address")
      .eq("id", order.event_id)
      .maybeSingle(),
    supabase
      .from("tickets")
      .select(
        "id,ticket_number,qr_token,status,attendee_name,issued_at,checked_in_at,ticket_type_id,seat_label",
      )
      .eq("order_id", order.id)
      .order("ticket_number"),
  ]);

  if (customerError || eventError || ticketError || !event) return null;

  const typeIds = [
    ...new Set((ticketRows ?? []).map((ticket) => ticket.ticket_type_id)),
  ];

  const { data: typeRows, error: typeError } = typeIds.length
    ? await supabase
        .from("ticket_types")
        .select("id,name,seating_zone")
        .in("id", typeIds)
    : { data: [], error: null };

  if (typeError) return null;

  const typeMap = new Map(
    (typeRows ?? []).map((type) => [
      type.id,
      { name: type.name, seatingZone: type.seating_zone },
    ]),
  );

  return {
    orderNumber: order.order_number,
    orderStatus: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: (order.payment_method as PaymentMethod | null) ?? null,
    total: order.total_lkr,
    currency: order.currency,
    customerName: customer?.full_name ?? "Concert Patron",
    customerEmail: customer?.email ?? "",
    eventName: event.name,
    startsAt: event.starts_at,
    timezone: event.timezone,
    venueName: event.venue_name,
    venueAddress: event.venue_address,
    tickets: (ticketRows ?? []).map((ticket) => {
      const ticketType = typeMap.get(ticket.ticket_type_id);
      return {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        qrToken: ticket.qr_token,
        status: ticket.status,
        attendeeName: ticket.attendee_name,
        issuedAt: ticket.issued_at,
        checkedInAt: ticket.checked_in_at,
        ticketTypeName: ticketType?.name ?? "Admission",
        seatingZone: ticketType?.seatingZone ?? null,
        seatLabel: ticket.seat_label,
      };
    }),
  };
}
