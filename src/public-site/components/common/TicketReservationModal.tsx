import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Calendar, MapPin, Clock, ShieldCheck, Ticket as TicketIcon, Sparkles } from 'lucide-react';
import { TICKET_TIERS, CONCERT_META } from '../../data/concertData';
import { TicketTier } from '../../types';
import type { LiveConcertMeta } from '@/lib/catalog/types';
import { SwaraRanjanaLogo } from './SwaraRanjanaLogo';
import { ButterflyArtwork } from './ButterflyArtwork';
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

  useEffect(() => {
    if (!isOpen) return;
    const nextTier = resolveTier();
    setSelectedTier(nextTier);
    setQuantity((current) => Math.min(current, Math.max(1, Math.min(nextTier.maxPerOrder ?? 6, nextTier.remainingSeats ?? 20))));
  }, [isOpen, initialTierId, tiers]);
  const [quantity, setQuantity] = useState(2);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequest: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const maxQuantity = Math.max(1, Math.min(selectedTier.maxPerOrder ?? 6, selectedTier.remainingSeats ?? 20));
  const quantityOptions = Array.from({ length: maxQuantity }, (_, index) => index + 1);
  const totalAmount = selectedTier.priceLKR * Math.min(quantity, maxQuantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="ticket-reservation-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1721]/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#FEFFFF] text-[#0E1721] max-w-4xl w-full rounded-sm overflow-hidden shadow-2xl my-6 border border-[#C2CBD2]/40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            id="ticket-modal-close-btn"
            onClick={resetAndClose}
            className="absolute top-5 right-5 z-20 p-2 text-[#0E1721]/70 hover:text-[#0E1721] bg-white/80 hover:bg-white rounded-full transition-all border border-black/5"
            aria-label="Close Reservation"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Order & Tier Selector Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-ink-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#2271B1]" />
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#31465A]">
                    Live Concert Seat Reservation
                  </span>
                </div>

                <h2 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light mb-2">
                  Reserve Your Seat
                </h2>
                <p className="text-xs text-[#7D8A95] font-light mb-6">
                  Select your preferred seating sanctuary for Swara Ranjana 2026.
                </p>

                {/* Tier Selection Radio-Cards */}
                <div className="space-y-3 mb-6">
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A]">
                    Select Seating Tier
                  </label>
                  {tiers.map((tier) => {
                    const isSelected = selectedTier.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          if (tier.availability === 'Sold Out') return;
                          setSelectedTier(tier);
                          setQuantity((current) => Math.min(current, Math.max(1, Math.min(tier.maxPerOrder ?? 6, tier.remainingSeats ?? 20))));
                        }}
                        className={`p-4 border rounded-sm transition-all duration-200 flex items-center justify-between ${tier.availability === 'Sold Out' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                          isSelected
                            ? 'border-[#2271B1] bg-[#2271B1]/5 shadow-sm'
                            : 'border-ink-10 hover:border-ink-20 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-[#0E1721]">
                              {tier.tierName}
                            </span>
                            {tier.recommended && (
                              <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#2271B1] text-white rounded-xs">
                                Preferred
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#7D8A95] mt-0.5">
                            {tier.seatingZone}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-semibold text-[#0E1721]">
                            LKR {tier.formattedPrice}
                          </span>
                          <span className="block text-[9px] text-[#7D8A95] uppercase tracking-wider">
                            per seat
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-2">
                    Number of Seats
                  </label>
                  <div className="flex items-center gap-3">
                    {quantityOptions.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuantity(num)}
                        className={`w-10 h-10 rounded-sm font-mono text-xs font-medium border transition-all ${
                          quantity === num
                            ? 'bg-[#0E1721] text-white border-[#0E1721]'
                            : 'bg-white text-[#31465A] border-ink-10 hover:border-[#0E1721]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Information Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Wickremesinghe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-10 rounded-sm focus:outline-none focus:border-[#2271B1] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your.email@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-10 rounded-sm focus:outline-none focus:border-[#2271B1] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-mono tracking-widest text-[#31465A] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+94 77 000 0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-10 rounded-sm focus:outline-none focus:border-[#2271B1] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    id="confirm-seat-reservation-submit-btn"
                    type="submit"
                    disabled={isSubmitting || selectedTier.availability === 'Sold Out'}
                    onMouseEnter={playHoverChime}
                    className="w-full mt-4 py-3.5 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs font-medium uppercase tracking-[0.25em] transition-colors rounded-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Allocating Sanctuary Seats...</span>
                    ) : (
                      <span>Proceed to Reservation Confirmation →</span>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-[#7D8A95] pt-1">
                    * Interactive demonstration. Instant reservation pass will be generated.
                  </p>
                </form>
              </div>

              {/* Right Order Summary & Pass Preview Column */}
              <div className="lg:col-span-5 bg-[#F7FAFC] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-4 border-b border-ink-10">
                    <SwaraRanjanaLogo size="sm" />
                    <span className="text-[10px] font-mono text-[#2271B1] tracking-widest">
                      2026 CONCERT
                    </span>
                  </div>

                  {/* Concert Summary Details */}
                  <div className="py-6 space-y-3 text-xs text-[#31465A]">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-[#2271B1] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-[#0E1721] block">
                          {meta.date}
                        </span>
                        <span className="text-[11px] text-[#7D8A95]">
                          Doors open {meta.doorsOpen} • Showtime 06:00 PM
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#2271B1] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-[#0E1721] block">
                          {meta.venue}
                        </span>
                        <span className="text-[11px] text-[#7D8A95]">
                          {meta.hall}, Colombo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-4 bg-white border border-ink-10 rounded-sm space-y-2 mb-6">
                    <div className="flex justify-between text-xs text-[#31465A]">
                      <span>{selectedTier.tierName} × {quantity}</span>
                      <span>LKR {(selectedTier.priceLKR * quantity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#31465A]">
                      <span>Hall Acoustic Surcharge</span>
                      <span className="text-emerald-700 font-mono">Complimentary</span>
                    </div>
                    <div className="pt-2 border-t border-ink-10 flex justify-between text-sm font-semibold text-[#0E1721]">
                      <span>Total</span>
                      <span className="font-mono text-[#2271B1]">
                        LKR {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Tier Benefits */}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#7D8A95] block mb-2">
                      Included Privileges
                    </span>
                    <ul className="space-y-1.5">
                      {selectedTier.benefits.map((b, i) => (
                        <li key={i} className="text-[11px] text-[#31465A] flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#2271B1] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Cropped Butterfly Wing Watermark */}
                <div className="absolute -bottom-16 -right-16 w-56 h-56 opacity-10 pointer-events-none">
                  <ButterflyArtwork variant="right-wing-hero" />
                </div>
              </div>
            </div>
          ) : (
            /* Reservation Success Pass View */
            <div className="p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#2271B1]/10 text-[#2271B1] flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6" />
                </div>

                <span className="text-[10px] font-mono text-[#2271B1] tracking-[0.3em] uppercase block mb-1">
                  Seat Reservation Confirmed
                </span>

                <h2 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light mb-3">
                  See you under the lights.
                </h2>

                <p className="text-xs sm:text-sm text-[#31465A] font-light mb-8">
                  Dear <strong className="text-[#0E1721]">{formData.fullName || 'Concert Patron'}</strong>, your seats in the{' '}
                  <strong className="text-[#2271B1]">{selectedTier.tierName}</strong> ({quantity} Seats) have been reserved for Swara Ranjana 2026. A digital pass has been sent to{' '}
                  <span className="underline">{formData.email || 'your email'}</span>.
                </p>

                {/* Digital Ticket Pass Card */}
                <div className="bg-[#0E1721] text-white p-6 rounded-sm text-left relative overflow-hidden shadow-xl mb-8 border border-white/10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <SwaraRanjanaLogo size="sm" theme="light" />
                      <span className="text-[9px] font-mono text-[#2271B1] tracking-widest block mt-1">
                        OFFICIAL CONCERT PASS
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-[#C2CBD2]">
                        SR26-{(Math.random() * 89999 + 10000).toFixed(0)}
                      </span>
                      <span className="block text-[9px] text-[#7D8A95] uppercase">
                        {quantity} {quantity === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-6 border-y border-white/10 py-3">
                    <div>
                      <span className="text-[9px] text-[#7D8A95] uppercase block">Seating Zone</span>
                      <span className="font-medium text-white">{selectedTier.tierName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#7D8A95] uppercase block">Date & Time</span>
                      <span className="font-medium text-white">28 Nov 2026 • 06:00 PM</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#C2CBD2]">
                    <span>Nelum Pokuna Main Symphony Hall</span>
                    <span className="font-mono text-[#2271B1]">CONFIRMED</span>
                  </div>

                  {/* Cropped Wing Accent on pass */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 opacity-25 pointer-events-none">
                    <ButterflyArtwork variant="right-wing-hero" />
                  </div>
                </div>

                <button
                  id="close-ticket-success-btn"
                  onClick={resetAndClose}
                  onMouseEnter={playHoverChime}
                  className="px-8 py-3 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.25em] transition-colors rounded-sm"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
