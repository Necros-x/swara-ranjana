import { notFound } from "next/navigation";
import OrderDetail from "@/admin-site/pages/OrderDetail";
import { AdminRealtimeRefresh } from "@/admin-site/components/AdminRealtimeRefresh";
import { getAdminOrderDetail } from "@/lib/admin/orders";
import { requireStaff } from "@/lib/auth/requireStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(["SUPER_ADMIN", "ADMIN", "BOX_OFFICE"]);
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
