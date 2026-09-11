import LiveScanHistory from "@/admin-site/pages/LiveScanHistory";
import { AdminRealtimeRefresh } from "@/admin-site/components/AdminRealtimeRefresh";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getAdminScanHistory } from "@/lib/admin/scans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
    "SCANNER",
  ]);

  const logs = await getAdminScanHistory();
  return (
    <AdminRealtimeRefresh tables={["scan_logs", "tickets"]}>
      <LiveScanHistory logs={logs} />
    </AdminRealtimeRefresh>
  );
}
