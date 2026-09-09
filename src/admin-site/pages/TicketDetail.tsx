"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Button } from '@/admin-site/components/ui/Button';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockTickets, mockEvents, mockOrders } from '@/admin-site/data/mock-data';
import { formatDate } from '@/admin-site/lib/utils';
import { ArrowLeft, ExternalLink, Mail, Download, Ban, QrCode } from 'lucide-react';

export default function TicketDetail({ id }: { id: string }) {
  const ticket = mockTickets.find(t => t.id === id);
  const event = ticket ? mockEvents.find(e => e.id === ticket.eventId) : null;
  const order = ticket ? mockOrders.find(o => o.id === ticket.orderId) : null;

  if (!ticket || !event || !order) return <div className="p-8 text-center text-[#7D8A95]">Ticket not found</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/tickets" className="p-2 rounded-full hover:bg-[#C2CBD2]/20 text-[#7D8A95] hover:text-[#0E1721] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Ticket Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ticket Visual */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-[#C2CBD2]/50 flex flex-col">
            <div className="bg-[#0E1721] h-32 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                background: 'radial-gradient(circle at 50% 50%, #2271B1 0%, transparent 60%)'
              }}></div>
              <h2 className="text-white font-serif text-3xl font-light z-10">{event.name}</h2>
            </div>
            
            <div className="p-8 flex-1 flex flex-col items-center border-b border-dashed border-[#C2CBD2]">
              <div className="text-center mb-6">
                <div className="text-sm text-[#7D8A95] uppercase tracking-wider mb-1">Admit One</div>
                <div className="text-xl font-medium text-[#0E1721]">{ticket.customerName}</div>
              </div>
              
              <div className="w-full flex justify-between items-center mb-6 text-sm">
                <div>
                  <div className="text-[#7D8A95] mb-1">Category</div>
                  <div className="font-medium text-[#2271B1]">{ticket.ticketCategoryName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#7D8A95] mb-1">Date</div>
                  <div className="font-medium text-[#0E1721]">{formatDate(event.date).split(',')[0]}</div>
                </div>
              </div>
              
              <div className="w-full text-center text-sm">
                <div className="text-[#7D8A95] mb-1">Venue</div>
                <div className="font-medium text-[#0E1721]">{event.venue}</div>
              </div>
            </div>
            
            <div className="p-8 bg-[#F8FAFC] flex flex-col items-center justify-center">
              <div className="w-40 h-40 bg-white border border-[#C2CBD2] rounded-lg flex items-center justify-center mb-4 relative">
                {ticket.status === 'VALID' ? (
                  <QrCode className="w-32 h-32 text-[#0E1721]" strokeWidth={1} />
                ) : (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <Badge variant={ticket.status === 'USED' ? 'secondary' : 'destructive'} className="text-sm px-3 py-1">
                      {ticket.status}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="font-mono text-sm tracking-widest text-[#7D8A95]">
                {ticket.ticketNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-serif text-lg border-b border-[#C2CBD2] pb-2 mb-4">Administration</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#7D8A95] mb-1 text-xs uppercase tracking-wider">Status</div>
                  <Badge variant={ticket.status === 'VALID' ? 'success' : ticket.status === 'USED' ? 'secondary' : 'destructive'}>
                    {ticket.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-[#7D8A95] mb-1 text-xs uppercase tracking-wider">Payment</div>
                  <Badge variant={ticket.paymentState === 'PAID' ? 'success' : 'default'} className="bg-green-100 text-green-800 border-none">
                    {ticket.paymentState}
                  </Badge>
                </div>
                <div>
                  <div className="text-[#7D8A95] mb-1 text-xs uppercase tracking-wider">Issued At</div>
                  <div className="font-medium text-[#0E1721]">{formatDate(ticket.issuedAt)}</div>
                </div>
                <div>
                  <div className="text-[#7D8A95] mb-1 text-xs uppercase tracking-wider">Checked In</div>
                  <div className="font-medium text-[#0E1721]">{ticket.checkedInAt ? formatDate(ticket.checkedInAt) : '-'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-serif text-lg border-b border-[#C2CBD2] pb-2 mb-4">Order Link</h3>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium text-[#2271B1]">{order.orderNumber}</div>
                  <div className="text-[#7D8A95]">Purchased by {order.customerName}</div>
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-[#C2CBD2]/30 bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] shadow-sm transition-colors hover:bg-gray-50 hover:text-[#31465A]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Order
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Resend Ticket
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            {ticket.status === 'VALID' && (
              <Button variant="destructive" className="w-full justify-start mt-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                <Ban className="w-4 h-4 mr-2" />
                Revoke Ticket
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
