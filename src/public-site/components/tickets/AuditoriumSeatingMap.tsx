"use client";

import { useMemo, useState } from "react";

interface BlockDefinition {
  id: string;
  level: "ODC" | "BALCONY";
  rows: number[];
  total: number;
  className?: string;
}

const BLOCKS: BlockDefinition[] = [
  { id: "A", level: "ODC", total: 163, rows: [8, 10, 11, 10, 11, 11, 12, 12, 12, 5, 13, 13, 13, 11, 11] },
  { id: "B", level: "ODC", total: 61, rows: [2, 3, 4, 4, 5, 5, 6, 7, 8, 8, 9] },
  { id: "C", level: "ODC", total: 256, rows: [11, 13, 13, 13, 14, 14, 15, 15, 16, 17, 18, 17, 18, 14, 14, 17, 17] },
  { id: "D", level: "ODC", total: 61, rows: [2, 3, 4, 4, 5, 5, 6, 7, 8, 8, 9] },
  { id: "E", level: "ODC", total: 172, rows: [9, 10, 11, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 11, 12] },
  { id: "F", level: "BALCONY", total: 132, rows: [17, 18, 18, 20, 21, 21, 17] },
  { id: "G", level: "BALCONY", total: 148, rows: [15, 16, 16, 18, 19, 20, 21, 23] },
  { id: "H", level: "BALCONY", total: 127, rows: [17, 18, 18, 18, 19, 21, 16] },
];

function SeatDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-[6px] w-[6px] shrink-0 rounded-[2px] border transition-colors ${
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
      className={`group min-w-0 rounded-[22px] border bg-white p-3 text-left shadow-[0_12px_32px_rgba(14,23,33,.05)] transition duration-300 ${
        selected
          ? "border-[#2271B1] ring-2 ring-[#2271B1]/10"
          : "border-[#C2CBD2]/70 hover:border-[#2271B1]/60"
      } ${block.className ?? ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0E1721]">
          Block {block.id}
        </span>
        <span className="font-mono text-[9px] text-[#7D8A95]">
          {block.total}
        </span>
      </div>

      <div className="space-y-[3px]">
        {block.rows.map((count, rowIndex) => (
          <div
            key={`${block.id}-${rowIndex + 1}`}
            className="flex min-h-[8px] items-center justify-center gap-[2px]"
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.14em] text-[#7D8A95]">
        <span>NICD Auditorium seating reference · 1,120 seats</span>
        <span>ODC 713 · Balcony 407</span>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="mx-auto min-w-[980px] max-w-[1120px] rounded-[34px] border border-[#C2CBD2]/60 bg-[#F5F8FA] px-8 py-9 shadow-inner">
          <div className="mb-7 text-center">
            <div className="mx-auto w-[46%] rounded-t-[60px] border-x border-t border-[#C2CBD2]/70 bg-white px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#31465A]">
              Auditorium Balcony
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-5 px-12">
            <div className="origin-bottom-right rotate-[7deg]">
              <Block
                block={block("F")}
                selected={selectedBlock === "F"}
                onSelect={() => setSelectedBlock(selectedBlock === "F" ? null : "F")}
              />
            </div>
            <Block
              block={block("G")}
              selected={selectedBlock === "G"}
              onSelect={() => setSelectedBlock(selectedBlock === "G" ? null : "G")}
            />
            <div className="origin-bottom-left -rotate-[7deg]">
              <Block
                block={block("H")}
                selected={selectedBlock === "H"}
                onSelect={() => setSelectedBlock(selectedBlock === "H" ? null : "H")}
              />
            </div>
          </div>

          <div className="my-9 flex items-center gap-4 px-12">
            <div className="h-px flex-1 bg-[#C2CBD2]/70" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#7D8A95]">
              Balcony / ODC separation
            </span>
            <div className="h-px flex-1 bg-[#C2CBD2]/70" />
          </div>

          <div className="mb-6 text-center">
            <div className="mx-auto w-[54%] rounded-t-[60px] border-x border-t border-[#C2CBD2]/70 bg-white px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#31465A]">
              Auditorium ODC · Down Flow
            </div>
          </div>

          <div className="grid grid-cols-[1fr_.55fr_1.35fr_.55fr_1fr] items-end gap-3">
            <div className="origin-bottom-right rotate-[10deg]">
              <Block
                block={block("A")}
                selected={selectedBlock === "A"}
                onSelect={() => setSelectedBlock(selectedBlock === "A" ? null : "A")}
              />
            </div>
            <div className="origin-bottom-right rotate-[4deg]">
              <Block
                block={block("B")}
                selected={selectedBlock === "B"}
                onSelect={() => setSelectedBlock(selectedBlock === "B" ? null : "B")}
              />
            </div>
            <Block
              block={block("C")}
              selected={selectedBlock === "C"}
              onSelect={() => setSelectedBlock(selectedBlock === "C" ? null : "C")}
            />
            <div className="origin-bottom-left -rotate-[4deg]">
              <Block
                block={block("D")}
                selected={selectedBlock === "D"}
                onSelect={() => setSelectedBlock(selectedBlock === "D" ? null : "D")}
              />
            </div>
            <div className="origin-bottom-left -rotate-[10deg]">
              <Block
                block={block("E")}
                selected={selectedBlock === "E"}
                onSelect={() => setSelectedBlock(selectedBlock === "E" ? null : "E")}
              />
            </div>
          </div>

          <div className="mx-auto mt-10 w-[58%] rounded-b-[90px] border border-[#0E1721] bg-[#0E1721] px-6 py-4 text-center text-white shadow-lg">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.34em]">
              Stage
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[58px] border-l-2 border-[#2271B1] bg-[#F7FAFC] px-4 py-3 text-xs leading-relaxed text-[#5F6D79]">
        {selected ? (
          <>
            <span className="font-semibold text-[#0E1721]">Block {selected.id}</span>
            {" · "}{selected.level === "ODC" ? "Auditorium ODC" : "Auditorium Balcony"}
            {" · "}{selected.rows.length} rows · {selected.total} seats. Row-by-row seat selection will use this exact geometry once the event’s seat-pricing rules are connected.
          </>
        ) : (
          <>Select any block to inspect its real row geometry. The map reproduces the block and row seat counts from the supplied auditorium plan.</>
        )}
      </div>
    </div>
  );
}
