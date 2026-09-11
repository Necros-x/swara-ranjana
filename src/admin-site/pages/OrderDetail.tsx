"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/admin-site/components/ui/Card';
import { Badge } from '@/admin-site/components/ui/Badge';
import { formatCurrency, formatDate } from '@/admin-site/lib/utils';
import { ArrowLeft, Clock3, CreditCard, FileText, Ticket as TicketIcon } from 'lucide-react';
import type { AdminOrderDetailData } from '@/lib/admin/orders';
import { reviewBankSlip } from '@/app/actions/payment';

function paymentClass(status: AdminOrderDetailData['paymentStatus']) {
  if (status === 'PAID') return 'border-green-500 text-green-700';
  if (status === 'FAILED') return 'border-red-400 text-red-700';
  if (status.includes('REFUNDED')) return 'border-amber-400 text-amber-700';
  return 'border-[#C2CBD2] text-[#31465A]';
}

export default function OrderDetail({ order }: { order: AdminOrderDetailData }) {
  const [reviewReason, setReviewReason] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewPending, startReview] = useTransition();
  const reviewSlip = (approve: boolean) => startReview(async () => {
    if (!order.paymentSubmission) return;
    const result = await reviewBankSlip(order.paymentSubmission.id, approve, reviewReason);
    if (!result.ok) setReviewMessage(result.message || 'Unable to review payment slip.');
    else window.location.reload();
  });
  const holdExpired = order.orderStatus === 'PENDING' && order.expiresAt
    ? new Date(order.expiresAt).getTime() <= Date.now()
    : false;
  const slipIsImage = !!order.paymentSubmission?.originalFilename.match(
    /\.(jpe?g|png|webp)$/i,
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 rounded-full hover:bg-[#C2CBD2]/20 text-[#7D8A95] hover:text-[#0E1721] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-medium text-[#0E1721]">Order {order.orderNumber}</h1>
            <Badge variant="outline">{holdExpired ? 'EXPIRED HOLD' : order.orderStatus}</Badge>
          </div>
          <p className="text-sm text-[#7D8A95]">Created {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="border border-[#C2CBD2]/60 rounded-lg p-4 flex items-center justify-between gap-5">
                    <div>
                      <div className="font-medium text-[#31465A]">{item.ticketTypeName}</div>
                      <div className="text-xs text-[#7D8A95] mt-1">{item.quantity} × {formatCurrency(item.unitPrice, order.currency)}</div>
                    </div>
                    <div className="font-medium text-[#0E1721]">{formatCurrency(item.totalPrice, order.currency)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-[#C2CBD2] flex justify-between items-center text-lg">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatCurrency(order.total, order.currency)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><TicketIcon className="w-4 h-4" /> Admission Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {!order.tickets.length ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-[#31465A]">No admission tickets issued yet.</p>
                  <p className="text-xs text-[#7D8A95] mt-1">This is expected for an unpaid Phase 3 reservation. QR tickets are issued only after verified payment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {order.tickets.map((ticket) => (
                    <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="block border border-[#C2CBD2] rounded-lg p-4 hover:border-[#2271B1] transition-colors">
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <div className="font-medium text-[#2271B1]">{ticket.ticketNumber}</div>
                          <div className="text-sm text-[#31465A]">{ticket.ticketTypeName}</div>
                        </div>
                        <Badge variant={ticket.status === 'VALID' ? 'success' : ticket.status === 'USED' ? 'secondary' : 'destructive'}>{ticket.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Customer</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div><div className="text-[#7D8A95] text-xs uppercase tracking-wider mb-1">Name</div><div className="font-medium">{order.customerName}</div></div>
              <div><div className="text-[#7D8A95] text-xs uppercase tracking-wider mb-1">Email</div><a href={`mailto:${order.customerEmail}`} className="text-[#2271B1] hover:underline">{order.customerEmail || '—'}</a></div>
              <div><div className="text-[#7D8A95] text-xs uppercase tracking-wider mb-1">Phone</div><div>{order.customerPhone || '—'}</div></div>
              {order.notes && <div><div className="text-[#7D8A95] text-xs uppercase tracking-wider mb-1">Booking notes</div><div>{order.notes}</div></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#7D8A95]" /><span className="font-medium">{order.paymentMethod?.replaceAll('_', ' ') || order.paymentProvider || 'Awaiting payment method'}</span></div>
              <Badge variant="outline" className={paymentClass(order.paymentStatus)}>Payment {order.paymentStatus.replaceAll('_', ' ')}</Badge>
              {order.paymentReference && <div className="text-xs text-[#7D8A95]">Ref: <span className="font-mono text-[#31465A]">{order.paymentReference}</span></div>}
              {order.paidAt && <div className="text-xs text-[#7D8A95]">Paid {formatDate(order.paidAt)}</div>}
              {order.paymentSubmission && (
                <div className="pt-4 mt-4 border-t border-[#C2CBD2]/60 space-y-3">
                  <div className="text-xs font-semibold text-[#31465A]">Bank slip: {order.paymentSubmission.status}</div>
                  {order.paymentSubmission.signedUrl && (
                    <a
                      href={order.paymentSubmission.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group block overflow-hidden rounded-md border border-[#C2CBD2]/70 bg-[#F8FAFB] transition hover:border-[#2271B1]"
                      title="Open uploaded slip"
                    >
                      {slipIsImage ? (
                        <img
                          src={order.paymentSubmission.signedUrl}
                          alt="Uploaded bank transfer slip"
                          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-32 flex-col items-center justify-center gap-2 bg-[#F3F6F8] text-[#31465A]">
                          <FileText className="h-8 w-8 text-[#2271B1]" />
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                            PDF payment slip
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 border-t border-[#C2CBD2]/50 px-3 py-2">
                        <span className="truncate text-[10px] text-[#7D8A95]">
                          {order.paymentSubmission.originalFilename}
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2271B1]">
                          Open ↗
                        </span>
                      </div>
                    </a>
                  )}
                  {order.paymentSubmission.status === 'PENDING' && (
                    <>
                      <textarea value={reviewReason} onChange={(e) => setReviewReason(e.target.value)} placeholder="Reason if rejecting (optional)" className="w-full min-h-20 border border-[#C2CBD2] rounded-md p-2 text-xs" />
                      <div className="grid grid-cols-2 gap-2">
                        <button disabled={reviewPending} onClick={() => reviewSlip(true)} className="px-3 py-2 bg-emerald-600 text-white text-xs rounded-md disabled:opacity-50">Approve</button>
                        <button disabled={reviewPending} onClick={() => reviewSlip(false)} className="px-3 py-2 bg-red-600 text-white text-xs rounded-md disabled:opacity-50">Reject</button>
                      </div>
                      {reviewMessage && <p className="text-xs text-red-600">{reviewMessage}</p>}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {order.expiresAt && order.orderStatus === 'PENDING' && (
            <Card>
              <CardContent className="p-5 flex gap-3">
                <Clock3 className="w-4 h-4 text-[#2271B1] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#31465A]">Checkout hold</div>
                  <div className="text-xs text-[#7D8A95] mt-1">{holdExpired ? 'Expired' : `Reserved until ${formatDate(order.expiresAt)}`}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
