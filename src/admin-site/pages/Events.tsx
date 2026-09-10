"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Button } from '@/admin-site/components/ui/Button';
import { Badge } from '@/admin-site/components/ui/Badge';
import { Plus, X } from 'lucide-react';
import { saveEvent } from '@/app/admin/actions/catalog';
import type { EventStatus } from '@/types/database';

export interface LiveAdminEvent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  doorsOpenAt: string | null;
  startsAt: string;
  endsAt: string | null;
  venueName: string;
  venueAddress: string | null;
  totalCapacity: number;
  ticketsSold: number;
  remaining: number;
  currency: string;
  status: EventStatus;
}

function localInputValue(iso: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function EventForm({ event, onClose }: { event?: LiveAdminEvent; onClose: () => void }) {
  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0E1721]">{event ? 'Edit Event' : 'Create Event'}</h2>
            <p className="text-xs text-[#7D8A95] mt-1">Changes here become the source of truth for the ticket catalogue.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#7D8A95] hover:text-[#0E1721]" aria-label="Close event form">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={saveEvent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="hidden" name="id" value={event?.id ?? ''} />

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Event name</span>
            <input name="name" required defaultValue={event?.name ?? ''} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Slug</span>
            <input name="slug" required defaultValue={event?.slug ?? 'swara-ranjana-2026'} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm font-mono" />
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-[#31465A]">Description</span>
            <textarea name="description" rows={3} defaultValue={event?.description ?? ''} className="w-full px-3 py-2 border border-[#C2CBD2]/60 rounded-md text-sm resize-y" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Doors open</span>
            <input type="datetime-local" name="doorsOpenAt" defaultValue={localInputValue(event?.doorsOpenAt ?? null)} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Starts</span>
            <input type="datetime-local" name="startsAt" required defaultValue={localInputValue(event?.startsAt ?? null)} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Ends</span>
            <input type="datetime-local" name="endsAt" defaultValue={localInputValue(event?.endsAt ?? null)} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Status</span>
            <select name="status" defaultValue={event?.status ?? 'DRAFT'} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm bg-white">
              {['DRAFT', 'ON_SALE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED'].map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Venue</span>
            <input name="venueName" required defaultValue={event?.venueName ?? ''} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Venue address</span>
            <input name="venueAddress" defaultValue={event?.venueAddress ?? ''} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Total capacity</span>
            <input type="number" min="0" name="totalCapacity" required defaultValue={event?.totalCapacity ?? 0} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Currency</span>
            <input name="currency" maxLength={3} defaultValue={event?.currency ?? 'LKR'} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm uppercase" />
          </label>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{event ? 'Save Changes' : 'Create Event'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Events({ events }: { events: LiveAdminEvent[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LiveAdminEvent | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Event Management</h1>
          <p className="text-sm text-[#7D8A95] mt-1">Live Supabase data • Asia/Colombo timezone</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => { setEditing(null); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {(showCreate || editing) && (
        <EventForm event={editing ?? undefined} onClose={() => { setShowCreate(false); setEditing(null); }} />
      )}

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
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-[#7D8A95]">
                    No events yet. Create Swara Ranjana 2026 to start the live ticket catalogue.
                  </TableCell>
                </TableRow>
              ) : events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{event.name}</span>
                      <span className="text-[11px] font-mono text-[#7D8A95]">/{event.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{new Date(event.startsAt).toLocaleDateString('en-LK', { timeZone: 'Asia/Colombo' })}</span>
                      <span className="text-[#7D8A95] text-xs">{new Date(event.startsAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Colombo' })}</span>
                    </div>
                  </TableCell>
                  <TableCell>{event.venueName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{event.ticketsSold} / {event.totalCapacity}</span>
                      <span className="text-xs text-[#7D8A95]">{event.remaining} remaining</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#2271B1] text-[#2271B1]">{event.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditing(event); }}>Edit</Button>
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
