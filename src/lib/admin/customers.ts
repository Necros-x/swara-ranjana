import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminCustomerSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  accountActive: boolean;
  accountActivatedAt: string | null;
  lastLoginAt: string | null;
  orderCount: number;
  activeTicketCount: number;
  lastOrderAt: string | null;
}

export async function getAdminCustomerSummaries(): Promise<AdminCustomerSummary[]> {
  const admin = createAdminClient();
  const { data: customers, error: customersError } = await admin
    .from("customers")
    .select(
      "id, full_name, email, phone, auth_user_id, account_activated_at, last_login_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (customersError) throw customersError;
  if (!customers?.length) return [];

  const customerIds = customers.map((customer) => customer.id);
  const [ordersResult, ticketsResult] = await Promise.all([
    admin
      .from("orders")
      .select("customer_id, created_at")
      .in("customer_id", customerIds),
    admin
      .from("tickets")
      .select("customer_id, status")
      .in("customer_id", customerIds),
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (ticketsResult.error) throw ticketsResult.error;

  const ordersByCustomer = new Map<string, string[]>();
  for (const order of ordersResult.data ?? []) {
    const list = ordersByCustomer.get(order.customer_id) ?? [];
    list.push(order.created_at);
    ordersByCustomer.set(order.customer_id, list);
  }

  const activeTicketsByCustomer = new Map<string, number>();
  for (const ticket of ticketsResult.data ?? []) {
    if (ticket.status !== "VALID" && ticket.status !== "USED") continue;
    activeTicketsByCustomer.set(
      ticket.customer_id,
      (activeTicketsByCustomer.get(ticket.customer_id) ?? 0) + 1,
    );
  }

  return customers.map((customer) => {
    const orderDates = ordersByCustomer.get(customer.id) ?? [];
    const lastOrderAt = orderDates.length
      ? orderDates.reduce((latest, value) =>
          new Date(value).getTime() > new Date(latest).getTime() ? value : latest,
        )
      : null;

    return {
      id: customer.id,
      fullName: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.created_at,
      accountActive: Boolean(customer.auth_user_id),
      accountActivatedAt: customer.account_activated_at,
      lastLoginAt: customer.last_login_at,
      orderCount: orderDates.length,
      activeTicketCount: activeTicketsByCustomer.get(customer.id) ?? 0,
      lastOrderAt,
    };
  });
}
