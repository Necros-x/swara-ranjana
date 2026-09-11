import RefundRequests from "@/admin-site/pages/RefundRequests";
import { AdminRealtimeRefresh } from "@/admin-site/components/AdminRealtimeRefresh";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getAdminRequests } from "@/lib/admin/requests";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  const requests = await getAdminRequests();
  return (
    <AdminRealtimeRefresh
      tables={["customer_order_requests", "orders", "tickets", "payment_submissions"]}
    >
      <RefundRequests requests={requests} />
    </AdminRealtimeRefresh>
  );
}
