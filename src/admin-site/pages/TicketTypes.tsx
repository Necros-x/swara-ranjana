"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/admin-site/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/admin-site/components/ui/Table";
import { Button } from "@/admin-site/components/ui/Button";
import { Badge } from "@/admin-site/components/ui/Badge";
import { formatCurrency } from "@/admin-site/lib/utils";
import { Plus, Trash2, X } from "lucide-react";
import {
  archiveTicketType,
  saveTicketType,
  setTicketTypeStatus,
} from "@/app/admin/actions/catalog";
import type { TicketTypeStatus } from "@/types/database";

export interface TicketTypeEventOption {
  id: string;
  name: string;
}

export interface SeatBlockOption {
  id: string;
  eventId: string;
  code: string;
  displayName: string;
  capacity: number;
  assignedTicketTypeId: string | null;
}

export interface LiveAdminTicketType {
  id: string;
  eventId: string;
  eventName: string;
  code: string;
  name: string;
  description: string | null;
  seatingZone: string | null;
  priceLkr: number;
  capacity: number;
  quantitySold: number;
  quantityRemaining: number;
  maxPerOrder: number;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  status: TicketTypeStatus;
  sortOrder: number;
  benefits: string[];
  recommended: boolean;
  blockIds: string[];
}

function localInputValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function TicketTypeForm({
  ticketType,
  events,
  seatBlocks,
  onClose,
}: {
  ticketType?: LiveAdminTicketType;
  events: TicketTypeEventOption[];
  seatBlocks: SeatBlockOption[];
  onClose: () => void;
}) {
  const [eventId, setEventId] = useState(
    ticketType?.eventId ?? events[0]?.id ?? "",
  );
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(
    ticketType?.blockIds ?? [],
  );

  const eventBlocks = useMemo(
    () => seatBlocks.filter((block) => block.eventId === eventId),
    [eventId, seatBlocks],
  );

  const selectedCapacity = eventBlocks
    .filter((block) => selectedBlockIds.includes(block.id))
    .reduce((sum, block) => sum + block.capacity, 0);

  const changeEvent = (nextEventId: string) => {
    setEventId(nextEventId);
    setSelectedBlockIds([]);
  };

  const toggleBlock = (blockId: string) => {
    setSelectedBlockIds((current) =>
      current.includes(blockId)
        ? current.filter((id) => id !== blockId)
        : [...current, blockId],
    );
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0E1721]">
              {ticketType ? "Edit Ticket Category" : "Create Ticket Category"}
            </h2>
            <p className="mt-1 text-xs text-[#7D8A95]">
              Categories control pricing, availability and which auditorium blocks can be allocated.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-2 text-[#7D8A95] hover:text-[#0E1721]"
            aria-label="Close ticket category form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={saveTicketType} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input type="hidden" name="id" value={ticketType?.id ?? ""} />

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Event</span>
            <select
              name="eventId"
              required
              value={eventId}
              onChange={(event) => changeEvent(event.target.value)}
              className="h-10 w-full border border-[#C2CBD2]/60 bg-white px-3 text-sm"
            >
              <option value="" disabled>
                Select event
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Code</span>
            <input
              name="code"
              required
              placeholder="GENERAL"
              defaultValue={ticketType?.code ?? ""}
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 font-mono text-sm uppercase"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Display name</span>
            <input
              name="name"
              required
              defaultValue={ticketType?.name ?? ""}
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Seating zone label</span>
            <input
              name="seatingZone"
              defaultValue={ticketType?.seatingZone ?? ""}
              placeholder="Balcony · Blocks F–H"
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-[#31465A]">Short description</span>
            <textarea
              name="description"
              rows={2}
              defaultValue={ticketType?.description ?? ""}
              className="w-full resize-y border border-[#C2CBD2]/60 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Price (LKR)</span>
            <input
              type="number"
              min="0"
              name="priceLkr"
              required
              defaultValue={ticketType?.priceLkr ?? 0}
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Capacity</span>
            <input
              type="number"
              min="0"
              name="capacity"
              required
              readOnly={selectedBlockIds.length > 0}
              value={
                selectedBlockIds.length > 0
                  ? selectedCapacity
                  : undefined
              }
              defaultValue={
                selectedBlockIds.length > 0 ? undefined : ticketType?.capacity ?? 0
              }
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm read-only:bg-[#F4F7F9]"
            />
            <span className="block text-[10px] leading-relaxed text-[#7D8A95]">
              With auditorium blocks selected, capacity is calculated automatically from the real hall map.
            </span>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Max per order</span>
            <input
              type="number"
              min="1"
              max="20"
              name="maxPerOrder"
              required
              defaultValue={ticketType?.maxPerOrder ?? 6}
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Sort order</span>
            <input
              type="number"
              min="0"
              name="sortOrder"
              defaultValue={ticketType?.sortOrder ?? 0}
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Sales start</span>
            <input
              type="datetime-local"
              name="saleStartsAt"
              defaultValue={localInputValue(ticketType?.saleStartsAt ?? null)}
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Sales end</span>
            <input
              type="datetime-local"
              name="saleEndsAt"
              defaultValue={localInputValue(ticketType?.saleEndsAt ?? null)}
              className="h-10 w-full border border-[#C2CBD2]/60 px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Status</span>
            <select
              name="status"
              defaultValue={ticketType?.status ?? "DRAFT"}
              className="h-10 w-full border border-[#C2CBD2]/60 bg-white px-3 text-sm"
            >
              {['DRAFT', 'AVAILABLE', 'PAUSED', 'SOLD_OUT'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="flex h-10 items-center gap-3 self-end">
            <input
              type="checkbox"
              name="recommended"
              defaultChecked={ticketType?.recommended ?? false}
              className="h-4 w-4"
            />
            <span className="text-sm text-[#31465A]">Recommended / featured category</span>
          </label>

          {eventBlocks.length > 0 && (
            <div className="space-y-3 md:col-span-2">
              <div>
                <span className="text-xs font-medium text-[#31465A]">Auditorium blocks</span>
                <p className="mt-1 text-[10px] leading-relaxed text-[#7D8A95]">
                  Assign the physical blocks this category can use. Reassigning a block moves all remaining inventory in that block to this category; previously issued tickets keep their original category and seat.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {eventBlocks.map((block) => {
                  const selected = selectedBlockIds.includes(block.id);
                  const assignedElsewhere =
                    block.assignedTicketTypeId &&
                    block.assignedTicketTypeId !== ticketType?.id;

                  return (
                    <label
                      key={block.id}
                      className={`cursor-pointer border p-3 transition ${
                        selected
                          ? "border-[#2271B1] bg-[#2271B1]/5"
                          : "border-[#C2CBD2]/60 bg-white hover:border-[#2271B1]/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="blockIds"
                        value={block.id}
                        checked={selected}
                        onChange={() => toggleBlock(block.id)}
                        className="mr-2 h-4 w-4"
                      />
                      <span className="font-mono text-xs font-semibold">Block {block.code}</span>
                      <span className="mt-1 block text-[10px] text-[#7D8A95]">
                        {block.capacity} seats
                        {assignedElsewhere ? " · currently another category" : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-[#31465A]">Benefits — one per line</span>
            <textarea
              name="benefits"
              rows={5}
              defaultValue={ticketType?.benefits.join("\n") ?? ""}
              className="w-full resize-y border border-[#C2CBD2]/60 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {ticketType ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function TicketTypes({
  ticketTypes,
  events,
  seatBlocks,
}: {
  ticketTypes: LiveAdminTicketType[];
  events: TicketTypeEventOption[];
  seatBlocks: SeatBlockOption[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LiveAdminTicketType | null>(null);
  const [removing, setRemoving] = useState<LiveAdminTicketType | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Ticket Categories</h1>
          <p className="mt-1 text-sm text-[#7D8A95]">
            Create, edit, pause or remove ticket categories and their auditorium allocation.
          </p>
        </div>
        <Button
          disabled={events.length === 0}
          className="w-full sm:w-auto"
          onClick={() => {
            setEditing(null);
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      {events.length === 0 && (
        <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create an event first, then add its ticket categories.
        </div>
      )}

      {(showCreate || editing) && (
        <TicketTypeForm
          ticketType={editing ?? undefined}
          events={events}
          seatBlocks={seatBlocks}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
          }}
        />
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Blocks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-[#7D8A95]">
                    No ticket categories yet.
                  </TableCell>
                </TableRow>
              ) : (
                ticketTypes.map((category) => {
                  const blocks = seatBlocks.filter(
                    (block) => block.assignedTicketTypeId === category.id,
                  );

                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs text-[#7D8A95]">
                            {category.code} • {category.seatingZone || "No zone set"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{category.eventName}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(category.priceLkr)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {category.quantitySold} / {category.capacity}
                          </span>
                          <span className="text-xs text-[#7D8A95]">
                            {category.quantityRemaining} remaining
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-[#31465A]">
                          {blocks.length
                            ? blocks.map((block) => block.code).join(", ")
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.status === "AVAILABLE" ? "success" : "outline"}
                        >
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <form action={setTicketTypeStatus}>
                            <input type="hidden" name="id" value={category.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={
                                category.status === "PAUSED" ? "AVAILABLE" : "PAUSED"
                              }
                            />
                            <Button type="submit" variant="outline" size="sm">
                              {category.status === "PAUSED" ? "Resume" : "Pause"}
                            </Button>
                          </form>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowCreate(false);
                              setEditing(category);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRemoving(category)}
                            className="text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {removing && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0E1721]/65 p-4 backdrop-blur-sm"
          onClick={() => setRemoving(null)}
        >
          <div
            className="w-full max-w-md border border-[#C2CBD2] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-600">
                  Remove category
                </div>
                <h2 className="mt-2 font-serif text-2xl text-[#0E1721]">
                  {removing.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setRemoving(null)}
                className="cursor-pointer p-2 text-[#7D8A95] hover:text-[#0E1721]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#5F6D79]">
              This removes the category from active admin/public use and frees its auditorium blocks for another category. Existing orders and issued tickets keep their historical category and seat data.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => setRemoving(null)}>
                Keep Category
              </Button>
              <form action={archiveTicketType}>
                <input type="hidden" name="id" value={removing.id} />
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Remove
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
