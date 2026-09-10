"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Input } from '@/admin-site/components/ui/Input';
import { Badge } from '@/admin-site/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/admin-site/lib/utils';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AdminOrderListItem } from '@/lib/admin/orders';

function statusClass(paymentStatus: AdminOrderListItem['paymentStatus']) {
  if (paymentStatus === 'PAID') return 'bg-green-100 text-green-700';
  if (paymentStatus === 'FAILED') return 'bg-red-100 text-red-700';
  if (paymentStatus === 'REFUNDED' || paymentStatus === 'PARTIALLY_REFUNDED') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-[#31465A]';
}

export default function Orders({ orders }: { orders: AdminOrderListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery = !needle || [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.customerPhone ?? '',
      ].some((value) => value.toLowerCase().includes(needle));
      const matchesStatus = !status || order.paymentStatus === status || order.orderStatus === status;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#31465A]">Orders</h1>
          <p className="text-xs text-[#7D8A95] mt-1">Live checkout reservations and paid ticket orders.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D8A95]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by order number, email, phone or name..."
            className="pl-9 h-10 w-full lg:max-w-md"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-[#C2CBD2]/30 bg-white px-3 py-1 text-sm text-[#31465A] shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2271B1]"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {!filtered.length ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-[#7D8A95]">
            {orders.length ? 'No orders match these filters.' : 'No customer orders yet.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Order</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Customer</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Tickets</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Total</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Payment</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Order state</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer border-b border-[#C2CBD2]/30 last:border-0 hover:bg-[#F8FAFB] transition-colors"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <TableCell className="font-bold text-[#2271B1] text-xs">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#31465A] text-sm">{order.customerName}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-0.5">{order.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#31465A] text-sm">{order.ticketQuantity}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-0.5">{order.ticketTypes.join(', ') || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-[#31465A] text-sm">{formatCurrency(order.total, order.currency)}</TableCell>
                      <TableCell>
                        <Badge className={cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none', statusClass(order.paymentStatus))}>
                          {order.paymentStatus.replaceAll('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{order.orderStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="md:hidden space-y-4">
            {filtered.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:border-[#2271B1]/50 transition-colors"
                onClick={() => router.push(`/admin/orders/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="font-bold text-[#2271B1] text-sm">{order.orderNumber}</span>
                    <Badge className={cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none', statusClass(order.paymentStatus))}>
                      {order.paymentStatus.replaceAll('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <div className="font-bold text-[#31465A] text-sm">{order.customerName}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{order.customerEmail}</div>
                  </div>
                  <div className="flex justify-between items-end border-t border-[#C2CBD2]/30 pt-3 mt-3 gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">
                      {order.ticketQuantity} ticket(s) • {order.ticketTypes.join(', ') || 'Ticket'}
                    </div>
                    <div className="font-bold text-[#31465A] whitespace-nowrap">{formatCurrency(order.total, order.currency)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
