import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, OrderStatus, PaymentMethod, PaymentStatus, PaymentSubmissionStatus, TicketStatus } from "@/types/database";
import type { CustomerProfile } from "@/lib/auth/requireCustomer";

export interface AccountOrderItem { id: string; ticketTypeName: string; quantity: number; totalPrice: number; }
export interface AccountTicketSummary { id: string; ticketNumber: string; ticketTypeName: string; status: TicketStatus; }
export interface AccountOrder {
  id: string; orderNumber: string; accessToken: string; status: OrderStatus; paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null; total: number; currency: string; createdAt: string; expiresAt: string | null;
  eventName: string; eventStartsAt: string; eventTimezone: string; venueName: string; items: AccountOrderItem[];
  tickets: AccountTicketSummary[]; slipStatus: PaymentSubmissionStatus | null;
}
export interface CustomerAccountData { customer: CustomerProfile; orders: AccountOrder[]; }
export interface AccountDigitalTicket {
  id: string; ticketNumber: string; qrToken: string; status: TicketStatus; attendeeName: string | null;
  ticketTypeName: string; seatingZone: string | null; checkedInAt: string | null;
}
export interface AccountTicketBundle {
  orderId: string; orderNumber: string; orderStatus: OrderStatus; paymentStatus: PaymentStatus; paymentMethod: PaymentMethod | null;
  total: number; currency: string; customerName: string; eventName: string; startsAt: string; timezone: string;
  venueName: string; venueAddress: string | null; tickets: AccountDigitalTicket[];
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

export async function getCustomerAccountData(supabase: SupabaseClient<Database>, customer: CustomerProfile): Promise<CustomerAccountData> {
  const { data: orders, error } = await supabase.from("orders")
    .select("id,event_id,order_number,access_token,status,payment_status,payment_method,total_lkr,currency,created_at,expires_at")
    .eq("customer_id", customer.id).order("created_at", { ascending: false });
  if (error || !orders?.length) return { customer, orders: [] };

  const orderIds = orders.map(o => o.id);
  const eventIds = unique(orders.map(o => o.event_id));
  const events = (await supabase.from("events").select("id,name,starts_at,timezone,venue_name").in("id", eventIds)).data ?? [];
  const items = (await supabase.from("order_items").select("id,order_id,ticket_type_id,quantity,total_price_lkr").in("order_id", orderIds)).data ?? [];
  const tickets = (await supabase.from("tickets").select("id,order_id,ticket_type_id,ticket_number,status").in("order_id", orderIds).order("ticket_number")).data ?? [];
  const submissions = (await supabase.from("payment_submissions").select("order_id,status,submitted_at").in("order_id", orderIds).order("submitted_at", { ascending: false })).data ?? [];
  const typeIds = unique([...items.map(i => i.ticket_type_id), ...tickets.map(t => t.ticket_type_id)]);
  const types = typeIds.length ? ((await supabase.from("ticket_types").select("id,name").in("id", typeIds)).data ?? []) : [];
  const eventMap = new Map(events.map(e => [e.id,e]));
  const typeMap = new Map(types.map(t => [t.id,t.name]));

  return { customer, orders: orders.map(order => {
    const ev = eventMap.get(order.event_id);
    const oi = items.filter(i => i.order_id===order.id).map(i => ({ id:i.id, ticketTypeName:typeMap.get(i.ticket_type_id) ?? "Admission", quantity:i.quantity, totalPrice:i.total_price_lkr }));
    const ts = tickets.filter(t => t.order_id===order.id).map(t => ({ id:t.id, ticketNumber:t.ticket_number, ticketTypeName:typeMap.get(t.ticket_type_id) ?? "Admission", status:t.status }));
    const slip = submissions.find(s => s.order_id===order.id);
    return { id:order.id, orderNumber:order.order_number, accessToken:order.access_token, status:order.status, paymentStatus:order.payment_status, paymentMethod:order.payment_method, total:order.total_lkr, currency:order.currency, createdAt:order.created_at, expiresAt:order.expires_at, eventName:ev?.name ?? "Swara Ranjana", eventStartsAt:ev?.starts_at ?? "", eventTimezone:ev?.timezone ?? "Asia/Colombo", venueName:ev?.venue_name ?? "Venue TBA", items:oi, tickets:ts, slipStatus:slip?.status ?? null };
  }) };
}

export async function getCustomerTicketBundle(supabase: SupabaseClient<Database>, customer: CustomerProfile, orderId: string): Promise<AccountTicketBundle | null> {
  const { data: order } = await supabase.from("orders").select("id,event_id,order_number,status,payment_status,payment_method,total_lkr,currency").eq("id",orderId).eq("customer_id",customer.id).maybeSingle();
  if (!order) return null;
  const event = (await supabase.from("events").select("name,starts_at,timezone,venue_name,venue_address").eq("id",order.event_id).maybeSingle()).data;
  const tickets = (await supabase.from("tickets").select("id,ticket_number,qr_token,status,attendee_name,ticket_type_id,checked_in_at").eq("order_id",order.id).eq("customer_id",customer.id).order("ticket_number")).data ?? [];
  if (!event) return null;
  const typeIds=unique(tickets.map(t=>t.ticket_type_id));
  const types=typeIds.length ? ((await supabase.from("ticket_types").select("id,name,seating_zone").in("id",typeIds)).data ?? []) : [];
  const typeMap=new Map(types.map(t=>[t.id,t]));
  return { orderId:order.id, orderNumber:order.order_number, orderStatus:order.status, paymentStatus:order.payment_status, paymentMethod:order.payment_method, total:order.total_lkr, currency:order.currency, customerName:customer.full_name, eventName:event.name, startsAt:event.starts_at, timezone:event.timezone, venueName:event.venue_name, venueAddress:event.venue_address, tickets:tickets.map(t=>{ const tt=typeMap.get(t.ticket_type_id); return { id:t.id, ticketNumber:t.ticket_number, qrToken:t.qr_token, status:t.status, attendeeName:t.attendee_name, ticketTypeName:tt?.name ?? "Admission", seatingZone:tt?.seating_zone ?? null, checkedInAt:t.checked_in_at }; }) };
}
