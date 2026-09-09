import React from 'react';
import { motion } from 'motion/react';
import { PageId } from '../../types';
import { PREVIOUS_EDITIONS, CONCERT_META } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { ParallaxImage } from '../common/ParallaxImage';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  onOpenTicketsModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenTicketsModal }) => {
  return (
    <div id="about-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Top Background Wing Crop */}
      <div className="absolute top-10 -right-20 w-[450px] sm:w-[600px] h-[700px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* ========================================================================= */}
        {/* 1. HERO                                                                   */}
        {/* ========================================================================= */}
        <div className="max-w-4xl mb-20 sm:mb-28">
          <SectionLabel label="About Swara Ranjana" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            The Symphony of<br />
            <span className="italic text-[#2271B1]">Metamorphosis.</span>
          </EditorialHeading>

          <p className="text-base sm:text-xl text-[#31465A] font-light leading-relaxed font-serif max-w-2xl">
            Born from a desire to elevate live South Asian music onto the global high-fashion editorial stage, Swara Ranjana is an intimate confluence of classical purity and orchestral majesty.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. THE STORY & THE VISION (Grid Layout)                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start py-16 border-t border-ink-10">
          <div className="lg:col-span-4">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#2271B1] block mb-2">
              Chapter I
            </span>
            <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light">
              The Story
            </h3>
          </div>

          <div className="lg:col-span-8 space-y-6 text-sm sm:text-base text-[#31465A] font-light leading-relaxed">
            <p>
              In Sanskrit and Sinhala classical tradition, <em className="text-[#0E1721]">Swara</em> represents the divine musical note — a resonant vibration capable of evoking distinct emotional states. <em className="text-[#0E1721]">Ranjana</em> signifies that which enchants, delights, and colors the human spirit.
            </p>
            <p>
              Conceived in Colombo by a collective of master instrumentalists, composers, and stage architects, Swara Ranjana was founded to challenge the conventional format of live concerts in the region. We replaced artificial backing tracks and distracting pyrotechnics with pure acoustic authenticity, immaculate string sections, and bespoke hall amplification.
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start py-16 border-t border-ink-10">
          <div className="lg:col-span-4">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#2271B1] block mb-2">
              Chapter II
            </span>
            <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light">
              The Vision & The Butterfly
            </h3>
          </div>

          <div className="lg:col-span-8 space-y-6 text-sm sm:text-base text-[#31465A] font-light leading-relaxed">
            <p>
              The 2026 visual identity is anchored in the ethereal butterfly — an ancient symbol of metamorphosis, delicate grace, and soaring release.
            </p>
            <p>
              Just as a cocoon transforms into an intricate creature of flight, every melodic phrase in Swara Ranjana begins in deep meditative silence before unfolding into a breathtaking symphonic crescendo. The sharp ink contours paired with electric cobalt blue represent the dialogue between centuries-old classical discipline and cutting-edge contemporary expression.
            </p>
          </div>
        </div>

        {/* The Experience Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start py-16 border-t border-ink-10">
          <div className="lg:col-span-4">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#2271B1] block mb-2">
              Chapter III
            </span>
            <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light">
              The Experience
            </h3>
          </div>

          <div className="lg:col-span-8 space-y-6 text-sm sm:text-base text-[#31465A] font-light leading-relaxed">
            <p>
              Guests at Swara Ranjana do not merely listen; they enter a curated sensory sanctuary. From the moment attendees step into the candlelit marble promenade of Nelum Pokuna to the final acoustic encore, every detail is engineered for timeless emotional resonance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-5 bg-[#F9FBFC] border border-ink-10 rounded-sm">
                <span className="font-mono text-xs text-[#2271B1] block mb-1">01 / ACOUSTICS</span>
                <h4 className="font-gemola text-xl text-[#0E1721]">Pure Resonance</h4>
                <p className="text-xs text-[#7D8A95] mt-1">
                  Zero digital auto-tune. Authentic acoustic instruments miked with precision studio diaphragms.
                </p>
              </div>
              <div className="p-5 bg-[#F9FBFC] border border-ink-10 rounded-sm">
                <span className="font-mono text-xs text-[#2271B1] block mb-1">02 / SCENOGRAPHY</span>
                <h4 className="font-gemola text-xl text-[#0E1721]">Editorial Light</h4>
                <p className="text-xs text-[#7D8A95] mt-1">
                  Architectural chiaroscuro lighting transitioning in harmony with classical raga modes.
                </p>
              </div>
              <div className="p-5 bg-[#F9FBFC] border border-ink-10 rounded-sm">
                <span className="font-mono text-xs text-[#2271B1] block mb-1">03 / INTIMACY</span>
                <h4 className="font-gemola text-xl text-[#0E1721]">Sanctuary Seating</h4>
                <p className="text-xs text-[#7D8A95] mt-1">
                  Capped attendance to ensure generous space, optimal sightlines, and zero distractions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. PREVIOUS EDITIONS (Visual Timeline)                                    */}
        {/* ========================================================================= */}
        <div className="py-20 border-t border-ink-10">
          <SectionLabel label="Historical Chronology" number="02" className="mb-4" />
          <EditorialHeading size="lg" className="mb-16">
            Previous Editions
          </EditorialHeading>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PREVIOUS_EDITIONS.map((edition) => (
              <div
                key={edition.year}
                className="group relative border border-ink-10 bg-white rounded-sm overflow-hidden p-6 sm:p-8 flex flex-col justify-between hover:border-[#2271B1] transition-all duration-300 shadow-sm"
              >
                <div>
                  <span className="font-gemola text-6xl sm:text-7xl font-light text-[#0E1721] group-hover:text-[#2271B1] transition-colors leading-none block mb-3">
                    {edition.year}
                  </span>

                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#2271B1] block mb-1">
                    {edition.theme}
                  </span>

                  <p className="text-xs font-mono text-[#7D8A95] mb-4">
                    {edition.venue}
                  </p>

                  <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-black mb-4">
                    <ParallaxImage
                      src={edition.image}
                      alt={edition.theme}
                      className="grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>

                  <p className="text-xs text-[#31465A] font-light leading-relaxed mb-4">
                    {edition.description}
                  </p>
                </div>

                {edition.quote && (
                  <p className="text-[11px] text-[#7D8A95] italic font-serif border-t border-ink-10 pt-3">
                    {edition.quote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-16 border-t border-ink-10 text-center">
          <h3 className="font-gemola text-4xl sm:text-5xl text-[#0E1721] font-light mb-4">
            Be part of the 2026 legacy.
          </h3>
          <button
            onClick={onOpenTicketsModal}
            className="px-8 py-3.5 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.25em] font-medium transition-colors rounded-sm"
          >
            Reserve Your Seat Sanctuary →
          </button>
        </div>
      </div>
    </div>
  );
};
