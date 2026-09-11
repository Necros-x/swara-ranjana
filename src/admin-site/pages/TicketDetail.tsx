"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Download,
  ExternalLink,
  MapPin,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/admin-site/components/ui/Badge";
import { Button } from "@/admin-site/components/ui/Button";
import { Card, CardContent } from "@/admin-site/components/ui/Card";
import { revokeAdminTicket } from "@/app/admin/actions/tickets";
import type { AdminTicketDetail } from "@/lib/admin/tickets";

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-LK")}`;
}

function ticketStatusVariant(status: AdminTicketDetail["status"]) {
  if (status === "VALID") return "success" as const;
  if (status === "USED") return "secondary" as const;
  return "destructive" as const;
}

function paymentVariant(status: AdminTicketDetail["order"]["paymentStatus"]) {
  if (status === "PAID") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  return "destructive" as const;
}

function scanVariant(result: AdminTicketDetail["scanHistory"][number]["result"]) {
  if (result === "ADMITTED") return "success" as const;
  if (result === "PAYMENT_DUE" || result === "DUPLICATE") {
    return "warning" as const;
  }
  return "destructive" as const;
}

function saveDataUrl(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export default function TicketDetail({
  ticket,
  canRevoke,
}: {
  ticket: AdminTicketDetail;
  canRevoke: boolean;
}) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(ticket.qrToken, {
      width: 520,
      margin: 4,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0E1721",
        light: "#FFFFFF",
      },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [ticket.qrToken]);

  const submitRevoke = () => {
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await revokeAdminTicket({
        ticketId: ticket.id,
        reason,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      setRevokeOpen(false);
      setReason("");
      router.refresh();
    });
  };

  const isInternal = ticket.source === "INTERNAL";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tickets"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C2CBD2]/50 bg-white text-[#7D8A95] transition hover:bg-[#F7F9FA] hover:text-[#0E1721]"
            aria-label="Back to tickets"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2271B1]">
              Ticket registry
            </div>
            <h1 className="mt-1 font-gemola text-3xl text-[#0E1721] sm:text-4xl">
              {ticket.ticketNumber}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={ticketStatusVariant(ticket.status)}>
            {ticket.status}
          </Badge>
          <Badge variant={isInternal ? "warning" : "outline"}>
            {ticket.source}
          </Badge>
        </div>
      </div>

      {message && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative overflow-hidden bg-[#0E1721] px-6 py-7 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(34,113,177,0.28),transparent_45%)]" />
                <div className="relative">
                  <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#C2CBD2]">
                    Swara Ranjana • Admission
                  </div>
                  <h2 className="mt-3 font-gemola text-3xl leading-none">
                    {ticket.event.name}
                  </h2>
                  <div className="mt-4 text-sm text-[#DCE3E8]">
                    {formatDate(ticket.event.startsAt)}
                  </div>
                </div>
              </div>

              <div className="border-b border-dashed border-[#C2CBD2] p-6">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#7D8A95]">
                  Holder
                </div>
                <div className="mt-1 text-lg font-semibold text-[#0E1721]">
                  {ticket.holderName}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#7D8A95]">
                      Category
                    </div>
                    <div className="mt-1 font-medium text-[#2271B1]">
                      {ticket.ticketType.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#7D8A95]">
                      Zone
                    </div>
                    <div className="mt-1 font-medium text-[#31465A]">
                      {ticket.ticketType.seatingZone || "General admission"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center bg-[#F8FAFB] p-7">
                <div className="relative flex aspect-square w-full max-w-[250px] items-center justify-center overflow-hidden border border-[#C2CBD2]/60 bg-white p-4">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR code for ${ticket.ticketNumber}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-[#7D8A95]">Generating QR…</div>
                  )}

                  {ticket.status !== "VALID" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/88 backdrop-blur-[2px]">
                      <Badge variant={ticketStatusVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="mt-4 font-mono text-xs tracking-[0.16em] text-[#7D8A95]">
                  {ticket.ticketNumber}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!qrDataUrl}
                  onClick={() =>
                    qrDataUrl &&
                    saveDataUrl(qrDataUrl, `${ticket.ticketNumber}.png`)
                  }
                  className="mt-5 w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
              </div>
            </CardContent>
          </Card>

          {canRevoke && ticket.status === "VALID" && (
            <Button
              type="button"
              variant="destructive"
              className="w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              onClick={() => {
                setError("");
                setRevokeOpen(true);
              }}
            >
              <Ban className="mr-2 h-4 w-4" />
              Revoke ticket
            </Button>
          )}

          {ticket.status === "REVOKED" && (
            <Card>
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <Ban className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <div className="text-sm font-semibold text-[#0E1721]">
                      Ticket revoked
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-[#7D8A95]">
                      {ticket.revokeReason || "No reason recorded."}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-[#7D8A95]">
                      {formatDateTime(ticket.revokedAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 border-b border-[#C2CBD2]/50 pb-4">
                <ShieldCheck className="h-4 w-4 text-[#2271B1]" />
                <h2 className="font-serif text-lg text-[#0E1721]">
                  Ticket status
                </h2>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#7D8A95]">
                    Ticket
                  </div>
                  <div className="mt-2">
                    <Badge variant={ticketStatusVariant(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#7D8A95]">
                    Payment
                  </div>
                  <div className="mt-2">
                    <Badge variant={paymentVariant(ticket.order.paymentStatus)}>
                      {ticket.order.paymentStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#7D8A95]">
                    Source
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#31465A]">
                    {isInternal ? "Internal allocation" : "Website order"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#7D8A95]">
                    Issued
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#31465A]">
                    {formatDateTime(ticket.issuedAt)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#7D8A95]">
                    Checked in
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#31465A]">
                    {formatDateTime(ticket.checkedInAt)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#7D8A95]">
                    Face value
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#31465A]">
                    {formatMoney(
                      ticket.ticketType.priceLkr,
                      ticket.order.currency,
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 border-b border-[#C2CBD2]/50 pb-4">
                  <CalendarDays className="h-4 w-4 text-[#2271B1]" />
                  <h2 className="font-serif text-lg text-[#0E1721]">Show</h2>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                      Event
                    </div>
                    <div className="mt-1 font-semibold text-[#0E1721]">
                      {ticket.event.name}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#7D8A95]" />
                    <span className="text-[#31465A]">
                      {formatDateTime(ticket.event.startsAt)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7D8A95]" />
                    <div className="text-[#31465A]">
                      <div>{ticket.event.venueName}</div>
                      {ticket.event.venueAddress && (
                        <div className="mt-1 text-xs text-[#7D8A95]">
                          {ticket.event.venueAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 border-b border-[#C2CBD2]/50 pb-4">
                  <ReceiptText className="h-4 w-4 text-[#2271B1]" />
                  <h2 className="font-serif text-lg text-[#0E1721]">Order</h2>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono font-semibold text-[#2271B1]">
                        {ticket.order.orderNumber}
                      </div>
                      <div className="mt-1 text-xs text-[#7D8A95]">
                        {ticket.order.status} • {ticket.order.paymentMethod || "No payment method"}
                      </div>
                    </div>
                    <Link
                      href={`/admin/orders/${ticket.order.id}`}
                      className="inline-flex h-9 items-center gap-2 border border-[#C2CBD2]/50 px-3 text-[10px] font-bold uppercase tracking-wider text-[#31465A] transition hover:bg-[#F7F9FA]"
                    >
                      Open
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                        Order total
                      </div>
                      <div className="mt-1 font-semibold text-[#0E1721]">
                        {formatMoney(ticket.order.totalLkr, ticket.order.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                        Paid at
                      </div>
                      <div className="mt-1 text-[#31465A]">
                        {formatDateTime(ticket.order.paidAt)}
                      </div>
                    </div>
                  </div>
                  {ticket.order.paymentReference && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                        Payment reference
                      </div>
                      <div className="mt-1 break-all font-mono text-xs text-[#31465A]">
                        {ticket.order.paymentReference}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 border-b border-[#C2CBD2]/50 pb-4">
                <UserRound className="h-4 w-4 text-[#2271B1]" />
                <h2 className="font-serif text-lg text-[#0E1721]">
                  {isInternal ? "Allocation" : "Customer"}
                </h2>
              </div>

              {isInternal ? (
                <div className="mt-5 space-y-3 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                      School / group / holder
                    </div>
                    <div className="mt-1 font-semibold text-[#0E1721]">
                      {ticket.holderName}
                    </div>
                  </div>
                  {ticket.order.notes && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                        Internal note
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-[#31465A]">
                        {ticket.order.notes}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                      Name
                    </div>
                    <div className="mt-1 font-semibold text-[#0E1721]">
                      {ticket.customer.fullName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                      Email
                    </div>
                    <div className="mt-1 break-all text-sm text-[#31465A]">
                      {ticket.customer.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7D8A95]">
                      Phone
                    </div>
                    <div className="mt-1 text-sm text-[#31465A]">
                      {ticket.customer.phone || "—"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#C2CBD2]/50 pb-4">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-[#2271B1]" />
                  <h2 className="font-serif text-lg text-[#0E1721]">
                    Scan history
                  </h2>
                </div>
                <div className="text-xs text-[#7D8A95]">
                  {ticket.scanHistory.length} record{ticket.scanHistory.length === 1 ? "" : "s"}
                </div>
              </div>

              {!ticket.scanHistory.length ? (
                <div className="py-10 text-center text-sm text-[#7D8A95]">
                  This ticket has not been scanned yet.
                </div>
              ) : (
                <div className="divide-y divide-[#C2CBD2]/35">
                  {ticket.scanHistory.map((scan) => (
                    <div
                      key={scan.id}
                      className="grid gap-3 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                    >
                      <Badge variant={scanVariant(scan.result)}>
                        {scan.result}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium text-[#31465A]">
                          {scan.gate || "Gate not recorded"}
                        </div>
                        <div className="mt-1 text-xs text-[#7D8A95]">
                          {scan.staffName}
                        </div>
                      </div>
                      <div className="text-xs text-[#7D8A95] sm:text-right">
                        {formatDateTime(scan.scannedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {revokeOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-end justify-center bg-[#0E1721]/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => !pending && setRevokeOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg bg-white p-6 shadow-2xl sm:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-red-600">
                  Gate access control
                </div>
                <h2 className="mt-2 font-gemola text-3xl text-[#0E1721]">
                  Revoke this ticket?
                </h2>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => setRevokeOpen(false)}
                className="rounded-full p-2 text-[#7D8A95] hover:bg-[#F3F5F7] disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#7D8A95]">
              Revoking {ticket.ticketNumber} immediately makes it invalid at every gate. This does not refund the order or change its payment status.
            </p>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs font-medium text-[#31465A]">
                Reason
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 500))}
                rows={4}
                placeholder="Why is this ticket being revoked?"
                className="w-full resize-y rounded-md border border-[#C2CBD2] p-3 text-sm outline-none focus:border-[#2271B1]"
              />
            </label>

            {error && (
              <div className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setRevokeOpen(false)}
              >
                Keep ticket
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={pending || reason.trim().length < 3}
                onClick={submitRevoke}
              >
                {pending ? "Revoking…" : "Revoke ticket"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
