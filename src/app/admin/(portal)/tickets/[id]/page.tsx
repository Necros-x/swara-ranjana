import { notFound } from "next/navigation";
import TicketDetail from "@/admin-site/pages/TicketDetail";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getAdminTicketDetail } from "@/lib/admin/tickets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
    "SCANNER",
  ]);
  const ticket = await getAdminTicketDetail(id);

  if (!ticket) notFound();

  const canRevoke =
    profile.role === "SUPER_ADMIN" || profile.role === "ADMIN";

  return <TicketDetail ticket={ticket} canRevoke={canRevoke} />;
}
