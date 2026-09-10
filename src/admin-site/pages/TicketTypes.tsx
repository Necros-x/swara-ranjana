"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Button } from '@/admin-site/components/ui/Button';
import { Badge } from '@/admin-site/components/ui/Badge';
import { formatCurrency } from '@/admin-site/lib/utils';
import { Plus, X } from 'lucide-react';
import { saveTicketType, setTicketTypeStatus } from '@/app/admin/actions/catalog';
import type { TicketTypeStatus } from '@/types/database';

export interface TicketTypeEventOption {
  id: string;
  name: string;
}

export interface LiveAdminTicketType {
  id: string;
  eventId: string;
  eventName: string;
  code: string;
  name: string;
  description: string | null;
  seatingZone: string | null;
  priceLkr: number;
  capacity: number;
  quantitySold: number;
  quantityRemaining: number;
  maxPerOrder: number;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  status: TicketTypeStatus;
  sortOrder: number;
  benefits: string[];
  recommended: boolean;
}

function localInputValue(iso: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Colombo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function TicketTypeForm({
  ticketType,
  events,
  onClose,
}: {
  ticketType?: LiveAdminTicketType;
  events: TicketTypeEventOption[];
  onClose: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0E1721]">{ticketType ? 'Edit Ticket Type' : 'Create Ticket Type'}</h2>
            <p className="text-xs text-[#7D8A95] mt-1">Available ticket types are exposed to the public ticket page when the event is on sale.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#7D8A95] hover:text-[#0E1721]" aria-label="Close ticket type form">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={saveTicketType} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="hidden" name="id" value={ticketType?.id ?? ''} />

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Event</span>
            <select name="eventId" required defaultValue={ticketType?.eventId ?? events[0]?.id ?? ''} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm bg-white">
              <option value="" disabled>Select event</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Code</span>
            <input name="code" required placeholder="GENERAL" defaultValue={ticketType?.code ?? ''} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm font-mono uppercase" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Display name</span>
            <input name="name" required defaultValue={ticketType?.name ?? ''} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Seating zone</span>
            <input name="seatingZone" defaultValue={ticketType?.seatingZone ?? ''} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-[#31465A]">Short description</span>
            <textarea name="description" rows={2} defaultValue={ticketType?.description ?? ''} className="w-full px-3 py-2 border border-[#C2CBD2]/60 rounded-md text-sm resize-y" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Price (LKR)</span>
            <input type="number" min="0" name="priceLkr" required defaultValue={ticketType?.priceLkr ?? 0} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Capacity</span>
            <input type="number" min="0" name="capacity" required defaultValue={ticketType?.capacity ?? 0} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Max per order</span>
            <input type="number" min="1" max="20" name="maxPerOrder" required defaultValue={ticketType?.maxPerOrder ?? 6} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Sort order</span>
            <input type="number" min="0" name="sortOrder" defaultValue={ticketType?.sortOrder ?? 0} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Sales start</span>
            <input type="datetime-local" name="saleStartsAt" defaultValue={localInputValue(ticketType?.saleStartsAt ?? null)} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Sales end</span>
            <input type="datetime-local" name="saleEndsAt" defaultValue={localInputValue(ticketType?.saleEndsAt ?? null)} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm" />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#31465A]">Status</span>
            <select name="status" defaultValue={ticketType?.status ?? 'DRAFT'} className="w-full h-10 px-3 border border-[#C2CBD2]/60 rounded-md text-sm bg-white">
              {['DRAFT', 'AVAILABLE', 'PAUSED', 'SOLD_OUT'].map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-3 self-end h-10">
            <input type="checkbox" name="recommended" defaultChecked={ticketType?.recommended ?? false} className="w-4 h-4" />
            <span className="text-sm text-[#31465A]">Recommended / featured tier</span>
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-[#31465A]">Benefits — one per line</span>
            <textarea name="benefits" rows={5} defaultValue={ticketType?.benefits.join('\n') ?? ''} className="w-full px-3 py-2 border border-[#C2CBD2]/60 rounded-md text-sm resize-y" />
          </label>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{ticketType ? 'Save Changes' : 'Create Ticket Type'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function TicketTypes({
  ticketTypes,
  events,
}: {
  ticketTypes: LiveAdminTicketType[];
  events: TicketTypeEventOption[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LiveAdminTicketType | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Ticket Categories</h1>
          <p className="text-sm text-[#7D8A95] mt-1">Live inventory and public catalogue settings</p>
        </div>
        <Button disabled={events.length === 0} className="w-full sm:w-auto" onClick={() => { setEditing(null); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Category
        </Button>
      </div>

      {events.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create an event first, then add its ticket categories.
        </div>
      )}

      {(showCreate || editing) && (
        <TicketTypeForm ticketType={editing ?? undefined} events={events} onClose={() => { setShowCreate(false); setEditing(null); }} />
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Sales Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-[#7D8A95]">No ticket categories yet.</TableCell>
                </TableRow>
              ) : ticketTypes.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-[#7D8A95]">{category.code} • {category.seatingZone || 'No zone set'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{category.eventName}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(category.priceLkr)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{category.quantitySold} / {category.capacity}</span>
                      <span className="text-xs text-[#7D8A95]">{category.quantityRemaining} remaining</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-[#7D8A95]">
                      <span>Start: {category.saleStartsAt ? new Date(category.saleStartsAt).toLocaleDateString('en-LK') : 'Any time'}</span>
                      <span>End: {category.saleEndsAt ? new Date(category.saleEndsAt).toLocaleDateString('en-LK') : 'No end'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.status === 'AVAILABLE' ? 'success' : 'outline'}>{category.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <form action={setTicketTypeStatus}>
                        <input type="hidden" name="id" value={category.id} />
                        <input type="hidden" name="status" value={category.status === 'PAUSED' ? 'AVAILABLE' : 'PAUSED'} />
                        <Button type="submit" variant="outline" size="sm">
                          {category.status === 'PAUSED' ? 'Resume' : 'Pause'}
                        </Button>
                      </form>
                      <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditing(category); }}>Edit</Button>
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
