import React from "react";
import { CONCERT_META } from "../../data/concertData";
import { SectionLabel } from "../common/SectionLabel";
import { EditorialHeading } from "../common/EditorialHeading";
import { ButterflyArtwork } from "../common/ButterflyArtwork";
import {
  Accessibility,
  Clock,
  ExternalLink,
  MapPin,
  QrCode,
  Armchair,
} from "lucide-react";

interface VenuePageProps {
  onOpenTicketsModal: () => void;
}

export const VenuePage: React.FC<VenuePageProps> = ({ onOpenTicketsModal }) => {
  return (
    <div
      id="venue-page-root"
      className="relative overflow-hidden pb-24 pt-28 sm:pt-36"
    >
      <div className="pointer-events-none absolute -right-20 top-10 h-[650px] w-[450px] opacity-10">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-16 max-w-3xl sm:mb-20">
          <SectionLabel
            label="The Auditorium"
            number="01"
            className="mb-4"
          />

          <EditorialHeading size="giant" className="mb-6">
            THE
            <br />
            <span className="font-normal italic text-[#2271B1]">VENUE.</span>
          </EditorialHeading>

          <p className="text-base font-light leading-relaxed text-[#31465A] sm:text-lg">
            Swara Ranjana 2026 will be presented at {CONCERT_META.venue} in
            Polgolla, Kandy, Sri Lanka. The physical seating plan contains 1,120
            seats across the ODC and Balcony sections.
          </p>
        </div>

        <div className="mb-24 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="relative min-h-[420px] overflow-hidden rounded-sm bg-[#0E1721] text-white shadow-xl lg:col-span-7">
            <div className="pointer-events-none absolute -bottom-24 -right-10 h-[520px] w-[520px] opacity-[0.16]">
              <ButterflyArtwork variant="right-wing-hero" />
            </div>

            <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between p-8 sm:p-10">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#62B6F3]">
                  Swara Ranjana 2026
                </span>
                <h2 className="mt-5 max-w-xl font-gemola text-4xl font-light leading-[0.95] sm:text-6xl">
                  Mahinda Rajapaksha Auditorium
                </h2>
                <p className="mt-4 text-sm font-light text-white/60">
                  Polgolla · Kandy · Sri Lanka
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/15 pt-6 font-mono text-xs sm:grid-cols-4">
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-white/45">
                    Capacity
                  </span>
                  <strong className="mt-1 block text-base text-white">1,120</strong>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-white/45">
                    ODC
                  </span>
                  <strong className="mt-1 block text-base text-white">713</strong>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-white/45">
                    Balcony
                  </span>
                  <strong className="mt-1 block text-base text-white">407</strong>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-white/45">
                    Blocks
                  </span>
                  <strong className="mt-1 block text-base text-white">A–H</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-sm border border-ink-10 bg-[#F9FBFC] p-6">
              <h4 className="mb-2 font-gemola text-2xl font-light text-[#0E1721]">
                Auditorium plan
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#31465A]">
                Ticket categories map to the auditorium blocks, while exact
                physical seats are allocated automatically by the reservation
                system. Guests choose a ticket category and quantity rather than
                an individual seat.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="rounded-sm border border-ink-10 p-4">
                <span className="block text-[10px] uppercase text-[#7D8A95]">
                  Location
                </span>
                <span className="font-semibold text-[#0E1721]">
                  Polgolla, Kandy
                </span>
              </div>
              <div className="rounded-sm border border-ink-10 p-4">
                <span className="block text-[10px] uppercase text-[#7D8A95]">
                  Doors
                </span>
                <span className="font-semibold text-[#0E1721]">
                  {CONCERT_META.doorsOpen}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-10 py-16">
          <SectionLabel
            label="Visitor Guidelines"
            number="02"
            className="mb-4"
          />
          <EditorialHeading size="md" className="mb-12">
            Arrival & Admission
          </EditorialHeading>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-sm border border-ink-10 bg-[#FEFFFF] p-6">
              <Clock className="mb-3 h-5 w-5 text-[#2271B1]" />
              <h4 className="mb-2 text-sm font-medium text-[#0E1721]">
                Schedule & Doors
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#7D8A95]">
                Main hall doors open at <strong>{CONCERT_META.doorsOpen}</strong>.
                Showtime is scheduled for <strong>06:00 PM</strong>.
              </p>
            </div>

            <div className="rounded-sm border border-ink-10 bg-[#FEFFFF] p-6">
              <QrCode className="mb-3 h-5 w-5 text-[#2271B1]" />
              <h4 className="mb-2 text-sm font-medium text-[#0E1721]">
                Digital Admission
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#7D8A95]">
                Keep the QR code on each digital ticket private and ready to scan
                at the gate. Pay-on-arrival reservations must be paid before
                admission.
              </p>
            </div>

            <div className="rounded-sm border border-ink-10 bg-[#FEFFFF] p-6">
              <Armchair className="mb-3 h-5 w-5 text-[#2271B1]" />
              <h4 className="mb-2 text-sm font-medium text-[#0E1721]">
                Seating
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#7D8A95]">
                Your physical seat is assigned automatically within the blocks
                mapped to your ticket category. The assigned seat is shown on
                the issued ticket.
              </p>
            </div>

            <div className="rounded-sm border border-ink-10 bg-[#FEFFFF] p-6">
              <Accessibility className="mb-3 h-5 w-5 text-[#2271B1]" />
              <h4 className="mb-2 text-sm font-medium text-[#0E1721]">
                Access & Parking
              </h4>
              <p className="text-xs font-light leading-relaxed text-[#7D8A95]">
                Final accessibility, parking and drop-off guidance will be
                published after the arrangements with the venue are confirmed.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-10 py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#2271B1]">
                Location & Directions
              </span>
              <h3 className="mb-4 font-gemola text-3xl font-light text-[#0E1721] sm:text-4xl">
                Polgolla, Kandy
              </h3>
              <p className="mb-6 text-xs font-light leading-relaxed text-[#31465A] sm:text-sm">
                The event venue is Mahinda Rajapaksha Auditorium, Polgolla,
                Kandy, Sri Lanka. Use the map search below for the latest routing
                information from your current location.
              </p>

              <div className="mb-6 flex items-start gap-3 border-l-2 border-[#2271B1] bg-[#2271B1]/5 px-4 py-3 text-xs text-[#31465A]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
                <span>Mahinda Rajapaksha Auditorium, Polgolla, Kandy, Sri Lanka</span>
              </div>

              <a
                href="https://maps.google.com/?q=Mahinda+Rajapaksha+Auditorium+Polgolla+Kandy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-[#0E1721] px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2271B1]"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="relative overflow-hidden rounded-sm bg-[#0E1721] p-8 text-white lg:col-span-6">
              <div className="relative z-10">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-[#62B6F3]">
                  Event Assistance
                </span>
                <h4 className="mb-3 font-gemola text-2xl font-light">
                  Need help before the evening?
                </h4>
                <p className="text-xs font-light leading-relaxed text-[#C2CBD2]">
                  Official event contact details and final arrival instructions
                  will be published here once they are confirmed. No placeholder
                  phone number or email address is used for guest support.
                </p>
              </div>

              <div className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 opacity-20">
                <ButterflyArtwork variant="right-wing-hero" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-10 pt-12 text-center">
          <p className="mx-auto max-w-xl text-sm font-light leading-relaxed text-[#31465A]">
            Ready to reserve? Choose your ticket category and the system will
            allocate an available physical seat automatically.
          </p>
          <button
            type="button"
            onClick={onOpenTicketsModal}
            className="mt-6 cursor-pointer rounded-sm bg-[#0E1721] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2271B1]"
          >
            Reserve tickets
          </button>
        </div>
      </div>
    </div>
  );
};
