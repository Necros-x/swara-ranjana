import React, { useState, useEffect } from 'react';
import { playHoverChime } from '../../lib/audioInteraction';

interface EventCountdownProps {
  onReserveClick: () => void;
}

export const EventCountdown: React.FC<EventCountdownProps> = ({ onReserveClick }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-11-28T18:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-full border-y border-[#0E1721]/5 bg-white py-12 px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-10 z-20 relative">
      <div className="flex items-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-[10px] tracking-[0.25em] font-medium text-[#7D8A95] uppercase mb-3">Days</span>
          <span className="font-gemola text-4xl sm:text-5xl lg:text-6xl text-[#0E1721] tracking-tighter font-light">
            {formatNumber(timeLeft.days)}
          </span>
        </div>
        <span className="text-3xl font-light text-[#31465A] opacity-20 mt-4">:</span>
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-[10px] tracking-[0.25em] font-medium text-[#7D8A95] uppercase mb-3">Hours</span>
          <span className="font-gemola text-4xl sm:text-5xl lg:text-6xl text-[#0E1721] tracking-tighter font-light">
            {formatNumber(timeLeft.hours)}
          </span>
        </div>
        <span className="text-3xl font-light text-[#31465A] opacity-20 mt-4">:</span>
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-[10px] tracking-[0.25em] font-medium text-[#7D8A95] uppercase mb-3">Minutes</span>
          <span className="font-gemola text-4xl sm:text-5xl lg:text-6xl text-[#0E1721] tracking-tighter font-light">
            {formatNumber(timeLeft.minutes)}
          </span>
        </div>
        <span className="text-3xl font-light text-[#31465A] opacity-20 mt-4 hidden sm:block">:</span>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-[10px] tracking-[0.25em] font-medium text-[#7D8A95] uppercase mb-3">Seconds</span>
          <span className="font-gemola text-4xl sm:text-5xl lg:text-6xl text-[#0E1721] tracking-tighter font-light">
            {formatNumber(timeLeft.seconds)}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#31465A] max-w-[240px] leading-relaxed text-center sm:text-right">
          The anticipation builds.<br/> Secure your presence.
        </span>
        <button
          onClick={onReserveClick}
          onMouseEnter={playHoverChime}
          className="bg-[#0E1721] text-white px-10 py-5 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#2271B1] transition-colors duration-500 whitespace-nowrap"
        >
          Reserve Tickets
        </button>
      </div>
    </div>
  );
};
