import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminScanResult =
  | "ADMITTED"
  | "PAYMENT_DUE"
  | "DUPLICATE"
  | "INVALID"
  | "REVOKED"
  | "REFUNDED"
  | "WRONG_EVENT";

export interface AdminScanHistoryItem {
  id: number;
  timestamp: string;
  ticketNumber: string;
  ticketCategoryName: string;
  customerName: string;
  result: AdminScanResult;
  staffName: string;
  gate: string;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export async function getAdminScanHistory(
  limit = 250,
): Promise<AdminScanHistoryItem[]> {
  const admin = createAdminClient();

  const { data: logs, error } = await admin
    .from("scan_logs")
    .select(
      "id,ticket_id,staff_user_id,result,gate,ticket_number_snapshot,scanned_at",
    )
    .order("scanned_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load scan history:", error);
    return [];
  }

  if (!logs?.length) return [];

  const ticketIds = unique(
    logs.map((log) => log.ticket_id ?? ""),
  );
  const staffIds = unique(
    logs.map((log) => log.staff_user_id),
  );

  const [{ data: tickets }, { data: staff }] = await Promise.all([
    ticketIds.length
      ? admin
          .from("tickets")
          .select("id,customer_id,ticket_type_id")
          .in("id", ticketIds)
      : Promise.resolve({ data: [] }),
    staffIds.length
      ? admin
          .from("staff_profiles")
          .select("user_id,display_name")
          .in("user_id", staffIds)
      : Promise.resolve({ data: [] }),
  ]);

  const customerIds = unique(
    (tickets ?? []).map((ticket) => ticket.customer_id),
  );
  const typeIds = unique(
    (tickets ?? []).map((ticket) => ticket.ticket_type_id),
  );

  const [{ data: customers }, { data: ticketTypes }] = await Promise.all([
    customerIds.length
      ? admin
          .from("customers")
          .select("id,full_name")
          .in("id", customerIds)
      : Promise.resolve({ data: [] }),
    typeIds.length
      ? admin
          .from("ticket_types")
          .select("id,name")
          .in("id", typeIds)
      : Promise.resolve({ data: [] }),
  ]);

  const ticketMap = new Map(
    (tickets ?? []).map((ticket) => [ticket.id, ticket]),
  );
  const staffMap = new Map(
    (staff ?? []).map((member) => [member.user_id, member.display_name]),
  );
  const customerMap = new Map(
    (customers ?? []).map((customer) => [customer.id, customer.full_name]),
  );
  const typeMap = new Map(
    (ticketTypes ?? []).map((type) => [type.id, type.name]),
  );

  return logs.map((log) => {
    const ticket = log.ticket_id ? ticketMap.get(log.ticket_id) : undefined;

    return {
      id: log.id,
      timestamp: log.scanned_at,
      ticketNumber:
        log.ticket_number_snapshot ??
        (log.result === "INVALID" ? "Unknown QR" : "—"),
      ticketCategoryName: ticket
        ? typeMap.get(ticket.ticket_type_id) ?? "Admission"
        : "—",
      customerName: ticket
        ? customerMap.get(ticket.customer_id) ?? "Unknown guest"
        : "—",
      result: String(log.result) as AdminScanResult,
      staffName:
        staffMap.get(log.staff_user_id) ?? "Event staff",
      gate: log.gate || "Unspecified gate",
    };
  });
}
