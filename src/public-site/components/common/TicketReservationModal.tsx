import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Check, MapPin, ShieldCheck, X } from 'lucide-react';
import { TICKET_TIERS, CONCERT_META } from '../../data/concertData';
import type { TicketTier } from '../../types';
import type { LiveConcertMeta } from '@/lib/catalog/types';
import { createCheckoutReservation, getCheckoutSeatMap } from '@/app/actions/checkout';
import type { CheckoutReservationSuccess } from '@/lib/checkout/types';
import type { PublicSeat, PublicSeatBlock, PublicSeatMap, SeatSelectionMode } from '@/lib/seating/types';
import { AuditoriumSeatMap } from '../tickets/AuditoriumSeatMap';
import { SwaraRanjanaLogo } from './SwaraRanjanaLogo';
import { playHoverChime } from '../../lib/audioInteraction';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTierId?: string;
  ticketTiers?: TicketTier[];
  concertMeta?: LiveConcertMeta;
}

export const TicketReservationModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  initialTierId,
  ticketTiers,
  concertMeta,
}) => {
  const router = useRouter();
  const tiers = useMemo(() => (ticketTiers?.length ? ticketTiers : TICKET_TIERS), [ticketTiers]);
  const meta = concertMeta ?? CONCERT_META;
  const resolveTier = () => tiers.find((tier) => tier.id === initialTierId && tier.availability !== 'Sold Out') ?? tiers.find((tier) => tier.recommended && tier.availability !== 'Sold Out') ?? tiers.find((tier) => tier.availability !== 'Sold Out') ?? tiers[0];

  const [selectedTier, setSelectedTier] = useState<TicketTier>(() => resolveTier());
  const [quantity, setQuantity] = useState(2);
  const [selectionMode, setSelectionMode] = useState<SeatSelectionMode>('RANDOM');
  const [seatMap, setSeatMap] = useState<PublicSeatMap | null>(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', specialRequest: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [reservation, setReservation] = useState<CheckoutReservationSuccess | null>(null);

  const maxQuantity = Math.max(1, Math.min(selectedTier?.maxPerOrder ?? 6, selectedTier?.remainingSeats ?? 20));
  const safeQuantity = Math.min(quantity, maxQuantity);
  const checkoutEnabled = Boolean(concertMeta?.id && ticketTiers?.length);

  useEffect(() => {
    if (!isOpen) return;
    const nextTier = resolveTier();
    setSelectedTier(nextTier);
    setQuantity((current) => Math.min(current, Math.max(1, Math.min(nextTier.maxPerOrder ?? 6, nextTier.remainingSeats ?? 20))));
    setSelectionMode('RANDOM');
    setSelectedSeatIds([]);
    setSeatMap(null);
    setSubmitError(null);
    setRequestId(null);
  }, [isOpen, initialTierId, tiers]);

  useEffect(() => {
    if (!isOpen || selectionMode !== 'MANUAL' || !concertMeta?.id || !selectedTier?.id) return;
    let cancelled = false;
    setSeatMapLoading(true);
    void getCheckoutSeatMap(concertMeta.id, selectedTier.id).then((map) => {
      if (!cancelled) {
        setSeatMap(map);
        setSeatMapLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [isOpen, selectionMode, concertMeta?.id, selectedTier?.id]);

  if (!isOpen || !selectedTier) return null;

  const quantityOptions = Array.from({ length: maxQuantity }, (_, index) => index + 1);
  const selectedSeats = seatMap?.blocks.flatMap((block) => block.seats).filter((seat) => selectedSeatIds.includes(seat.id)) ?? [];
  const selectionFee = selectionMode === 'MANUAL' ? selectedSeats.reduce((sum, seat) => sum + seat.manualFeeLkr, 0) : 0;
  const totalAmount = selectedTier.priceLKR * safeQuantity + selectionFee;

  const toggleSeat = (seat: PublicSeat, block: PublicSeatBlock) => {
    if (block.ticketTypeId !== selectedTier.id || seat.status !== 'AVAILABLE') return;
    setSubmitError(null);
    setRequestId(null);
    setSelectedSeatIds((current) => {
      if (current.includes(seat.id)) return current.filter((id) => id !== seat.id);
      if (current.length >= safeQuantity) return current;
      return [...current, seat.id];
    });
  };

  const chooseTier = (tier: TicketTier) => {
    if (tier.availability === 'Sold Out') return;
    setSelectedTier(tier);
    setSelectedSeatIds([]);
    setSeatMap(null);
    setRequestId(null);
    setSubmitError(null);
    setQuantity((current) => Math.min(current, Math.max(1, Math.min(tier.maxPerOrder ?? 6, tier.remainingSeats ?? 20))));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!checkoutEnabled || !concertMeta?.id) {
      setSubmitError('Online ticket reservations are not available yet. Please refresh and try again.');
      return;
    }
    if (selectionMode === 'MANUAL' && selectedSeatIds.length !== safeQuantity) {
      setSubmitError(`Select exactly ${safeQuantity} seat${safeQuantity === 1 ? '' : 's'} on the auditorium map.`);
      return;
    }

    const nextRequestId = requestId ?? crypto.randomUUID();
    if (!requestId) setRequestId(nextRequestId);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await createCheckoutReservation({
        eventId: concertMeta.id,
        ticketTypeId: selectedTier.id,
        quantity: safeQuantity,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.specialRequest,
        requestId: nextRequestId,
        selectionMode,
        selectedSeatIds: selectionMode === 'MANUAL' ? selectedSeatIds : undefined,
      });

      if (!result.ok) {
        setSubmitError(result.message);
        if (result.code === 'SEAT_UNAVAILABLE' && selectionMode === 'MANUAL') {
          const refreshed = await getCheckoutSeatMap(concertMeta.id, selectedTier.id);
          setSeatMap(refreshed);
          setSelectedSeatIds([]);
          setRequestId(null);
        }
        return;
      }

      setReservation(result);
      setQuantity(result.quantity ?? safeQuantity);
      setIsSubmitted(true);
    } catch {
      setSubmitError('The reservation request was interrupted. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setIsSubmitting(false);
    setSubmitError(null);
    setRequestId(null);
    setReservation(null);
    setSelectedSeatIds([]);
    onClose();
  };

  const continueToPayment = () => {
    if (!reservation) return;
    router.push(`/payment/${encodeURIComponent(reservation.orderNumber)}?token=${encodeURIComponent(reservation.accessToken)}`);
    resetAndClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0E1721]/80 p-3 backdrop-blur-md sm:p-6" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .99 }}
          className="relative my-3 w-full max-w-6xl overflow-hidden border border-[#C2CBD2]/40 bg-[#FEFFFF] text-[#0E1721] shadow-2xl sm:my-6"
          onClick={(event) => event.stopPropagation()}
        >
          <button onClick={resetAndClose} className="absolute right-4 top-4 z-30 rounded-full border border-black/5 bg-white/90 p-2 text-[#0E1721]/70 hover:text-[#0E1721]" aria-label="Close reservation"><X className="h-5 w-5"/></button>

          {!isSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_360px]">
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="mb-2 flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-[#2271B1]"/><span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#31465A]">Live Concert Seat Reservation</span></div>
                <h2 className="font-gemola text-3xl font-light sm:text-4xl">Reserve Your Seat</h2>
                <p className="mb-7 mt-2 text-xs font-light text-[#7D8A95]">Mahinda Rajapaksha Auditorium, Polgolla · conducted by St. Sylvester&apos;s College, Kandy.</p>

                <div className="mb-6 grid gap-3 md:grid-cols-3">
                  {tiers.map((tier) => {
                    const active = selectedTier.id === tier.id;
                    return <button key={tier.id} type="button" disabled={tier.availability === 'Sold Out'} onClick={() => chooseTier(tier)} className={`border p-4 text-left transition ${active ? 'border-[#2271B1] bg-[#2271B1]/5' : 'border-ink-10 bg-white hover:border-[#2271B1]/50'} disabled:cursor-not-allowed disabled:opacity-40`}>
                      <span className="block text-sm font-medium">{tier.tierName}</span><span className="mt-1 block text-[10px] text-[#7D8A95]">{tier.seatingZone}</span><span className="mt-3 block font-mono text-xs font-semibold">LKR {tier.formattedPrice}</span>
                    </button>;
                  })}
                </div>

                <div className="mb-6">
                  <span className="mb-2 block text-[10px] font-mono uppercase tracking-[.18em] text-[#7D8A95]">Number of seats</span>
                  <div className="flex flex-wrap gap-2">{quantityOptions.map((num) => <button key={num} type="button" onClick={() => { setQuantity(num); setSelectedSeatIds([]); setRequestId(null); }} className={`h-10 w-10 border font-mono text-xs ${quantity === num ? 'border-[#0E1721] bg-[#0E1721] text-white' : 'border-ink-10 bg-white hover:border-[#2271B1]'}`}>{num}</button>)}</div>
                </div>

                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => { setSelectionMode('RANDOM'); setSelectedSeatIds([]); setRequestId(null); }} className={`border p-4 text-left transition ${selectionMode === 'RANDOM' ? 'border-[#2271B1] bg-[#2271B1]/5' : 'border-ink-10'}`}>
                    <span className="block text-sm font-semibold">Random assignment</span><span className="mt-1 block text-[11px] leading-relaxed text-[#7D8A95]">No extra fee. We secure available seats from your ticket category.</span>
                  </button>
                  <button type="button" onClick={() => { setSelectionMode('MANUAL'); setSelectedSeatIds([]); setRequestId(null); }} className={`border p-4 text-left transition ${selectionMode === 'MANUAL' ? 'border-[#2271B1] bg-[#2271B1]/5' : 'border-ink-10'}`}>
                    <span className="block text-sm font-semibold">Choose exact seats</span><span className="mt-1 block text-[11px] leading-relaxed text-[#7D8A95]">Seat-specific fee is shown in the map and added before checkout.</span>
                  </button>
                </div>

                {selectionMode === 'MANUAL' && (
                  <div className="mb-7 border border-ink-10 bg-[#F9FBFC] p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><span className="block text-sm font-semibold">Select {safeQuantity} seat{safeQuantity === 1 ? '' : 's'}</span><span className="text-[10px] text-[#7D8A95]">{selectedSeatIds.length}/{safeQuantity} selected</span></div><span className="font-mono text-xs text-[#2271B1]">Selection fee: LKR {selectionFee.toLocaleString('en-LK')}</span></div>
                    {seatMapLoading ? <div className="py-16 text-center text-xs text-[#7D8A95]">Loading live seat availability…</div> : seatMap ? <AuditoriumSeatMap compact seatMap={seatMap} ticketTypeId={selectedTier.id} selectedSeatIds={selectedSeatIds} onSeatToggle={toggleSeat} selectionLimit={safeQuantity}/> : <div className="border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">Live seat availability could not be loaded. Use random assignment or retry.</div>}
                    {selectedSeats.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{selectedSeats.map((seat) => <span key={seat.id} className="border border-[#2271B1]/30 bg-white px-2.5 py-1 font-mono text-[10px] text-[#31465A]">{seat.label} · +LKR {seat.manualFeeLkr.toLocaleString('en-LK')}</span>)}</div>}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block"><span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-[#31465A]">Full Name *</span><input required value={formData.fullName} onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setRequestId(null); }} className="w-full border border-ink-10 px-3.5 py-2.5 text-xs outline-none focus:border-[#2271B1]"/></label>
                    <label className="block"><span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-[#31465A]">Email *</span><input required type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setRequestId(null); }} className="w-full border border-ink-10 px-3.5 py-2.5 text-xs outline-none focus:border-[#2271B1]"/></label>
                  </div>
                  <label className="block"><span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-[#31465A]">Phone *</span><input required type="tel" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setRequestId(null); }} className="w-full border border-ink-10 px-3.5 py-2.5 text-xs outline-none focus:border-[#2271B1]"/></label>
                  <label className="block"><span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-[#31465A]">Special Request <span className="normal-case tracking-normal text-[#7D8A95]">(optional)</span></span><textarea rows={3} maxLength={500} value={formData.specialRequest} onChange={(e) => { setFormData({ ...formData, specialRequest: e.target.value }); setRequestId(null); }} className="w-full resize-none border border-ink-10 px-3.5 py-2.5 text-xs outline-none focus:border-[#2271B1]"/></label>
                  {submitError && <div className="border border-red-200 bg-red-50 p-3 text-[11px] leading-relaxed text-red-700">{submitError}</div>}
                  <button id="confirm-seat-reservation-submit-btn" type="submit" disabled={isSubmitting || selectedTier.availability === 'Sold Out' || !checkoutEnabled || (selectionMode === 'MANUAL' && selectedSeatIds.length !== safeQuantity)} onMouseEnter={playHoverChime} className="flex w-full items-center justify-center bg-[#0E1721] py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#2271B1] disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? 'Securing your seats…' : 'Hold Seats & Continue →'}</button>
                  <p className="text-center text-[10px] text-[#7D8A95]">Exact seats are held atomically for 10 minutes. Tickets are issued only after payment is verified.</p>
                </form>
              </div>

              <aside className="relative border-t border-ink-10 bg-[#F7FAFC] p-6 lg:border-l lg:border-t-0 lg:p-8">
                <div className="flex items-center justify-between border-b border-ink-10 pb-4"><SwaraRanjanaLogo size="sm"/><span className="font-mono text-[9px] tracking-widest text-[#2271B1]">2026 CONCERT</span></div>
                <div className="space-y-4 py-6 text-xs text-[#31465A]">
                  <div className="flex gap-2.5"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]"/><div><span className="block font-medium text-[#0E1721]">{meta.date}</span><span className="text-[11px] text-[#7D8A95]">Doors {meta.doorsOpen}</span></div></div>
                  <div className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]"/><div><span className="block font-medium text-[#0E1721]">{meta.venue}</span><span className="text-[11px] text-[#7D8A95]">{meta.city}</span></div></div>
                </div>
                <div className="border-y border-ink-10 py-5">
                  <div className="flex justify-between text-xs"><span className="text-[#7D8A95]">{selectedTier.tierName} × {safeQuantity}</span><span className="font-mono">LKR {(selectedTier.priceLKR * safeQuantity).toLocaleString('en-LK')}</span></div>
                  <div className="mt-2 flex justify-between text-xs"><span className="text-[#7D8A95]">Seat selection</span><span className="font-mono">{selectionMode === 'RANDOM' ? 'FREE' : `LKR ${selectionFee.toLocaleString('en-LK')}`}</span></div>
                  <div className="mt-4 flex items-end justify-between border-t border-ink-10 pt-4"><span className="text-xs font-medium">Estimated total</span><span className="font-mono text-xl">LKR {totalAmount.toLocaleString('en-LK')}</span></div>
                </div>
                <div className="mt-6 border border-[#2271B1]/20 bg-white p-4 text-[11px] leading-relaxed text-[#5F6D79]"><ShieldCheck className="mb-2 h-4 w-4 text-[#2271B1]"/>Random assignment has no seat-selection fee. Manual fees are temporary configurable values managed by the Swara Ranjana admin team.</div>
              </aside>
            </div>
          ) : (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="h-6 w-6"/></div>
              <h2 className="mt-5 font-gemola text-4xl">Seats held.</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#7D8A95]">Reservation <strong className="text-[#0E1721]">{reservation?.orderNumber}</strong> is secured for 10 minutes. {reservation?.selectionMode === 'RANDOM' ? 'Your seats were assigned automatically with no selection fee.' : 'Your exact selected seats are locked for this reservation.'}</p>
              {reservation?.selectedSeats?.length ? <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">{reservation.selectedSeats.map((seat) => <span key={seat.id} className="border border-[#C2CBD2] bg-[#F8FAFB] px-3 py-1.5 font-mono text-xs">{seat.label}</span>)}</div> : null}
              <div className="mx-auto mt-7 max-w-md border border-ink-10 bg-[#F8FAFB] p-5"><div className="flex justify-between text-xs text-[#7D8A95]"><span>Total</span><span className="font-mono text-lg font-semibold text-[#0E1721]">{reservation?.currency} {reservation?.totalLkr.toLocaleString('en-LK')}</span></div></div>
              <button onClick={continueToPayment} className="mt-7 bg-[#0E1721] px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#2271B1]">Continue to payment →</button>
              <p className="mt-4 text-[10px] text-[#7D8A95]">A reservation email has also been sent to the address you provided.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
