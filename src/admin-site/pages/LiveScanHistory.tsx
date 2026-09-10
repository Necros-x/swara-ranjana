"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
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
import type {
  AdminScanHistoryItem,
  AdminScanResult,
} from "@/lib/admin/scans";

function badgeVariant(result: AdminScanResult) {
  if (result === "ADMITTED") return "success" as const;
  if (result === "DUPLICATE" || result === "PAYMENT_DUE") {
    return "warning" as const;
  }
  return "destructive" as const;
}

function exportCsv(rows: AdminScanHistoryItem[]) {
  const escape = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`;

  const lines = [
    [
      "Timestamp",
      "Ticket",
      "Category",
      "Customer",
      "Result",
      "Staff",
      "Gate",
    ].map(escape),
    ...rows.map((row) =>
      [
        row.timestamp,
        row.ticketNumber,
        row.ticketCategoryName,
        row.customerName,
        row.result,
        row.staffName,
        row.gate,
      ].map(escape),
    ),
  ];

  const blob = new Blob(
    [lines.map((line) => line.join(",")).join("\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `swara-ranjana-scan-history-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function LiveScanHistory({
  logs,
}: {
  logs: AdminScanHistoryItem[];
}) {
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesQuery =
        !needle ||
        [
          log.ticketNumber,
          log.customerName,
          log.ticketCategoryName,
          log.staffName,
          log.gate,
        ].some((value) => value.toLowerCase().includes(needle));

      const matchesResult =
        !resultFilter || log.result === resultFilter;

      return matchesQuery && matchesResult;
    });
  }, [logs, query, resultFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#31465A]">
            Scan History
          </h1>
          <p className="mt-1 text-xs text-[#7D8A95]">
            Live entrance validation activity from all gates.
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => exportCsv(filtered)}
          disabled={!filtered.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A95]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ticket, customer, staff or gate..."
            className="h-10 w-full pl-9 lg:max-w-md"
          />
        </div>

        <select
          value={resultFilter}
          onChange={(event) => setResultFilter(event.target.value)}
          className="h-10 rounded-md border border-[#C2CBD2]/40 bg-white px-3 text-sm text-[#31465A] shadow-sm outline-none focus:ring-1 focus:ring-[#2271B1]"
        >
          <option value="">All Results</option>
          <option value="ADMITTED">Admitted</option>
          <option value="PAYMENT_DUE">Payment Due</option>
          <option value="DUPLICATE">Duplicate</option>
          <option value="INVALID">Invalid</option>
          <option value="WRONG_EVENT">Wrong Event</option>
          <option value="REVOKED">Revoked</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Staff & Gate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filtered.length ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-[#7D8A95]"
                  >
                    No scan activity matches this view.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs text-[#7D8A95]">
                      {new Intl.DateTimeFormat("en-LK", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Colombo",
                      }).format(new Date(log.timestamp))}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-[#2271B1]">
                          {log.ticketNumber}
                        </span>
                        <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#7D8A95]">
                          {log.ticketCategoryName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#31465A]">
                      {log.customerName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={badgeVariant(log.result)}
                        className="border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {log.result.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#31465A]">
                          {log.staffName}
                        </span>
                        <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#7D8A95]">
                          {log.gate}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-[#7D8A95]">
        Showing {filtered.length} of the latest {logs.length} scan records.
      </p>
    </div>
  );
}
