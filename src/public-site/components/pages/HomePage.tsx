import React from "react";
import { motion } from "motion/react";
import { PageId, Artist } from "../../types";
import {
  ARTISTS_DATA,
  CONCERT_META,
  PROGRAMME_ACTS,
  TICKET_TIERS,
  GALLERY_ITEMS,
} from "../../data/concertData";
import { SwaraRanjanaLogo } from "../common/SwaraRanjanaLogo";
import { ButterflyArtwork } from "../common/ButterflyArtwork";
import { HeroButterfly } from "../common/HeroButterfly";
import { ParallaxImage } from "../common/ParallaxImage";
import { EventCountdown } from "../common/EventCountdown";
import { SectionLabel } from "../common/SectionLabel";
import { EditorialHeading } from "../common/EditorialHeading";
import { playHoverChime } from "../../lib/audioInteraction";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenArtistModal: (artist: Artist) => void;
  onOpenTicketsModal: (tierId?: string) => void;
  onOpenGalleryItem: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenArtistModal,
  onOpenTicketsModal,
  onOpenGalleryItem,
}) => {
  return (
    <div id="homepage-root" className="relative overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          {/* Left Column: Editorial Typography & Statement */}
          <div className="lg:col-span-7 z-10 flex flex-col justify-center max-w-2xl">
            {/* Small Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 mb-6 sm:mb-8"
            >
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-[#2271B1]">
                SWARA RANJANA
              </span>
              <span className="w-6 h-[1px] bg-[#2271B1]/40" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#7D8A95]">
                LIVE MUSICAL EXPERIENCE • 2026
              </span>
            </motion.div>

            {/* Giant Swara Ranjana Wordmark / Display Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-6 sm:mb-8"
            >
              <h1
                className="font-gemola font-light text-[#0E1721] tracking-tighter mb-8 text-[6rem] sm:text-[8rem] lg:text-[130px] leading-[0.85]"
                style={{ fontWeight: 200 }}
              >
                SWARA
                <br />
                <span className="font-normal italic">RANJANA</span>
              </h1>
            </motion.div>

            {/* Short Statement */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-[14px] leading-relaxed text-[#7D8A95] italic font-serif max-w-sm mb-8 sm:mb-10"
            >
              “An evening where voices, melodies and memories become one. A
              contemporary exploration of classical resonance.”
            </motion.p>

            {/* Event Key Coordinates */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#7D8A95] font-mono mb-8 sm:mb-10 border-l border-[#2271B1] pl-4 uppercase"
            >
              <span>{CONCERT_META.date}</span>
              <span>•</span>
              <span>{CONCERT_META.hall}</span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-wrap items-center gap-8 sm:gap-12"
            >
              <button
                id="hero-reserve-seat-cta"
                onClick={() => onOpenTicketsModal()}
                onMouseEnter={playHoverChime}
                className="bg-[#0E1721] text-white px-10 py-5 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#2271B1] transition-colors duration-500 flex items-center gap-3"
              >
                <span>Reserve Your Seat</span>
              </button>

              <button
                id="hero-discover-experience-btn"
                onClick={() => {
                  const el = document.getElementById("experience-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-[#0E1721] pb-1 hover:text-[#2271B1] hover:border-[#2271B1] transition-all"
              >
                Discover →
              </button>
            </motion.div>
          </div>

          {/* Right Column / mobile hero artwork background. */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.14] translate-x-[18%] -translate-y-[3%] scale-[1.03] lg:relative lg:inset-auto lg:col-span-5 lg:h-[700px] lg:translate-x-0 lg:translate-y-0 lg:scale-100 lg:opacity-100">
            {/* Desktop soft duplicate: static wing layers, so it never flaps. */}
            <div className="absolute inset-0 z-0 hidden -translate-x-5 scale-150 blur-md lg:block">
              <HeroButterfly variant="backdrop" pose="hero" />
            </div>

            {/* Desktop crisp foreground is the only butterfly allowed to flap. */}
            <div className="absolute inset-0 z-10 hidden lg:block">
              <HeroButterfly pose="hero" flap />
            </div>

            {/* Mobile/tablet: static corrected butterfly behind the hero copy. */}
            <div className="absolute inset-0 z-0 lg:hidden">
              <HeroButterfly pose="corrected" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1.5 COUNTDOWN SECTION                                                     */}
      {/* ========================================================================= */}
      <EventCountdown onReserveClick={() => onOpenTicketsModal()} />

      {/* ========================================================================= */}
      {/* 2. INTRODUCTION / THE EXPERIENCE SECTION                                 */}
      {/* ========================================================================= */}
      <section
        id="experience-section"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <SectionLabel
            label="The Experience"
            number="01"
            className="mb-8 sm:mb-12"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Asymmetric Left: Large Editorial Statement */}
            <div className="lg:col-span-7">
              <EditorialHeading size="xl" className="mb-8">
                Music heard.
                <br />
                <span className="italic font-normal text-[#2271B1]">
                  Emotion
                </span>{" "}
                remembered.
              </EditorialHeading>

              <div className="space-y-6 text-sm sm:text-base text-[#31465A] font-light leading-relaxed max-w-xl">
                <p>
                  Swara Ranjana 2026 is an immersive indoor live musical concert
                  engineered for deep acoustic intimacy and visual grandeur. We
                  celebrate the organic dialogue between ancient South Asian
                  ragas, the resonant bow of the chamber cello, soaring vocal
                  poetry, and electrifying Sri Lankan polyrhythms.
                </p>
                <p>
                  Bathed in pure porcelain whitespace and ethereal cobalt
                  reflections, this performance strips away commercial excess to
                  reveal the unvarnished soul of live composition.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-6">
                <button
                  onClick={() => onNavigate("about")}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-medium text-[#0E1721] hover:text-[#2271B1] transition-colors group"
                >
                  <span>Explore The Full Vision</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* Asymmetric Right: Isolated Wing Crop in negative space & Micro specs */}
            <div className="lg:col-span-5 relative flex flex-col justify-between pt-4">
              <div className="p-8 border border-ink-10 bg-[#FEFFFF] rounded-sm relative shadow-[0_10px_30px_rgba(14,23,33,0.02)]">
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden opacity-20 pointer-events-none">
                  <ButterflyArtwork variant="right-wing-hero" />
                </div>

                <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#2271B1] block mb-4">
                  Acoustic Architecture
                </span>

                <h3 className="font-gemola text-2xl text-[#0E1721] font-light mb-3">
                  Purity of Sound & Light
                </h3>

                <p className="text-xs text-[#31465A] font-light leading-relaxed mb-6">
                  Performed within the acoustically calibrated Nelum Pokuna
                  Symphony Hall, every instrument is amplified with pristine
                  natural transparency without harsh digital artifacts.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink-10 text-[11px] font-mono text-[#7D8A95]">
                  <div>
                    <span className="block text-[#0E1721] font-semibold">
                      1,280
                    </span>
                    Sanctuary Seats
                  </div>
                  <div>
                    <span className="block text-[#0E1721] font-semibold">
                      30+
                    </span>
                    Symphonic Musicians
                  </div>
                </div>
              </div>

              {/* Spaced micro quote */}
              <div className="mt-8 pl-4 border-l border-ink-20 italic font-serif text-xs text-[#7D8A95] leading-relaxed">
                “A rare encounter between classical discipline and high-fashion
                stagecraft.”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED ARTISTS SECTION                                              */}
      {/* ========================================================================= */}
      <section
        id="artists-section"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#F9FBFC] relative border-y border-ink-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 sm:mb-20 gap-6">
            <div>
              <SectionLabel
                label="Mastery & Voices"
                number="02"
                className="mb-4"
              />
              <EditorialHeading size="lg">Featured Maestros</EditorialHeading>
            </div>

            <button
              onClick={() => onNavigate("artists")}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-medium text-[#0E1721] hover:text-[#2271B1] transition-colors"
            >
              <span>View All 6 Maestros</span>
              <span>→</span>
            </button>
          </div>

          {/* Alternating Editorial Showcase for Top 3 Artists */}
          <div className="space-y-20 sm:space-y-28">
            {ARTISTS_DATA.slice(0, 3).map((artist, index) => {
              const isEven = index % 2 === 1;

              return (
                <div
                  key={artist.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Portrait Column */}
                  <div
                    className={`lg:col-span-6 relative group cursor-pointer ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                    onClick={() => onOpenArtistModal(artist)}
                  >
                    <div className="relative overflow-hidden rounded-sm bg-[#0E1721] aspect-[4/5] max-h-[560px] shadow-lg">
                      <ParallaxImage
                        src={artist.image}
                        alt={artist.name}
                        className="grayscale contrast-105 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-[#0E1721]/15 group-hover:opacity-0 transition-opacity" />

                      {/* Floating Numbering Watermark */}
                      <span className="absolute top-6 left-6 font-mono text-xs text-white/90 tracking-widest bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-xs">
                        {artist.number}
                      </span>

                      {/* Cobalt hover line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2271B1] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </div>
                  </div>

                  {/* Copy Column */}
                  <div
                    className={`lg:col-span-6 flex flex-col justify-center ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-xs text-[#2271B1] tracking-[0.3em] uppercase">
                        {artist.category}
                      </span>
                      <span className="w-8 h-[1px] bg-[#2271B1]/40" />
                      <span className="text-xs text-[#7D8A95] uppercase tracking-widest">
                        {artist.role}
                      </span>
                    </div>

                    <h3 className="font-gemola text-4xl sm:text-5xl lg:text-6xl font-light text-[#0E1721] mb-4">
                      {artist.name}
                    </h3>

                    <p className="text-sm sm:text-base text-[#31465A] font-light leading-relaxed mb-6 max-w-lg">
                      {artist.shortDescription}
                    </p>

                    {artist.repertoirePreview && (
                      <p className="text-xs text-[#7D8A95] italic font-serif mb-8 border-l-2 border-[#2271B1] pl-3">
                        Repertoire: "{artist.repertoirePreview}"
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onOpenArtistModal(artist)}
                        className="px-6 py-2.5 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-sm"
                      >
                        Artist Biography & Repertoire →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ARTISTIC INTERLUDE (Magazine Spread)                                  */}
      {/* ========================================================================= */}
      <section
        id="artistic-interlude"
        className="relative py-32 sm:py-48 px-4 sm:px-6 lg:px-12 bg-[#0E1721] text-[#FEFFFF] overflow-hidden select-none"
      >
        {/* Full Symmetrical Butterfly with high contrast in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[650px] sm:w-[900px] lg:w-[1200px] h-full">
            <HeroButterfly />
          </div>
        </div>

        {/* Minimal Magazine Spread Typography */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-xs sm:text-sm tracking-[0.5em] text-[#2271B1] uppercase block mb-6">
              SWARA RANJANA • NOVEMBER 2026
            </span>

            <h2 className="font-gemola text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-white leading-tight">
              ONE NIGHT.
              <br />
              <span className="italic text-[#C2CBD2]">ONE STAGE.</span>
              <br />
              ONE MEMORY.
            </h2>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-mono text-[#C2CBD2] tracking-widest">
              <span>NELUM POKUNA THEATRE</span>
              <span>/</span>
              <span>COLOMBO</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PROGRAMME PREVIEW SECTION                                             */}
      {/* ========================================================================= */}
      <section
        id="programme-preview-section"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 relative"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <SectionLabel label="The Evening" number="03" className="mb-4" />
              <EditorialHeading size="lg">Programme</EditorialHeading>
            </div>

            <button
              onClick={() => onNavigate("programme")}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-medium text-[#0E1721] hover:text-[#2271B1] transition-colors"
            >
              <span>View Full Schedule (8 Acts)</span>
              <span>→</span>
            </button>
          </div>

          {/* Timeline Rows with Thin Rules */}
          <div className="border-t border-ink-10 divide-y divide-ink-10">
            {PROGRAMME_ACTS.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline hover:bg-black/[0.01] transition-colors px-2"
              >
                <div className="sm:col-span-3">
                  <span className="font-mono text-sm sm:text-base font-semibold text-[#2271B1]">
                    {act.time}
                  </span>
                  <span className="block text-[10px] font-mono text-[#7D8A95] tracking-wider uppercase mt-0.5">
                    {act.duration}
                  </span>
                </div>

                <div className="sm:col-span-6">
                  <h4 className="font-gemola text-2xl sm:text-3xl text-[#0E1721] font-light">
                    {act.title}
                  </h4>
                  <p className="text-xs text-[#31465A] font-light mt-1">
                    {act.description}
                  </p>
                </div>

                <div className="sm:col-span-3 text-left sm:text-right">
                  <span className="text-xs text-[#31465A] font-medium block">
                    {act.performer}
                  </span>
                  <span className="text-[10px] font-mono text-[#7D8A95] uppercase tracking-wider">
                    {act.categoryTag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => onNavigate("programme")}
              className="px-8 py-3 border border-ink-20 hover:border-[#2271B1] text-xs uppercase tracking-[0.25em] font-medium text-[#0E1721] hover:text-[#2271B1] transition-colors rounded-sm"
            >
              View Full Concert Schedule →
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GALLERY PREVIEW (Artistic Overlaps & Masonry)                          */}
      {/* ========================================================================= */}
      <section
        id="gallery-preview-section"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#F9FBFC] border-t border-ink-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <SectionLabel
                label="Visual Archive"
                number="04"
                className="mb-4"
              />
              <EditorialHeading size="lg">The Atmosphere</EditorialHeading>
            </div>

            <button
              onClick={() => onNavigate("gallery")}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-medium text-[#0E1721] hover:text-[#2271B1] transition-colors"
            >
              <span>Explore Gallery (All Photographs)</span>
              <span>→</span>
            </button>
          </div>

          {/* Artistic Asymmetric Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image 1: Tall Portrait */}
            <div
              className="md:col-span-4 relative group cursor-pointer overflow-hidden rounded-sm bg-[#0E1721] aspect-[3/4]"
              onClick={() => onOpenGalleryItem(GALLERY_ITEMS[0].id)}
            >
              <ParallaxImage
                src={GALLERY_ITEMS[0].image}
                alt={GALLERY_ITEMS[0].title}
                className="grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
                <span className="text-[10px] font-mono text-[#2271B1] tracking-widest uppercase">
                  {GALLERY_ITEMS[0].category}
                </span>
                <h4 className="font-gemola text-2xl font-light">
                  {GALLERY_ITEMS[0].title}
                </h4>
              </div>
            </div>

            {/* Image 2: Wide Landscape & Image 3 stacked */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                className="sm:col-span-2 relative group cursor-pointer overflow-hidden rounded-sm bg-[#0E1721] aspect-[16/9]"
                onClick={() => onOpenGalleryItem(GALLERY_ITEMS[1].id)}
              >
                <ParallaxImage
                  src={GALLERY_ITEMS[1].image}
                  alt={GALLERY_ITEMS[1].title}
                  className="grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-mono text-[#2271B1] tracking-widest uppercase">
                    {GALLERY_ITEMS[1].category}
                  </span>
                  <h4 className="font-gemola text-2xl font-light">
                    {GALLERY_ITEMS[1].title}
                  </h4>
                </div>
              </div>

              <div
                className="relative group cursor-pointer overflow-hidden rounded-sm bg-[#0E1721] aspect-square"
                onClick={() => onOpenGalleryItem(GALLERY_ITEMS[2].id)}
              >
                <ParallaxImage
                  src={GALLERY_ITEMS[2].image}
                  alt={GALLERY_ITEMS[2].title}
                  className="grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <span className="text-[9px] font-mono text-[#2271B1] tracking-widest uppercase">
                    {GALLERY_ITEMS[2].category}
                  </span>
                  <h4 className="font-gemola text-xl font-light">
                    {GALLERY_ITEMS[2].title}
                  </h4>
                </div>
              </div>

              <div
                className="relative group cursor-pointer overflow-hidden rounded-sm bg-[#0E1721] aspect-square"
                onClick={() => onOpenGalleryItem(GALLERY_ITEMS[3].id)}
              >
                <ParallaxImage
                  src={GALLERY_ITEMS[3].image}
                  alt={GALLERY_ITEMS[3].title}
                  className="grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <span className="text-[9px] font-mono text-[#2271B1] tracking-widest uppercase">
                    {GALLERY_ITEMS[3].category}
                  </span>
                  <h4 className="font-gemola text-xl font-light">
                    {GALLERY_ITEMS[3].title}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TICKET SECTION                                                         */}
      {/* ========================================================================= */}
      <section
        id="tickets-preview-section"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 relative"
      >
        <div className="max-w-6xl mx-auto">
          <SectionLabel label="Seat Allocation" number="05" className="mb-4" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">
            <div className="lg:col-span-7">
              <EditorialHeading size="xl">
                BE PART OF
                <br />
                <span className="italic text-[#2271B1]">THE EVENING.</span>
              </EditorialHeading>
            </div>

            <div className="lg:col-span-5 text-xs font-mono text-[#31465A] space-y-2 border-l border-ink-10 pl-6">
              <p>
                <strong className="text-[#0E1721]">DATE:</strong>{" "}
                {CONCERT_META.date}
              </p>
              <p>
                <strong className="text-[#0E1721]">TIME:</strong> Doors{" "}
                {CONCERT_META.doorsOpen} • Showtime 06:00 PM
              </p>
              <p>
                <strong className="text-[#0E1721]">VENUE:</strong>{" "}
                {CONCERT_META.venue}, Colombo
              </p>
            </div>
          </div>

          {/* Editorial Ticket Rows */}
          <div className="border-y border-ink-10 divide-y divide-ink-10">
            {TICKET_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:bg-black/[0.015] transition-colors px-4"
              >
                <div className="md:col-span-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light">
                      {tier.tierName}
                    </h3>
                    {tier.recommended && (
                      <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#2271B1] text-white rounded-xs">
                        Preferred
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7D8A95] font-light mt-1">
                    {tier.seatingZone}
                  </p>
                </div>

                <div className="md:col-span-4">
                  <ul className="space-y-1 text-xs text-[#31465A] font-light">
                    {tier.benefits.slice(0, 2).map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#2271B1]">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <span className="font-mono text-xl sm:text-2xl font-light text-[#0E1721]">
                      LKR {tier.formattedPrice}
                    </span>
                    <span className="block text-[9px] font-mono text-[#7D8A95] uppercase tracking-wider">
                      {tier.availability}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenTicketsModal(tier.id)}
                    className="px-6 py-3 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-sm shrink-0"
                  >
                    Reserve →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. VENUE PREVIEW SECTION (Split Layout)                                  */}
      {/* ========================================================================= */}
      <section
        id="venue-preview-section"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#F9FBFC] border-t border-ink-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Venue Image */}
            <div className="lg:col-span-6 relative overflow-hidden rounded-sm bg-[#0E1721] aspect-[4/3] shadow-md">
              <ParallaxImage
                src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85"
                alt="Nelum Pokuna Auditorium"
                className="grayscale contrast-110 group-hover:scale-105 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-6 left-6 bg-[#0E1721]/80 backdrop-blur-sm text-white px-3 py-1 text-[10px] font-mono tracking-widest uppercase">
                Acoustic Symphony Hall
              </div>
            </div>

            {/* Right: Venue Information */}
            <div className="lg:col-span-6">
              <SectionLabel label="The Venue" number="06" className="mb-4" />

              <EditorialHeading size="md" className="mb-6">
                Nelum Pokuna Mahinda Rajapaksa Theatre
              </EditorialHeading>

              <div className="space-y-4 text-xs sm:text-sm text-[#31465A] font-light leading-relaxed mb-8">
                <p>
                  Sri Lanka’s premier architectural performing arts venue,
                  designed in homage to the historic 12th-century Lotus Pond in
                  Polonnaruwa.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs text-[#0E1721]">
                  <div>
                    <span className="block text-[10px] text-[#7D8A95] uppercase">
                      Location
                    </span>
                    Colombo 07, Sri Lanka
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#7D8A95] uppercase">
                      Doors Open
                    </span>
                    05:30 PM Promptly
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate("venue")}
                  className="px-6 py-3 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-sm"
                >
                  Venue Information & Map →
                </button>
                <a
                  href="https://maps.google.com/?q=Nelum+Pokuna+Mahinda+Rajapaksa+Theatre"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 border border-ink-20 hover:border-[#0E1721] text-xs uppercase tracking-[0.2em] text-[#0E1721] transition-colors rounded-sm"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL HOMEPAGE CTA                                                     */}
      {/* ========================================================================= */}
      <section
        id="final-homepage-cta"
        className="py-32 sm:py-44 px-4 sm:px-6 lg:px-12 text-center relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <SectionLabel
            label="Swara Ranjana 2026"
            align="center"
            className="mb-6"
          />

          <h2 className="font-gemola text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-[#0E1721] tracking-tight leading-[0.95] mb-8">
            See you
            <br />
            <span className="italic font-normal text-[#2271B1]">
              under the lights.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#31465A] font-light max-w-md mx-auto leading-relaxed mb-10">
            Secure your seat for an unforgettable evening of live South Asian
            orchestral music.
          </p>

          <button
            onClick={() => onOpenTicketsModal()}
            className="px-10 py-4 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 rounded-sm shadow-xl hover:shadow-[0_10px_30px_rgba(34,113,177,0.3)] inline-flex items-center gap-3"
          >
            <span>Reserve Your Seat</span>
            <span>→</span>
          </button>
        </div>

        {/* Subtle butterfly wings in background of final CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] opacity-10 pointer-events-none">
          <HeroButterfly pose="corrected" />
        </div>
      </section>
    </div>
  );
};