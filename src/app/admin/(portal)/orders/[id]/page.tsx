import { notFound } from "next/navigation";
import OrderDetail from "@/admin-site/pages/OrderDetail";
import { getAdminOrderDetail } from "@/lib/admin/orders";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  if (!order) notFound();
  return <OrderDetail order={order} />;
}
