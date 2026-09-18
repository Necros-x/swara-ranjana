"use client";

import { useMemo, useState } from "react";

interface BlockDefinition {
  id: string;
  level: "ODC" | "BALCONY";
  rows: number[];
  total: number;
}

const BLOCKS: BlockDefinition[] = [
  {
    id: "A",
    level: "ODC",
    total: 163,
    rows: [8, 10, 11, 10, 11, 11, 12, 12, 12, 5, 13, 13, 13, 11, 11],
  },
  {
    id: "B",
    level: "ODC",
    total: 61,
    rows: [2, 3, 4, 4, 5, 5, 6, 7, 8, 8, 9],
  },
  {
    id: "C",
    level: "ODC",
    total: 256,
    rows: [11, 13, 13, 13, 14, 14, 15, 15, 16, 17, 18, 17, 18, 14, 14, 17, 17],
  },
  {
    id: "D",
    level: "ODC",
    total: 61,
    rows: [2, 3, 4, 4, 5, 5, 6, 7, 8, 8, 9],
  },
  {
    id: "E",
    level: "ODC",
    total: 172,
    rows: [9, 10, 11, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 11, 12],
  },
  {
    id: "F",
    level: "BALCONY",
    total: 132,
    rows: [17, 18, 18, 20, 21, 21, 17],
  },
  {
    id: "G",
    level: "BALCONY",
    total: 148,
    rows: [15, 16, 16, 18, 19, 20, 21, 23],
  },
  {
    id: "H",
    level: "BALCONY",
    total: 127,
    rows: [17, 18, 18, 18, 19, 21, 16],
  },
];

function SeatDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-[3px] w-[3px] shrink-0 rounded-[1px] border transition-colors sm:h-[4px] sm:w-[4px] lg:h-[6px] lg:w-[6px] lg:rounded-[2px] ${
        active
          ? "border-[#2271B1] bg-[#2271B1]"
          : "border-[#9AA7B1] bg-white"
      }`}
    />
  );
}

function Block({
  block,
  selected,
  onSelect,
}: {
  block: BlockDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Block ${block.id}, ${block.rows.length} rows, ${block.total} seats`}
      className={`group min-w-0 overflow-hidden rounded-lg border bg-white p-1.5 text-left shadow-[0_8px_24px_rgba(14,23,33,.04)] transition duration-300 sm:rounded-xl sm:p-2 lg:rounded-[22px] lg:p-3 ${
        selected
          ? "border-[#2271B1] ring-2 ring-[#2271B1]/10"
          : "border-[#C2CBD2]/70 hover:border-[#2271B1]/60"
      } cursor-pointer`}
    >
      <div className="mb-1 flex min-w-0 items-center justify-between gap-1 px-0.5 sm:mb-2 sm:gap-2 sm:px-1">
        <span className="truncate font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[#0E1721] sm:text-[9px] sm:tracking-[0.14em] lg:text-[10px] lg:tracking-[0.16em]">
          <span className="hidden sm:inline">Block </span>
          {block.id}
        </span>
        <span className="shrink-0 font-mono text-[7px] text-[#7D8A95] sm:text-[8px] lg:text-[9px]">
          {block.total}
        </span>
      </div>

      <div className="space-y-[2px] sm:space-y-[3px]">
        {block.rows.map((count, rowIndex) => (
          <div
            key={`${block.id}-${rowIndex + 1}`}
            className="flex min-h-[4px] items-center justify-center gap-[1px] sm:min-h-[6px] sm:gap-[2px] lg:min-h-[8px]"
            title={`Block ${block.id} · Row ${rowIndex + 1} · ${count} seats`}
          >
            {Array.from({ length: count }, (_, seatIndex) => (
              <SeatDot key={seatIndex} active={selected} />
            ))}
          </div>
        ))}
      </div>
    </button>
  );
}

export function AuditoriumSeatingMap() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const selected = useMemo(
    () => BLOCKS.find((block) => block.id === selectedBlock) ?? null,
    [selectedBlock],
  );

  const block = (id: string) => BLOCKS.find((item) => item.id === id)!;

  const selectBlock = (id: string) => {
    setSelectedBlock((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#7D8A95] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:text-[10px] sm:tracking-[0.14em]">
        <span>NICD Auditorium seating reference · 1,120 seats</span>
        <span>ODC 713 · Balcony 407</span>
      </div>

      <div className="w-full">
        <div className="mx-auto w-full max-w-[1120px] rounded-2xl border border-[#C2CBD2]/60 bg-[#F5F8FA] px-2 py-5 shadow-inner sm:rounded-[28px] sm:px-5 sm:py-7 lg:rounded-[34px] lg:px-8 lg:py-9">
          <div className="mb-4 text-center sm:mb-6 lg:mb-7">
            <div className="mx-auto w-[62%] rounded-t-3xl border-x border-t border-[#C2CBD2]/70 bg-white px-2 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#31465A] sm:w-[52%] sm:px-4 sm:text-[9px] sm:tracking-[0.22em] lg:w-[46%] lg:px-5 lg:py-3 lg:text-[10px] lg:tracking-[0.28em]">
              Auditorium Balcony
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-1.5 px-0 sm:gap-3 sm:px-4 lg:gap-5 lg:px-12">
            <div className="origin-bottom-right md:rotate-[5deg] lg:rotate-[7deg]">
              <Block
                block={block("F")}
                selected={selectedBlock === "F"}
                onSelect={() => selectBlock("F")}
              />
            </div>
            <Block
              block={block("G")}
              selected={selectedBlock === "G"}
              onSelect={() => selectBlock("G")}
            />
            <div className="origin-bottom-left md:-rotate-[5deg] lg:-rotate-[7deg]">
              <Block
                block={block("H")}
                selected={selectedBlock === "H"}
                onSelect={() => selectBlock("H")}
              />
            </div>
          </div>

          <div className="my-5 flex items-center gap-2 px-1 sm:my-7 sm:gap-3 sm:px-4 lg:my-9 lg:gap-4 lg:px-12">
            <div className="h-px flex-1 bg-[#C2CBD2]/70" />
            <span className="shrink-0 font-mono text-[7px] uppercase tracking-[0.12em] text-[#7D8A95] sm:text-[8px] sm:tracking-[0.18em] lg:text-[9px] lg:tracking-[0.22em]">
              Balcony / ODC
            </span>
            <div className="h-px flex-1 bg-[#C2CBD2]/70" />
          </div>

          <div className="mb-4 text-center sm:mb-5 lg:mb-6">
            <div className="mx-auto w-[68%] rounded-t-3xl border-x border-t border-[#C2CBD2]/70 bg-white px-2 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-[#31465A] sm:w-[60%] sm:px-4 sm:text-[9px] sm:tracking-[0.2em] lg:w-[54%] lg:px-5 lg:py-3 lg:text-[10px] lg:tracking-[0.28em]">
              Auditorium ODC · Down Flow
            </div>
          </div>

          <div className="grid grid-cols-[1fr_.6fr_1.35fr_.6fr_1fr] items-end gap-1 sm:gap-2 lg:gap-3">
            <div className="origin-bottom-right md:rotate-[6deg] lg:rotate-[10deg]">
              <Block
                block={block("A")}
                selected={selectedBlock === "A"}
                onSelect={() => selectBlock("A")}
              />
            </div>
            <div className="origin-bottom-right md:rotate-[3deg] lg:rotate-[4deg]">
              <Block
                block={block("B")}
                selected={selectedBlock === "B"}
                onSelect={() => selectBlock("B")}
              />
            </div>
            <Block
              block={block("C")}
              selected={selectedBlock === "C"}
              onSelect={() => selectBlock("C")}
            />
            <div className="origin-bottom-left md:-rotate-[3deg] lg:-rotate-[4deg]">
              <Block
                block={block("D")}
                selected={selectedBlock === "D"}
                onSelect={() => selectBlock("D")}
              />
            </div>
            <div className="origin-bottom-left md:-rotate-[6deg] lg:-rotate-[10deg]">
              <Block
                block={block("E")}
                selected={selectedBlock === "E"}
                onSelect={() => selectBlock("E")}
              />
            </div>
          </div>

          <div className="mx-auto mt-6 w-[72%] rounded-b-[52px] border border-[#0E1721] bg-[#0E1721] px-4 py-2.5 text-center text-white shadow-lg sm:mt-8 sm:w-[64%] sm:py-3 lg:mt-10 lg:w-[58%] lg:rounded-b-[90px] lg:px-6 lg:py-4">
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] sm:text-[9px] sm:tracking-[0.28em] lg:text-[10px] lg:tracking-[0.34em]">
              Stage
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[58px] border-l-2 border-[#2271B1] bg-[#F7FAFC] px-4 py-3 text-xs leading-relaxed text-[#5F6D79]">
        {selected ? (
          <>
            <span className="font-semibold text-[#0E1721]">
              Block {selected.id}
            </span>
            {" · "}
            {selected.level === "ODC"
              ? "Auditorium ODC"
              : "Auditorium Balcony"}
            {" · "}
            {selected.rows.length} rows · {selected.total} seats.
          </>
        ) : (
          <>
            Select any block to inspect its row geometry. The map preserves the
            supplied A–H block capacities and row-by-row seat counts while
            scaling to the available screen width.
          </>
        )}
      </div>
    </div>
  );
}
