import LiveScanner from "@/admin-site/pages/LiveScanner";
import { requireStaff } from "@/lib/auth/requireStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const { supabase, profile } = await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
    "SCANNER",
  ]);

  const { data: event } = await supabase
    .from("events")
    .select("id,name")
    .eq("slug", "swara-ranjana-2026")
    .maybeSingle();

  if (!event) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        The Swara Ranjana 2026 event could not be loaded. Check the event record
        before using the entrance scanner.
      </div>
    );
  }

  return <LiveScanner event={event} staffRole={profile.role} />;
}
