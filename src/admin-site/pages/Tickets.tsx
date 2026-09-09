"use client";

import React from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Input } from '@/admin-site/components/ui/Input';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockTickets } from '@/admin-site/data/mock-data';
import { formatDate, cn } from '@/admin-site/lib/utils';
import { Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Tickets() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-normal text-[#31465A]">Tickets</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D8A95]" />
          <Input 
            placeholder="Search ticket number, customer, order..." 
            className="pl-9 h-10 w-full lg:max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-10 rounded-md border border-[#C2CBD2]/30 bg-white px-3 py-1 text-sm text-[#31465A] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#2271B1]">
            <option value="">All Statuses</option>
            <option value="VALID">Valid</option>
            <option value="USED">Used</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <button className="h-10 px-3 border border-[#C2CBD2]/30 bg-white rounded-md text-[#7D8A95] hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Ticket Number</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Order</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Category</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Checked In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTickets.map((ticket) => (
                <TableRow 
                  key={ticket.id}
                  className="cursor-pointer border-b border-[#C2CBD2]/30 last:border-0 hover:bg-[#F8FAFB] transition-colors"
                  onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                >
                  <TableCell className="font-mono font-bold text-[#2271B1] text-xs">{ticket.ticketNumber}</TableCell>
                  <TableCell className="text-sm font-medium text-[#31465A]">{mockTickets.find(t=>t.id===ticket.id)?.orderId}</TableCell>
                  <TableCell className="font-bold text-[#31465A] text-sm">{ticket.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#31465A]/30 text-[#31465A] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {ticket.ticketCategoryName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'VALID' ? 'success' : ticket.status === 'USED' ? 'secondary' : 'destructive'} className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                        ticket.status === 'VALID' ? "bg-green-100 text-green-700" : ticket.status === 'USED' ? "bg-gray-100 text-[#7D8A95]" : "bg-red-100 text-red-700"
                      )}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">
                    {ticket.checkedInAt ? formatDate(ticket.checkedInAt) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
