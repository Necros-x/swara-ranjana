import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Twitter, Facebook, Link2 } from 'lucide-react';
import { Artist } from '../../types';
import { ButterflyArtwork } from './ButterflyArtwork';
import { playHoverChime } from '../../lib/audioInteraction';

interface ArtistModalProps {
  artist: Artist | null;
  onClose: () => void;
  onReserveClick?: () => void;
}

export const ArtistModal: React.FC<ArtistModalProps> = ({
  artist,
  onClose,
  onReserveClick,
}) => {
  if (!artist) return null;

  return (
    <AnimatePresence>
      <div
        id="artist-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1721]/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#FEFFFF] text-[#0E1721] max-w-4xl w-full rounded-sm overflow-hidden shadow-2xl my-8 border border-[#C2CBD2]/40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            id="artist-modal-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2 text-[#0E1721]/70 hover:text-[#0E1721] bg-white/80 hover:bg-white rounded-full transition-all border border-black/5"
            aria-label="Close Artist Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Portrait Column */}
            <div className="relative md:col-span-5 bg-[#0E1721] min-h-[340px] md:min-h-[500px] overflow-hidden">
              <img
                src={artist.portraitLarge || artist.image}
                alt={artist.name}
                className="w-full h-full object-cover grayscale contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1721] via-transparent to-transparent opacity-80" />

              {/* Numbering and category watermark */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="font-mono text-xs text-[#2271B1] tracking-[0.3em] uppercase block mb-1">
                  Maestro {artist.number} / 06
                </span>
                <h3 className="font-gemola text-2xl sm:text-3xl text-white font-light leading-tight">
                  {artist.name}
                </h3>
                <p className="text-xs text-[#C2CBD2] uppercase tracking-widest mt-1">
                  {artist.role}
                </p>
              </div>

              {/* Cropped Butterfly Wing Decoration */}
              <div className="absolute -top-10 -right-10 w-44 h-44 opacity-20 pointer-events-none">
                <ButterflyArtwork variant="right-wing-hero" />
              </div>
            </div>

            {/* Right Details Column */}
            <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#2271B1]" />
                  <span className="text-[11px] font-mono text-[#31465A] tracking-[0.25em] uppercase">
                    {artist.category}
                  </span>
                </div>

                <h2 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light leading-tight mb-4">
                  {artist.name}
                </h2>

                <p className="text-sm sm:text-base text-[#31465A] leading-relaxed font-light mb-6">
                  {artist.bio}
                </p>

                {/* Repertoire highlight */}
                {artist.repertoirePreview && (
                  <div className="p-4 bg-[#FEFFFF] border-l-2 border-[#2271B1] border-y border-r border-ink-10 mb-6 rounded-r-sm">
                    <span className="text-[10px] font-mono text-[#2271B1] tracking-widest uppercase block mb-1">
                      Concert Repertoire Preview
                    </span>
                    <p className="text-xs sm:text-sm text-[#0E1721] italic font-serif">
                      "{artist.repertoirePreview}"
                    </p>
                  </div>
                )}

                {/* Key career highlights */}
                {artist.featuredHighlights && (
                  <div className="space-y-2 mb-6">
                    <span className="text-[10px] uppercase font-mono text-[#7D8A95] tracking-widest block">
                      Artistic Accolades
                    </span>
                    <ul className="space-y-1.5">
                      {artist.featuredHighlights.map((hl, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-[#31465A] flex items-start gap-2"
                        >
                          <span className="text-[#2271B1] mt-0.5">•</span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#0E1721]/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#7D8A95] font-medium hidden sm:inline-block">Share</span>
                  <div className="flex items-center gap-4 sm:border-l sm:border-[#0E1721]/10 sm:pl-4">
                    <button 
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=Experience ${artist.name} live at Swara Ranjana 2026.`, '_blank')}
                      className="text-[#31465A] hover:text-[#2271B1] transition-colors" 
                      title="Share to X"
                      aria-label="Share to X"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                      className="text-[#31465A] hover:text-[#2271B1] transition-colors" 
                      title="Share to Facebook"
                      aria-label="Share to Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }}
                      className="text-[#31465A] hover:text-[#2271B1] transition-colors" 
                      title="Copy Link"
                      aria-label="Copy Link"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  id="artist-modal-reserve-btn"
                  onClick={() => {
                    onClose();
                    if (onReserveClick) onReserveClick();
                  }}
                  onMouseEnter={playHoverChime}
                  className="bg-[#0E1721] text-white px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#2271B1] transition-colors duration-500"
                >
                  Reserve Seat
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
