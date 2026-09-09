"use client";

import React from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Input } from '@/admin-site/components/ui/Input';
import { mockCustomers } from '@/admin-site/data/mock-data';
import { formatCurrency, formatDate } from '@/admin-site/lib/utils';
import { Search } from 'lucide-react';

export default function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-normal text-[#31465A]">Customers</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D8A95]" />
          <Input 
            placeholder="Search by name, email or phone..." 
            className="pl-9 h-10 w-full"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Contact</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] text-center">Orders</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] text-center">Tickets</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] text-right">Total Spend</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Last Purchase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer border-b border-[#C2CBD2]/30 last:border-0 hover:bg-[#F8FAFB] transition-colors">
                  <TableCell className="font-bold text-[#31465A] text-sm">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">
                      <span>{customer.email}</span>
                      <span>{customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-[#31465A] text-sm">{customer.orders.length}</TableCell>
                  <TableCell className="text-center font-bold text-[#31465A] text-sm">{customer.ticketsPurchased}</TableCell>
                  <TableCell className="text-right font-bold text-[#2271B1] text-sm">{formatCurrency(customer.totalSpend)}</TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{formatDate(customer.lastPurchaseDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
