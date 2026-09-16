import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { VASR_CONTRIBUTORS } from '../../data/vasrData';

interface VasrPreviewSectionProps {
  onExplore: () => void;
}

export const VasrPreviewSection: React.FC<VasrPreviewSectionProps> = ({ onExplore }) => {
  return (
    <section
      id="vasr-preview-section"
      className="relative overflow-hidden border-t border-[#0E1721]/10 bg-[#FEFFFF] px-4 py-24 sm:px-6 sm:py-28 lg:px-12"
    >
      <div className="pointer-events-none absolute -right-8 top-4 select-none font-gemola text-[26vw] leading-none text-[#2271B1]/[0.025] sm:text-[20vw] lg:text-[15vw]">
        VASR
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.35em] text-[#2271B1]">
              Visual Artists Swara Ranjana
            </span>
            <h2 className="font-gemola text-4xl font-light leading-[0.95] text-[#0E1721] sm:text-6xl lg:text-7xl">
              Meet the team shaping
              <br />
              <span className="italic text-[#2271B1]">the visual experience.</span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right">
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0E1721] transition-colors hover:text-[#2271B1]"
            >
              Explore VASR
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 border-y border-[#0E1721]/10 lg:grid-cols-2 lg:divide-x lg:divide-[#0E1721]/10">
          {VASR_CONTRIBUTORS.slice(0, 2).map((contributor, index) => (
            <article
              key={contributor.id}
              className="group flex min-h-64 flex-col justify-between border-b border-[#0E1721]/10 p-6 last:border-b-0 sm:p-8 lg:border-b-0"
            >
              <div>
                <div className="mb-8 flex items-start justify-between gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#7D8A95]">
                    VASR {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-gemola text-5xl font-light text-[#0E1721]/10 transition-colors group-hover:text-[#2271B1]/20">
                    {contributor.initials}
                  </span>
                </div>

                <h3 className="font-gemola text-3xl font-light text-[#0E1721] sm:text-4xl">
                  {contributor.name}
                </h3>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#2271B1]">
                  {contributor.roles.join(' / ')}
                </p>
                <p className="mt-5 max-w-md text-sm font-light leading-6 text-[#31465A]">
                  {contributor.shortBio}
                </p>
              </div>

              {contributor.studioCredit && (
                <a
                  href={contributor.studioCredit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex w-fit items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7D8A95] transition-colors hover:text-[#2271B1]"
                >
                  {contributor.studioCredit.name}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
