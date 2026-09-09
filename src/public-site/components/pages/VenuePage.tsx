import React from 'react';
import { motion } from 'motion/react';
import { CONCERT_META } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { MapPin, Navigation, Car, Shirt, Accessibility, Clock, Phone, ExternalLink } from 'lucide-react';

interface VenuePageProps {
  onOpenTicketsModal: () => void;
}

export const VenuePage: React.FC<VenuePageProps> = ({ onOpenTicketsModal }) => {
  return (
    <div id="venue-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Background Wing Crop */}
      <div className="absolute top-10 -right-20 w-[450px] h-[650px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* ========================================================================= */}
        {/* HERO                                                                      */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <SectionLabel label="Architectural Stage" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            THE<br />
            <span className="italic font-normal text-[#2271B1]">VENUE.</span>
          </EditorialHeading>

          <p className="text-base sm:text-lg text-[#31465A] font-light leading-relaxed font-serif">
            Nelum Pokuna Mahinda Rajapaksa Theatre — Sri Lanka’s monumental performing arts jewel, blending ancient hydraulic aesthetic geometry with world-class 21st-century symphonic acoustics.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* VENUE HERO PHOTOGRAPHY & SPECS                                            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-24">
          <div className="lg:col-span-7 relative overflow-hidden rounded-sm bg-[#0E1721] aspect-[16/10] shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=85"
              alt="Nelum Pokuna Performing Arts Theatre"
              className="w-full h-full object-cover grayscale contrast-110 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] font-mono text-[#2271B1] tracking-widest uppercase block mb-1">
                Colosseum of Fine Arts
              </span>
              <h3 className="font-gemola text-2xl sm:text-3xl font-light">
                Lotus Pond Auditorium
              </h3>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-[#F9FBFC] border border-ink-10 rounded-sm">
              <h4 className="font-gemola text-2xl text-[#0E1721] font-light mb-2">
                Acoustic Architecture
              </h4>
              <p className="text-xs text-[#31465A] font-light leading-relaxed">
                The auditorium features floating acoustic baffles and curved timber wall cladding calibrated to provide a natural reverberation time of 1.6 seconds — ideal for South Asian classical strings and vocals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 border border-ink-10 rounded-sm">
                <span className="text-[10px] text-[#7D8A95] uppercase block">Location</span>
                <span className="font-semibold text-[#0E1721]">Colombo 07</span>
              </div>
              <div className="p-4 border border-ink-10 rounded-sm">
                <span className="text-[10px] text-[#7D8A95] uppercase block">Climate</span>
                <span className="font-semibold text-[#0E1721]">21°C Controlled</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GUEST LOGISTICS (4-Column Grid)                                          */}
        {/* ========================================================================= */}
        <div className="py-16 border-t border-ink-10">
          <SectionLabel label="Visitor Guidelines" number="02" className="mb-4" />
          <EditorialHeading size="md" className="mb-12">
            Arrival & Hospitality
          </EditorialHeading>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Arrival & Doors */}
            <div className="p-6 bg-[#FEFFFF] border border-ink-10 rounded-sm">
              <Clock className="w-5 h-5 text-[#2271B1] mb-3" />
              <h4 className="font-medium text-sm text-[#0E1721] mb-2">Schedule & Doors</h4>
              <p className="text-xs text-[#7D8A95] font-light leading-relaxed">
                Foyer and cocktail reception opens at <strong>05:00 PM</strong>. Main hall doors open at <strong>05:30 PM</strong>. Prompt curtain rise at <strong>06:00 PM</strong>.
              </p>
            </div>

            {/* Dress Code */}
            <div className="p-6 bg-[#FEFFFF] border border-ink-10 rounded-sm">
              <Shirt className="w-5 h-5 text-[#2271B1] mb-3" />
              <h4 className="font-medium text-sm text-[#0E1721] mb-2">Editorial Dress Code</h4>
              <p className="text-xs text-[#7D8A95] font-light leading-relaxed">
                Formal Evening Attire / Contemporary High-Fashion / Traditional South Asian Elegance (Sari / Sherwani / Tuxedo).
              </p>
            </div>

            {/* Parking & Valet */}
            <div className="p-6 bg-[#FEFFFF] border border-ink-10 rounded-sm">
              <Car className="w-5 h-5 text-[#2271B1] mb-3" />
              <h4 className="font-medium text-sm text-[#0E1721] mb-2">Parking & Valet</h4>
              <p className="text-xs text-[#7D8A95] font-light leading-relaxed">
                Complimentary subterranean secure parking for 500+ vehicles. Dedicated VIP Valet Drop-off at the West Portico.
              </p>
            </div>

            {/* Accessibility */}
            <div className="p-6 bg-[#FEFFFF] border border-ink-10 rounded-sm">
              <Accessibility className="w-5 h-5 text-[#2271B1] mb-3" />
              <h4 className="font-medium text-sm text-[#0E1721] mb-2">Accessibility</h4>
              <p className="text-xs text-[#7D8A95] font-light leading-relaxed">
                Step-free elevator access from basement parking to all auditorium levels. Dedicated companion seating available.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LOCATION MAP SECTION                                                      */}
        {/* ========================================================================= */}
        <div className="py-16 border-t border-ink-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#2271B1] block mb-2">
                Coordinates & Directions
              </span>
              <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light mb-4">
                In the Heart of Cinnamon Gardens
              </h3>
              <p className="text-xs sm:text-sm text-[#31465A] font-light leading-relaxed mb-6">
                Situated opposite Viharamahadevi Park and adjacent to the Colombo National Museum, Nelum Pokuna is accessible via Ananda Coomaraswamy Mawatha.
              </p>
              <div className="space-y-2 text-xs font-mono text-[#0E1721] mb-6">
                <p><strong>ADDRESS:</strong> 110 Ananda Coomaraswamy Mawatha, Colombo 00700</p>
                <p><strong>COORDINATES:</strong> 6.9118° N, 79.8643° E</p>
              </div>
              <a
                href="https://maps.google.com/?q=Nelum+Pokuna+Mahinda+Rajapaksa+Theatre"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-sm"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="lg:col-span-6 bg-[#0E1721] text-white p-8 rounded-sm relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-mono tracking-widest text-[#2271B1] uppercase block mb-1">
                  Concierge Assistance
                </span>
                <h4 className="font-gemola text-2xl font-light mb-3">
                  Need directions on the evening?
                </h4>
                <p className="text-xs text-[#C2CBD2] font-light leading-relaxed mb-6">
                  Our front-of-house team is available to guide patrons regarding gate access, VIP entrances, and parking routes.
                </p>
                <p className="font-mono text-sm text-[#2271B1]">
                  +94 11 268 9000
                </p>
              </div>

              <div className="absolute -bottom-10 -right-10 w-44 h-44 opacity-20 pointer-events-none">
                <ButterflyArtwork variant="right-wing-hero" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
