import React from "react";
import { motion } from "motion/react";
import { PageId, Artist } from "../../types";
import { CONCERT_META, TICKET_TIERS } from "../../data/concertData";
import { ButterflyArtwork } from "../common/ButterflyArtwork";
import { HeroButterfly } from "../common/HeroButterfly";
import { EventCountdown } from "../common/EventCountdown";
import { SectionLabel } from "../common/SectionLabel";
import { EditorialHeading } from "../common/EditorialHeading";
import { playHoverChime } from "../../lib/audioInteraction";

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenArtistModal: (artist: Artist) => void;
  onOpenTicketsModal: (tierId?: string) => void;
  onOpenGalleryItem: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenTicketsModal,
}) => {
  return (
    <div id="homepage-root" className="relative overflow-hidden">
      <section
        id="hero-section"
        className="relative flex min-h-[92vh] items-center justify-between overflow-hidden px-4 pb-16 pt-24 sm:min-h-screen sm:px-6 lg:px-12"
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-4">
          <div className="z-10 flex max-w-2xl flex-col justify-center lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 flex items-center gap-3 sm:mb-8"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#2271B1] sm:text-[11px]">
                SWARA RANJANA
              </span>
              <span className="h-px w-6 bg-[#2271B1]/40" />
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7D8A95] sm:text-[11px]">
                LIVE MUSICAL EXPERIENCE • 2026
              </span>
            </motion.div>

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
                className="mb-8 font-gemola text-[6rem] font-light leading-[0.85] tracking-tighter text-[#0E1721] sm:text-[8rem] lg:text-[130px]"
                style={{ fontWeight: 200 }}
              >
                SWARA
                <br />
                <span className="font-normal italic">RANJANA</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-8 max-w-sm font-serif text-[14px] italic leading-relaxed text-[#7D8A95] sm:mb-10"
            >
              “An evening where voices, melodies and memories become one. A
              contemporary exploration of classical resonance.”
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-l border-[#2271B1] pl-4 font-mono text-xs uppercase text-[#7D8A95] sm:mb-10"
            >
              <span>{CONCERT_META.date}</span>
              <span>•</span>
              <span>{CONCERT_META.hall}</span>
            </motion.div>

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
                className="flex cursor-pointer items-center gap-3 bg-[#0E1721] px-10 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-[#2271B1]"
              >
                <span>Reserve Your Seat</span>
              </button>

              <button
                id="hero-discover-experience-btn"
                onClick={() => {
                  const el = document.getElementById("experience-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="cursor-pointer border-b border-[#0E1721] pb-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:border-[#2271B1] hover:text-[#2271B1]"
              >
                Discover →
              </button>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 flex -translate-y-[3%] translate-x-[18%] scale-[1.03] items-center justify-center opacity-[0.14] lg:relative lg:inset-auto lg:col-span-5 lg:h-[700px] lg:translate-x-0 lg:translate-y-0 lg:scale-100 lg:opacity-100">
            <div className="absolute inset-0 z-0 hidden -translate-x-5 scale-150 blur-md lg:block">
              <HeroButterfly pose="hero" />
            </div>
            <div className="absolute inset-0 z-10 hidden lg:block">
              <HeroButterfly pose="hero" flap />
            </div>
            <div className="absolute inset-0 z-0 lg:hidden">
              <HeroButterfly pose="corrected" />
            </div>
          </div>
        </div>
      </section>

      <EventCountdown onReserveClick={() => onOpenTicketsModal()} />

      <section
        id="experience-section"
        className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionLabel label="The Experience" number="01" className="mb-8 sm:mb-12" />

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <EditorialHeading size="xl" className="mb-8">
                Music heard.
                <br />
                <span className="italic font-normal text-[#2271B1]">Emotion</span>{" "}
                remembered.
              </EditorialHeading>

              <div className="max-w-xl space-y-6 text-sm font-light leading-relaxed text-[#31465A] sm:text-base">
                <p>
                  Swara Ranjana 2026 is an indoor live musical experience built
                  around performance, atmosphere and a carefully structured
                  auditorium experience at Mahinda Rajapaksha Auditorium,
                  Polgolla.
                </p>
                <p>
                  Final artist, programme and media announcements will appear on
                  the site only after they are confirmed by the event team.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-6">
                <button
                  onClick={() => onNavigate("about")}
                  className="group inline-flex cursor-pointer items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-[#0E1721] transition-colors hover:text-[#2271B1]"
                >
                  <span>Explore The Full Vision</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            <div className="relative flex flex-col justify-between pt-4 lg:col-span-5">
              <div className="relative rounded-sm border border-ink-10 bg-[#FEFFFF] p-8 shadow-[0_10px_30px_rgba(14,23,33,0.02)]">
                <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 overflow-hidden opacity-20">
                  <ButterflyArtwork variant="right-wing-hero" />
                </div>

                <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.35em] text-[#2271B1]">
                  Auditorium Plan
                </span>
                <h3 className="mb-3 font-gemola text-2xl font-light text-[#0E1721]">
                  Built around the live experience
                </h3>
                <p className="mb-6 text-xs font-light leading-relaxed text-[#31465A]">
                  The verified seating plan contains 1,120 physical seats across
                  the ODC and Balcony sections. Online reservations select a
                  ticket category and quantity; physical seats are allocated by
                  the ticketing system.
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-ink-10 pt-4 font-mono text-[11px] text-[#7D8A95]">
                  <div>
                    <span className="block font-semibold text-[#0E1721]">1,120</span>
                    Physical Seats
                  </div>
                  <div>
                    <span className="block font-semibold text-[#0E1721]">8</span>
                    Seat Blocks A–H
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="artists-section"
        className="relative border-y border-ink-10 bg-[#F9FBFC] px-4 py-24 sm:px-6 sm:py-32 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionLabel label="Artist Line-up" number="02" className="mb-4" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <EditorialHeading size="lg">Artists announcement coming soon</EditorialHeading>
              <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-[#31465A] sm:text-base">
                We are withholding draft artist names and biographies until the
                official line-up is approved. The Artists page will publish the
                confirmed performers as soon as they are ready.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <button
                onClick={() => onNavigate("artists")}
                className="cursor-pointer border-b border-[#0E1721] pb-1 text-xs font-medium uppercase tracking-[0.22em] text-[#0E1721] transition-colors hover:border-[#2271B1] hover:text-[#2271B1]"
              >
                Artist announcement →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="artistic-interlude"
        className="relative overflow-hidden bg-[#0E1721] px-4 py-32 text-[#FEFFFF] select-none sm:px-6 sm:py-48 lg:px-12"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
          <div className="h-full w-[650px] sm:w-[900px] lg:w-[1200px]">
            <HeroButterfly />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mb-6 block font-mono text-xs uppercase tracking-[0.5em] text-[#2271B1] sm:text-sm">
              SWARA RANJANA • NOVEMBER 2026
            </span>
            <h2 className="font-gemola text-5xl font-light leading-tight tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
              ONE NIGHT.
              <br />
              <span className="italic text-[#C2CBD2]">ONE STAGE.</span>
              <br />
              ONE MEMORY.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-2 font-mono text-xs tracking-widest text-[#C2CBD2] sm:flex-row sm:gap-4">
              <span>MAHINDA RAJAPAKSHA AUDITORIUM</span>
              <span className="hidden sm:inline">/</span>
              <span>POLGOLLA · KANDY</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="programme-preview-section"
        className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <SectionLabel label="The Evening" number="03" className="mb-4" />
          <div className="rounded-sm border border-ink-10 bg-white p-8 sm:p-12">
            <EditorialHeading size="lg">Programme announcement pending</EditorialHeading>
            <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-[#31465A] sm:text-base">
              The detailed running order, act titles, performer assignments and
              intermission timings are still being finalized. Confirmed date,
              venue and doors-open time remain available throughout the site.
            </p>
            <button
              onClick={() => onNavigate("programme")}
              className="mt-8 cursor-pointer border-b border-[#0E1721] pb-1 text-xs font-medium uppercase tracking-[0.22em] text-[#0E1721] transition-colors hover:border-[#2271B1] hover:text-[#2271B1]"
            >
              Programme information →
            </button>
          </div>
        </div>
      </section>

      <section
        id="gallery-preview-section"
        className="border-t border-ink-10 bg-[#F9FBFC] px-4 py-24 sm:px-6 sm:py-32 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionLabel label="Visual Archive" number="04" className="mb-4" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <EditorialHeading size="lg">Official imagery coming soon</EditorialHeading>
              <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-[#31465A] sm:text-base">
                Temporary stock photography has been removed from the public
                experience. The approved artist portraits, rehearsal images and
                event archive will be published here when delivered.
              </p>
            </div>
            <div className="relative min-h-64 overflow-hidden rounded-sm bg-[#0E1721] lg:col-span-5">
              <div className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 opacity-25">
                <ButterflyArtwork variant="right-wing-hero" />
              </div>
              <div className="relative z-10 flex h-full min-h-64 items-end p-8 text-white">
                <button
                  onClick={() => onNavigate("gallery")}
                  className="cursor-pointer border-b border-white/50 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors hover:border-[#62B6F3] hover:text-[#62B6F3]"
                >
                  Open visual archive →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="tickets-preview-section"
        className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <SectionLabel label="Seat Allocation" number="05" className="mb-4" />

          <div className="mb-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <EditorialHeading size="xl">
                BE PART OF
                <br />
                <span className="italic text-[#2271B1]">THE EVENING.</span>
              </EditorialHeading>
            </div>

            <div className="space-y-2 border-l border-ink-10 pl-6 font-mono text-xs text-[#31465A] lg:col-span-5">
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
                {CONCERT_META.venue}, Kandy
              </p>
            </div>
          </div>

          <div className="divide-y divide-ink-10 border-y border-ink-10">
            {TICKET_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="grid grid-cols-1 items-center gap-6 px-4 py-8 transition-colors hover:bg-black/[0.015] sm:py-10 md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-gemola text-3xl font-light text-[#0E1721] sm:text-4xl">
                      {tier.tierName}
                    </h3>
                    {tier.recommended && (
                      <span className="rounded-xs bg-[#2271B1] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">
                        Preferred
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-light text-[#7D8A95]">
                    {tier.seatingZone}
                  </p>
                </div>

                <div className="md:col-span-4">
                  <ul className="space-y-1 text-xs font-light text-[#31465A]">
                    {tier.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="text-[#2271B1]">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-6 md:col-span-4 md:justify-end">
                  <div className="text-right">
                    <span className="font-mono text-xl font-light text-[#0E1721] sm:text-2xl">
                      LKR {tier.formattedPrice}
                    </span>
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-[#7D8A95]">
                      {tier.availability}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenTicketsModal(tier.id)}
                    className="shrink-0 cursor-pointer rounded-sm bg-[#0E1721] px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2271B1]"
                  >
                    Reserve →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="venue-preview-section"
        className="border-t border-ink-10 bg-[#F9FBFC] px-4 py-24 sm:px-6 sm:py-32 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#0E1721] text-white shadow-md lg:col-span-6">
              <div className="pointer-events-none absolute -bottom-20 -right-16 h-[420px] w-[420px] opacity-[0.14]">
                <ButterflyArtwork variant="right-wing-hero" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between p-7 sm:p-9">
                <span className="w-fit bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#62B6F3]">
                  Event Venue
                </span>
                <div>
                  <div className="font-gemola text-3xl font-light sm:text-4xl">
                    Mahinda Rajapaksha Auditorium
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                    Polgolla · Kandy · Sri Lanka
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <SectionLabel label="The Venue" number="06" className="mb-4" />
              <EditorialHeading size="md" className="mb-6">
                Mahinda Rajapaksha Auditorium, Polgolla
              </EditorialHeading>

              <div className="mb-8 space-y-4 text-xs font-light leading-relaxed text-[#31465A] sm:text-sm">
                <p>
                  Swara Ranjana 2026 takes place in Polgolla, Kandy. The verified
                  auditorium plan contains 1,120 physical seats: 713 in the ODC
                  and 407 in the Balcony.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs text-[#0E1721]">
                  <div>
                    <span className="block text-[10px] uppercase text-[#7D8A95]">Location</span>
                    Polgolla, Kandy
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-[#7D8A95]">Doors Open</span>
                    {CONCERT_META.doorsOpen}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate("venue")}
                  className="cursor-pointer rounded-sm bg-[#0E1721] px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2271B1]"
                >
                  Venue Information & Map →
                </button>
                <a
                  href="https://maps.google.com/?q=Mahinda+Rajapaksha+Auditorium+Polgolla+Kandy"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer rounded-sm border border-ink-20 px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#0E1721] transition-colors hover:border-[#0E1721]"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="final-homepage-cta"
        className="relative overflow-hidden px-4 py-32 text-center sm:px-6 sm:py-44 lg:px-12"
      >
        <div className="relative z-10 mx-auto max-w-4xl">
          <SectionLabel label="Swara Ranjana 2026" align="center" className="mb-6" />
          <h2 className="mb-8 font-gemola text-5xl font-light leading-[0.95] tracking-tight text-[#0E1721] sm:text-7xl md:text-8xl lg:text-9xl">
            See you
            <br />
            <span className="font-normal italic text-[#2271B1]">under the lights.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm font-light leading-relaxed text-[#31465A] sm:text-base">
            Secure your seat for Swara Ranjana 2026 at Mahinda Rajapaksha
            Auditorium, Polgolla.
          </p>
          <button
            onClick={() => onOpenTicketsModal()}
            className="inline-flex cursor-pointer items-center gap-3 rounded-sm bg-[#0E1721] px-10 py-4 text-xs font-medium uppercase tracking-[0.25em] text-white shadow-xl transition-all duration-300 hover:bg-[#2271B1] hover:shadow-[0_10px_30px_rgba(34,113,177,0.3)]"
          >
            <span>Reserve Your Seat</span>
            <span>→</span>
          </button>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-10 sm:w-[700px]">
          <HeroButterfly pose="corrected" />
        </div>
      </section>
    </div>
  );
};
