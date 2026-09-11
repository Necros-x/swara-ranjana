import Orders from "@/admin-site/pages/Orders";
import { AdminRealtimeRefresh } from "@/admin-site/components/AdminRealtimeRefresh";
import { getAdminOrders } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const orders = await getAdminOrders();
  return (
    <AdminRealtimeRefresh
      tables={["orders", "tickets", "payment_submissions", "customer_order_requests"]}
    >
      <Orders orders={orders} />
    </AdminRealtimeRefresh>
  );
}
