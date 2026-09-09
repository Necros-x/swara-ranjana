"use client";

import React from 'react';
import { Card, CardContent } from '@/admin-site/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin-site/components/ui/Table';
import { Button } from '@/admin-site/components/ui/Button';
import { Badge } from '@/admin-site/components/ui/Badge';
import { mockTicketCategories } from '@/admin-site/data/mock-data';
import { formatCurrency } from '@/admin-site/lib/utils';
import { Plus } from 'lucide-react';

export default function TicketTypes() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Ticket Categories</h1>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Sales Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTicketCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-[#7D8A95] max-w-[200px] truncate">{category.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(category.price)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{category.quantitySold} / {category.capacity}</span>
                      <span className="text-xs text-[#7D8A95]">{category.quantityRemaining} remaining</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-[#7D8A95]">
                      <span>Start: {new Date(category.saleStart).toLocaleDateString()}</span>
                      <span>End: {new Date(category.saleEnd).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.status === 'AVAILABLE' ? 'success' : 'outline'}>
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">Pause</Button>
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
