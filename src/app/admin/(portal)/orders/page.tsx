import Orders from "@/admin-site/pages/Orders";
import { getAdminOrders } from "@/lib/admin/orders";

export default async function Page() {
  const orders = await getAdminOrders();
  return <Orders orders={orders} />;
}
