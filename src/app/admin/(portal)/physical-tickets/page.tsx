import PhysicalTicketInventory from "@/admin-site/pages/PhysicalTicketInventory";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getPhysicalTicketInventory } from "@/lib/admin/physicalTickets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  const data = await getPhysicalTicketInventory();

  return <PhysicalTicketInventory data={data} />;
}
