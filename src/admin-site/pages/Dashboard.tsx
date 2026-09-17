"use client";

import React from "react";
import Link from "next/link";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/admin-site/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin-site/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/admin-site/components/ui/Table";
import type { AdminDashboardData } from "@/lib/admin/dashboard";

function money(value: number, currency = "LKR") {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
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

function scanBadge(result: string) {
  if (result === "ADMITTED") return "bg-emerald-100 text-emerald-700";
  if (result === "EXITED") return "bg-sky-100 text-sky-700";
  if (result === "PAYMENT_DUE") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

export default function Dashboard({ data }: { data: AdminDashboardData }) {
  if (!data.event) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-[#7D8A95]">
          No event is configured yet. Create an event to activate the dashboard.
        </CardContent>
      </Card>
    );
  }

  const event = data.event;
  const ticketUsage = event.totalCapacity
    ? Math.min((data.activeTickets / event.totalCapacity) * 100, 100)
    : 0;
  const insideUsage = data.activeTickets
    ? Math.min((data.insideNow / data.activeTickets) * 100, 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-serif text-2xl text-[#31465A]">{event.name}</h2>
          <p className="mt-1 text-sm text-[#7D8A95]">
            {dateTime(event.startsAt)} • {event.venueName}
          </p>
        </div>
        <Badge className="w-fit border-none bg-[#2271B1] px-3 py-1 text-sm font-semibold uppercase tracking-wider text-white">
          {event.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95]">
              Fully Paid Order Value
            </CardDescription>
            <CardTitle className="font-serif text-3xl font-normal text-[#31465A] sm:text-4xl">
              {money(data.fullyPaidOrderValue, event.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#7D8A95]">
              Excludes partial/refunded orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95]">
              Active Tickets
            </CardDescription>
            <CardTitle className="font-serif text-4xl font-normal text-[#31465A]">
              {data.activeTickets.toLocaleString("en-LK")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#7D8A95]">
              {Math.max(event.totalCapacity - data.activeTickets, 0).toLocaleString("en-LK")} capacity not yet issued
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-[#C2CBD2]/30 bg-[#F8FAFB]">
              <div
                className="h-full rounded-full bg-[#2271B1]"
                style={{ width: `${ticketUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95]">
              Total Orders
            </CardDescription>
            <CardTitle className="font-serif text-4xl font-normal text-[#31465A]">
              {data.totalOrders.toLocaleString("en-LK")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/orders"
              className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#2271B1] hover:underline"
            >
              View all orders →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95]">
              Inside Venue Now
            </CardDescription>
            <CardTitle className="font-serif text-4xl font-normal text-[#31465A]">
              {data.insideNow.toLocaleString("en-LK")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#7D8A95]">
              Live entrance presence
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-[#C2CBD2]/30 bg-[#F8FAFB]">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${insideUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">
              Last 7 Days
            </CardTitle>
            <CardDescription>
              New orders and tickets confirmed by reservation date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.salesSeries}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7D8A95", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7D8A95", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #C2CBD2",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#31465A"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#31465A" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    name="Confirmed tickets"
                    stroke="#2271B1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#2271B1" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">
              Categories
            </CardTitle>
            <CardDescription>Confirmed + active reservation inventory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.categories.length === 0 ? (
              <p className="text-sm text-[#7D8A95]">No ticket categories configured.</p>
            ) : (
              data.categories.map((category) => {
                const committed = category.sold + category.reserved;
                const percentage = category.capacity
                  ? Math.min(Math.round((committed / category.capacity) * 100), 100)
                  : 0;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-bold text-[#31465A]">{category.name}</span>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">
                        {percentage}% committed
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-[#C2CBD2]/30 bg-[#F8FAFB]">
                      <div
                        className="h-full rounded-full bg-[#2271B1]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">
                      <span>{category.sold} confirmed</span>
                      <span>{category.reserved} held</span>
                      <span>{category.remaining} left</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">
              Recent Orders
            </CardTitle>
            <Link
              href="/admin/orders"
              className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2271B1] hover:underline"
            >
              All orders
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7D8A95]">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="cursor-pointer font-mono text-xs font-bold text-[#2271B1] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[#31465A]">{order.customerName}</div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[#7D8A95]">
                          {order.ticketQuantity} ticket{order.ticketQuantity === 1 ? "" : "s"} • {order.orderStatus}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#31465A]">
                        {money(order.total, order.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">
              Recent Scans
            </CardTitle>
            <Link
              href="/admin/scan-history"
              className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2271B1] hover:underline"
            >
              Scan history
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.recentScans.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7D8A95]">No scan activity yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Gate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-[#31465A]">
                          {scan.ticketNumber}
                        </div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[#7D8A95]">
                          {dateTime(scan.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${scanBadge(scan.result)}`}
                        >
                          {scan.result}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-[#7D8A95]">
                        {scan.gate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
