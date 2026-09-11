import { notFound } from "next/navigation";
import RefundRequestDetail from "@/admin-site/pages/RefundRequestDetail";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getAdminRequestDetail } from "@/lib/admin/requests";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  const { id } = await params;
  const request = await getAdminRequestDetail(id);
  if (!request) notFound();

  return <RefundRequestDetail request={request} />;
}
