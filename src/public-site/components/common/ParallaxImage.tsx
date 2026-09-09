import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({ src, alt, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div ref={ref} className="w-full h-full absolute inset-0 overflow-hidden ">
      <motion.div style={{ y, scale: 1.25 }} className="w-full h-full origin-center">
        <img src={src} alt={alt} className={`w-full h-full object-cover ${className || ''}`} />
      </motion.div>
    </div>
  );
}
