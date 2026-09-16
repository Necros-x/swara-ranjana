"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  TicketCheck,
  TriangleAlert,
} from "lucide-react";
import type {
  GuestDigitalTicket,
  GuestTicketBundle,
} from "@/lib/tickets/guest";
import styles from "./DigitalTicketsClient.module.css";

function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function formatDateTime(value: string, timezone: string) {
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

function statusLabel(ticket: GuestDigitalTicket) {
  if (ticket.status === "USED") return "Already used";
  if (ticket.status === "REVOKED") return "Revoked";
  if (ticket.status === "REFUNDED") return "Refunded";
  return "Valid for entry";
}

function statusClasses(ticket: GuestDigitalTicket) {
  if (ticket.status === "VALID") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (ticket.status === "USED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-red-200 bg-red-50 text-red-700";
}

async function buildTicketPng(
  ticket: GuestDigitalTicket,
  bundle: GuestTicketBundle,
  qrDataUrl: string,
) {
  if (document.fonts) {
    await document.fonts.load("84px gemola").catch(() => undefined);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable.");

  ctx.fillStyle = "#FEFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  try {
    const butterfly = await loadImage("/butterfly/RTop.webp");
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.drawImage(butterfly, 1030, -90, 690, 760);
    ctx.restore();
  } catch {
    // The artwork is decorative only; the ticket remains downloadable without it.
  }

  ctx.fillStyle = "#0E1721";
  ctx.fillRect(0, 0, 42, canvas.height);

  ctx.fillStyle = "#2271B1";
  ctx.fillRect(42, 0, 8, canvas.height);

  ctx.fillStyle = "#2271B1";
  ctx.font = "600 22px Arial, sans-serif";
  ctx.fillText("OFFICIAL ADMISSION PASS • 2026", 110, 110);

  ctx.fillStyle = "#0E1721";
  ctx.font = "84px gemola, Georgia, serif";
  ctx.fillText("SWARA RANJANA", 110, 215);

  ctx.fillStyle = "#31465A";
  ctx.font = "32px Arial, sans-serif";
  ctx.fillText(ticket.ticketTypeName, 110, 290);

  ctx.fillStyle = "#7D8A95";
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText(
    ticket.seatLabel
      ? `${ticket.seatingZone ?? "Admission"} • Seat ${ticket.seatLabel}`
      : (ticket.seatingZone ?? "Admission"),
    110,
    330,
  );

  const rows = [
    ["GUEST", ticket.attendeeName || bundle.customerName],
    ["DATE", formatDateTime(bundle.startsAt, bundle.timezone)],
    ["VENUE", bundle.venueName],
    ["TICKET", ticket.ticketNumber],
  ];

  let y = 430;
  for (const [label, value] of rows) {
    ctx.fillStyle = "#7D8A95";
    ctx.font = "600 16px Arial, sans-serif";
    ctx.fillText(label, 110, y);
    ctx.fillStyle = "#0E1721";
    ctx.font = "26px Arial, sans-serif";
    const text = value.length > 58 ? `${value.slice(0, 55)}…` : value;
    ctx.fillText(text, 110, y + 38);
    y += 105;
  }

  ctx.strokeStyle = "#C2CBD2";
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(1110, 90);
  ctx.lineTo(1110, 810);
  ctx.stroke();
  ctx.setLineDash([]);

  const qr = await loadImage(qrDataUrl);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(1190, 170, 300, 300);
  ctx.drawImage(qr, 1190, 170, 300, 300);

  ctx.fillStyle = "#0E1721";
  ctx.font = "600 20px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(ticket.ticketNumber, 1340, 520);

  ctx.fillStyle = "#7D8A95";
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText("Present this QR at the entrance", 1340, 558);

  if (
    bundle.paymentMethod === "ON_ARRIVAL" &&
    bundle.paymentStatus !== "PAID"
  ) {
    ctx.fillStyle = "#FFF7E6";
    ctx.fillRect(1170, 620, 340, 76);
    ctx.fillStyle = "#9A5A00";
    ctx.font = "600 18px Arial, sans-serif";
    ctx.fillText("PAYMENT DUE AT ENTRY", 1340, 666);
  } else {
    ctx.fillStyle = "#ECFDF3";
    ctx.fillRect(1170, 620, 340, 76);
    ctx.fillStyle = "#047857";
    ctx.font = "600 18px Arial, sans-serif";
    ctx.fillText("PAYMENT CONFIRMED", 1340, 666);
  }

  ctx.fillStyle = "#7D8A95";
  ctx.font = "14px Arial, sans-serif";
  ctx.fillText("Do not share your QR code publicly.", 1340, 760);

  return canvas.toDataURL("image/png", 1);
}

export default function DigitalTicketsClient({
  bundle,
  accessToken,
}: {
  bundle: GuestTicketBundle;
  accessToken: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [qrByTicket, setQrByTicket] = useState<Record<string, string>>({});
  const [downloadBusy, setDownloadBusy] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const ticket = bundle.tickets[activeIndex] ?? null;
  const paymentDue =
    bundle.paymentMethod === "ON_ARRIVAL" && bundle.paymentStatus !== "PAID";

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      bundle.tickets.map(async (item) => {
        const dataUrl = await QRCode.toDataURL(item.qrToken, {
          errorCorrectionLevel: "M",
          margin: 4,
          width: 420,
          color: {
            dark: "#0E1721",
            light: "#FFFFFF",
          },
        });
        return [item.id, dataUrl] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setQrByTicket(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [bundle.tickets]);

  const eventDate = useMemo(
    () => formatDateTime(bundle.startsAt, bundle.timezone),
    [bundle.startsAt, bundle.timezone],
  );

  if (!bundle.tickets.length) {
    return (
      <main className="min-h-screen bg-[#FEFFFF] px-4 py-14 text-[#0E1721]">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/payment/${bundle.orderNumber}?token=${encodeURIComponent(accessToken)}`}
            className="text-xs uppercase tracking-[0.2em] text-[#7D8A95] hover:text-[#0E1721]"
          >
            ← Back to payment
          </Link>

          <div className="mt-10 border border-[#C2CBD2] p-8 text-center">
            <TriangleAlert className="mx-auto h-7 w-7 text-amber-600" />
            <h1 className="mt-4 font-gemola text-4xl">Tickets not issued yet.</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#7D8A95]">
              Your order exists, but admission tickets are only available after
              the reservation is confirmed. If you uploaded a bank slip, it may
              still be awaiting staff approval.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!ticket) return null;

  const qrDataUrl = qrByTicket[ticket.id];

  const previous = () =>
    setActiveIndex((index) =>
      index === 0 ? bundle.tickets.length - 1 : index - 1,
    );
  const next = () =>
    setActiveIndex((index) =>
      index === bundle.tickets.length - 1 ? 0 : index + 1,
    );

  const downloadQr = () => {
    if (!qrDataUrl) return;
    downloadDataUrl(qrDataUrl, `${ticket.ticketNumber}-QR.png`);
  };

  const downloadTicket = async () => {
    if (!qrDataUrl) return;
    setDownloadBusy(true);
    try {
      const dataUrl = await buildTicketPng(ticket, bundle, qrDataUrl);
      downloadDataUrl(dataUrl, `${ticket.ticketNumber}-Swara-Ranjana.png`);
    } finally {
      setDownloadBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F9FA] px-4 py-10 text-[#0E1721] sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className={styles.pageChrome}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/payment/${bundle.orderNumber}?token=${encodeURIComponent(accessToken)}`}
              className="text-xs uppercase tracking-[0.2em] text-[#7D8A95] hover:text-[#0E1721]"
            >
              ← Payment details
            </Link>
            <div className="flex items-center gap-2 text-xs text-[#7D8A95]">
              <ShieldCheck className="h-4 w-4 text-[#2271B1]" />
              Private ticket view
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.32em] text-[#2271B1]">
                Digital admission
              </span>
              <h1 className="mt-2 font-gemola text-4xl sm:text-5xl">
                Your tickets.
              </h1>
              <p className="mt-2 text-sm text-[#7D8A95]">
                Order {bundle.orderNumber} • {bundle.tickets.length}{" "}
                {bundle.tickets.length === 1 ? "ticket" : "tickets"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadTicket}
                disabled={!qrDataUrl || downloadBusy}
                className="inline-flex items-center gap-2 rounded-sm bg-[#0E1721] px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#2271B1]"
              >
                <Download className="h-4 w-4" />
                {downloadBusy ? "Preparing…" : "Download ticket"}
              </button>
              <button
                type="button"
                onClick={downloadQr}
                disabled={!qrDataUrl}
                className="inline-flex items-center gap-2 rounded-sm border border-[#C2CBD2] bg-white px-4 py-2.5 text-xs uppercase tracking-[0.15em]"
              >
                <QrCode className="h-4 w-4" />
                Save QR
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-sm border border-[#C2CBD2] bg-white px-4 py-2.5 text-xs uppercase tracking-[0.15em]"
              >
                <Printer className="h-4 w-4" />
                Print / PDF
              </button>
            </div>
          </div>

          {paymentDue && (
            <div className="mt-6 flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <strong>Payment due at entry.</strong> This ticket is reserved,
                but payment must be completed at the entrance before admission.
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {bundle.tickets.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  index === activeIndex
                    ? "border-[#2271B1] bg-[#2271B1] text-white"
                    : "border-[#C2CBD2] bg-white text-[#31465A]"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={ticketRef}
          className={`${styles.ticketShell} ${styles.ticketCanvas} mt-6 overflow-hidden border border-[#C2CBD2]/70 bg-[#FEFFFF] shadow-xl`}
        >
          <img
            src="/butterfly/RTop.webp"
            alt=""
            aria-hidden="true"
            className={`${styles.ticketWatermark} absolute -right-16 -top-16 w-[430px] opacity-[0.08]`}
          />

          <div className="grid min-h-[490px] lg:grid-cols-[1fr_310px]">
            <section className="relative p-7 sm:p-10 lg:p-12">
              <div className="absolute bottom-0 left-0 top-0 w-2 bg-[#2271B1]" />

              <div className="pl-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.34em] text-[#2271B1]">
                  Official admission pass • 2026
                </div>
                <div className="mt-3 font-gemola text-4xl sm:text-6xl">
                  SWARA RANJANA
                </div>

                <div className="mt-7">
                  <div className="text-2xl font-light text-[#31465A]">
                    {ticket.ticketTypeName}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#7D8A95]">
                    {ticket.seatingZone ?? "Admission"}
                  </div>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#7D8A95]">
                      Guest
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {ticket.attendeeName || bundle.customerName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#7D8A95]">
                      Date & time
                    </div>
                    <div className="mt-1 text-sm font-medium">{eventDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#7D8A95]">
                      Venue
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {bundle.venueName}
                    </div>
                    {bundle.venueAddress && (
                      <div className="mt-1 text-xs text-[#7D8A95]">
                        {bundle.venueAddress}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#7D8A95]">
                      Ticket number
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold text-[#2271B1]">
                      {ticket.ticketNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#7D8A95]">
                      Seat
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold text-[#0E1721]">
                      {ticket.seatLabel ?? "Assigned at entry"}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-9 inline-flex items-center gap-2 border px-3 py-2 text-xs font-medium ${statusClasses(ticket)}`}
                >
                  <TicketCheck className="h-4 w-4" />
                  {statusLabel(ticket)}
                </div>
              </div>
            </section>

            <aside className="relative flex flex-col items-center justify-center border-t border-dashed border-[#C2CBD2] bg-white p-7 text-center lg:border-l lg:border-t-0">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#7D8A95]">
                Scan at entrance
              </div>

              <div className="mt-5 flex h-[230px] w-[230px] items-center justify-center bg-white">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${ticket.ticketNumber}`}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="text-xs text-[#7D8A95]">Generating QR…</div>
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
                {paymentDue ? "PAYMENT DUE AT ENTRY" : "PAYMENT CONFIRMED"}
              </div>

              <p className="mt-5 max-w-[230px] text-[10px] leading-relaxed text-[#7D8A95]">
                This QR is unique to this ticket. Do not post or share it
                publicly.
              </p>
            </aside>
          </div>
        </div>

        {bundle.tickets.length > 1 && (
          <div className={`${styles.pageChrome} mt-5 flex items-center justify-between`}>
            <button
              type="button"
              onClick={previous}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#31465A]"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-xs text-[#7D8A95]">
              Ticket {activeIndex + 1} of {bundle.tickets.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#31465A]"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className={`${styles.pageChrome} mt-8 flex items-start gap-3 border-t border-[#C2CBD2] pt-5 text-xs leading-relaxed text-[#7D8A95]`}>
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
          Keep this private ticket link and QR code secure. Anyone holding the QR
          may present it at the gate until it has been redeemed.
        </div>
      </div>
    </main>
  );
}
