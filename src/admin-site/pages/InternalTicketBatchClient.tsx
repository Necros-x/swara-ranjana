"use client";

import { Download, Printer } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import type { InternalTicketBatch } from "@/lib/admin/tickets";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveDataUrl(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export default function InternalTicketBatchClient({
  batch,
}: {
  batch: InternalTicketBatch;
}) {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      batch.tickets.map(async (ticket) => {
        const dataUrl = await QRCode.toDataURL(ticket.qrToken, {
          width: 440,
          margin: 4,
          errorCorrectionLevel: "M",
          color: {
            dark: "#0E1721",
            light: "#FFFFFF",
          },
        });

        return [ticket.id, dataUrl] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setQrCodes(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [batch.tickets]);

  const printBatch = () => {
    const cards = batch.tickets
      .map((ticket) => {
        const qr = qrCodes[ticket.id] ?? "";
        return `
          <article class="ticket">
            <div class="eyebrow">SWARA RANJANA • INTERNAL ADMISSION</div>
            <h2>${escapeHtml(batch.eventName)}</h2>
            <p class="holder">${escapeHtml(ticket.holderName)}</p>
            <p>${escapeHtml(ticket.ticketTypeName)}</p>
            ${
              qr
                ? `<img src="${qr}" alt="">`
                : `<div class="qr-placeholder">QR</div>`
            }
            <div class="number">${escapeHtml(ticket.ticketNumber)}</div>
          </article>
        `;
      })
      .join("");

    const popup = window.open("", "_blank", "width=1000,height=800");
    if (!popup) return;

    popup.document.write(`<!doctype html>
<html>
<head>
  <title>${batch.orderNumber} — Internal Tickets</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;padding:24px;font-family:Arial,sans-serif;color:#0E1721}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .ticket{border:1px solid #C2CBD2;padding:20px;break-inside:avoid;text-align:center}
    .eyebrow{font-size:9px;letter-spacing:2px;color:#2271B1}
    h2{font-family:Georgia,serif;font-weight:400;margin:10px 0 6px}
    .holder{font-weight:700}
    p{font-size:12px;margin:5px 0;color:#31465A}
    img,.qr-placeholder{width:180px;height:180px;margin:14px auto 8px;display:block}
    .qr-placeholder{border:1px solid #ddd;display:grid;place-items:center}
    .number{font-family:monospace;font-size:12px;font-weight:700;margin-top:6px}
    @media print{body{padding:0}.grid{gap:6px}.ticket{page-break-inside:avoid}}
  </style>
</head>
<body><div class="grid">${cards}</div></body>
</html>`);
    popup.document.close();

    setTimeout(() => {
      popup.focus();
      popup.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#2271B1]">
            Internal ticket batch • {batch.orderNumber}
          </div>
          <h1 className="mt-2 font-gemola text-4xl text-[#0E1721]">
            {batch.eventName}
          </h1>
          <p className="mt-2 text-sm text-[#7D8A95]">
            {batch.holderLabel} • {batch.tickets.length} ticket
            {batch.tickets.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          disabled={Object.keys(qrCodes).length !== batch.tickets.length}
          onClick={printBatch}
          className="inline-flex h-11 items-center justify-center gap-2 bg-[#0E1721] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#2271B1] disabled:opacity-40"
        >
          <Printer className="h-4 w-4" />
          Print batch
        </button>
      </div>

      <div className="border border-[#C2CBD2]/70 bg-[#F8FAFB] p-4 text-xs leading-relaxed text-[#7D8A95]">
        These are gate-valid tickets generated directly by staff. They are not
        customer website orders and no customer email/account is created.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {batch.tickets.map((ticket) => {
          const qr = qrCodes[ticket.id];

          return (
            <article
              key={ticket.id}
              className="border border-[#C2CBD2]/70 bg-white p-5"
            >
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#2271B1]">
                {ticket.ticketTypeName}
              </div>
              <div className="mt-2 text-sm font-semibold text-[#31465A]">
                {ticket.holderName}
              </div>

              <div className="mx-auto mt-5 flex aspect-square max-w-[220px] items-center justify-center bg-white">
                {qr ? (
                  <img
                    src={qr}
                    alt={`QR for ${escapeHtml(ticket.ticketNumber)}`}
                    className="h-full w-full"
                  />
                ) : (
                  <span className="text-xs text-[#7D8A95]">
                    Generating QR…
                  </span>
                )}
              </div>

              <div className="mt-4 text-center font-mono text-xs font-bold text-[#0E1721]">
                {ticket.ticketNumber}
              </div>

              <button
                type="button"
                disabled={!qr}
                onClick={() =>
                  qr &&
                  saveDataUrl(qr, `${escapeHtml(ticket.ticketNumber)}-QR.png`)
                }
                className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 border border-[#C2CBD2] text-xs text-[#31465A] hover:border-[#2271B1] hover:text-[#2271B1] disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Save QR
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
