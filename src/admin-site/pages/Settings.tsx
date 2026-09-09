"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/admin-site/components/ui/Card';
import { Button } from '@/admin-site/components/ui/Button';
import { Input } from '@/admin-site/components/ui/Input';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl font-medium text-[#0E1721]">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <button className="w-full text-left px-4 py-2 text-sm font-medium bg-[#2271B1]/10 text-[#2271B1] rounded-lg">Event Settings</button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-[#7D8A95] hover:bg-[#F8FAFC] rounded-lg">Ticket Settings</button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-[#7D8A95] hover:bg-[#F8FAFC] rounded-lg">Email Configuration</button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-[#7D8A95] hover:bg-[#F8FAFC] rounded-lg">Payment Gateway</button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Defaults</CardTitle>
              <CardDescription>Configure standard details for the Swara Ranjana brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Name</label>
                <Input defaultValue="Swara Ranjana" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Email</label>
                <Input defaultValue="support@swararanjana.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Venue</label>
                <Input defaultValue="Lotus Arena" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Checkout Configuration</CardTitle>
              <CardDescription>Manage how customers purchase tickets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Tickets Per Order</label>
                <Input type="number" defaultValue="4" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reservation Timeout (Minutes)</label>
                <Input type="number" defaultValue="15" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t border-[#C2CBD2]">
            <Button>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
