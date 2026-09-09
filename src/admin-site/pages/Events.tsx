"use client";

import React from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Button } from '@/admin-site/components/ui/Button';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockEvents } from '@/admin-site/data/mock-data';
import { formatDate } from '@/admin-site/lib/utils';
import { Plus } from 'lucide-react';

export default function Events() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Event Management</h1>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{formatDate(event.date).split(',')[0]}</span>
                      <span className="text-[#7D8A95] text-xs">Doors: {event.doorsOpenTime} | Start: {event.startTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{event.ticketsSold} / {event.totalCapacity}</span>
                      <span className="text-xs text-[#7D8A95]">{event.remaining} remaining</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#2271B1] text-[#2271B1]">
                      {event.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
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
