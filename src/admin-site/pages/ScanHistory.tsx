"use client";

import React from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Input } from '@/admin-site/components/ui/Input';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockScanLogs } from '@/admin-site/data/mock-data';
import { formatDate } from '@/admin-site/lib/utils';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/admin-site/components/ui/Button';

export default function ScanHistory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-normal text-[#31465A]">Scan History</h1>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D8A95]" />
          <Input 
            placeholder="Search by ticket number or customer name..." 
            className="pl-9 h-10 w-full lg:max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-10 rounded-md border border-[#C2CBD2]/30 bg-white px-3 py-1 text-sm text-[#31465A] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#2271B1]">
            <option value="">All Results</option>
            <option value="ADMITTED">Admitted</option>
            <option value="DUPLICATE">Duplicate</option>
            <option value="INVALID">Invalid</option>
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
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Timestamp</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Ticket</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Result</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Staff & Gate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockScanLogs.map((log) => (
                <TableRow key={log.id} className="border-b border-[#C2CBD2]/30 last:border-0 hover:bg-[#F8FAFB] transition-colors">
                  <TableCell className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{formatDate(log.timestamp)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-[#2271B1]">{log.ticketNumber}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-0.5">{log.ticketCategoryName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-[#31465A] text-sm">{log.customerName}</TableCell>
                  <TableCell>
                    <Badge variant={
                      log.result === 'ADMITTED' ? 'success' : 
                      log.result === 'DUPLICATE' ? 'warning' : 'destructive'
                    } className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none">
                      {log.result}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#31465A]">{log.staffName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-0.5">{log.gate}</span>
                    </div>
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
