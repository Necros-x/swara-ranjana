import Customers from "@/admin-site/pages/Customers";
import { getAdminCustomerSummaries } from "@/lib/admin/customers";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN", "BOX_OFFICE", "SCANNER"]);
  const customers = await getAdminCustomerSummaries();

  return <Customers customers={customers} />;
}
