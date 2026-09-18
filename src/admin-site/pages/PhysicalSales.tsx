"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/admin-site/components/ui/Card";
import { Button } from "@/admin-site/components/ui/Button";
import { Badge } from "@/admin-site/components/ui/Badge";
import {
  recordPhysicalSale,
  type RecordPhysicalSaleResult,
} from "@/app/admin/actions/physicalSales";
import type { PhysicalSalesDashboardData } from "@/lib/admin/physicalSales";

function money(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  });
}

export default function PhysicalSales({
  data,
}: {
  data: PhysicalSalesDashboardData;
}) {
  const router = useRouter();
  const firstAvailable =
    data.categories.find((category) => !category.soldOut) ??
    data.categories[0];
  const [ticketTypeId, setTicketTypeId] = useState(firstAvailable?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<RecordPhysicalSaleResult | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => data.categories.find((category) => category.id === ticketTypeId) ?? null,
    [data.categories, ticketTypeId],
  );

  const submit = () => {
    if (!data.event || !selected) return;

    setResult(null);
    startTransition(async () => {
      const next = await recordPhysicalSale({
        eventId: data.event!.id,
        ticketTypeId: selected.id,
        quantity,
      });

      setResult(next);
      if (next.ok) {
        setQuantity(1);
        router.refresh();
      }
    });
  };

  if (!data.event) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-[#7D8A95]">
          No active show is available for physical ticket sales.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2271B1]">
          Physical ticket sales
        </div>
        <h1 className="mt-2 font-serif text-3xl text-[#0E1721]">
          {data.event.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#7D8A95]">
          Record the category and number of physical tickets you just sold. Physical
          tickets are assigned from the lowest serial upward; online reservations are
          assigned from the highest serial downward. Both use the same seat inventory.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {data.categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              setTicketTypeId(category.id);
              setResult(null);
            }}
            className={`cursor-pointer text-left transition ${
              ticketTypeId === category.id ? "scale-[1.01]" : ""
            }`}
          >
            <Card
              className={
                ticketTypeId === category.id
                  ? "border-[#2271B1] ring-2 ring-[#2271B1]/10"
                  : category.soldOut
                    ? "border-red-200"
                    : ""
              }
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8A95]">
                      {category.code}
                    </div>
                    <div className="mt-1 font-serif text-2xl text-[#31465A]">
                      {category.name}
                    </div>
                  </div>
                  <Badge
                    variant={category.soldOut ? "destructive" : "outline"}
                    className="shrink-0"
                  >
                    {category.soldOut
                      ? "SOLD OUT"
                      : `${category.available} left`}
                  </Badge>
                </div>

                <div className="mt-4 text-xl font-semibold text-[#0E1721]">
                  {money(category.priceLkr)}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#E4E9ED] pt-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-[#31465A]">
                      {category.soldPhysical}
                    </div>
                    <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#7D8A95]">
                      Physical
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[#31465A]">
                      {category.soldOnline}
                    </div>
                    <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#7D8A95]">
                      Online
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[#31465A]">
                      {category.heldOnline}
                    </div>
                    <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#7D8A95]">
                      Held
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-medium text-[#7D8A95]">
                  <span className="inline-flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    Physical next:{" "}
                    {category.nextPhysicalSerial
                      ? String(category.nextPhysicalSerial).padStart(3, "0")
                      : "FULL"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ArrowDown className="h-3 w-3" />
                    Online edge:{" "}
                    {category.highestAvailableSerial
                      ? String(category.highestAvailableSerial).padStart(3, "0")
                      : "FULL"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2271B1]/10 text-[#2271B1]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-[#31465A]">
                Record a physical sale
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#7D8A95]">
                Only record tickets after the customer has actually received the
                physical tickets.
              </p>
            </div>
          </div>

          {selected?.soldOut ? (
            <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {selected.name} is sold out.
              </div>
              <p className="mt-1 text-xs">
                Stop selling this category and notify the sales team/admin.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">
                  Category
                </span>
                <select
                  value={ticketTypeId}
                  onChange={(event) => {
                    setTicketTypeId(event.target.value);
                    setResult(null);
                  }}
                  className="h-11 w-full cursor-pointer border border-[#C2CBD2] bg-white px-3 text-sm outline-none focus:border-[#2271B1]"
                >
                  {data.categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      disabled={category.soldOut}
                    >
                      {category.name} — {money(category.priceLkr)} —{" "}
                      {category.available} left
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">
                  Quantity sold
                </span>
                <input
                  type="number"
                  min={1}
                  max={Math.min(selected?.available ?? 1, 100)}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="h-11 w-full border border-[#C2CBD2] bg-white px-3 text-sm outline-none focus:border-[#2271B1]"
                />
              </label>

              <Button
                type="button"
                disabled={
                  pending ||
                  !selected ||
                  selected.soldOut ||
                  quantity < 1 ||
                  quantity > selected.available
                }
                onClick={submit}
                className="h-11 cursor-pointer px-6 disabled:cursor-not-allowed"
              >
                {pending ? "Recording…" : "Record sale"}
              </Button>
            </div>
          )}

          {result && (
            <div
              className={`mt-5 border p-4 text-sm ${
                result.ok
                  ? result.soldOut
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
              role="status"
            >
              <div className="flex items-start gap-2">
                {result.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>
                  <div className="font-semibold">{result.message}</div>
                  {result.ok &&
                    result.serialCodeStart &&
                    result.serialCodeEnd && (
                      <div className="mt-1 text-xs">
                        Physical tickets: {result.serialCodeStart} →{" "}
                        {result.serialCodeEnd}
                        {result.orderNumber
                          ? ` • Sale ${result.orderNumber}`
                          : ""}
                      </div>
                    )}
                  {result.soldOut && (
                    <div className="mt-2 font-semibold">
                      This category is now full. Notify the other sellers immediately.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b border-[#E4E9ED] px-5 py-4">
            <ReceiptText className="h-4 w-4 text-[#2271B1]" />
            <h2 className="font-serif text-lg text-[#31465A]">
              Recent physical sales
            </h2>
          </div>

          {!data.recentSales.length ? (
            <div className="p-8 text-center text-sm text-[#7D8A95]">
              No physical sales recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[#E4E9ED]">
              {data.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div>
                    <div className="font-semibold text-[#31465A]">
                      {sale.ticketTypeName} × {sale.quantity}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#7D8A95]">
                      {sale.serialStart && sale.serialEnd
                        ? `${sale.serialStart} → ${sale.serialEnd} • `
                        : ""}
                      {sale.orderNumber} • {sale.sellerName}
                    </div>
                  </div>
                  <div className="font-semibold text-[#31465A]">
                    {money(sale.totalLkr)}
                  </div>
                  <div className="text-xs text-[#7D8A95]">
                    {dateTime(sale.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
