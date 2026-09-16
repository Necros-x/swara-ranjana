import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Check, MapPin, ShieldCheck, X } from 'lucide-react';
import { TICKET_TIERS, CONCERT_META } from '../../data/concertData';
import type { TicketTier } from '../../types';
import type { LiveConcertMeta } from '@/lib/catalog/types';
import { createCheckoutReservation } from '@/app/actions/checkout';
import type { CheckoutReservationSuccess } from '@/lib/checkout/types';
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
  const tiers = useMemo(
    () => (ticketTiers?.length ? ticketTiers : TICKET_TIERS),
    [ticketTiers],
  );
  const meta = concertMeta ?? CONCERT_META;

  const resolveTier = () => {
    const requested = tiers.find((tier) => tier.id === initialTierId);
    if (requested && requested.availability !== 'Sold Out') return requested;

    return (
      tiers.find((tier) => tier.recommended && tier.availability !== 'Sold Out') ??
      tiers.find((tier) => tier.availability !== 'Sold Out') ??
      tiers[0]
    );
  };

  const [selectedTier, setSelectedTier] = useState<TicketTier>(() => resolveTier());
  const [quantity, setQuantity] = useState(2);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequest: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [reservation, setReservation] = useState<CheckoutReservationSuccess | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const nextTier = resolveTier();
    setSelectedTier(nextTier);
    setQuantity((current) =>
      Math.min(
        current,
        Math.max(1, Math.min(nextTier.maxPerOrder ?? 6, nextTier.remainingSeats ?? 20)),
      ),
    );
    setSubmitError(null);
    setRequestId(null);
  }, [isOpen, initialTierId, tiers]);

  if (!isOpen || !selectedTier) return null;

  const maxQuantity = Math.max(
    1,
    Math.min(selectedTier.maxPerOrder ?? 6, selectedTier.remainingSeats ?? 20),
  );
  const safeQuantity = Math.min(quantity, maxQuantity);
  const quantityOptions = Array.from({ length: maxQuantity }, (_, index) => index + 1);
  const totalAmount = selectedTier.priceLKR * safeQuantity;
  const checkoutEnabled = Boolean(concertMeta?.id && ticketTiers?.length);

  const chooseTier = (tier: TicketTier) => {
    if (tier.availability === 'Sold Out') return;

    setSelectedTier(tier);
    setQuantity((current) =>
      Math.min(
        current,
        Math.max(1, Math.min(tier.maxPerOrder ?? 6, tier.remainingSeats ?? 20)),
      ),
    );
    setSubmitError(null);
    setRequestId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!checkoutEnabled || !concertMeta?.id) {
      setSubmitError(
        'Online ticket reservations are not available yet. Please refresh the page or try again later.',
      );
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
      });

      if (!result.ok) {
        setSubmitError(result.message);
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
    onClose();
  };

  const continueToPayment = () => {
    if (!reservation) return;

    router.push(
      `/payment/${encodeURIComponent(reservation.orderNumber)}?token=${encodeURIComponent(
        reservation.accessToken,
      )}`,
    );
    resetAndClose();
  };

  return (
    <AnimatePresence>
      <div
        id="ticket-reservation-overlay"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0E1721]/80 p-3 backdrop-blur-md sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.99 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-3 w-full max-w-4xl overflow-hidden border border-[#C2CBD2]/40 bg-[#FEFFFF] text-[#0E1721] shadow-2xl sm:my-6"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            id="ticket-modal-close-btn"
            type="button"
            onClick={resetAndClose}
            className="absolute right-4 top-4 z-30 cursor-pointer rounded-full border border-black/5 bg-white/90 p-2 text-[#0E1721]/70 transition hover:text-[#0E1721]"
            aria-label="Close reservation"
          >
            <X className="h-5 w-5" />
          </button>

          {!isSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="border-b border-ink-10 p-5 sm:p-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-10">
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#2271B1]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#31465A]">
                    Live Concert Reservation
                  </span>
                </div>

                <h2 className="font-gemola text-3xl font-light sm:text-4xl">
                  Reserve Your Seat
                </h2>
                <p className="mb-7 mt-2 text-xs font-light leading-relaxed text-[#7D8A95]">
                  Choose your ticket category and quantity. Seats are allocated automatically within the selected category.
                </p>

                <div className="mb-6 space-y-3">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#7D8A95]">
                    Ticket category
                  </span>

                  {tiers.map((tier) => {
                    const active = selectedTier.id === tier.id;

                    return (
                      <button
                        key={tier.id}
                        type="button"
                        disabled={tier.availability === 'Sold Out'}
                        onClick={() => chooseTier(tier)}
                        className={`flex w-full cursor-pointer items-center justify-between gap-4 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          active
                            ? 'border-[#2271B1] bg-[#2271B1]/5'
                            : 'border-ink-10 bg-white hover:border-[#2271B1]/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{tier.tierName}</span>
                            {tier.recommended && (
                              <span className="bg-[#2271B1] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="mt-1 block text-[10px] text-[#7D8A95]">
                            {tier.seatingZone}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="block font-mono text-sm font-semibold">
                            LKR {tier.formattedPrice}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-[#7D8A95]">
                            per ticket
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mb-6">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#7D8A95]">
                    Number of tickets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quantityOptions.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setQuantity(num);
                          setRequestId(null);
                          setSubmitError(null);
                        }}
                        className={`h-10 w-10 cursor-pointer border font-mono text-xs transition ${
                          quantity === num
                            ? 'border-[#0E1721] bg-[#0E1721] text-white'
                            : 'border-ink-10 bg-white hover:border-[#2271B1]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#31465A]">
                      Full Name *
                    </span>
                    <input
                      required
                      value={formData.fullName}
                      onChange={(event) => {
                        setFormData({ ...formData, fullName: event.target.value });
                        setRequestId(null);
                        setSubmitError(null);
                      }}
                      className="w-full border border-ink-10 px-3.5 py-2.5 text-xs outline-none transition focus:border-[#2271B1]"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#31465A]">
                        Email *
                      </span>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(event) => {
                          setFormData({ ...formData, email: event.target.value });
                          setRequestId(null);
                          setSubmitError(null);
                        }}
                        className="w-full border border-ink-10 px-3.5 py-2.5 text-xs outline-none transition focus:border-[#2271B1]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#31465A]">
                        Phone *
                      </span>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => {
                          setFormData({ ...formData, phone: event.target.value });
                          setRequestId(null);
                          setSubmitError(null);
                        }}
                        className="w-full border border-ink-10 px-3.5 py-2.5 text-xs outline-none transition focus:border-[#2271B1]"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#31465A]">
                      Special Request{' '}
                      <span className="normal-case tracking-normal text-[#7D8A95]">
                        (optional)
                      </span>
                    </span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Accessibility or booking notes"
                      value={formData.specialRequest}
                      onChange={(event) => {
                        setFormData({ ...formData, specialRequest: event.target.value });
                        setRequestId(null);
                        setSubmitError(null);
                      }}
                      className="w-full resize-none border border-ink-10 px-3.5 py-2.5 text-xs outline-none transition focus:border-[#2271B1]"
                    />
                  </label>

                  {submitError && (
                    <div
                      role="alert"
                      className="border border-red-200 bg-red-50 p-3 text-[11px] leading-relaxed text-red-700"
                    >
                      {submitError}
                    </div>
                  )}

                  <button
                    id="confirm-seat-reservation-submit-btn"
                    type="submit"
                    disabled={
                      isSubmitting ||
                      selectedTier.availability === 'Sold Out' ||
                      !checkoutEnabled
                    }
                    onMouseEnter={playHoverChime}
                    className="flex w-full cursor-pointer items-center justify-center bg-[#0E1721] py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#2271B1] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting ? 'Securing reservation…' : 'Hold Tickets & Continue →'}
                  </button>

                  <p className="text-center text-[10px] text-[#7D8A95]">
                    Your reservation is held for 10 minutes. Tickets are issued only after payment is verified.
                  </p>
                </form>
              </div>

              <aside className="relative bg-[#F7FAFC] p-6 sm:p-8 lg:col-span-5">
                <div className="flex items-center justify-between border-b border-ink-10 pb-4">
                  <SwaraRanjanaLogo size="sm" />
                  <span className="font-mono text-[9px] tracking-widest text-[#2271B1]">
                    2026 CONCERT
                  </span>
                </div>

                <div className="space-y-4 py-6 text-xs text-[#31465A]">
                  <div className="flex gap-2.5">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
                    <div>
                      <span className="block font-medium text-[#0E1721]">{meta.date}</span>
                      <span className="text-[11px] text-[#7D8A95]">Doors {meta.doorsOpen}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
                    <div>
                      <span className="block font-medium text-[#0E1721]">{meta.venue}</span>
                      <span className="text-[11px] text-[#7D8A95]">{meta.city}</span>
                    </div>
                  </div>
                </div>

                <div className="border-y border-ink-10 py-5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7D8A95]">
                      {selectedTier.tierName} × {safeQuantity}
                    </span>
                    <span className="font-mono">
                      LKR {totalAmount.toLocaleString('en-LK')}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between border-t border-ink-10 pt-4">
                    <span className="text-xs font-medium">Total</span>
                    <span className="font-mono text-xl">
                      LKR {totalAmount.toLocaleString('en-LK')}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border border-[#2271B1]/20 bg-white p-4 text-[11px] leading-relaxed text-[#5F6D79]">
                  <ShieldCheck className="mb-2 h-4 w-4 text-[#2271B1]" />
                  Seats are allocated automatically from the available inventory in your selected ticket category.
                </div>
              </aside>
            </div>
          ) : (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-gemola text-4xl">Reservation held.</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#7D8A95]">
                Reservation{' '}
                <strong className="text-[#0E1721]">{reservation?.orderNumber}</strong>{' '}
                is secured for 10 minutes. Continue to payment to complete the reservation.
              </p>

              <div className="mx-auto mt-7 max-w-md border border-ink-10 bg-[#F8FAFB] p-5">
                <div className="flex items-center justify-between gap-4 text-xs text-[#7D8A95]">
                  <span>Total</span>
                  <span className="font-mono text-lg font-semibold text-[#0E1721]">
                    {reservation?.currency} {reservation?.totalLkr.toLocaleString('en-LK')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={continueToPayment}
                className="mt-7 cursor-pointer bg-[#0E1721] px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#2271B1]"
              >
                Continue to payment →
              </button>

              <p className="mt-4 text-[10px] text-[#7D8A95]">
                A reservation email has also been sent to the address you provided.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
