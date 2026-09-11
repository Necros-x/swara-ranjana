"use client";

import {
  Plus,
  Search,
  TicketCheck,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/admin-site/components/ui/Badge";
import { Button } from "@/admin-site/components/ui/Button";
import { Card, CardContent } from "@/admin-site/components/ui/Card";
import { Input } from "@/admin-site/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/admin-site/components/ui/Table";
import { issueInternalTicketBatch } from "@/app/admin/actions/tickets";
import type {
  AdminTicketListItem,
  InternalIssueCatalog,
} from "@/lib/admin/tickets";

function statusVariant(status: AdminTicketListItem["status"]) {
  if (status === "VALID") return "success" as const;
  if (status === "USED") return "secondary" as const;
  return "destructive" as const;
}

export default function Tickets({
  tickets,
  catalog,
  canIssue,
}: {
  tickets: AdminTicketListItem[];
  catalog: InternalIssueCatalog;
  canIssue: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [eventId, setEventId] = useState("");
  const [source, setSource] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueEventId, setIssueEventId] = useState(
    catalog.events[0]?.id ?? "",
  );
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [holderLabel, setHolderLabel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [issueError, setIssueError] = useState("");
  const [pending, startTransition] = useTransition();

  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    tickets.forEach((ticket) => map.set(ticket.eventId, ticket.eventName));
    return [...map.entries()];
  }, [tickets]);

  const issueTypes = useMemo(
    () =>
      catalog.ticketTypes.filter(
        (type) => type.eventId === issueEventId,
      ),
    [catalog.ticketTypes, issueEventId],
  );

  const effectiveTypeId =
    issueTypes.some((type) => type.id === ticketTypeId)
      ? ticketTypeId
      : issueTypes[0]?.id ?? "";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesQuery =
        !needle ||
        [
          ticket.ticketNumber,
          ticket.orderNumber,
          ticket.holderName,
          ticket.ticketTypeName,
          ticket.eventName,
        ].some((value) => value.toLowerCase().includes(needle));

      return (
        matchesQuery &&
        (!status || ticket.status === status) &&
        (!eventId || ticket.eventId === eventId) &&
        (!source || ticket.source === source)
      );
    });
  }, [tickets, query, status, eventId, source]);

  const submitIssue = () => {
    setIssueError("");

    startTransition(async () => {
      const result = await issueInternalTicketBatch({
        eventId: issueEventId,
        ticketTypeId: effectiveTypeId,
        quantity,
        holderLabel,
        note,
      });

      if (!result.ok) {
        setIssueError(result.message);
        return;
      }

      if (result.orderId) {
        router.push(`/admin/tickets/batch/${result.orderId}`);
        return;
      }

      setIssueOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#31465A]">
            Tickets
          </h1>
          <p className="mt-1 text-xs text-[#7D8A95]">
            Website admissions and staff-issued Practice / School tickets in
            one gate registry.
          </p>
        </div>

        {canIssue && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setIssueError("");
              setIssueOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Issue internal tickets
          </Button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A95]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ticket number, holder, order, show..."
            className="h-10 w-full pl-9"
          />
        </div>

        <select
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          className="h-10 rounded-md border border-[#C2CBD2]/40 bg-white px-3 text-sm text-[#31465A]"
        >
          <option value="">All shows</option>
          {eventOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={source}
          onChange={(event) => setSource(event.target.value)}
          className="h-10 rounded-md border border-[#C2CBD2]/40 bg-white px-3 text-sm text-[#31465A]"
        >
          <option value="">All sources</option>
          <option value="WEBSITE">Website</option>
          <option value="INTERNAL">Internal</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-[#C2CBD2]/40 bg-white px-3 text-sm text-[#31465A]"
        >
          <option value="">All statuses</option>
          <option value="VALID">Valid</option>
          <option value="USED">Used</option>
          <option value="REVOKED">Revoked</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Show</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checked in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filtered.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-[#7D8A95]"
                    >
                      No tickets match this view.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/admin/tickets/${ticket.id}`);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-[#F8FAFB] focus:bg-[#F8FAFB] focus:outline-none"
                    >
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-[#2271B1]">
                          {ticket.ticketNumber}
                        </div>
                        <div className="mt-1 text-[10px] text-[#7D8A95]">
                          {ticket.orderNumber}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-40 text-sm font-medium text-[#31465A]">
                        {ticket.eventName}
                      </TableCell>
                      <TableCell className="min-w-40 text-sm text-[#31465A]">
                        {ticket.holderName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ticket.ticketTypeName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.source === "INTERNAL"
                              ? "warning"
                              : "outline"
                          }
                        >
                          {ticket.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-[#7D8A95]">
                        {ticket.checkedInAt
                          ? new Intl.DateTimeFormat("en-LK", {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: "Asia/Colombo",
                            }).format(new Date(ticket.checkedInAt))
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-[#7D8A95]">
        <TicketCheck className="h-4 w-4 text-[#2271B1]" />
        {filtered.length} of {tickets.length} registered tickets
      </div>

      {issueOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-[#0E1721]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setIssueOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl sm:rounded-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#2271B1]">
                  Gate registry
                </div>
                <h2 className="mt-2 font-gemola text-3xl text-[#0E1721]">
                  Issue internal tickets
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#7D8A95]">
                  Use this for Practice and School shows. These tickets are
                  registered and scannable, but are never sold through the
                  public website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIssueOpen(false)}
                className="rounded-full p-2 text-[#7D8A95] hover:bg-[#F3F5F7]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!catalog.events.length ? (
              <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Create the Practice / School show in Event Management first,
                then add at least one ticket category for it.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#31465A]">
                    Show
                  </span>
                  <select
                    value={issueEventId}
                    onChange={(event) => {
                      setIssueEventId(event.target.value);
                      setTicketTypeId("");
                    }}
                    className="h-11 w-full rounded-md border border-[#C2CBD2] bg-white px-3 text-sm"
                  >
                    {catalog.events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name} —{" "}
                        {new Date(event.startsAt).toLocaleString("en-LK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Colombo",
                        })}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#31465A]">
                    Ticket category
                  </span>
                  <select
                    value={effectiveTypeId}
                    onChange={(event) => setTicketTypeId(event.target.value)}
                    disabled={!issueTypes.length}
                    className="h-11 w-full rounded-md border border-[#C2CBD2] bg-white px-3 text-sm disabled:opacity-50"
                  >
                    {!issueTypes.length && (
                      <option value="">
                        Create a ticket category for this show first
                      </option>
                    )}
                    {issueTypes.map((type) => (
                      <option
                        key={type.id}
                        value={type.id}
                        disabled={type.status === "SOLD_OUT"}
                      >
                        {type.name} • {type.code} • {type.status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#31465A]">
                    School / group / holder
                  </span>
                  <Input
                    value={holderLabel}
                    onChange={(event) =>
                      setHolderLabel(event.target.value.slice(0, 160))
                    }
                    placeholder="e.g. St. Sylvester's College"
                    className="h-11"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#31465A]">
                    Quantity
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(500, Number(event.target.value) || 1),
                        ),
                      )
                    }
                    className="h-11"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#31465A]">
                    Note (optional)
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value.slice(0, 1000))
                    }
                    rows={3}
                    placeholder="Batch, teacher/contact, distribution note..."
                    className="w-full resize-y rounded-md border border-[#C2CBD2] p-3 text-sm outline-none focus:border-[#2271B1]"
                  />
                </label>

                {issueError && (
                  <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {issueError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIssueOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={
                      pending ||
                      !effectiveTypeId ||
                      holderLabel.trim().length < 2
                    }
                    onClick={submitIssue}
                  >
                    {pending ? "Issuing…" : `Issue ${quantity}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
