import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { VASR_CONTRIBUTORS } from '../../data/vasrData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';

export const VasrPage: React.FC = () => {
  return (
    <div id="vasr-page" className="bg-[#FEFFFF] text-[#0E1721]">
      <section className="relative overflow-hidden px-4 pb-20 pt-36 sm:px-6 sm:pb-28 sm:pt-44 lg:px-12">
        <div className="pointer-events-none absolute -right-24 top-14 select-none font-gemola text-[34vw] leading-none text-[#2271B1]/[0.035] sm:text-[26vw] lg:text-[20vw]">
          VASR
        </div>

        <div className="relative mx-auto max-w-7xl">
          <SectionLabel label="Visual Artists Swara Ranjana" number="VASR" className="mb-8" />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <EditorialHeading size="xl">
                  The people shaping
                  <br />
                  <span className="italic font-normal text-[#2271B1]">what the music looks like.</span>
                </EditorialHeading>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-4"
            >
              <p className="max-w-md text-sm font-light leading-7 text-[#31465A]">
                VASR brings together the developers, animators and visual artists building the visual language around Swara Ranjana — from motion and digital experiences to original artwork.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#7D8A95]">
                <Sparkles className="h-3.5 w-3.5 text-[#2271B1]" />
                Growing creative roster
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-10 bg-[#F9FBFC] px-4 py-20 sm:px-6 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-3 block text-[10px] font-mono uppercase tracking-[0.35em] text-[#2271B1]">
                VASR / 2026
              </span>
              <h2 className="font-gemola text-4xl font-light sm:text-5xl lg:text-6xl">
                Creative Roster
              </h2>
            </div>
            <p className="max-w-sm text-xs font-light leading-6 text-[#7D8A95]">
              Additional contributors will be added as their details are confirmed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {VASR_CONTRIBUTORS.map((contributor, index) => (
              <motion.article
                key={contributor.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="group overflow-hidden border border-[#0E1721]/10 bg-white"
              >
                <div className="grid min-h-full grid-cols-1 sm:grid-cols-[190px_1fr]">
                  <div className="relative min-h-56 overflow-hidden bg-[#0E1721] sm:min-h-full">
                    {contributor.image ? (
                      <img
                        src={contributor.image}
                        alt={contributor.name}
                        className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-full min-h-56 items-end justify-start p-6 sm:min-h-full">
                        <span className="font-gemola text-7xl font-light tracking-[-0.06em] text-white/90">
                          {contributor.initials}
                        </span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#2271B1] transition-transform duration-500 sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-px" />
                    <span className="absolute left-5 top-5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/45">
                      VASR {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {contributor.roles.map((role) => (
                          <span
                            key={role}
                            className="border border-[#2271B1]/20 bg-[#2271B1]/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#2271B1]"
                          >
                            {role}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-gemola text-3xl font-light sm:text-4xl">
                        {contributor.name}
                      </h3>

                      <p className="mt-5 text-sm font-light leading-7 text-[#31465A]">
                        {contributor.bio}
                      </p>
                    </div>

                    {contributor.studioCredit && (
                      <div className="mt-8 border-t border-[#0E1721]/10 pt-5">
                        <span className="block text-[9px] font-mono uppercase tracking-[0.24em] text-[#7D8A95]">
                          {contributor.studioCredit.label}
                        </span>
                        <a
                          href={contributor.studioCredit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#0E1721] transition-colors hover:text-[#2271B1]"
                        >
                          {contributor.studioCredit.name}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-8 border border-dashed border-[#0E1721]/15 px-6 py-8 text-center sm:mt-10">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#7D8A95]">
              More VASR contributors will be announced as profile information is received.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
