import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, UserRound } from 'lucide-react';
import { PageId } from '../../types';
import { SwaraRanjanaLogo } from './SwaraRanjanaLogo';
import { ButterflyArtwork } from './ButterflyArtwork';
import { CONCERT_META } from '../../data/concertData';

interface MobileMenuProps {
  isOpen: boolean;
  activePage: PageId;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  onOpenTicketsModal: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  activePage,
  onClose,
  onNavigate,
  onOpenTicketsModal,
}) => {
  const navLinks: { id: PageId; label: string; number: string }[] = [
    { id: 'home', label: 'Home', number: '01' },
    { id: 'about', label: 'About', number: '02' },
    { id: 'artists', label: 'Artists', number: '03' },
    { id: 'programme', label: 'Programme', number: '04' },
    { id: 'gallery', label: 'Gallery', number: '05' },
    { id: 'tickets', label: 'Tickets', number: '06' },
    { id: 'venue', label: 'Venue', number: '07' },
    { id: 'contact', label: 'Contact', number: '08' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="mobile-fullscreen-menu"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 bg-[#FEFFFF] text-[#0E1721] flex flex-col justify-between p-6 sm:p-10 overflow-y-auto"
      >
        {/* Background cropped wing motif */}
        <div className="absolute top-1/4 -right-24 w-80 h-80 opacity-15 pointer-events-none">
          <ButterflyArtwork variant="right-wing-hero" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <SwaraRanjanaLogo size="sm" onClick={() => { onNavigate('home'); onClose(); }} />

          <button
            id="mobile-menu-close-btn"
            onClick={onClose}
            className="p-2.5 rounded-full border border-ink-10 text-[#0E1721] hover:text-[#2271B1] hover:border-[#2271B1] transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Giant Editorial Nav Links */}
        <div className="relative z-10 my-auto py-8">
          <nav className="space-y-3 sm:space-y-4">
            {navLinks.map((link, idx) => {
              const isActive = activePage === link.id;
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.4 }}
                >
                  <button
                    onClick={() => {
                      onNavigate(link.id);
                      onClose();
                    }}
                    className="group flex items-baseline gap-4 w-full text-left py-1"
                  >
                    <span className="font-mono text-xs text-[#2271B1] tracking-widest opacity-60 group-hover:opacity-100">
                      {link.number}
                    </span>
                    <span
                      className={`font-gemola text-3xl sm:text-4xl md:text-5xl font-light uppercase tracking-tight transition-all ${
                        isActive
                          ? 'text-[#0E1721] font-normal translate-x-2'
                          : 'text-[#31465A] hover:text-[#0E1721] hover:translate-x-2'
                      }`}
                    >
                      {link.label}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#2271B1] ml-2" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Footer info & CTA */}
        <div className="relative z-10 pt-6 border-t border-ink-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#7D8A95] font-light space-y-0.5">
            <p className="font-medium text-[#0E1721]">{CONCERT_META.dateShort} • {CONCERT_META.venue}</p>
            <p>Colombo, Sri Lanka</p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row">
            <a
              href="/account"
              onClick={onClose}
              className="flex min-h-10 items-center justify-center gap-1.5 border border-[#0E1721]/10 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.18em]"
            >
              <UserRound className="h-3.5 w-3.5 shrink-0" />
              My Tickets
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenTicketsModal();
              }}
              className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-sm bg-[#0E1721] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#FEFFFF] sm:w-auto sm:px-6 sm:py-3 sm:text-xs sm:tracking-[0.2em]"
            >
              <Ticket className="h-3.5 w-3.5 shrink-0 text-[#2271B1]" />
              <span className="sm:hidden">Reserve</span>
              <span className="hidden sm:inline">Reserve Seat (LKR 5,000+)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
