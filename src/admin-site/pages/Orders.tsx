"use client";

import React from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Input } from '@/admin-site/components/ui/Input';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockOrders } from '@/admin-site/data/mock-data';
import { formatCurrency, formatDate, cn } from '@/admin-site/lib/utils';
import { Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Orders() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-normal text-[#31465A]">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D8A95]" />
          <Input 
            placeholder="Search by order number, email, phone or name..." 
            className="pl-9 h-10 w-full lg:max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-10 rounded-md border border-[#C2CBD2]/30 bg-white px-3 py-1 text-sm text-[#31465A] shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2271B1]">
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <button className="h-10 px-3 border border-[#C2CBD2]/30 bg-white rounded-md text-[#7D8A95] hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Order</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Tickets</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Total</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-0.5">{order.ticketTypes.join(', ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-[#31465A] text-sm">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={order.orderStatus === 'PAID' ? 'success' : 'default'} className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                        order.orderStatus === 'PAID' ? "bg-green-100 text-green-700" : "bg-gray-100 text-[#31465A]"
                      )}>
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{formatDate(order.createdDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {mockOrders.map(order => (
          <Card 
            key={order.id} 
            className="cursor-pointer hover:border-[#2271B1]/50 transition-colors"
            onClick={() => router.push(`/admin/orders/${order.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-[#2271B1] text-sm">{order.orderNumber}</span>
                <Badge variant={order.orderStatus === 'PAID' ? 'success' : 'default'} className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                        order.orderStatus === 'PAID' ? "bg-green-100 text-green-700" : "bg-gray-100 text-[#31465A]"
                      )}>{order.orderStatus}</Badge>
              </div>
              <div className="mb-3">
                <div className="font-bold text-[#31465A] text-sm">{order.customerName}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{order.customerEmail}</div>
              </div>
              <div className="flex justify-between items-end border-t border-[#C2CBD2]/30 pt-3 mt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">
                  {order.ticketQuantity} ticket(s) • {order.ticketTypes.join(', ')}
                </div>
                <div className="font-bold text-[#31465A]">{formatCurrency(order.total)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
