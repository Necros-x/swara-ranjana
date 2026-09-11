"use client";

import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({
  src,
  alt,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /*
   * Window-style parallax:
   * the page/window moves at normal scroll speed while the photograph sits on
   * a slightly deeper plane and drifts much more slowly behind it.
   *
   * Important: there is deliberately NO scroll-linked scale, zoom, rotate or
   * changing Z depth here. The crop stays visually stable while only the
   * relative vertical position changes.
   */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 30,
    mass: 0.45,
  });

  const y = useTransform(
    smoothProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["-5%", "5%"],
  );

  return (
    <div
      ref={ref}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <motion.div
        className="absolute inset-x-0 -top-[10%] h-[120%] w-full"
        style={{
          y,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          willChange: reduceMotion ? "auto" : "transform",
        }}
      >
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${className || ""}`}
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(-1px)",
          }}
        />
      </motion.div>
    </div>
  );
};
