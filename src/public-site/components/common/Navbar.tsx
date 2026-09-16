import React, { useState, useEffect } from 'react';
import { Menu, UserRound } from 'lucide-react';
import { PageId } from '../../types';
import { SwaraRanjanaLogo } from './SwaraRanjanaLogo';
import { playHoverChime } from '../../lib/audioInteraction';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenTicketsModal: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, onOpenTicketsModal, onOpenMobileMenu }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'artists', label: 'Artists' }, { id: 'programme', label: 'Programme' },
    { id: 'gallery', label: 'Gallery' }, { id: 'tickets', label: 'Tickets' }, { id: 'venue', label: 'Venue' }, { id: 'contact', label: 'Contact' },
  ];
  return (
    <header id="main-navigation-header" className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-[#FEFFFF]/90 backdrop-blur-md border-b border-[#0E1721]/5 py-3 shadow-[0_4px_20px_rgba(14,23,33,0.03)]' : 'bg-transparent pt-10 pb-6'}`}>
      <div className="w-full px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4"><SwaraRanjanaLogo size="sm" onClick={() => onNavigate('home')} className="hover:scale-[0.99] transition-transform"/><span className="hidden xl:inline-block text-[10px] tracking-[0.2em] font-medium opacity-50 uppercase border-l border-[#0E1721]/10 pl-3">St. Sylvester&apos;s College · Kandy</span></div>
        <nav className="hidden lg:flex items-center gap-7 xl:gap-10" aria-label="Main Navigation">{navLinks.map((link) => { const isActive = activePage === link.id; return <button key={link.id} id={`nav-link-${link.id}`} onClick={() => onNavigate(link.id)} className={`text-[11px] uppercase tracking-[0.15em] font-medium transition-colors duration-300 pb-1 ${isActive ? 'text-[#0E1721] border-b border-[#0E1721]' : 'text-[#31465A] hover:text-[#2271B1]'}`}>{link.label}</button>; })}</nav>
        <div className="flex items-center gap-3 sm:gap-4"><a href="/account" aria-label="My tickets" title="My tickets" className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#0E1721]/10 text-[#31465A] transition-colors hover:border-[#2271B1] hover:text-[#2271B1]"><UserRound className="h-4 w-4"/></a><button id="nav-reserve-seat-btn" onClick={onOpenTicketsModal} onMouseEnter={playHoverChime} className="hidden sm:inline-flex items-center bg-[#0E1721] text-white px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#2271B1] transition-colors duration-500">Reserve Seat</button><button id="mobile-menu-open-btn" onClick={onOpenMobileMenu} className="lg:hidden p-2 text-[#0E1721] hover:text-[#2271B1] transition-colors focus:outline-none" aria-label="Open Navigation Menu"><Menu className="w-6 h-6"/></button></div>
      </div>
    </header>
  );
};
