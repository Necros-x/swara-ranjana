import React from "react";
import { PageId } from "../../types";
import { SwaraRanjanaLogo } from "./SwaraRanjanaLogo";
import { CONCERT_META } from "../../data/concertData";

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenTicketsModal: () => void;
}

const footerNavigation: Array<{ id: PageId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "about", label: "About & Vision" },
  { id: "artists", label: "Featured Maestros" },
  { id: "vasr", label: "VASR — Visual Artists" },
  { id: "programme", label: "Evening Programme" },
  { id: "gallery", label: "Visual Archive" },
  { id: "tickets", label: "Seat Sanctuary" },
  { id: "venue", label: "Venue & Access" },
  { id: "contact", label: "Connect & Inquiries" },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      id="editorial-footer"
      className="relative z-50 overflow-hidden border-t border-[#0E1721]/5 bg-white pb-12 pt-20 text-[#0E1721]"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-12 lg:gap-16">
          <div className="flex flex-col justify-between md:col-span-5">
            <div>
              <div className="flex items-start">
                <SwaraRanjanaLogo
                  size="md"
                  onClick={() => onNavigate("home")}
                  className="items-start"
                />
              </div>
              <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-[#31465A]">
                An ethereal evening where voices, melodies and memories become
                one. A live musical experience conducted by St. Sylvester&apos;s
                College, Kandy.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs text-[#2271B1]">
                <span>{CONCERT_META.dateShort}</span>
                <span>•</span>
                <span>Mahinda Rajapaksha Auditorium, Polgolla</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-10 pt-6 font-mono text-[11px] uppercase tracking-widest text-[#7D8A95]">
              <span>Conducted by St. Sylvester&apos;s College</span>
              <span>/</span>
              <span>Kandy</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.35em] text-[#7D8A95]">
              Navigation
            </span>
            <ul className="space-y-2.5">
              {footerNavigation.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="group flex cursor-pointer items-center gap-1.5 text-xs font-light text-[#31465A] transition-colors hover:text-[#0E1721]"
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
            <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.35em] text-[#7D8A95]">
              Inquiries & Hospitality
            </span>

            <div className="space-y-4 text-xs font-light leading-relaxed text-[#31465A]">
              <p>
                <strong className="block font-medium text-[#0E1721]">
                  Concert Venue
                </strong>
                Mahinda Rajapaksha Auditorium, Polgolla
                <br />
                Kandy, Sri Lanka
              </p>

              <p>
                <strong className="block font-medium text-[#0E1721]">
                  Official Contact
                </strong>
                Confirmed event contact details will be published here before
                public launch.
              </p>

              <p>
                <strong className="block font-medium text-[#0E1721]">
                  Official Channels
                </strong>
                Verified social and media links will appear here once the event
                channels are confirmed.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-between gap-4 border-t border-ink-10 pt-12 font-mono text-[11px] text-[#7D8A95] sm:flex-row">
          <div>© 2026 SWARA RANJANA. ALL RIGHTS RESERVED.</div>
          <div>
            <span className="text-[#31465A]">LIVE MUSICAL EXPERIENCE</span> •
            KANDY, SRI LANKA
          </div>
          <div>ST. SYLVESTER&apos;S COLLEGE, KANDY</div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 -mb-16 mt-12 w-full select-none overflow-hidden text-left opacity-[0.075]">
        <span className="-ml-[0.035em] block w-max whitespace-nowrap font-gemola text-[13.2vw] uppercase leading-[0.72] tracking-[0.045em] text-[#0E1721]">
          SWARA RANJANA
        </span>
      </div>
    </footer>
  );
};
