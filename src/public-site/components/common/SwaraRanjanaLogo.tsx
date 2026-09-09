import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  onClick?: () => void;
}

export const SwaraRanjanaLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  theme = 'dark',
  onClick,
}) => {
  const sizeStyles = {
    sm: {
      swara: 'text-xl tracking-[0.2em]',
      ranjana: 'text-[7px] tracking-[0.6em] mt-0.5',
    },
    md: {
      swara: 'text-2xl sm:text-3xl tracking-[0.22em]',
      ranjana: 'text-[9px] sm:text-[10px] tracking-[0.7em] mt-1',
    },
    lg: {
      swara: 'text-4xl sm:text-5xl tracking-[0.25em]',
      ranjana: 'text-xs sm:text-sm tracking-[0.8em] mt-1.5',
    },
    xl: {
      swara: 'text-6xl sm:text-7xl lg:text-8xl tracking-[0.28em]',
      ranjana: 'text-sm sm:text-base lg:text-lg tracking-[0.9em] mt-2',
    },
    hero: {
      swara: 'text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] tracking-[0.18em] leading-none',
      ranjana: 'text-base sm:text-xl md:text-2xl lg:text-3xl tracking-[0.75em] sm:tracking-[0.9em] mt-3 sm:mt-6',
    },
  };

  const textColor = theme === 'light' ? 'text-white' : 'text-[#0E1721]';
  const subtitleColor = theme === 'light' ? 'text-white/80' : 'text-[#0E1721]/90';

  return (
    <div
      id="swara-ranjana-wordmark"
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center select-none cursor-pointer transition-opacity hover:opacity-90 ${className}`}
    >
      {/* Primary SWARA with bespoke editorial serif styling */}
      <span
        className={`font-gemola font-light uppercase inline-block ${sizeStyles[size].swara} ${textColor}`}
        style={{
          fontFeatureSettings: '"salt" on, "swsh" on',
        }}
      >
        <span className="inline-block transition-transform duration-300">S</span>
        <span className="inline-block -ml-[0.04em] font-normal italic">W</span>
        <span className="inline-block -ml-[0.03em]">A</span>
        <span className="inline-block -ml-[0.02em]">R</span>
        <span className="inline-block -ml-[0.03em]">A</span>
      </span>

      {/* Subtitle R A N J A N A with ultra wide tracking */}
      {showSubtitle && (
        <span
          className={`font-sans font-light uppercase text-center pl-[0.7em] ${sizeStyles[size].ranjana} ${subtitleColor}`}
        >
          R A N J A N A
        </span>
      )}
    </div>
  );
};
