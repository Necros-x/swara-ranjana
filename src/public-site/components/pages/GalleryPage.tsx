import React from 'react';
import { GalleryItem } from '../../types';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { Camera } from 'lucide-react';

interface GalleryPageProps {
  onOpenLightbox: (item: GalleryItem) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = () => {
  return (
    <div id="gallery-page-root" className="relative overflow-hidden pb-24 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute -right-24 top-10 h-[650px] w-[480px] opacity-10">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-16 max-w-3xl sm:mb-20">
          <SectionLabel label="Visual Archive" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            THE<br />
            <span className="italic font-normal text-[#2271B1]">ARCHIVE.</span>
          </EditorialHeading>

          <p className="text-base font-light leading-relaxed text-[#31465A] sm:text-lg font-serif">
            Official Swara Ranjana photography and behind-the-scenes material
            will be published here after the approved event archive is ready.
            Temporary stock imagery is intentionally hidden from the public site.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-sm border border-[#C2CBD2]/60 bg-[#F9FBFC] p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 opacity-[0.08]">
            <ButterflyArtwork variant="right-wing-hero" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#2271B1]/10 text-[#2271B1]">
              <Camera className="h-5 w-5" />
            </div>
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-[#2271B1]">
              Official imagery pending
            </span>
            <h2 className="font-gemola text-4xl font-light text-[#0E1721] sm:text-5xl">
              The visual archive is being prepared.
            </h2>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-[#31465A]">
              Final artist portraits, rehearsal photography, stage imagery and
              event archive material will replace this state once the approved
              media set is delivered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
