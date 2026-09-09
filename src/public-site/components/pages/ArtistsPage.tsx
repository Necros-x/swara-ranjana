import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PageId, Artist } from '../../types';
import { ARTISTS_DATA } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { Music, ArrowRight, Sparkles } from 'lucide-react';

interface ArtistsPageProps {
  onOpenArtistModal: (artist: Artist) => void;
  onOpenTicketsModal: () => void;
}

export const ArtistsPage: React.FC<ArtistsPageProps> = ({
  onOpenArtistModal,
  onOpenTicketsModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Vocals',
    'Strings & Sitar',
    'Percussion & Tabla',
    'Contemporary Fusion',
    'Keyboards & Flute',
  ];

  const filteredArtists =
    activeCategory === 'All'
      ? ARTISTS_DATA
      : ARTISTS_DATA.filter((a) => a.category.includes(activeCategory));

  return (
    <div id="artists-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Background Wing Crop */}
      <div className="absolute top-10 -right-24 w-[500px] h-[700px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* ========================================================================= */}
        {/* HERO                                                                      */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <SectionLabel label="Master Musicians" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            THE<br />
            <span className="italic font-normal text-[#2271B1]">ARTISTS.</span>
          </EditorialHeading>

          <p className="text-base sm:text-lg text-[#31465A] font-light leading-relaxed font-serif">
            A hand-selected ensemble of six visionary virtuosos uniting classical Vedic heritage, Carnatic precision, ritualistic Sri Lankan drumming, and contemporary orchestral arrangements.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* FILTER CATEGORY PILLS                                                     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-16 border-b border-ink-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium rounded-sm whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-[#0E1721] text-white shadow-sm'
                  : 'bg-[#F4F7F9] text-[#31465A] hover:text-[#0E1721] hover:bg-[#E5EBEF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* EDITORIAL ARTIST DIRECTORY (Varied compositions)                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {filteredArtists.map((artist, idx) => {
            // Asymmetric layout logic
            const isFeaturedLarge = idx === 0 || idx === 3;
            const colSpan = isFeaturedLarge ? 'md:col-span-12 lg:col-span-7' : 'md:col-span-6 lg:col-span-5';

            return (
              <motion.div
                key={artist.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => onOpenArtistModal(artist)}
                className={`${colSpan} group cursor-pointer border border-ink-10 hover:border-[#2271B1] bg-[#FEFFFF] rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-500 shadow-sm hover:shadow-md`}
              >
                <div>
                  {/* Portrait with monochrome to color transition */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#0E1721]">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-[#0E1721]/15 group-hover:opacity-0 transition-opacity" />

                    {/* Artist Number Watermark */}
                    <span className="absolute top-4 left-4 font-mono text-xs text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-xs">
                      {artist.number}
                    </span>

                    {/* Category badge */}
                    <span className="absolute bottom-4 left-4 text-[10px] font-mono tracking-widest uppercase text-white bg-[#2271B1] px-2.5 py-1 rounded-xs">
                      {artist.category}
                    </span>
                  </div>

                  {/* Copy Details */}
                  <div className="p-6 sm:p-8">
                    <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#7D8A95] block mb-1">
                      {artist.role}
                    </span>

                    <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light group-hover:text-[#2271B1] transition-colors mb-3">
                      {artist.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#31465A] font-light leading-relaxed mb-4 line-clamp-3">
                      {artist.shortDescription}
                    </p>

                    {artist.repertoirePreview && (
                      <p className="text-xs text-[#7D8A95] italic font-serif border-l-2 border-[#2271B1] pl-3 py-0.5">
                        "{artist.repertoirePreview}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom link bar */}
                <div className="px-6 sm:px-8 py-4 border-t border-ink-10 bg-[#F9FBFC] group-hover:bg-[#2271B1]/5 flex items-center justify-between transition-colors">
                  <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#0E1721] group-hover:text-[#2271B1]">
                    Read Biography & Repertoire
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#7D8A95] group-hover:text-[#2271B1] group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Ensemble Note & Tickets CTA */}
        <div className="mt-24 p-8 sm:p-12 border border-ink-10 bg-[#0E1721] text-white rounded-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="font-mono text-xs text-[#2271B1] tracking-[0.3em] uppercase block mb-2">
              Symphonic Integration
            </span>
            <h3 className="font-gemola text-3xl sm:text-4xl font-light mb-4 text-white">
              Accompanied by the 30-Piece Symphony
            </h3>
            <p className="text-xs sm:text-sm text-[#C2CBD2] font-light leading-relaxed mb-8">
              In addition to our 6 featured maestros, Swara Ranjana features a handpicked 30-piece string, woodwind, and choral ensemble conducted by Dr. Amali Perera.
            </p>
            <button
              onClick={onOpenTicketsModal}
              className="px-8 py-3.5 bg-white hover:bg-[#2271B1] text-[#0E1721] hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-sm"
            >
              Reserve Seats to Experience Live →
            </button>
          </div>

          <div className="absolute -bottom-16 -right-16 w-80 h-80 opacity-20 pointer-events-none">
            <ButterflyArtwork variant="right-wing-hero" />
          </div>
        </div>
      </div>
    </div>
  );
};
