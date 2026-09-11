"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Check, RotateCcw, Trash2, X } from "lucide-react";
import { requestCustomerOrderAction } from "@/app/account/actions";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentSubmissionStatus,
  TicketStatus,
} from "@/types/database";

const REFUND_CUTOFF_MS = 48 * 60 * 60 * 1000;

interface PendingRequest {
  kind: "CANCEL" | "REFUND";
  status: "PENDING" | "APPROVED";
  scope: "FULL" | "PARTIAL";
  requestedAmount: number;
  createdAt: string;
}

interface RefundTicket {
  id: string;
  ticketNumber: string;
  ticketTypeName: string;
  status: TicketStatus;
  refundValue: number;
}

export default function AccountOrderActions({
  orderId,
  orderStatus,
  paymentStatus,
  paymentMethod,
  slipStatus,
  eventStartsAt,
  pendingRequest,
  tickets,
  currency,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  slipStatus: PaymentSubmissionStatus | null;
  eventStartsAt: string;
  pendingRequest: PendingRequest | null;
  tickets: RefundTicket[];
  currency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  const eventStartMs = eventStartsAt
    ? new Date(eventStartsAt).getTime()
    : Number.NaN;
  const cutoffReached =
    Number.isFinite(eventStartMs) &&
    Date.now() >= eventStartMs - REFUND_CUTOFF_MS;
  const closed =
    orderStatus === "CANCELLED" || orderStatus === "REFUNDED";
  const isRefund =
    paymentStatus === "PAID" || paymentStatus === "PARTIALLY_REFUNDED";
  const refundableTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === "VALID"),
    [tickets],
  );
  const selectedRefundAmount = refundableTickets
    .filter((ticket) => selectedTicketIds.includes(ticket.id))
    .reduce((sum, ticket) => sum + ticket.refundValue, 0);

  if (closed) return null;

  // Requests created before the cutoff stay visible and can still be resolved
  // by staff. The 48-hour rule only blocks new customer-initiated requests.
  if (pendingRequest) {
    const approved = pendingRequest.status === "APPROVED";
    return (
      <div className="inline-flex min-h-10 items-center border border-amber-200 bg-amber-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">
        {pendingRequest.kind === "REFUND"
          ? approved
            ? `${pendingRequest.scope} refund approved • awaiting completion`
            : `${pendingRequest.scope} refund request pending`
          : "Cancellation pending"}
      </div>
    );
  }

  if (cutoffReached) {
    return (
      <div className="basis-full border border-[#C2CBD2]/70 bg-[#F8FAFB] px-4 py-3 text-xs leading-relaxed text-[#5F6D79]">
        <span className="font-semibold text-[#0E1721]">
          Refund & cancellation window closed.
        </span>{" "}
        Online requests close 48 hours before showtime. For an urgent exception, {" "}
        <a href="/contact" className="font-medium text-[#2271B1] hover:underline">
          contact Swara Ranjana
        </a>
        , email {" "}
        <a
          href="mailto:concierge@swararanjana.lk"
          className="font-medium text-[#2271B1] hover:underline"
        >
          concierge@swararanjana.lk
        </a>
        {" "}or call {" "}
        <a
          href="tel:+94112689000"
          className="font-medium text-[#2271B1] hover:underline"
        >
          +94 11 268 9000
        </a>
        .
      </div>
    );
  }

  if (isRefund && refundableTickets.length === 0) return null;

  const needsReview = slipStatus === "PENDING";
  const label = isRefund
    ? "Request refund"
    : needsReview
      ? "Request cancellation"
      : "Cancel reservation";

  const openDialog = () => {
    setError("");
    setSuccess("");
    setReason("");
    setSelectedTicketIds(
      isRefund ? refundableTickets.map((ticket) => ticket.id) : [],
    );
    setOpen(true);
  };

  const toggleTicket = (ticketId: string) => {
    setError("");
    setSelectedTicketIds((current) =>
      current.includes(ticketId)
        ? current.filter((id) => id !== ticketId)
        : [...current, ticketId],
    );
  };

  const submit = () => {
    setError("");
    setSuccess("");

    if (isRefund && selectedTicketIds.length === 0) {
      setError("Select at least one ticket to refund.");
      return;
    }

    startTransition(async () => {
      const result = await requestCustomerOrderAction(
        orderId,
        reason,
        isRefund ? selectedTicketIds : [],
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={`inline-flex h-10 items-center gap-2 border px-4 text-xs font-medium transition ${
          isRefund
            ? "border-amber-300 text-amber-800 hover:bg-amber-50"
            : "border-red-200 text-red-700 hover:bg-red-50"
        }`}
      >
        {isRefund ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {label}
      </button>

      {success && (
        <p className="basis-full text-xs text-emerald-700">{success}</p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-[#0E1721]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl sm:rounded-sm sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#2271B1]">
                  Ticket action
                </div>
                <h3 className="mt-2 font-gemola text-3xl text-[#0E1721]">
                  {isRefund ? "Choose tickets to refund." : "Cancel this reservation?"}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-[#7D8A95] hover:bg-[#F4F6F8] hover:text-[#0E1721]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#7D8A95]">
              {isRefund
                ? "You can refund the whole order or only selected unused tickets. Selected tickets stay valid until staff approve and actually complete the refund."
                : needsReview
                  ? "A payment slip is already awaiting review, so staff must resolve your cancellation before that payment can be approved."
                  : paymentMethod === "ON_ARRIVAL"
                    ? "This immediately cancels the reservation and revokes its unused tickets. No payment has been collected."
                    : "This immediately releases the reservation because no payment has been accepted."}
            </p>

            <div className="mt-4 border-l-2 border-[#2271B1] bg-[#F7FAFC] px-4 py-3 text-xs leading-relaxed text-[#5F6D79]">
              Refund and cancellation requests must be submitted at least 48 hours before showtime. After the cutoff, urgent exceptions must be discussed directly with Swara Ranjana.
            </div>

            {isRefund && (
              <div className="mt-5 border border-[#C2CBD2]/70 bg-[#F8FAFB] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7D8A95]">
                      Refundable tickets
                    </div>
                    <div className="mt-1 text-xs text-[#31465A]">
                      {selectedTicketIds.length} of {refundableTickets.length} selected
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTicketIds(
                        selectedTicketIds.length === refundableTickets.length
                          ? []
                          : refundableTickets.map((ticket) => ticket.id),
                      )
                    }
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2271B1] hover:underline"
                  >
                    {selectedTicketIds.length === refundableTickets.length
                      ? "Clear all"
                      : "Select all"}
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {refundableTickets.map((ticket) => {
                    const checked = selectedTicketIds.includes(ticket.id);
                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => toggleTicket(ticket.id)}
                        className={`flex w-full items-center justify-between gap-4 border p-3 text-left transition ${
                          checked
                            ? "border-[#2271B1] bg-white"
                            : "border-[#C2CBD2]/60 bg-white/60 hover:border-[#7D8A95]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center border ${
                              checked
                                ? "border-[#2271B1] bg-[#2271B1] text-white"
                                : "border-[#C2CBD2] bg-white"
                            }`}
                          >
                            {checked && <Check className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-mono text-xs font-semibold text-[#0E1721]">
                              {ticket.ticketNumber}
                            </div>
                            <div className="mt-0.5 truncate text-[10px] text-[#7D8A95]">
                              {ticket.ticketTypeName}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-xs font-medium text-[#31465A]">
                          {currency} {ticket.refundValue.toLocaleString("en-LK")}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#C2CBD2]/60 pt-3 text-sm">
                  <span className="text-[#7D8A95]">
                    {selectedTicketIds.length === refundableTickets.length
                      ? "Full remaining refund"
                      : "Partial refund"}
                  </span>
                  <span className="font-semibold text-[#0E1721]">
                    {currency} {selectedRefundAmount.toLocaleString("en-LK")}
                  </span>
                </div>
              </div>
            )}

            <label className="mt-5 block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#7D8A95]">
                Reason (optional)
              </span>
              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value.slice(0, 1000));
                  setError("");
                }}
                rows={4}
                placeholder="Tell Swara Ranjana anything we should know."
                className="w-full resize-none border border-[#C2CBD2] p-3 text-sm outline-none focus:border-[#2271B1]"
              />
              <span className="mt-1 block text-right text-[10px] text-[#9AA5AE]">
                {reason.length}/1000
              </span>
            </label>

            {error && (
              <div className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 border border-[#C2CBD2] text-xs font-medium text-[#31465A] hover:border-[#7D8A95]"
              >
                Keep reservation
              </button>
              <button
                type="button"
                disabled={pending || (isRefund && selectedTicketIds.length === 0)}
                onClick={submit}
                className={`h-11 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50 ${
                  isRefund
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {pending ? "Submitting…" : label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
