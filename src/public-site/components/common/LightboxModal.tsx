import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { GalleryItem } from '../../types';
import { SwaraRanjanaLogo } from './SwaraRanjanaLogo';

interface LightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onSelect: (item: GalleryItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  items,
  onClose,
  onSelect,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item]);

  if (!item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onSelect(items[prevIndex]);
  };
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % items.length;
    onSelect(items[nextIndex]);
  };

  return (
    <AnimatePresence>
      <div
        id="gallery-lightbox-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1721]/95 backdrop-blur-xl p-4 sm:p-8"
      >
        {/* Top Bar with Logo & Close */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <SwaraRanjanaLogo size="sm" theme="light" />
            <span className="hidden sm:inline-block text-xs uppercase tracking-[0.3em] text-[#7D8A95] border-l border-white/10 pl-4">
              Visual Archive
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-xs text-[#C2CBD2] tracking-widest">
              {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>

            <button
              id="lightbox-close-button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        <button
          id="lightbox-prev-btn"
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
          aria-label="Previous photograph"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Main Content */}
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center"
        >
          <div className="relative overflow-hidden rounded-sm max-h-[70vh] shadow-2xl">
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[65vh] w-auto object-contain"
            />
          </div>

          {/* Editorial Caption Bar */}
          <div className="mt-4 text-center max-w-2xl px-4">
            <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#2271B1] font-mono mb-1">
              <span>{item.year}</span>
              <span>•</span>
              <span>{item.category}</span>
            </div>

            <h3 className="font-gemola text-2xl sm:text-3xl text-white font-light mb-1">
              {item.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#C2CBD2] font-light leading-relaxed">
              {item.caption}
            </p>

            {item.photographer && (
              <p className="text-[10px] text-[#7D8A95] tracking-widest uppercase mt-2 flex items-center justify-center gap-1.5">
                <Camera className="w-3 h-3 text-[#2271B1]" />
                {item.photographer}
              </p>
            )}
          </div>
        </motion.div>

        {/* Next Button */}
        <button
          id="lightbox-next-btn"
          onClick={handleNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
          aria-label="Next photograph"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>
    </AnimatePresence>
  );
};
