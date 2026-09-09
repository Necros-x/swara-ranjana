"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/admin-site/components/ui/Card';
import { Button } from '@/admin-site/components/ui/Button';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockOrders, mockTickets } from '@/admin-site/data/mock-data';
import { formatCurrency, formatDate } from '@/admin-site/lib/utils';
import { ArrowLeft, Mail, Download, Ban, CreditCard } from 'lucide-react';

export default function OrderDetail({ id }: { id: string }) {
  const order = mockOrders.find(o => o.id === id);
  const tickets = mockTickets.filter(t => t.orderId === id);

  if (!order) return <div className="p-8 text-center text-[#7D8A95]">Order not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 rounded-full hover:bg-[#C2CBD2]/20 text-[#7D8A95] hover:text-[#0E1721] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#0E1721] flex items-center gap-3">
            Order {order.orderNumber}
            <Badge variant={order.orderStatus === 'PAID' ? 'success' : 'default'} className="text-xs">
              {order.orderStatus}
            </Badge>
          </h1>
          <p className="text-sm text-[#7D8A95]">{formatDate(order.createdDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="block border border-[#C2CBD2] rounded-lg p-4 hover:border-[#2271B1] transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-[#2271B1]">{ticket.ticketNumber}</div>
                        <div className="text-sm text-[#31465A] font-medium">{ticket.ticketCategoryName}</div>
                      </div>
                      <Badge variant={ticket.status === 'VALID' ? 'success' : ticket.status === 'USED' ? 'secondary' : 'destructive'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-[#C2CBD2] flex justify-between items-center text-lg">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-[#7D8A95] text-xs uppercase tracking-wider mb-1">Name</div>
                <div className="font-medium">{order.customerName}</div>
              </div>
              <div>
                <div className="text-[#7D8A95] text-xs uppercase tracking-wider mb-1">Email</div>
                <a href={`mailto:${order.customerEmail}`} className="text-[#2271B1] hover:underline">{order.customerEmail}</a>
              </div>
              <div>
                <div className="text-[#7D8A95] text-xs uppercase tracking-wider mb-1">Phone</div>
                <div>{order.customerPhone}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#7D8A95]" />
                <span className="font-medium">Card ending in 4242</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-700">Payment {order.paymentStatus}</Badge>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Resend Order Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Tickets (PDF)
            </Button>
            <Button variant="destructive" className="w-full justify-start mt-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
              <Ban className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
