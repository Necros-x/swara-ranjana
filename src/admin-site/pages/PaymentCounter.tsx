"use client";

import {
  BadgeCheck,
  CreditCard,
  Search,
  TicketCheck,
  TriangleAlert,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
  collectOnArrivalPayment,
  findPaymentCounterOrder,
  type PaymentCounterOrder,
} from "@/app/admin/actions/payment-counter";

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-LK")}`;
}

export default function PaymentCounter() {
  const [identifier, setIdentifier] = useState("");
  const [order, setOrder] = useState<PaymentCounterOrder | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const lookup = () => {
    if (!identifier.trim() || pending) return;

    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await findPaymentCounterOrder(identifier);
      if (!result.ok || !result.order) {
        setOrder(null);
        setError(result.message);
        return;
      }

      setOrder(result.order);
      setMessage(result.message);
    });
  };

  const markPaid = () => {
    if (!order || pending) return;

    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await collectOnArrivalPayment(order.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      const refreshed = await findPaymentCounterOrder(order.orderNumber);
      if (refreshed.ok && refreshed.order) {
        setOrder(refreshed.order);
      }
    });
  };

  const canCollect =
    order?.paymentMethod === "ON_ARRIVAL" &&
    order?.status === "CONFIRMED" &&
    order?.paymentStatus === "PENDING";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2271B1]">
          Box office workflow
        </div>
        <h1 className="mt-2 font-gemola text-4xl text-[#0E1721]">
          Payment counter
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7D8A95]">
          Record pay-on-arrival payments here. This counter never admits a
          guest; after payment is recorded, send them to the gate where the
          ticket is scanned again for admission.
        </p>
      </div>

      <div className="rounded-2xl border border-[#C2CBD2]/60 bg-white p-5 shadow-sm sm:p-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            lookup();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A95]" />
            <input
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value.toUpperCase())
              }
              placeholder="Order number or ticket number"
              className="h-12 w-full rounded-xl border border-[#C2CBD2] pl-11 pr-4 font-mono text-sm outline-none focus:border-[#2271B1]"
            />
          </div>
          <button
            type="submit"
            disabled={pending || !identifier.trim()}
            className="h-12 rounded-xl bg-[#0E1721] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2271B1] disabled:opacity-40"
          >
            {pending ? "Checking…" : "Find reservation"}
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && !error && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {order && (
        <div className="overflow-hidden rounded-2xl border border-[#C2CBD2]/60 bg-white shadow-sm">
          <div className="border-b border-[#C2CBD2]/50 bg-[#F8FAFB] px-5 py-4 sm:px-6">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7D8A95]">
              Reservation
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-[#2271B1]">
              {order.orderNumber}
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Guest
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.customerName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Show
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.eventName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Payment method
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.paymentMethod?.replaceAll("_", " ") ?? "Not selected"}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Amount
              </div>
              <div className="mt-1 text-xl font-bold text-[#0E1721]">
                {money(order.currency, order.total)}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Reservation status
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.status}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Payment status
              </div>
              <div
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus}
              </div>
            </div>
          </div>

          <div className="border-t border-[#C2CBD2]/50 p-5 sm:p-6">
            {canCollect ? (
              <button
                type="button"
                onClick={markPaid}
                disabled={pending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0E1721] px-5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2271B1] disabled:opacity-40"
              >
                <CreditCard className="h-5 w-5" />
                {pending ? "Recording…" : "Mark payment as received"}
              </button>
            ) : order.paymentStatus === "PAID" ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <TicketCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  Payment is confirmed. Send the guest to the gate; the gate
                  scan will admit and mark the ticket as used.
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                This reservation cannot be collected from the on-arrival
                payment counter. Check its payment method and reservation
                status in Orders.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
