import Orders from "@/admin-site/pages/Orders";
import { AdminRealtimeRefresh } from "@/admin-site/components/AdminRealtimeRefresh";
import { getAdminOrders } from "@/lib/admin/orders";
import { requireStaff } from "@/lib/auth/requireStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN", "BOX_OFFICE"]);
  const orders = await getAdminOrders();
  return (
    <AdminRealtimeRefresh
      tables={["orders", "tickets", "payment_submissions", "customer_order_requests"]}
    >
      <Orders orders={orders} />
    </AdminRealtimeRefresh>
  );
}
