import Link from "next/link";
import { notFound } from "next/navigation";
import InternalTicketBatchClient from "@/admin-site/pages/InternalTicketBatchClient";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getInternalTicketBatch } from "@/lib/admin/tickets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
  ]);

  const batch = await getInternalTicketBatch(orderId);
  if (!batch) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/tickets"
        className="text-xs uppercase tracking-[0.16em] text-[#7D8A95] hover:text-[#2271B1]"
      >
        ← Ticket registry
      </Link>

      <InternalTicketBatchClient batch={batch} />
    </div>
  );
}
