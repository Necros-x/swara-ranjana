import React from 'react';
import { motion } from 'motion/react';
import { PageId } from '../../types';
import { PROGRAMME_ACTS, CONCERT_META } from '../../data/concertData';
import { SectionLabel } from '../common/SectionLabel';
import { EditorialHeading } from '../common/EditorialHeading';
import { ButterflyArtwork } from '../common/ButterflyArtwork';
import { Calendar, Clock, MapPin, Coffee, Sparkles } from 'lucide-react';

interface ProgrammePageProps {
  onOpenTicketsModal: () => void;
}

export const ProgrammePage: React.FC<ProgrammePageProps> = ({ onOpenTicketsModal }) => {
  return (
    <div id="programme-page-root" className="pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Background Wing Crop */}
      <div className="absolute top-1/3 -left-32 w-[550px] h-[700px] opacity-10 pointer-events-none">
        <ButterflyArtwork variant="left-wing" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================================= */}
        {/* HERO                                                                      */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <SectionLabel label="Chronological Schedule" align="center" number="01" className="mb-4" />

          <EditorialHeading size="giant" className="mb-6">
            THE<br />
            <span className="italic font-normal text-[#2271B1]">PROGRAMME.</span>
          </EditorialHeading>

          <p className="text-base sm:text-lg text-[#31465A] font-light leading-relaxed font-serif mb-8">
            An eight-act continuous musical narrative seamlessly guiding listeners from contemplative dusk to an ecstatic symphonic dawn.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-y-2 gap-x-6 px-6 py-3 bg-[#F4F7F9] border border-ink-10 rounded-sm text-xs font-mono text-[#31465A]">
            <span className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#2271B1]" />
              {CONCERT_META.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#2271B1]" />
              Doors Open {CONCERT_META.doorsOpen}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#2271B1]" />
              {CONCERT_META.hall}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VERTICAL TIMELINE (Alternating on Desktop)                                */}
        {/* ========================================================================= */}
        <div className="relative border-l md:border-l-0 md:before:absolute md:before:top-0 md:before:bottom-0 md:before:left-1/2 md:before:-translate-x-1/2 md:before:w-[1px] md:before:bg-ink-20 pl-6 md:pl-0 space-y-12 sm:space-y-16">
          {PROGRAMME_ACTS.map((act, index) => {
            const isLeft = index % 2 === 0;

            if (act.isIntermission) {
              return (
                <div
                  key={act.id}
                  className="relative md:w-2/3 md:mx-auto p-6 sm:p-8 bg-[#0E1721] text-white rounded-sm text-center shadow-lg border border-white/10"
                >
                  <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#2271B1] tracking-[0.3em] uppercase mb-2">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{act.time} • {act.duration}</span>
                  </div>
                  <h3 className="font-gemola text-2xl sm:text-3xl font-light text-white mb-2">
                    {act.title}
                  </h3>
                  <p className="text-xs text-[#C2CBD2] font-light max-w-lg mx-auto leading-relaxed">
                    {act.description}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={act.id}
                className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                  isLeft ? 'md:text-right' : 'md:flex-row-reverse'
                }`}
              >
                {/* Center Node Marker on Desktop */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#2271B1] items-center justify-center z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E1721]" />
                </div>

                {/* Left Side Content */}
                <div className={isLeft ? 'md:pr-12' : 'md:col-start-2 md:pl-12 md:text-left'}>
                  <div className="flex items-center gap-3 mb-2 md:inline-flex">
                    <span className="font-mono text-sm font-semibold text-[#2271B1]">
                      {act.time}
                    </span>
                    <span className="text-[10px] font-mono text-[#7D8A95] uppercase tracking-wider bg-[#F4F7F9] px-2 py-0.5 rounded-xs">
                      {act.duration}
                    </span>
                    <span className="text-[10px] font-mono text-[#2271B1] uppercase tracking-wider">
                      {act.categoryTag}
                    </span>
                  </div>

                  <h3 className="font-gemola text-3xl sm:text-4xl text-[#0E1721] font-light mb-2">
                    {act.title}
                  </h3>

                  <p className="text-xs font-mono text-[#7D8A95] uppercase tracking-wider mb-3">
                    Performer: <span className="text-[#0E1721] font-medium">{act.performer}</span>
                  </p>

                  <p className="text-xs sm:text-sm text-[#31465A] font-light leading-relaxed">
                    {act.description}
                  </p>
                </div>

                {/* Empty side for rhythm */}
                <div className={isLeft ? 'hidden md:block md:col-start-2' : 'hidden md:block md:col-start-1'} />
              </div>
            );
          })}
        </div>

        {/* Performance Rules & Etiquette */}
        <div className="mt-24 p-8 border border-ink-10 bg-[#F9FBFC] rounded-sm">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#7D8A95] block mb-3">
            Concert Protocols & Hall Etiquette
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#31465A] font-light leading-relaxed">
            <p>
              • <strong>Punctuality:</strong> Doors close precisely at 05:55 PM. Once the overture begins, late entrants will be held in the foyer until the conclusion of Act I.
            </p>
            <p>
              • <strong>Acoustic Sanctuary:</strong> To maintain the pristine soundscape, all mobile devices must be switched to silent or powered off.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={onOpenTicketsModal}
            className="px-8 py-3.5 bg-[#0E1721] hover:bg-[#2271B1] text-white text-xs uppercase tracking-[0.25em] font-medium transition-colors rounded-sm"
          >
            Reserve Your Seat for the Programme →
          </button>
        </div>
      </div>
    </div>
  );
};
