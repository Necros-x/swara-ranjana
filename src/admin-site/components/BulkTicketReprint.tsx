"use client";

import { useMemo, useState } from "react";
import { Printer, Search, X } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/admin-site/components/ui/Button";
import { Input } from "@/admin-site/components/ui/Input";
import type { AdminTicketListItem } from "@/lib/admin/tickets";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printable(ticket: AdminTicketListItem) {
  return ticket.status === "VALID" || ticket.status === "USED";
}

export function BulkTicketReprint({
  tickets,
}: {
  tickets: AdminTicketListItem[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return tickets.filter(
      (ticket) =>
        printable(ticket) &&
        (!needle ||
          [
            ticket.ticketNumber,
            ticket.orderNumber,
            ticket.holderName,
            ticket.ticketTypeName,
            ticket.eventName,
            ticket.seatLabel ?? "",
          ].some((value) => value.toLowerCase().includes(needle))),
    );
  }, [query, tickets]);

  const selected = useMemo(
    () => tickets.filter((ticket) => selectedIds.has(ticket.id) && printable(ticket)),
    [selectedIds, tickets],
  );

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((ticket) => selectedIds.has(ticket.id));

  const toggleTicket = (ticketId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        filtered.forEach((ticket) => next.delete(ticket.id));
      } else {
        filtered.forEach((ticket) => next.add(ticket.id));
      }
      return next;
    });
  };

  const printSelected = async () => {
    if (!selected.length || printing) return;
    setPrinting(true);

    try {
      const qrEntries = await Promise.all(
        selected.map(async (ticket) => {
          const dataUrl = await QRCode.toDataURL(ticket.qrToken, {
            width: 520,
            margin: 2,
            errorCorrectionLevel: "M",
            color: {
              dark: "#0E1721",
              light: "#FFFFFF",
            },
          });

          return [ticket.id, dataUrl] as const;
        }),
      );

      const qrMap = new Map(qrEntries);
      const cards = selected
        .map((ticket) => {
          const seat = ticket.seatLabel ? ` • ${escapeHtml(ticket.seatLabel)}` : "";
          return `
            <article class="ticket">
              <div class="eyebrow">SWARA RANJANA • ${escapeHtml(ticket.source)}</div>
              <h2>${escapeHtml(ticket.eventName)}</h2>
              <div class="holder">${escapeHtml(ticket.holderName)}</div>
              <div class="meta">${escapeHtml(ticket.ticketTypeName)}${seat}</div>
              <img src="${qrMap.get(ticket.id) ?? ""}" alt="">
              <div class="number">${escapeHtml(ticket.ticketNumber)}</div>
              <div class="status">${escapeHtml(ticket.status)}</div>
            </article>
          `;
        })
        .join("");

      const popup = window.open("", "_blank", "width=1100,height=850");
      if (!popup) return;

      popup.document.write(`<!doctype html>
<html>
<head>
  <title>Swara Ranjana — Bulk Reprint</title>
  <style>
    *{box-sizing:border-box}
    @page{size:A4;margin:8mm}
    body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#0E1721}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5mm}
    .ticket{border:.3mm solid #C2CBD2;padding:6mm;text-align:center;break-inside:avoid;page-break-inside:avoid}
    .eyebrow{font-size:7pt;letter-spacing:1.6pt;color:#2271B1;font-weight:700}
    h2{font-family:Georgia,serif;font-weight:400;font-size:16pt;margin:3mm 0 2mm}
    .holder{font-size:10pt;font-weight:700}
    .meta{font-size:8pt;color:#31465A;margin-top:1.5mm}
    img{display:block;width:38mm;height:38mm;margin:4mm auto 2mm}
    .number{font-family:monospace;font-size:9pt;font-weight:700}
    .status{font-size:6.5pt;letter-spacing:1pt;color:#7D8A95;margin-top:1mm}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body><div class="grid">${cards}</div></body>
</html>`);
      popup.document.close();

      setTimeout(() => {
        popup.focus();
        popup.print();
      }, 350);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full cursor-pointer sm:w-auto"
      >
        <Printer className="mr-2 h-4 w-4" />
        Bulk reprint
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[170] flex items-end justify-center bg-[#0E1721]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => !printing && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[92dvh] w-full max-w-3xl flex-col bg-white shadow-2xl sm:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#C2CBD2]/50 p-5">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2271B1]">
                  Ticket operations
                </div>
                <h2 className="mt-2 font-gemola text-3xl font-light text-[#0E1721]">
                  Bulk reprint issued tickets
                </h2>
                <p className="mt-1 text-xs text-[#7D8A95]">
                  Select any valid or used issued tickets and print their existing QR codes again.
                </p>
              </div>
              <button
                type="button"
                disabled={printing}
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full p-2 text-[#7D8A95] hover:bg-[#F3F5F7] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close bulk reprint"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#C2CBD2]/50 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A95]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ticket number, holder, category, seat..."
                  className="h-10 pl-9"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={toggleVisible}
                  disabled={!filtered.length}
                  className="cursor-pointer font-semibold text-[#2271B1] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {allVisibleSelected ? "Clear visible" : "Select visible"}
                </button>
                <span className="text-[#7D8A95]">
                  {selected.length} selected • {filtered.length} visible
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!filtered.length ? (
                <div className="p-10 text-center text-sm text-[#7D8A95]">
                  No printable tickets match this search.
                </div>
              ) : (
                <div className="divide-y divide-[#E4E9ED]">
                  {filtered.map((ticket) => (
                    <label
                      key={ticket.id}
                      className="flex cursor-pointer items-start gap-3 px-5 py-4 transition hover:bg-[#F8FAFB]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ticket.id)}
                        onChange={() => toggleTicket(ticket.id)}
                        className="mt-1 h-4 w-4 cursor-pointer accent-[#2271B1]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#2271B1]">
                            {ticket.ticketNumber}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.1em] text-[#7D8A95]">
                            {ticket.source}
                          </span>
                        </div>
                        <div className="mt-1 text-sm font-medium text-[#31465A]">
                          {ticket.holderName}
                        </div>
                        <div className="mt-1 text-xs text-[#7D8A95]">
                          {ticket.ticketTypeName}
                          {ticket.seatLabel ? ` • ${ticket.seatLabel}` : ""}
                          {ticket.eventName ? ` • ${ticket.eventName}` : ""}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#C2CBD2]/50 p-4">
              <Button
                type="button"
                variant="outline"
                disabled={printing}
                onClick={() => setOpen(false)}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={!selected.length || printing}
                onClick={printSelected}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <Printer className="mr-2 h-4 w-4" />
                {printing ? "Preparing…" : `Print ${selected.length}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
