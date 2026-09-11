import { notFound } from "next/navigation";
import OrderDetail from "@/admin-site/pages/OrderDetail";
import { AdminRealtimeRefresh } from "@/admin-site/components/AdminRealtimeRefresh";
import { getAdminOrderDetail } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  if (!order) notFound();
  return (
    <AdminRealtimeRefresh
      tables={["orders", "tickets", "payment_submissions", "customer_order_requests"]}
    >
      <OrderDetail order={order} />
    </AdminRealtimeRefresh>
  );
}
