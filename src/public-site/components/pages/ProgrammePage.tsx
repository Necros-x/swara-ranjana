import React from 'react';
import { CONCERT_META } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ProgrammePageProps {
  onOpenTicketsModal: () => void;
}

export const ProgrammePage: React.FC<ProgrammePageProps> = ({ onOpenTicketsModal }) => {
  return (
    <div id="programme-page-root" className="relative overflow-hidden pb-24 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[700px] w-[550px] opacity-10">
        <ButterflyArtwork variant="left-wing" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <SectionLabel label="Evening Programme" align="center" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            THE<br />
            <span className="italic font-normal text-[#2271B1]">PROGRAMME.</span>
          </EditorialHeading>

          <p className="text-base font-light leading-relaxed text-[#31465A] sm:text-lg font-serif">
            The detailed Swara Ranjana 2026 running order is being finalized.
            Act titles, performers, durations and intermission details will be
            published only after they are officially confirmed.
          </p>

          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-sm border border-ink-10 bg-[#F4F7F9] px-6 py-3 font-mono text-xs text-[#31465A]">
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#2271B1]" />
              {CONCERT_META.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#2271B1]" />
              Doors Open {CONCERT_META.doorsOpen}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#2271B1]" />
              {CONCERT_META.hall}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-sm border border-[#C2CBD2]/60 bg-[#0E1721] p-8 text-white sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 opacity-20">
            <ButterflyArtwork variant="right-wing-hero" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#62B6F3]">
              Schedule announcement pending
            </span>
            <h2 className="font-gemola text-4xl font-light sm:text-5xl">
              A complete running order will appear here.
            </h2>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-[#C2CBD2]">
              Until the programme is locked, we are keeping draft act names,
              performer assignments and timing details off the public website.
              Confirmed event date, doors-open time and venue remain shown above.
            </p>

            <button
              type="button"
              onClick={onOpenTicketsModal}
              className="mt-8 cursor-pointer rounded-sm bg-white px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#0E1721] transition-colors hover:bg-[#2271B1] hover:text-white"
            >
              Reserve Your Seat →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
