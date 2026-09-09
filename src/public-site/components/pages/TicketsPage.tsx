import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TICKET_TIERS, CONCERT_META } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { playHoverChime } from '../../lib/audioInteraction';
import { Check, ShieldCheck, Ticket as TicketIcon, Calendar, Clock, MapPin, HelpCircle } from 'lucide-react';

interface TicketsPageProps {
  onOpenTicketsModal: (tierId?: string) => void;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({ onOpenTicketsModal }) => {
  const [selectedSeatingPreview, setSelectedSeatingPreview] = useState<string>('tier-premium');

  return (
    <div id="tickets-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Background Wing Crop */}
      <div className="absolute top-10 -right-20 w-[450px] h-[650px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* ========================================================================= */}
        {/* HERO                                                                      */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <SectionLabel label="Seat Sanctuary" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            YOUR SEAT<br />
            <span className="italic font-normal text-[#2271B1]">AWAITS.</span>
          </EditorialHeading>

          <p className="text-base sm:text-lg text-[#31465A] font-light leading-relaxed font-serif mb-8">
            An intentionally intimate hall capacity designed so that every seat experiences uncompromised acoustic fidelity and direct line-of-sight to the stage.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-mono text-[#31465A] border-l-2 border-[#2271B1] pl-4">
            <span className="font-semibold text-[#0E1721]">{CONCERT_META.date}</span>
            <span>•</span>
            <span>{CONCERT_META.doorsOpen} Doors</span>
            <span>•</span>
            <span>{CONCERT_META.hall}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EDITORIAL TICKET TIERS TABLE                                              */}
        {/* ========================================================================= */}
        <div className="border-t border-ink-10 divide-y divide-ink-10 mb-20">
          {TICKET_TIERS.map((tier) => {
            return (
              <div
                key={tier.id}
                className="py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:bg-black/[0.015] transition-colors px-2 sm:px-4"
              >
                {/* Col 1: Tier Name & Zone */}
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light">
                      {tier.tierName}
                    </h3>
                    {tier.recommended && (
                      <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#2271B1] text-white rounded-xs">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-mono text-[#7D8A95] tracking-wider uppercase mt-1">
                    {tier.seatingZone}
                  </p>

                  <p className="text-xs text-[#31465A] font-light leading-relaxed mt-3 max-w-sm">
                    {tier.subtitle}
                  </p>
                </div>

                {/* Col 2: Benefits List */}
                <div className="lg:col-span-4">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#7D8A95] block mb-2">
                    Included Privileges
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#31465A] font-light">
                    {tier.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#2271B1] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 3: Price & Action */}
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
                  <div className="text-left lg:text-right">
                    <span className="font-mono text-2xl sm:text-3xl font-light text-[#0E1721] block">
                      LKR {tier.formattedPrice}
                    </span>
                    <span className="text-[10px] font-mono text-[#7D8A95] uppercase tracking-wider">
                      {tier.availability}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenTicketsModal(tier.id)}
                    onMouseEnter={playHoverChime}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 rounded-sm shadow-sm"
                  >
                    Select & Reserve →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SEATING PLAN VISUAL SCHEMATIC                                            */}
        {/* ========================================================================= */}
        <div className="p-8 sm:p-12 border border-ink-10 bg-[#F9FBFC] rounded-sm mb-20">
          <SectionLabel label="Auditorium Geometry" number="02" className="mb-4" />
          <EditorialHeading size="md" className="mb-8">
            Hall Seating Map
          </EditorialHeading>

          {/* Interactive Visual Stage Schematic */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Stage Box */}
            <div className="py-4 bg-[#0E1721] text-white rounded-t-xl tracking-[0.3em] font-mono text-xs uppercase shadow-md">
              ✦ SYMPHONIC ORCHESTRA STAGE ✦
            </div>

            {/* Diamond Stalls / Royal Box (VIP) */}
            <div
              onClick={() => setSelectedSeatingPreview('tier-vip')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedSeatingPreview === 'tier-vip'
                  ? 'border-[#2271B1] bg-[#2271B1]/10 shadow-md'
                  : 'border-ink-20 hover:border-[#2271B1] bg-white'
              }`}
            >
              <span className="font-mono text-xs font-semibold text-[#0E1721] uppercase block mb-1">
                ROYAL BOX & DIAMOND STALLS (Rows A – H)
              </span>
              <p className="text-[11px] text-[#7D8A95]">
                Direct acoustic sweet spot • Dedicated VIP Red Carpet Entrance & Valet
              </p>
            </div>

            {/* Grand Tier Stalls (Premium) */}
            <div
              onClick={() => setSelectedSeatingPreview('tier-premium')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedSeatingPreview === 'tier-premium'
                  ? 'border-[#2271B1] bg-[#2271B1]/10 shadow-md'
                  : 'border-ink-20 hover:border-[#2271B1] bg-white'
              }`}
            >
              <span className="font-mono text-xs font-semibold text-[#0E1721] uppercase block mb-1">
                GRAND TIER STALLS (Rows J – R)
              </span>
              <p className="text-[11px] text-[#7D8A95]">
                Elevated sightlines • Optimal chamber acoustic resonance
              </p>
            </div>

            {/* Balcony Sanctuary (General) */}
            <div
              onClick={() => setSelectedSeatingPreview('tier-general')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedSeatingPreview === 'tier-general'
                  ? 'border-[#2271B1] bg-[#2271B1]/10 shadow-md'
                  : 'border-ink-20 hover:border-[#2271B1] bg-white'
              }`}
            >
              <span className="font-mono text-xs font-semibold text-[#0E1721] uppercase block mb-1">
                BALCONY SANCTUARY (Circle & Balcony)
              </span>
              <p className="text-[11px] text-[#7D8A95]">
                Panoramic auditorium vantage point • Comprehensive audio immersion
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOOKING ASSISTANCE & CONCIERGE                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-ink-10 text-xs text-[#31465A] font-light">
          <div>
            <h4 className="font-medium text-[#0E1721] text-sm mb-2">Instant Digital Pass</h4>
            <p className="leading-relaxed">
              Upon reservation confirmation, your high-resolution digital pass with unique verification ID is issued immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#0E1721] text-sm mb-2">Corporate & Patron Enquiries</h4>
            <p className="leading-relaxed">
              For corporate box reservations of 6+ guests or private reception arrangements, contact concierge@swararanjana.lk.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#0E1721] text-sm mb-2">Accessibility Seating</h4>
            <p className="leading-relaxed">
              Dedicated wheelchair access and companion spaces are situated on the Ground Stalls tier with elevator service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
