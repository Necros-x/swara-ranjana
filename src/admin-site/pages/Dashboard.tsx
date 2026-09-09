"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockEvents, mockTicketCategories, mockOrders, mockScanLogs } from '@/admin-site/data/mock-data';
import { formatCurrency, formatDate, cn } from '@/admin-site/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const salesData = [
  { name: 'Aug 22', sales: 400 },
  { name: 'Aug 23', sales: 300 },
  { name: 'Aug 24', sales: 550 },
  { name: 'Aug 25', sales: 700 },
  { name: 'Aug 26', sales: 900 },
  { name: 'Aug 27', sales: 1200 },
  { name: 'Aug 28', sales: 1500 },
];

export default function Dashboard() {
  const event = mockEvents[0];
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0) * 1000; // Simulated multiplier
  const checkedIn = 450;
  
  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#31465A] mb-1">{event.name}</h2>
          <p className="text-sm text-[#7D8A95]">
            {formatDate(event.date).split(',')[0]} • {event.venue}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge className="bg-[#2271B1] text-white border-none px-3 py-1 text-sm uppercase tracking-wider font-semibold">
            {event.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95] mb-2">Total Revenue</CardDescription>
            <CardTitle className="font-serif text-4xl text-[#31465A] font-normal">{formatCurrency(totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] font-bold uppercase tracking-wider text-green-600 flex items-center mt-2">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              12% FROM YESTERDAY
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95] mb-2">Tickets Sold</CardDescription>
            <CardTitle className="font-serif text-4xl text-[#31465A] font-normal">{event.ticketsSold.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-2">
              {event.remaining.toLocaleString()} remaining of {event.totalCapacity.toLocaleString()}
            </div>
            <div className="w-full bg-[#F8FAFB] border border-[#C2CBD2]/30 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-[#2271B1] h-1.5 rounded-full" style={{ width: `${(event.ticketsSold / event.totalCapacity) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95] mb-2">Total Orders</CardDescription>
            <CardTitle className="font-serif text-4xl text-[#31465A] font-normal">1,245</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-2">
              Avg. 2.8 tickets per order
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#7D8A95] mb-2">Checked In</CardDescription>
            <CardTitle className="font-serif text-4xl text-[#31465A] font-normal">{checkedIn.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-2">
              {(event.ticketsSold - checkedIn).toLocaleString()} not yet checked in
            </div>
            <div className="w-full bg-[#F8FAFB] border border-[#C2CBD2]/30 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(checkedIn / event.ticketsSold) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7D8A95', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7D8A95', fontSize: 12 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #C2CBD2', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#2271B1" strokeWidth={3} dot={{ r: 4, fill: '#2271B1' }} activeDot={{ r: 6, fill: '#2271B1', stroke: '#FEFFFF', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mockTicketCategories.map(category => {
              const percentage = Math.round((category.quantitySold / category.capacity) * 100);
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-[#31465A]">{category.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{percentage}% Sold</span>
                  </div>
                  <div className="w-full bg-[#F8FAFB] border border-[#C2CBD2]/30 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#2271B1] h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">
                    <span>{category.quantitySold} sold</span>
                    <span>{category.quantityRemaining} left</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Order</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Customer</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map(order => (
                  <TableRow key={order.id} className="border-b border-[#C2CBD2]/30 last:border-0 hover:bg-[#F8FAFB] transition-colors">
                    <TableCell className="font-bold text-[#2271B1] text-xs">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#31465A] text-sm">{order.customerName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-0.5">{order.ticketQuantity} tickets</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#31465A] text-sm">{formatCurrency(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Entry Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal text-[#31465A]">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Ticket</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Result</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Gate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockScanLogs.map(log => (
                  <TableRow key={log.id} className="border-b border-[#C2CBD2]/30 last:border-0 hover:bg-[#F8FAFB] transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-[#31465A]">{log.ticketNumber}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95] mt-0.5">{formatDate(log.timestamp).split(',')[1]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.result === 'ADMITTED' ? 'success' : 'destructive'} className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                        log.result === 'ADMITTED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {log.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">{log.gate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
