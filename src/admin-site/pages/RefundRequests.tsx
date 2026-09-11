import Link from "next/link";
import { Badge } from "@/admin-site/components/ui/Badge";
import { Card, CardContent } from "@/admin-site/components/ui/Card";
import { RotateCcw } from "lucide-react";
import type { AdminRequestListItem } from "@/lib/admin/requests";

function statusVariant(status: AdminRequestListItem["status"]) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "REJECTED" || status === "CANCELLED") {
    return "destructive" as const;
  }
  return "default" as const;
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

export default function RefundRequests({
  requests,
}: {
  requests: AdminRequestListItem[];
}) {
  const active = requests.filter((request) =>
    ["PENDING", "APPROVED"].includes(request.status),
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2271B1]">
            Customer care
          </div>
          <h1 className="mt-2 font-gemola text-4xl text-[#0E1721]">
            Refunds & cancellations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7D8A95]">
            Review customer requests, approve partial or full refunds, and only
            invalidate tickets after the money has actually been returned.
          </p>
        </div>
        <div className="border border-[#C2CBD2]/70 bg-white px-4 py-3 text-right">
          <div className="text-[9px] uppercase tracking-[0.16em] text-[#7D8A95]">
            Needs attention
          </div>
          <div className="mt-1 text-2xl font-semibold text-[#0E1721]">
            {active}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {!requests.length ? (
            <div className="py-16 text-center">
              <RotateCcw className="mx-auto h-6 w-6 text-[#7D8A95]" />
              <p className="mt-3 text-sm font-medium text-[#31465A]">
                No refund or cancellation requests yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#C2CBD2]/40">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/admin/requests/${request.id}`}
                  className="grid gap-4 p-5 transition hover:bg-[#F8FAFB] sm:grid-cols-[1.3fr_1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={request.kind === "REFUND" ? "warning" : "outline"}
                      >
                        {request.scope} {request.kind}
                      </Badge>
                      <Badge variant={statusVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="mt-3 font-mono text-xs font-semibold text-[#2271B1]">
                      {request.orderNumber}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#31465A]">
                      {request.customerName}
                    </div>
                    <div className="mt-1 truncate text-xs text-[#7D8A95]">
                      {request.customerEmail} • {request.eventName}
                    </div>
                  </div>

                  <div className="text-sm">
                    {request.kind === "REFUND" ? (
                      <>
                        <div className="font-semibold text-[#0E1721]">
                          {request.currency} {request.requestedAmount.toLocaleString("en-LK")}
                        </div>
                        <div className="mt-1 text-xs text-[#7D8A95]">
                          {request.ticketCount} ticket{request.ticketCount === 1 ? "" : "s"}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-[#7D8A95]">
                        Entire reservation
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-[#7D8A95] sm:text-right">
                    {date(request.createdAt)}
                    <div className="mt-2 font-semibold uppercase tracking-[0.12em] text-[#2271B1]">
                      Open →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
