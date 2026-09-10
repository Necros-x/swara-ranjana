import React, { useEffect, useState } from 'react';
import { playHoverChime } from '../../lib/audioInteraction';

interface EventCountdownProps {
  onReserveClick: () => void;
}

export const EventCountdown: React.FC<EventCountdownProps> = ({
  onReserveClick,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-11-28T18:00:00+05:30').getTime();

    const updateCountdown = () => {
      const difference = targetDate - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) /
              (1000 * 60 * 60),
          ),
          minutes: Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60),
          ),
          seconds: Math.floor(
            (difference % (1000 * 60)) / 1000,
          ),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatNumber = (num: number) =>
    num.toString().padStart(2, '0');

  return (
    <section className="relative z-20 w-full border-y border-[#0E1721]/5 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:px-12 lg:py-12 xl:px-16">
        <div className="flex w-full items-center justify-center gap-4 sm:gap-8 lg:w-auto lg:justify-start xl:gap-10">
          {[
            ['Days', timeLeft.days],
            ['Hours', timeLeft.hours],
            ['Minutes', timeLeft.minutes],
            ['Seconds', timeLeft.seconds],
          ].map(([label, value], index) => (
            <React.Fragment key={label}>
              {index > 0 && (
                <span
                  className={`mt-4 text-2xl font-light text-[#31465A] opacity-20 sm:text-3xl ${
                    label === 'Seconds' ? 'hidden sm:block' : ''
                  }`}
                >
                  :
                </span>
              )}
              <div
                className={`flex flex-col items-center lg:items-start ${
                  label === 'Seconds' ? 'hidden sm:flex' : ''
                }`}
              >
                <span className="mb-3 text-[9px] font-medium uppercase tracking-[0.2em] text-[#7D8A95] sm:text-[10px] sm:tracking-[0.25em]">
                  {label}
                </span>
                <span className="font-gemola text-4xl font-light tracking-tighter text-[#0E1721] sm:text-5xl lg:text-6xl">
                  {formatNumber(value as number)}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-center lg:w-auto lg:justify-end lg:gap-8">
          <span className="max-w-[240px] text-center text-[10px] font-medium uppercase leading-relaxed tracking-[0.18em] text-[#31465A] sm:text-[11px] lg:text-right lg:tracking-[0.2em]">
            The anticipation builds.
            <br />
            Secure your presence.
          </span>
          <button
            type="button"
            onClick={onReserveClick}
            onMouseEnter={playHoverChime}
            className="w-full whitespace-nowrap bg-[#0E1721] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-[#2271B1] sm:w-auto lg:px-10 lg:py-5"
          >
            Reserve Tickets
          </button>
        </div>
      </div>
    </section>
  );
};
