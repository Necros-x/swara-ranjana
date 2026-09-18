import PhysicalSales from "@/admin-site/pages/PhysicalSales";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getPhysicalSalesDashboard } from "@/lib/admin/physicalSales";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN", "SELLER"]);
  const data = await getPhysicalSalesDashboard();

  return <PhysicalSales data={data} />;
}
