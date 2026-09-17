import Dashboard from "@/admin-site/pages/Dashboard";
import { getAdminDashboardData } from "@/lib/admin/dashboard";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN", "BOX_OFFICE"]);
  const data = await getAdminDashboardData();

  return <Dashboard data={data} />;
}
