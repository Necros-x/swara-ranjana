import Tickets from "@/admin-site/pages/Tickets";
import { requireStaff } from "@/lib/auth/requireStaff";
import {
  getAdminTickets,
  getInternalIssueCatalog,
} from "@/lib/admin/tickets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const { profile } = await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
    "SCANNER",
  ]);

  const [tickets, catalog] = await Promise.all([
    getAdminTickets(),
    getInternalIssueCatalog(),
  ]);

  return (
    <Tickets
      tickets={tickets}
      catalog={catalog}
      canIssue={profile.role !== "SCANNER"}
    />
  );
}
