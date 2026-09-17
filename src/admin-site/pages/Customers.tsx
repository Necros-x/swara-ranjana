"use client";

import React, { useMemo, useState } from "react";
import { Search, UserCheck, UsersRound } from "lucide-react";
import { Badge } from "@/admin-site/components/ui/Badge";
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
import type { AdminCustomerSummary } from "@/lib/admin/customers";

function dateLabel(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  });
}

export default function Customers({
  customers,
}: {
  customers: AdminCustomerSummary[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;

    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [customers, query]);

  const activeAccounts = customers.filter((customer) => customer.accountActive).length;
  const activeTickets = customers.reduce(
    (sum, customer) => sum + customer.activeTicketCount,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#31465A]">Customers</h1>
          <p className="mt-1 text-sm text-[#7D8A95]">
            Live reservation customers and account activity.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7D8A95]">
              <UsersRound className="h-4 w-4 text-[#2271B1]" />
              Customers
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#0E1721]">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7D8A95]">
              <UserCheck className="h-4 w-4 text-[#2271B1]" />
              Active accounts
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#0E1721]">{activeAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7D8A95]">
              Active tickets
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#0E1721]">{activeTickets}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A95]" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email or phone..."
          className="h-10 w-full pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-[#7D8A95]">
            {customers.length === 0
              ? "No customers yet."
              : "No customers match this search."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {filtered.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[#31465A]">{customer.fullName}</div>
                      <div className="mt-1 truncate text-xs text-[#7D8A95]">{customer.email}</div>
                      {customer.phone && (
                        <div className="mt-0.5 text-xs text-[#7D8A95]">{customer.phone}</div>
                      )}
                    </div>
                    <Badge variant={customer.accountActive ? "success" : "secondary"}>
                      {customer.accountActive ? "ACCOUNT" : "GUEST"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#E4E9ED] py-3 text-xs">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-[#7D8A95]">Orders</div>
                      <div className="mt-1 font-medium">{customer.orderCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-[#7D8A95]">Active tickets</div>
                      <div className="mt-1 font-medium">{customer.activeTicketCount}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-[#7D8A95]">
                    Last order: <span className="font-medium text-[#31465A]">{dateLabel(customer.lastOrderAt)}</span>
                  </div>
                  {customer.accountActive && (
                    <div className="mt-1 text-xs text-[#7D8A95]">
                      Last login: <span className="font-medium text-[#31465A]">{dateLabel(customer.lastLoginAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-center">Orders</TableHead>
                      <TableHead className="text-center">Active Tickets</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Last Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium text-[#31465A]">{customer.fullName}</div>
                          <div className="mt-1 text-[10px] text-[#7D8A95]">
                            Customer since {dateLabel(customer.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-[#31465A]">{customer.email}</div>
                          <div className="mt-1 text-xs text-[#7D8A95]">{customer.phone || "No phone"}</div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{customer.orderCount}</TableCell>
                        <TableCell className="text-center font-medium">{customer.activeTicketCount}</TableCell>
                        <TableCell>
                          <Badge variant={customer.accountActive ? "success" : "secondary"}>
                            {customer.accountActive ? "ACTIVE" : "GUEST"}
                          </Badge>
                          {customer.accountActive && (
                            <div className="mt-1 text-[10px] text-[#7D8A95]">
                              Last login {dateLabel(customer.lastLoginAt)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-[#7D8A95]">
                          {dateLabel(customer.lastOrderAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
