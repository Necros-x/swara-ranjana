import Link from "next/link";
import LiveScanner from "@/admin-site/pages/LiveScanner";
import { requireStaff } from "@/lib/auth/requireStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: requestedEventId } = await searchParams;
  const { supabase, profile } = await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
    "SCANNER",
  ]);

  const { data: events, error } = await supabase
    .from("events")
    .select("id,name,slug,starts_at,status")
    .in("status", ["DRAFT", "ON_SALE", "SOLD_OUT"])
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const availableEvents = events ?? [];
  const selected =
    availableEvents.find((event) => event.id === requestedEventId) ??
    (availableEvents.length === 1 ? availableEvents[0] : null);

  if (!selected) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#2271B1]">
            Gate setup
          </div>
          <h1 className="mt-2 font-gemola text-4xl text-[#0E1721]">
            Choose the show.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#7D8A95]">
            Practice, School and Public tickets share the same database, but
            gate validation is locked to one show at a time so a ticket cannot
            be admitted to the wrong performance.
          </p>
        </div>

        {!availableEvents.length ? (
          <div className="border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            No active shows are registered. Create the show in Event Management
            first.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {availableEvents.map((event) => (
              <Link
                key={event.id}
                href={`/admin/scanner?event=${encodeURIComponent(event.id)}`}
                className="border border-[#C2CBD2] bg-white p-5 transition hover:border-[#2271B1] hover:shadow-sm"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2271B1]">
                  {event.status.replaceAll("_", " ")}
                </div>
                <div className="mt-2 font-gemola text-2xl text-[#0E1721]">
                  {event.name}
                </div>
                <div className="mt-2 text-xs text-[#7D8A95]">
                  {new Date(event.starts_at).toLocaleString("en-LK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Colombo",
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto mb-4 flex max-w-xl items-center justify-between gap-4">
        <div className="text-xs text-[#7D8A95]">
          Gate locked to{" "}
          <span className="font-semibold text-[#31465A]">
            {selected.name}
          </span>
        </div>
        {availableEvents.length > 1 && (
          <Link
            href="/admin/scanner"
            className="text-xs font-medium text-[#2271B1] hover:underline"
          >
            Change show
          </Link>
        )}
      </div>

      <LiveScanner
        event={{ id: selected.id, name: selected.name }}
        staffRole={profile.role}
      />
    </div>
  );
}
