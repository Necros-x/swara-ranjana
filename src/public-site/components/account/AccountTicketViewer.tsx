"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  TicketCheck,
  TriangleAlert,
} from "lucide-react";
import type { AccountTicketBundle } from "@/lib/account/data";

function save(url: string, name: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function when(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-LK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));
}

export default function AccountTicketViewer({
  bundle,
  initialTicketId,
}: {
  bundle: AccountTicketBundle;
  initialTicketId?: string;
}) {
  const initialIndex = useMemo(() => {
    if (!initialTicketId) return 0;

    const index = bundle.tickets.findIndex(
      (ticket) => ticket.id === initialTicketId,
    );

    return index >= 0 ? index : 0;
  }, [bundle.tickets, initialTicketId]);

  const [active, setActive] = useState(initialIndex);
  const [codes, setCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    setActive(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      bundle.tickets.map(async (ticket) => [
        ticket.id,
        await QRCode.toDataURL(ticket.qrToken, {
          width: 460,
          margin: 4,
          errorCorrectionLevel: "M",
          color: {
            dark: "#0E1721",
            light: "#FFFFFF",
          },
        }),
      ] as const),
    ).then((entries) => {
      if (!cancelled) {
        setCodes(Object.fromEntries(entries));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bundle.tickets]);

  const ticket = bundle.tickets[active];

  if (!ticket) {
    return (
      <div className="border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <TriangleAlert className="mb-3 h-5 w-5" />
        Tickets have not been issued for this order yet.
      </div>
    );
  }

  const qr = codes[ticket.id];
  const paymentDue =
    bundle.paymentMethod === "ON_ARRIVAL" &&
    bundle.paymentStatus !== "PAID";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[.2em] text-[#7D8A95]">
            Order {bundle.orderNumber}
          </div>
          <div className="mt-1 text-sm text-[#31465A]">
            Ticket {active + 1} of {bundle.tickets.length}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!qr}
            onClick={() =>
              qr &&
              save(
                qr,
                `${ticket.ticketNumber}-QR.png`,
              )
            }
            className="inline-flex h-10 items-center gap-2 border border-[#C2CBD2] bg-white px-4 text-xs hover:border-[#2271B1] disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Save QR
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 border border-[#C2CBD2] bg-white px-4 text-xs hover:border-[#2271B1]"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border border-[#C2CBD2]/70 bg-white shadow-[0_20px_70px_rgba(14,23,33,.08)]">
        <img
          src="/butterfly/RTop.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-14 w-[380px] opacity-[.07]"
        />

        <div className="grid lg:grid-cols-[1fr_300px]">
          <section className="relative p-7 sm:p-10">
            <div className="absolute bottom-0 left-0 top-0 w-2 bg-[#2271B1]" />
            <div className="pl-3">
              <div className="text-[10px] font-mono uppercase tracking-[.3em] text-[#2271B1]">
                Official admission pass • 2026
              </div>
              <h1 className="mt-3 font-gemola text-4xl sm:text-5xl">
                SWARA RANJANA
              </h1>

              <div className="mt-7 text-xl text-[#31465A]">
                {ticket.ticketTypeName}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[.16em] text-[#7D8A95]">
                {ticket.seatingZone ?? "Admission"}
              </div>

              <div className="mt-9 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] uppercase text-[#7D8A95]">
                    Guest
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {ticket.attendeeName ||
                      bundle.customerName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase text-[#7D8A95]">
                    Date & time
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {when(
                      bundle.startsAt,
                      bundle.timezone,
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase text-[#7D8A95]">
                    Venue
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {bundle.venueName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase text-[#7D8A95]">
                    Ticket
                  </div>
                  <div className="mt-1 font-mono text-sm font-semibold text-[#2271B1]">
                    {ticket.ticketNumber}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#7D8A95]">
                    Seat
                  </div>
                  <div className="mt-1 font-mono text-sm font-semibold text-[#0E1721]">
                    {ticket.seatLabel ?? "Assigned at entry"}
                  </div>
                </div>
              </div>

              <div
                className={`mt-8 inline-flex items-center gap-2 border px-3 py-2 text-xs font-medium ${
                  ticket.status === "VALID"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : ticket.status === "USED"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <TicketCheck className="h-4 w-4" />
                {ticket.status}
              </div>
            </div>
          </section>

          <aside className="flex flex-col items-center justify-center border-t border-dashed border-[#C2CBD2] p-7 text-center lg:border-l lg:border-t-0">
            <div className="text-[10px] uppercase tracking-[.22em] text-[#7D8A95]">
              Scan at entrance
            </div>

            <div className="mt-5 flex h-[225px] w-[225px] items-center justify-center bg-white">
              {qr ? (
                <img
                  src={qr}
                  alt={`QR code for ${ticket.ticketNumber}`}
                  className="h-full w-full"
                />
              ) : (
                <span className="text-xs text-[#7D8A95]">
                  Generating QR…
                </span>
              )}
            </div>

            <div className="mt-4 font-mono text-sm font-semibold">
              {ticket.ticketNumber}
            </div>

            <div
              className={`mt-5 w-full border px-3 py-3 text-xs font-semibold ${
                paymentDue
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {paymentDue
                ? "PAYMENT DUE AT ENTRY"
                : "PAYMENT CONFIRMED"}
            </div>
          </aside>
        </div>
      </div>

      {bundle.tickets.length > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setActive((index) =>
                index === 0
                  ? bundle.tickets.length - 1
                  : index - 1,
              )
            }
            className="inline-flex items-center gap-1 text-xs uppercase"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-xs text-[#7D8A95]">
            {active + 1}/{bundle.tickets.length}
          </span>

          <button
            type="button"
            onClick={() =>
              setActive((index) =>
                index === bundle.tickets.length - 1
                  ? 0
                  : index + 1,
              )
            }
            className="inline-flex items-center gap-1 text-xs uppercase"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
