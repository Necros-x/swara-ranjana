import React from 'react';
import { motion } from 'motion/react';

interface SectionLabelProps {
  label: string;
  number?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  theme?: 'dark' | 'light';
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  label,
  number,
  className = '',
  align = 'left',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-3 select-none ${
        align === 'center'
          ? 'justify-center w-full'
          : align === 'right'
          ? 'justify-end w-full'
          : 'justify-start'
      } ${className}`}
    >
      {number && (
        <span
          className={`font-mono text-[11px] tracking-widest ${
            isLight ? 'text-[#C2CBD2]' : 'text-[#2271B1]'
          }`}
        >
          {number}
        </span>
      )}

      {number && (
        <span
          className={`w-4 h-[1px] ${
            isLight ? 'bg-white/30' : 'bg-[#2271B1]/40'
          }`}
        />
      )}

      <span
        className={`text-[10px] sm:text-[11px] font-medium tracking-[0.3em] sm:tracking-[0.4em] uppercase ${
          isLight ? 'text-white/80' : 'text-[#31465A]'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
};
