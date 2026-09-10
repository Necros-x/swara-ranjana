import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, PaymentStatus, TicketStatus } from "@/types/database";

export type PaymentMethod = "CARD" | "ON_ARRIVAL" | "BANK_SLIP";

export interface GuestPaymentOrder {
  id: string; orderNumber: string; status: OrderStatus; paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null; total: number; currency: string; expiresAt: string | null;
  customerName: string; customerEmail: string; eventName: string; venueName: string; startsAt: string;
  items: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  tickets: Array<{ id: string; ticketNumber: string; status: TicketStatus }>;
  slipStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
}

export async function getGuestPaymentOrder(orderNumber: string, accessToken: string): Promise<GuestPaymentOrder | null> {
  if (!orderNumber || !accessToken) return null;
  const supabase = createAdminClient();
  const { data: order } = await supabase.from("orders").select("id,event_id,customer_id,order_number,status,payment_status,payment_method,total_lkr,currency,expires_at").eq("order_number", orderNumber).eq("access_token", accessToken).maybeSingle();
  if (!order) return null;
  const [{data:customer},{data:event},{data:items},{data:tickets},{data:submissions}] = await Promise.all([
    supabase.from("customers").select("full_name,email").eq("id", order.customer_id).maybeSingle(),
    supabase.from("events").select("name,venue_name,starts_at").eq("id", order.event_id).maybeSingle(),
    supabase.from("order_items").select("ticket_type_id,quantity,unit_price_lkr,total_price_lkr").eq("order_id", order.id),
    supabase.from("tickets").select("id,ticket_number,status").eq("order_id", order.id).order("ticket_number"),
    supabase.from("payment_submissions").select("status").eq("order_id", order.id).order("submitted_at", {ascending:false}).limit(1),
  ]);
  const typeIds=[...new Set((items??[]).map(i=>i.ticket_type_id))];
  const {data:types}=typeIds.length?await supabase.from("ticket_types").select("id,name").in("id",typeIds):{data:[]};
  const names=new Map((types??[]).map(t=>[t.id,t.name]));
  return { id:order.id, orderNumber:order.order_number, status:order.status, paymentStatus:order.payment_status,
    paymentMethod:(order.payment_method as PaymentMethod|null)??null, total:order.total_lkr, currency:order.currency, expiresAt:order.expires_at,
    customerName:customer?.full_name??"Concert Patron", customerEmail:customer?.email??"", eventName:event?.name??"Swara Ranjana 2026", venueName:event?.venue_name??"", startsAt:event?.starts_at??"",
    items:(items??[]).map(i=>({name:names.get(i.ticket_type_id)??"Ticket",quantity:i.quantity,unitPrice:i.unit_price_lkr,totalPrice:i.total_price_lkr})),
    tickets:(tickets??[]).map(t=>({id:t.id,ticketNumber:t.ticket_number,status:t.status})), slipStatus:(submissions?.[0]?.status as any)??null };
}
