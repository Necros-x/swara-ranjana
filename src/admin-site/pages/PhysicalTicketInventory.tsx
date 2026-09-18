"use client";

import { useMemo, useState } from "react";
import QRCode from "qrcode";
import { Printer, QrCode, TicketCheck } from "lucide-react";
import { Badge } from "@/admin-site/components/ui/Badge";
import { Button } from "@/admin-site/components/ui/Button";
import { Card, CardContent } from "@/admin-site/components/ui/Card";
import type {
  PhysicalTicketInventoryData,
  PhysicalTicketInventoryItem,
} from "@/lib/admin/physicalTickets";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusLabel(status: PhysicalTicketInventoryItem["status"]) {
  if (status === "AVAILABLE") return "Available";
  if (status === "HELD_ONLINE") return "Online hold";
  if (status === "SOLD_ONLINE") return "Online sold";
  return "Physical sold";
}

function statusVariant(status: PhysicalTicketInventoryItem["status"]) {
  if (status === "AVAILABLE") return "outline" as const;
  if (status === "HELD_ONLINE") return "warning" as const;
  if (status === "SOLD_ONLINE") return "secondary" as const;
  return "success" as const;
}

export default function PhysicalTicketInventory({
  data,
}: {
  data: PhysicalTicketInventoryData;
}) {
  const firstCategory = data.categories[0];
  const [categoryId, setCategoryId] = useState(firstCategory?.id ?? "");
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(
    firstCategory ? Math.min(firstCategory.capacity, 50) : 1,
  );
  const [printing, setPrinting] = useState(false);

  const category = useMemo(
    () => data.categories.find((item) => item.id === categoryId) ?? null,
    [categoryId, data.categories],
  );

  const selectedItems = useMemo(() => {
    return data.items.filter(
      (item) =>
        item.ticketTypeId === categoryId &&
        item.serialNumber >= rangeStart &&
        item.serialNumber <= rangeEnd,
    );
  }, [categoryId, data.items, rangeEnd, rangeStart]);

  const chooseCategory = (id: string) => {
    const next = data.categories.find((item) => item.id === id);
    setCategoryId(id);
    setRangeStart(1);
    setRangeEnd(next ? Math.min(next.capacity, 50) : 1);
  };

  const printRange = async () => {
    if (!selectedItems.length || printing) return;

    setPrinting(true);

    try {
      const qrEntries = await Promise.all(
        selectedItems.map(async (item) => {
          const dataUrl = await QRCode.toDataURL(item.qrToken, {
            width: 520,
            margin: 2,
            errorCorrectionLevel: "M",
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });

          return [item.id, dataUrl] as const;
        }),
      );

      const qrMap = new Map(qrEntries);
      const labels = selectedItems
        .map((item) => {
          const qr = qrMap.get(item.id) ?? "";
          return `
            <article class="label">
              <div class="brand">SWARA RANJANA</div>
              <img src="${qr}" alt="">
              <div class="serial">${escapeHtml(item.serialCode)}</div>
              <div class="meta">${escapeHtml(item.ticketTypeName)} · ${escapeHtml(item.seatLabel)}</div>
            </article>
          `;
        })
        .join("");

      const popup = window.open("", "_blank", "width=1200,height=850");
      if (!popup) return;

      popup.document.write(`<!doctype html>
<html>
<head>
  <title>${escapeHtml(category?.name ?? "Ticket")} QR labels</title>
  <style>
    *{box-sizing:border-box}
    @page{size:A4;margin:8mm}
    body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#0E1721}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
    .label{
      height:48mm;
      border:0.25mm solid #C2CBD2;
      padding:3mm;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      break-inside:avoid;
      page-break-inside:avoid;
      text-align:center;
      overflow:hidden;
    }
    .brand{font-size:6.5pt;font-weight:700;letter-spacing:1.2pt;margin-bottom:1.5mm}
    img{width:29mm;height:29mm;display:block}
    .serial{font-family:monospace;font-size:9pt;font-weight:700;margin-top:1.2mm}
    .meta{font-size:6.5pt;color:#31465A;margin-top:.8mm;white-space:nowrap}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body>
  <div class="grid">${labels}</div>
</body>
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

  if (!data.event || !category) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-[#7D8A95]">
          No pre-issued ticket inventory is available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2271B1]">
          <QrCode className="h-4 w-4" />
          Pre-issued seat QR inventory
        </div>
        <h1 className="mt-2 font-serif text-3xl text-[#0E1721]">
          Physical Ticket Labels
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#7D8A95]">
          Every auditorium seat has one permanent serial and QR token before sale.
          Print these labels and paste each one onto the matching physical ticket.
          Online customers and physical sellers consume this same inventory.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => chooseCategory(item.id)}
            className="cursor-pointer text-left"
          >
            <Card
              className={
                item.id === categoryId
                  ? "border-[#2271B1] ring-2 ring-[#2271B1]/10"
                  : ""
              }
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7D8A95]">
                      {item.code}
                    </div>
                    <div className="mt-1 font-serif text-2xl text-[#31465A]">
                      {item.name}
                    </div>
                  </div>
                  <Badge variant="outline">{item.capacity} labels</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#7D8A95]">
                  <span>{item.available} available</span>
                  <span>{item.soldPhysical} physical sold</span>
                  <span>{item.soldOnline} online sold</span>
                  <span>{item.heldOnline} online held</span>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 sm:p-7">
          <div className="grid gap-4 lg:grid-cols-[1fr_150px_150px_auto_auto] lg:items-end">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-[#31465A]">Category</span>
              <select
                value={categoryId}
                onChange={(event) => chooseCategory(event.target.value)}
                className="h-11 w-full cursor-pointer border border-[#C2CBD2] bg-white px-3 text-sm outline-none focus:border-[#2271B1]"
              >
                {data.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.capacity})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-[#31465A]">From serial</span>
              <input
                type="number"
                min={1}
                max={category.capacity}
                value={rangeStart}
                onChange={(event) =>
                  setRangeStart(
                    Math.min(
                      category.capacity,
                      Math.max(1, Number(event.target.value) || 1),
                    ),
                  )
                }
                className="h-11 w-full border border-[#C2CBD2] px-3 text-sm outline-none focus:border-[#2271B1]"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-[#31465A]">To serial</span>
              <input
                type="number"
                min={1}
                max={category.capacity}
                value={rangeEnd}
                onChange={(event) =>
                  setRangeEnd(
                    Math.min(
                      category.capacity,
                      Math.max(1, Number(event.target.value) || 1),
                    ),
                  )
                }
                className="h-11 w-full border border-[#C2CBD2] px-3 text-sm outline-none focus:border-[#2271B1]"
              />
            </label>

            <Button
              type="button"
              variant="outline"
              className="h-11 cursor-pointer"
              onClick={() => {
                setRangeStart(1);
                setRangeEnd(category.capacity);
              }}
            >
              Full category
            </Button>

            <Button
              type="button"
              className="h-11 cursor-pointer"
              disabled={!selectedItems.length || printing || rangeStart > rangeEnd}
              onClick={printRange}
            >
              <Printer className="mr-2 h-4 w-4" />
              {printing
                ? "Preparing…"
                : `Print ${selectedItems.length} label${selectedItems.length === 1 ? "" : "s"}`}
            </Button>
          </div>

          <div className="mt-4 border-l-2 border-[#2271B1] bg-[#F7FAFC] px-4 py-3 text-xs leading-relaxed text-[#5F6D79]">
            Keep printed tickets in serial order. Sellers record sales from the low
            end ({category.code} 001 upward), while the website reserves from the high
            end ({String(category.capacity).padStart(3, "0")} downward).
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-[#E4E9ED] px-5 py-4">
            <div className="flex items-center gap-2">
              <TicketCheck className="h-4 w-4 text-[#2271B1]" />
              <h2 className="font-serif text-lg text-[#31465A]">
                Selected range
              </h2>
            </div>
            <span className="text-xs text-[#7D8A95]">
              {selectedItems.length} ticket{selectedItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="max-h-[480px] overflow-auto">
            <div className="grid gap-px bg-[#E4E9ED] sm:grid-cols-2 xl:grid-cols-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#0E1721]">
                      {item.serialCode}
                    </div>
                    <div className="mt-1 text-[10px] text-[#7D8A95]">
                      {item.seatLabel} · {item.ticketTypeName}
                    </div>
                  </div>
                  <Badge variant={statusVariant(item.status)}>
                    {statusLabel(item.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
