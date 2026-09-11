import React from 'react';
import { TICKET_TIERS, CONCERT_META } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { AuditoriumSeatMap } from '../tickets/AuditoriumSeatMap';
import { playHoverChime } from '../../lib/audioInteraction';
import { Check } from 'lucide-react';
import type { TicketTier } from '../../types';
import type { LiveConcertMeta } from '@/lib/catalog/types';

interface TicketsPageProps {
  onOpenTicketsModal: (tierId?: string) => void;
  ticketTiers?: TicketTier[];
  concertMeta?: LiveConcertMeta;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({ onOpenTicketsModal, ticketTiers, concertMeta }) => {
  const tiers = ticketTiers?.length ? ticketTiers : TICKET_TIERS;
  const meta = concertMeta ?? CONCERT_META;

  return (
    <div id="tickets-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      <div className="absolute top-10 -right-20 w-[450px] h-[650px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mb-16 sm:mb-20">
          <SectionLabel label="Seat Sanctuary" number="01" className="mb-4" />
          <EditorialHeading size="giant" className="mb-6">
            YOUR SEAT<br /><span className="italic font-normal text-[#2271B1]">AWAITS.</span>
          </EditorialHeading>
          <p className="text-base sm:text-lg text-[#31465A] font-light leading-relaxed font-serif mb-8">
            Choose your ticket category, then let us assign seats at no extra cost or select exact seats from the real auditorium plan for a small seat-specific selection fee.
          </p>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-mono text-[#31465A] border-l-2 border-[#2271B1] pl-4">
            <span className="font-semibold text-[#0E1721]">{meta.date}</span><span>•</span><span>{meta.doorsOpen} Doors</span><span>•</span><span>{meta.hall}</span>
          </div>
        </div>

        <div className="border-t border-ink-10 divide-y divide-ink-10 mb-20">
          {tiers.map((tier) => (
            <div key={tier.id} className="py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:bg-black/[0.015] transition-colors px-2 sm:px-4">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light">{tier.tierName}</h3>
                  {tier.recommended && <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#2271B1] text-white rounded-xs">Recommended</span>}
                </div>
                <p className="text-xs font-mono text-[#7D8A95] tracking-wider uppercase mt-1">{tier.seatingZone}</p>
                <p className="text-xs text-[#31465A] font-light leading-relaxed mt-3 max-w-sm">{tier.subtitle}</p>
              </div>

              <div className="lg:col-span-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#7D8A95] block mb-2">Included Privileges</span>
                <ul className="space-y-1.5 text-xs text-[#31465A] font-light">
                  {tier.benefits.map((benefit, index) => <li key={index} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#2271B1] shrink-0 mt-0.5"/><span>{benefit}</span></li>)}
                </ul>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
                <div className="text-left lg:text-right">
                  <span className="font-mono text-2xl sm:text-3xl font-light text-[#0E1721] block">LKR {tier.formattedPrice}</span>
                  <span className="text-[10px] font-mono text-[#7D8A95] uppercase tracking-wider">{tier.availability}</span>
                </div>
                <button
                  onClick={() => tier.availability !== 'Sold Out' && onOpenTicketsModal(tier.id)}
                  onMouseEnter={tier.availability !== 'Sold Out' ? playHoverChime : undefined}
                  disabled={tier.availability === 'Sold Out'}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0E1721] hover:bg-[#2271B1] disabled:bg-[#C2CBD2] disabled:cursor-not-allowed text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 rounded-sm shadow-sm"
                >
                  {tier.availability === 'Sold Out' ? 'Sold Out' : 'Select & Reserve →'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <section id="auditorium-geometry" className="p-5 sm:p-8 lg:p-12 border border-ink-10 bg-[#F9FBFC] rounded-sm mb-20 scroll-mt-28">
          <SectionLabel label="Auditorium Geometry" number="02" className="mb-4" />
          <EditorialHeading size="md" className="mb-3">Hall Seating Map</EditorialHeading>
          <p className="mb-8 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#7D8A95]">
            Row-accurate geometry from the official Mahinda Rajapaksha Auditorium, Polgolla seating plan: 713 ODC seats and 407 balcony seats, 1,120 total.
          </p>
          <AuditoriumSeatMap />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-ink-10 text-xs text-[#31465A] font-light">
          <div><h4 className="font-medium text-[#0E1721] text-sm mb-2">Random assignment · no fee</h4><p className="leading-relaxed">Choose your ticket category and we will assign available seats from its blocks with no seat-selection surcharge.</p></div>
          <div><h4 className="font-medium text-[#0E1721] text-sm mb-2">Choose exact seats</h4><p className="leading-relaxed">Open the reservation flow to pick exact available seats. The fee is shown per seat before the hold is created.</p></div>
          <div><h4 className="font-medium text-[#0E1721] text-sm mb-2">Accessibility</h4><p className="leading-relaxed">For wheelchair access, companion seating, or another seating requirement, contact Swara Ranjana before completing the reservation.</p></div>
        </div>
      </div>
    </div>
  );
};
