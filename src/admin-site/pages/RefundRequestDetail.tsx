"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/admin-site/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/admin-site/components/ui/Card";
import { reviewCustomerRequest } from "@/app/admin/actions/requests";
import type { AdminRequestDetail } from "@/lib/admin/requests";

function formatDate(value: string, timezone = "Asia/Colombo") {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function statusVariant(status: AdminRequestDetail["status"]) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "REJECTED" || status === "CANCELLED") {
    return "destructive" as const;
  }
  return "default" as const;
}

export default function RefundRequestDetail({
  request,
}: {
  request: AdminRequestDetail;
}) {
  const router = useRouter();
  const [staffNote, setStaffNote] = useState(request.staffNote ?? "");
  const [refundReference, setRefundReference] = useState(
    request.refundReference ?? "",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const refundWindowClosed =
    new Date(request.eventStartsAt).getTime() <= Date.now();

  const run = (
    action: "APPROVE" | "REJECT" | "COMPLETE_REFUND",
  ) => {
    setError("");
    setMessage("");

    if (action === "COMPLETE_REFUND" && !refundReference.trim()) {
      setError("Enter the bank/provider refund reference first.");
      return;
    }

    startTransition(async () => {
      const result = await reviewCustomerRequest(
        request.id,
        action,
        staffNote,
        refundReference,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      router.refresh();
    });
  };

  const selected =
    request.kind === "REFUND" ? request.selectedTickets : request.orderTickets;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/requests"
          className="rounded-full p-2 text-[#7D8A95] transition hover:bg-[#C2CBD2]/20 hover:text-[#0E1721]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={request.kind === "REFUND" ? "warning" : "outline"}>
              {request.scope} {request.kind}
            </Badge>
            <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
          </div>
          <h1 className="mt-3 font-gemola text-4xl text-[#0E1721]">
            {request.kind === "REFUND"
              ? "Refund request"
              : "Cancellation request"}
          </h1>
          <p className="mt-2 text-sm text-[#7D8A95]">
            {request.orderNumber} • submitted {formatDate(request.createdAt)}
          </p>
        </div>
      </div>

      {refundWindowClosed && request.kind === "REFUND" && request.status !== "COMPLETED" && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          The show has started. Refund approval/completion is now locked by policy.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requested tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selected.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex flex-col justify-between gap-3 border border-[#C2CBD2]/60 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-mono text-xs font-semibold text-[#2271B1] hover:underline"
                      >
                        {ticket.ticketNumber}
                      </Link>
                      <div className="mt-1 text-sm text-[#31465A]">
                        {ticket.ticketTypeName}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {request.kind === "REFUND" && (
                        <span className="text-sm font-semibold text-[#0E1721]">
                          {request.currency} {ticket.amount.toLocaleString("en-LK")}
                        </span>
                      )}
                      <Badge
                        variant={
                          ticket.status === "VALID"
                            ? "success"
                            : ticket.status === "REFUNDED"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {request.kind === "REFUND" && (
                <div className="mt-5 flex items-center justify-between border-t border-[#C2CBD2]/60 pt-4">
                  <span className="text-sm text-[#7D8A95]">Requested refund</span>
                  <span className="text-lg font-semibold text-[#0E1721]">
                    {request.currency} {request.requestedAmount.toLocaleString("en-LK")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                  Customer reason
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#31465A]">
                  {request.reason || "No reason supplied."}
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                  Staff note
                </span>
                <textarea
                  value={staffNote}
                  onChange={(event) => setStaffNote(event.target.value.slice(0, 1000))}
                  rows={4}
                  disabled={["COMPLETED", "REJECTED", "CANCELLED"].includes(request.status)}
                  placeholder="Internal/customer-facing decision note..."
                  className="w-full resize-y border border-[#C2CBD2] p-3 text-sm outline-none focus:border-[#2271B1] disabled:bg-[#F8FAFB]"
                />
              </label>

              {request.kind === "REFUND" && request.status === "APPROVED" && (
                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                    Refund reference
                  </span>
                  <input
                    value={refundReference}
                    onChange={(event) => setRefundReference(event.target.value.slice(0, 160))}
                    placeholder="Bank / provider transaction reference"
                    className="h-11 w-full border border-[#C2CBD2] px-3 text-sm outline-none focus:border-[#2271B1]"
                  />
                  <p className="mt-2 text-[10px] leading-relaxed text-[#7D8A95]">
                    Only mark completed after the money has actually been returned.
                  </p>
                </label>
              )}

              {error && (
                <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                  {message}
                </div>
              )}

              {request.status === "PENDING" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={pending || (request.kind === "REFUND" && refundWindowClosed)}
                    onClick={() => run("APPROVE")}
                    className="inline-flex h-11 items-center justify-center gap-2 bg-emerald-600 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {request.kind === "REFUND" ? "Approve refund" : "Approve cancellation"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run("REJECT")}
                    className="inline-flex h-11 items-center justify-center gap-2 border border-red-200 px-4 text-xs font-bold uppercase tracking-[0.12em] text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}

              {request.kind === "REFUND" && request.status === "APPROVED" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={pending || refundWindowClosed || !refundReference.trim()}
                    onClick={() => run("COMPLETE_REFUND")}
                    className="inline-flex h-11 items-center justify-center gap-2 bg-[#0E1721] px-4 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#2271B1] disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Mark refund completed
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run("REJECT")}
                    className="inline-flex h-11 items-center justify-center gap-2 border border-red-200 px-4 text-xs font-bold uppercase tracking-[0.12em] text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Withdraw approval
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="font-semibold text-[#31465A]">{request.customerName}</div>
              <a href={`mailto:${request.customerEmail}`} className="break-all text-[#2271B1] hover:underline">
                {request.customerEmail}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Show & payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#31465A]">
              <div className="font-semibold">{request.eventName}</div>
              <div className="text-xs text-[#7D8A95]">
                {formatDate(request.eventStartsAt, request.eventTimezone)}
              </div>
              <div className="border-t border-[#C2CBD2]/50 pt-3">
                <div>{request.paymentMethod?.replaceAll("_", " ") || "Payment method —"}</div>
                <div className="mt-1 text-xs text-[#7D8A95]">{request.paymentStatus.replaceAll("_", " ")}</div>
                {request.paymentProvider && <div className="mt-2 text-xs">Provider: {request.paymentProvider}</div>}
                {request.paymentReference && <div className="mt-1 break-all font-mono text-xs">Payment ref: {request.paymentReference}</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#7D8A95]">
              <div>Submitted {formatDate(request.createdAt)}</div>
              {request.reviewedAt && <div>Reviewed {formatDate(request.reviewedAt)}{request.reviewedByName ? ` by ${request.reviewedByName}` : ""}</div>}
              {request.completedAt && <div>Completed {formatDate(request.completedAt)}</div>}
              {request.refundReference && <div className="break-all font-mono text-[#31465A]">Refund ref: {request.refundReference}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
