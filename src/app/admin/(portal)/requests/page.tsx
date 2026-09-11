import RefundRequests from "@/admin-site/pages/RefundRequests";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getAdminRequests } from "@/lib/admin/requests";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  const requests = await getAdminRequests();
  return <RefundRequests requests={requests} />;
}
