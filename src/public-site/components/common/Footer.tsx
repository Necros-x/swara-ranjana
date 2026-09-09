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
      className="relative bg-white text-[#0E1721] pt-20 pb-12 overflow-hidden border-t border-[#0E1721]/5 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16">
          {/* Col 1: Wordmark & Statement */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start">
                <SwaraRanjanaLogo
                  size="md"
                  onClick={() => onNavigate('home')}
                  className="items-start"
                />
              </div>

              <p className="mt-6 text-sm text-[#31465A] font-light max-w-sm leading-relaxed">
                An ethereal evening where voices, melodies and memories become one.
                A live symphonic performance uniting South Asian classical mastery with contemporary orchestral soundscapes.
              </p>

              <div className="mt-6 flex items-center gap-3 text-xs font-mono text-[#2271B1]">
                <span>{CONCERT_META.dateShort}</span>
                <span>•</span>
                <span>{CONCERT_META.hall}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-ink-10 flex items-center gap-3 text-[11px] uppercase font-mono tracking-widest text-[#7D8A95]">
              <span>Curated in Colombo</span>
              <span>/</span>
              <span>2026 Edition</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#7D8A95] block mb-4">
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
                    className="text-xs text-[#31465A] hover:text-[#0E1721] transition-colors flex items-center gap-1.5 group font-light"
                  >
                    <span>{item.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2271B1]">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact & Inquiries */}
          <div className="md:col-span-4">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#7D8A95] block mb-4">
              Inquiries & Hospitality
            </span>
            <div className="space-y-3 text-xs text-[#31465A] font-light">
              <p>
                <strong className="font-medium text-[#0E1721] block">Concert Secretariat</strong>
                Nelum Pokuna Mahinda Rajapaksa Theatre<br />
                110 Ananda Coomaraswamy Mawatha, Colombo 00700
              </p>
              <p>
                <strong className="font-medium text-[#0E1721] block">Box Office & VIP Concierge</strong>
                <a href="mailto:concierge@swararanjana.lk" className="hover:text-[#2271B1] transition-colors">
                  concierge@swararanjana.lk
                </a><br />
                <span>+94 11 268 9000</span>
              </p>
            </div>

            <div className="mt-6">
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#7D8A95] block mb-3">
                Digital Presence
              </span>
              <div className="flex flex-wrap gap-2">
                {['Instagram', 'Spotify', 'YouTube', 'SoundCloud'].map((network) => (
                  <a
                    key={network}
                    href={`https://${network.toLowerCase()}.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-ink-10 hover:border-[#2271B1] rounded-xs text-[11px] text-[#31465A] hover:text-[#0E1721] transition-all"
                  >
                    <span>{network}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#2271B1]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Giant Typography & Watermark Extension */}
        <div className="relative pt-12 border-t border-ink-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#7D8A95]">
          <div>
            © 2026 SWARA RANJANA. ALL RIGHTS RESERVED.
          </div>
          <div>
            <span className="text-[#31465A]">LIVE MUSICAL EXPERIENCE</span> • COLOMBO, SRI LANKA
          </div>
          <div>
            DESIGNED FOR SWARA RANJANA 2026
          </div>
        </div>

        {/* Subliminal Cropped Giant Wordmark extending beyond bottom edge */}
        <div className="mt-12 -mb-20 text-center select-none pointer-events-none opacity-[0.04]">
          <span className="font-gemola text-[12vw] tracking-[0.25em] text-[#0E1721] leading-none uppercase inline-block whitespace-nowrap">
            SWARA RANJANA
          </span>
        </div>
      </div>

      {/* Extreme Cropped Butterfly Wing extending past right boundary */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-10 pointer-events-none">
        <ButterflyArtwork variant="right-wing-hero" />
      </div>
    </footer>
  );
};
