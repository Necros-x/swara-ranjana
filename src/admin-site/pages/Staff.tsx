"use client";

import React from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Button } from '@/admin-site/components/ui/Button';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockStaff } from '@/admin-site/data/mock-data';
import { formatDate } from '@/admin-site/lib/utils';
import { Plus } from 'lucide-react';

export default function Staff() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Staff Management</h1>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Invite Staff
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{staff.name}</span>
                      <span className="text-xs text-[#7D8A95]">{staff.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#31465A] text-[#31465A] bg-[#31465A]/5">
                      {staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#7D8A95]">
                    {formatDate(staff.lastActive)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">Edit Role</Button>
                    {staff.role !== 'SUPER_ADMIN' && (
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Disable</Button>
                    )}
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
