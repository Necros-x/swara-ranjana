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

  // Use a real 3D camera-space movement rather than a flat 2D translate.
  // The oversized image plane prevents edges being exposed as the image
  // travels toward / away from the viewer.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 82,
    damping: 24,
    mass: 0.35,
  });
  const y = useTransform(smoothProgress, [0, 0.5, 1], ["-18%", "0%", "18%"]);
  const z = useTransform(smoothProgress, [0, 0.5, 1], [-150, 95, -135]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [7, 0, -7]);
  const rotateY = useTransform(smoothProgress, [0, 0.5, 1], [-2.4, 0, 2.4]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{
        perspective: "900px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <motion.div
        className="absolute -inset-[18%] origin-center"
        style={
          reduceMotion
            ? {
                transform: "translate3d(0,0,0)",
              }
            : {
                y,
                z,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }
        }
      >
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${className || ""}`}
          style={{ backfaceVisibility: "hidden" }}
        />
      </motion.div>
    </div>
  );
};
