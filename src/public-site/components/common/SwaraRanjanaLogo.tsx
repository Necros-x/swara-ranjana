import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  onClick?: () => void;
}

const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'w-[118px] sm:w-[132px]',
  md: 'w-[178px] sm:w-[210px]',
  lg: 'w-[260px] sm:w-[300px]',
  xl: 'w-[360px] sm:w-[430px]',
  hero: 'w-[min(82vw,620px)]',
};

export const SwaraRanjanaLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  theme = 'dark',
  onClick,
}) => {
  const image = (
    <img
      src="/brand/swara-ranjana-logo.webp"
      alt="Swara Ranjana"
      className={`block h-auto object-contain ${sizeClasses[size]} ${theme === 'dark' ? 'invert' : ''}`}
    />
  );

  if (onClick) {
    return (
      <button
        id="swara-ranjana-wordmark"
        type="button"
        onClick={onClick}
        className={`inline-flex select-none items-center justify-center cursor-pointer transition-opacity hover:opacity-85 ${className}`}
        aria-label="Swara Ranjana home"
      >
        {image}
      </button>
    );
  }

  return (
    <div
      id="swara-ranjana-wordmark"
      className={`inline-flex select-none items-center justify-center ${className}`}
    >
      {image}
    </div>
  );
};
