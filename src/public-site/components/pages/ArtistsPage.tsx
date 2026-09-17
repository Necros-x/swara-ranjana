import React from 'react';
import { Artist } from '../../types';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';

interface ArtistsPageProps {
  onOpenArtistModal: (artist: Artist) => void;
  onOpenTicketsModal: () => void;
}

export const ArtistsPage: React.FC<ArtistsPageProps> = ({ onOpenTicketsModal }) => {
  return (
    <div id="artists-page-root" className="relative overflow-hidden pb-24 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute -right-24 top-10 h-[700px] w-[500px] opacity-10">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-16 max-w-3xl sm:mb-20">
          <SectionLabel label="Artist Line-up" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            THE<br />
            <span className="italic font-normal text-[#2271B1]">ARTISTS.</span>
          </EditorialHeading>

          <p className="text-base font-light leading-relaxed text-[#31465A] sm:text-lg font-serif">
            The official Swara Ranjana 2026 artist line-up is being finalized.
            Confirmed artist names, biographies and performance details will be
            published here once the programme team approves them.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-sm border border-[#C2CBD2]/60 bg-[#F9FBFC] p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 opacity-[0.08]">
            <ButterflyArtwork variant="right-wing-hero" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#2271B1]">
              Official announcement pending
            </span>
            <h2 className="font-gemola text-4xl font-light text-[#0E1721] sm:text-5xl">
              The stage is set. The names come next.
            </h2>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-[#31465A]">
              We are intentionally withholding preview names and biographies so
              the public site only presents confirmed performers. Ticket
              reservations remain available while the line-up announcement is
              prepared.
            </p>

            <button
              type="button"
              onClick={onOpenTicketsModal}
              className="mt-8 cursor-pointer rounded-sm bg-[#0E1721] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2271B1]"
            >
              Reserve Your Seat →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
