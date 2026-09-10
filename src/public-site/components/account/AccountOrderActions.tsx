"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw, Trash2, X } from "lucide-react";
import { requestCustomerOrderAction } from "@/app/account/actions";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentSubmissionStatus,
} from "@/types/database";

interface PendingRequest {
  kind: "CANCEL" | "REFUND";
  status: "PENDING";
  createdAt: string;
}

export default function AccountOrderActions({
  orderId,
  orderStatus,
  paymentStatus,
  paymentMethod,
  slipStatus,
  eventStartsAt,
  pendingRequest,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  slipStatus: PaymentSubmissionStatus | null;
  eventStartsAt: string;
  pendingRequest: PendingRequest | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  const eventStarted =
    !!eventStartsAt && new Date(eventStartsAt).getTime() <= Date.now();
  const closed =
    orderStatus === "CANCELLED" || orderStatus === "REFUNDED";

  if (closed || eventStarted) return null;

  if (pendingRequest) {
    return (
      <div className="inline-flex h-10 items-center border border-amber-200 bg-amber-50 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
        {pendingRequest.kind === "REFUND"
          ? "Refund request pending"
          : "Cancellation pending"}
      </div>
    );
  }

  const isRefund = paymentStatus === "PAID";
  const needsReview = slipStatus === "PENDING";
  const label = isRefund
    ? "Request refund"
    : needsReview
      ? "Request cancellation"
      : "Cancel reservation";

  const submit = () => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await requestCustomerOrderAction(orderId, reason);
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
        onClick={() => {
          setError("");
          setSuccess("");
          setOpen(true);
        }}
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
            className="w-full max-w-md bg-white p-6 shadow-2xl sm:rounded-sm sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#2271B1]">
                  Ticket action
                </div>
                <h3 className="mt-2 font-gemola text-3xl text-[#0E1721]">
                  {isRefund ? "Request a refund?" : "Cancel this reservation?"}
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
                ? "Your tickets remain active until staff approve the request and the money is actually refunded. OnePay refunds will be connected once the gateway is activated."
                : needsReview
                  ? "A payment slip is already awaiting review, so staff must check it before cancellation can be completed."
                  : paymentMethod === "ON_ARRIVAL"
                    ? "This immediately cancels the reservation and revokes its unused tickets. No payment has been collected."
                    : "This immediately releases the reservation because no payment has been accepted."}
            </p>

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
                placeholder="Tell us anything the box office should know."
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
                disabled={pending}
                onClick={submit}
                className={`h-11 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50 ${
                  isRefund ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
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
