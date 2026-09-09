import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GalleryItem } from '../../types';
import { GALLERY_ITEMS } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { Camera, ZoomIn } from 'lucide-react';

interface GalleryPageProps {
  onOpenLightbox: (item: GalleryItem) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onOpenLightbox }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filters = ['ALL', '2026', '2025', '2024', 'BEHIND THE SCENES'];

  const filteredItems =
    activeFilter === 'ALL'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.year === activeFilter);

  return (
    <div id="gallery-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Background Wing Crop */}
      <div className="absolute top-10 -right-24 w-[480px] h-[650px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* ========================================================================= */}
        {/* HERO                                                                      */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <SectionLabel label="Visual Archive" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            THE<br />
            <span className="italic font-normal text-[#2271B1]">ARCHIVE.</span>
          </EditorialHeading>

          <p className="text-base sm:text-lg text-[#31465A] font-light leading-relaxed font-serif">
            A high-fashion photographic journal capturing the stillness of rehearsal, orchestral crescendos, architectural lighting, and intimate artist portraits across Swara Ranjana.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* FILTER CATEGORY PILLS                                                     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-14 border-b border-ink-10 no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium rounded-sm whitespace-nowrap transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-[#0E1721] text-white shadow-sm'
                  : 'bg-[#F4F7F9] text-[#31465A] hover:text-[#0E1721] hover:bg-[#E5EBEF]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* EDITORIAL MASONRY / ASYMMETRIC GRID                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {filteredItems.map((item, idx) => {
            // Editorial grid layout patterns
            let colSpan = 'md:col-span-6 lg:col-span-4';
            let aspectClass = 'aspect-[4/5]';

            if (item.aspectRatio === 'landscape') {
              colSpan = 'md:col-span-12 lg:col-span-8';
              aspectClass = 'aspect-[16/9]';
            } else if (item.aspectRatio === 'square') {
              colSpan = 'md:col-span-6 lg:col-span-4';
              aspectClass = 'aspect-square';
            } else if (item.aspectRatio === 'tall') {
              colSpan = 'md:col-span-6 lg:col-span-4';
              aspectClass = 'aspect-[3/5]';
            }

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                onClick={() => onOpenLightbox(item)}
                className={`${colSpan} group relative cursor-pointer overflow-hidden rounded-sm bg-[#0E1721] shadow-sm hover:shadow-xl transition-all duration-500`}
              >
                <div className={`w-full ${aspectClass} overflow-hidden`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>

                {/* Editorial Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1721]/90 via-[#0E1721]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-[#2271B1] text-white px-2 py-0.5 rounded-xs">
                      {item.year}
                    </span>
                    <ZoomIn className="w-5 h-5 text-white/80" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#2271B1] uppercase block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-gemola text-2xl sm:text-3xl font-light text-white leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#C2CBD2] font-light line-clamp-2">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Photography Credit Statement */}
        <div className="mt-20 pt-8 border-t border-ink-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#7D8A95]">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#2271B1]" />
            <span>PHOTOGRAPHY CURATED EXCLUSIVELY FOR SWARA RANJANA</span>
          </div>
          <span>COLOMBO ARCHIVES</span>
        </div>
      </div>
    </div>
  );
};
