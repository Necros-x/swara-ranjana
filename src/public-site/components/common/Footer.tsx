import React from 'react';
import { PageId } from '../../types';
import { SwaraRanjanaLogo } from './SwaraRanjanaLogo';
import { ButterflyArtwork } from './ButterflyArtwork';
import { CONCERT_META } from '../../data/concertData';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenTicketsModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTicketsModal }) => {
  return (
    <footer
      id="editorial-footer"
      className="relative overflow-hidden border-t border-[#0E1721]/5 bg-white pt-20 pb-12 text-[#0E1721] z-50"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-12 lg:gap-16">
          <div className="flex flex-col justify-between md:col-span-5">
            <div>
              <div className="flex items-start">
                <SwaraRanjanaLogo
                  size="md"
                  onClick={() => onNavigate('home')}
                  className="items-start"
                />
              </div>

              <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-[#31465A]">
                An ethereal evening where voices, melodies and memories become one.
                A live symphonic performance uniting South Asian classical mastery with contemporary orchestral soundscapes.
              </p>

              <div className="mt-6 flex items-center gap-3 text-xs font-mono text-[#2271B1]">
                <span>{CONCERT_META.dateShort}</span>
                <span>•</span>
                <span>{CONCERT_META.hall}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-ink-10 pt-6 text-[11px] uppercase font-mono tracking-widest text-[#7D8A95]">
              <span>Curated in Colombo</span>
              <span>/</span>
              <span>2026 Edition</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <span className="mb-4 block text-[10px] font-mono tracking-[0.35em] uppercase text-[#7D8A95]">
              Navigation
            </span>
            <ul className="space-y-2.5">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About & Vision' },
                { id: 'artists', label: 'Featured Maestros' },
                { id: 'programme', label: 'Evening Programme' },
                { id: 'gallery', label: 'Visual Archive' },
                { id: 'tickets', label: 'Seat Sanctuary' },
                { id: 'venue', label: 'Venue & Access' },
                { id: 'contact', label: 'Connect & Inquiries' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id as PageId)}
                    className="group flex items-center gap-1.5 text-xs font-light text-[#31465A] transition-colors hover:text-[#0E1721]"
                  >
                    <span>{item.label}</span>
                    <span className="text-[#2271B1] opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <span className="mb-4 block text-[10px] font-mono tracking-[0.35em] uppercase text-[#7D8A95]">
              Inquiries & Hospitality
            </span>
            <div className="space-y-3 text-xs font-light text-[#31465A]">
              <p>
                <strong className="block font-medium text-[#0E1721]">Concert Secretariat</strong>
                Nelum Pokuna Mahinda Rajapaksa Theatre<br />
                110 Ananda Coomaraswamy Mawatha, Colombo 00700
              </p>
              <p>
                <strong className="block font-medium text-[#0E1721]">Swara Ranjana</strong>
                <a href="mailto:concierge@swararanjana.lk" className="transition-colors hover:text-[#2271B1]">
                  concierge@swararanjana.lk
                </a><br />
                <span>+94 11 268 9000</span>
              </p>
            </div>

            <div className="mt-6">
              <span className="mb-3 block text-[10px] font-mono tracking-[0.35em] uppercase text-[#7D8A95]">
                Digital Presence
              </span>
              <div className="flex flex-wrap gap-2">
                {['Instagram', 'Spotify', 'YouTube', 'SoundCloud'].map((network) => (
                  <a
                    key={network}
                    href={`https://${network.toLowerCase()}.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xs border border-ink-10 px-3 py-1.5 text-[11px] text-[#31465A] transition-all hover:border-[#2271B1] hover:text-[#0E1721]"
                  >
                    <span>{network}</span>
                    <ArrowUpRight className="h-3 w-3 text-[#2271B1]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-between gap-4 border-t border-ink-10 pt-12 text-[11px] font-mono text-[#7D8A95] sm:flex-row">
          <div>© 2026 SWARA RANJANA. ALL RIGHTS RESERVED.</div>
          <div>
            <span className="text-[#31465A]">LIVE MUSICAL EXPERIENCE</span> • COLOMBO, SRI LANKA
          </div>
          <div>DESIGNED FOR SWARA RANJANA 2026</div>
        </div>
      </div>

      {/* Full-bleed footer wordmark: deliberately escapes the content max-width. */}
      <div className="relative z-10 mt-12 -mb-16 w-full select-none overflow-hidden text-left pointer-events-none opacity-[0.04]">
        <span className="-ml-[0.035em] block w-max whitespace-nowrap font-gemola text-[13.2vw] leading-[0.72] tracking-[0.045em] uppercase text-[#0E1721]">
          SWARA RANJANA
        </span>
      </div>

      <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 opacity-10">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>
    </footer>
  );
};
