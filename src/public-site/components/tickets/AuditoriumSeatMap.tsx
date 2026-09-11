"use client";

import type { PublicSeat, PublicSeatBlock, PublicSeatMap } from "@/lib/seating/types";

const STATIC_ROWS: Record<string, number[]> = {
  A: [8,10,11,10,11,11,12,12,12,5,13,13,13,11,11],
  B: [2,3,4,4,5,5,6,7,8,8,9],
  C: [11,13,13,13,14,14,15,15,16,17,18,17,18,14,14,17,17],
  D: [2,3,4,4,5,5,6,7,8,8,9],
  E: [9,10,11,10,11,11,12,12,12,12,13,13,13,11,12],
  F: [17,18,18,20,21,21,17],
  G: [15,16,16,18,19,20,21,23],
  H: [17,18,18,18,19,21,16],
};

const TOTALS: Record<string, number> = { A:163,B:61,C:256,D:61,E:172,F:132,G:148,H:127 };

interface AuditoriumSeatMapProps {
  seatMap?: PublicSeatMap | null;
  selectedSeatIds?: string[];
  onSeatToggle?: (seat: PublicSeat, block: PublicSeatBlock) => void;
  selectionLimit?: number;
  compact?: boolean;
  ticketTypeId?: string;
}

function groupRows(block: PublicSeatBlock) {
  const rows = new Map<number, PublicSeat[]>();
  for (const seat of block.seats) {
    const row = rows.get(seat.rowNumber) ?? [];
    row.push(seat);
    rows.set(seat.rowNumber, row);
  }
  return [...rows.entries()].sort((a,b) => a[0]-b[0]).map(([rowNumber,seats]) => ({
    rowNumber,
    seats: seats.sort((a,b) => a.seatNumber-b.seatNumber),
  }));
}

function SeatDot({
  seat,
  selected,
  disabled,
  onClick,
}: {
  seat?: PublicSeat;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const unavailable = seat && seat.status !== "AVAILABLE";
  const classes = selected
    ? "border-[#2271B1] bg-[#2271B1] shadow-[0_0_0_2px_rgba(34,113,177,.16)]"
    : unavailable
      ? "border-[#C2CBD2] bg-[#DDE3E7] opacity-55"
      : "border-[#93A2AE] bg-white hover:border-[#2271B1] hover:bg-[#2271B1]/10";

  return (
    <button
      type="button"
      disabled={!seat || disabled || unavailable || !onClick}
      onClick={onClick}
      aria-label={seat ? `${seat.label}${unavailable ? ` ${seat.status.toLowerCase()}` : ""}` : undefined}
      title={seat ? `${seat.label} · ${seat.status}${seat.manualFeeLkr ? ` · manual select +LKR ${seat.manualFeeLkr.toLocaleString("en-LK")}` : ""}` : undefined}
      className={`h-[9px] w-[9px] shrink-0 rounded-[2px] border transition ${classes} disabled:cursor-default`}
    />
  );
}

function SeatBlockView({
  code,
  block,
  selectedSeatIds,
  onSeatToggle,
  selectionLimit,
  rotate = "",
}: {
  code: string;
  block?: PublicSeatBlock;
  selectedSeatIds: string[];
  onSeatToggle?: AuditoriumSeatMapProps["onSeatToggle"];
  selectionLimit: number;
  rotate?: string;
}) {
  const staticRows = STATIC_ROWS[code] ?? [];
  const rows = block ? groupRows(block) : staticRows.map((count,rowIndex) => ({
    rowNumber: rowIndex + 1,
    seats: Array.from({ length: count }, (_, seatIndex) => ({ seatNumber: seatIndex + 1 })),
  }));

  return (
    <div className={`min-w-0 ${rotate}`}>
      <div className="rounded-[18px] border border-[#C2CBD2]/75 bg-white p-2.5 shadow-[0_12px_32px_rgba(14,23,33,.05)]">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#0E1721]">Block {code}</span>
          <span className="font-mono text-[8px] text-[#7D8A95]">{block?.seats.length ?? TOTALS[code]}</span>
        </div>
        <div className="space-y-[2px]">
          {rows.map((row) => (
            <div key={row.rowNumber} className="flex min-h-[9px] items-center justify-center gap-[2px]">
              {row.seats.map((rawSeat) => {
                const seat = block ? (rawSeat as PublicSeat) : undefined;
                const selected = Boolean(seat && selectedSeatIds.includes(seat.id));
                const atLimit = selectedSeatIds.length >= selectionLimit && !selected;
                return (
                  <SeatDot
                    key={seat?.id ?? `${code}-${row.rowNumber}-${rawSeat.seatNumber}`}
                    seat={seat}
                    selected={selected}
                    disabled={atLimit}
                    onClick={seat && onSeatToggle ? () => onSeatToggle(seat, block!) : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuditoriumSeatMap({
  seatMap,
  selectedSeatIds = [],
  onSeatToggle,
  selectionLimit = 20,
  compact = false,
  ticketTypeId,
}: AuditoriumSeatMapProps) {
  const blocks = new Map((seatMap?.blocks ?? []).map((block) => [block.code, block]));
  const filtered = (code: string) => {
    const block = blocks.get(code);
    if (!block) return undefined;
    if (ticketTypeId && block.ticketTypeId !== ticketTypeId) return {
      ...block,
      seats: block.seats.map((seat) => ({ ...seat, status: "SOLD" as const })),
    };
    return block;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono uppercase tracking-[0.14em] text-[#7D8A95]">
        <span>Mahinda Rajapaksha Auditorium · Polgolla</span>
        <span>1,120 seats · ODC 713 · Balcony 407</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className={`${compact ? "min-w-[760px]" : "min-w-[920px]"} mx-auto max-w-[1080px] rounded-[30px] border border-[#C2CBD2]/60 bg-[#F5F8FA] px-7 py-7 shadow-inner`}>
          <div className="mb-5 text-center">
            <span className="inline-block rounded-t-[40px] border-x border-t border-[#C2CBD2]/70 bg-white px-10 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#31465A]">Auditorium Balcony</span>
          </div>
          <div className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-4 px-10">
            <SeatBlockView code="F" block={filtered("F")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} rotate="origin-bottom-right rotate-[7deg]" />
            <SeatBlockView code="G" block={filtered("G")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} />
            <SeatBlockView code="H" block={filtered("H")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} rotate="origin-bottom-left -rotate-[7deg]" />
          </div>

          <div className="my-7 flex items-center gap-3 px-10"><div className="h-px flex-1 bg-[#C2CBD2]/70"/><span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#7D8A95]">Balcony / ODC</span><div className="h-px flex-1 bg-[#C2CBD2]/70"/></div>

          <div className="mb-5 text-center">
            <span className="inline-block rounded-t-[40px] border-x border-t border-[#C2CBD2]/70 bg-white px-10 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#31465A]">Auditorium ODC · Down Flow</span>
          </div>
          <div className="grid grid-cols-[1fr_.55fr_1.35fr_.55fr_1fr] items-end gap-2.5">
            <SeatBlockView code="A" block={filtered("A")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} rotate="origin-bottom-right rotate-[10deg]" />
            <SeatBlockView code="B" block={filtered("B")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} rotate="origin-bottom-right rotate-[4deg]" />
            <SeatBlockView code="C" block={filtered("C")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} />
            <SeatBlockView code="D" block={filtered("D")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} rotate="origin-bottom-left -rotate-[4deg]" />
            <SeatBlockView code="E" block={filtered("E")} selectedSeatIds={selectedSeatIds} onSeatToggle={onSeatToggle} selectionLimit={selectionLimit} rotate="origin-bottom-left -rotate-[10deg]" />
          </div>

          <div className="mx-auto mt-8 w-[56%] rounded-b-[70px] border border-[#0E1721] bg-[#0E1721] px-5 py-3 text-center font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white shadow-lg">Stage</div>
        </div>
      </div>

      {seatMap && (
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#7D8A95]">
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[2px] border border-[#93A2AE] bg-white"/>Available</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[2px] border border-[#2271B1] bg-[#2271B1]"/>Selected</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[2px] border border-[#C2CBD2] bg-[#DDE3E7]"/>Held / sold</span>
        </div>
      )}
    </div>
  );
}
