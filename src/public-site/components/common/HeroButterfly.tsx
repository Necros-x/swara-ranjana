"use client";

import { motion, useReducedMotion } from "motion/react";

type PartName =
  | "body"
  | "RTop"
  | "LTop"
  | "RBottom"
  | "LBottom"
  | "RTail"
  | "LTail";

type PartMotion = {
  rotate?: number[];
  x?: number[];
  y?: number[];
  scaleX?: number[];
  scaleY?: number[];
  duration: number;
  delay?: number;
};

type PartConfig = {
  src: string;

  // Placement / resting pose — tweak these live.
  left: number;
  top: number;
  width: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  origin: string;
  zIndex: number;

  // Animation for this single Photoshop layer.
  motion?: PartMotion;
};

/**
 * PLACE THE ASSETS HERE:
 *
 * public/butterfly/body.webp
 * public/butterfly/RTop.webp
 * public/butterfly/LTop.webp
 * public/butterfly/RBottom.webp
 * public/butterfly/LBottom.webp
 * public/butterfly/RTail.webp
 * public/butterfly/LTail.webp
 *
 * ---------------------------------------------------------------------------
 * TWEAK PANEL
 * ---------------------------------------------------------------------------
 * left:    + right / - left
 * top:     + down / - up
 * width:   size
 * rotate:  resting angle
 * scaleX/Y resting stretch
 * origin:  animation hinge point
 *
 * motion.rotate / x / y / scaleX / scaleY affect ONLY that layer.
 *
 * Photoshop recommendation:
 * Export all seven layers from the same transparent document canvas if
 * possible. That makes alignment easier. If you crop them tightly, use the
 * values below to reconstruct the butterfly.
 */
export const BUTTERFLY_PARTS: Record<PartName, PartConfig> = {
  body: {
    src: "/butterfly/body.webp",
    left: 43,
    top: 10,
    width: 14,
    rotate: 0,
    scaleX: 0.4,
    scaleY: 0.4,
    origin: "50% 35%",
    zIndex: 50,
  },

  RTop: {
    src: "/butterfly/RTop.webp",
    left: 52,
    top: 3,
    width: 49,
    rotate: 0,
    scaleX: 1.5,
    scaleY: 1.5,
    origin: "4% 78%",
    zIndex: 30,
    motion: {
      rotate: [0, -3.2, 0],
      x: [0, -2, 0],
      y: [0, -2, 0],
      scaleX: [1, 0.965, 1],
      duration: 4.4,
    },
  },

  LTop: {
    src: "/butterfly/LTop.webp",
    left: -1,
    top: 3,
    width: 49,
    rotate: 0,
    scaleX: 1.5,
    scaleY: 1.5,
    origin: "96% 78%",
    zIndex: 30,
    motion: {
      rotate: [0, 3.2, 0],
      x: [0, 2, 0],
      y: [0, -2, 0],
      scaleX: [1, 0.965, 1],
      duration: 4.4,
    },
  },

  RBottom: {
    src: "/butterfly/RBottom.webp",
    left: 52,
    top: 33,
    width: 38,
    rotate: 0,
    scaleX: 1.5,
    scaleY: 1.5,
    origin: "6% 8%",
    zIndex: 20,
    motion: {
      rotate: [0, -1.7, 0],
      x: [0, -1, 0],
      y: [0, 2, 0],
      scaleX: [1, 0.98, 1],
      duration: 4.4,
      delay: 0.05,
    },
  },

  LBottom: {
    src: "/butterfly/LBottom.webp",
    left: 10,
    top: 33,
    width: 38,
    rotate: 0,
    scaleX: 1.5,
    scaleY: 1.5,
    origin: "94% 8%",
    zIndex: 20,
    motion: {
      rotate: [0, 1.7, 0],
      x: [0, 1, 0],
      y: [0, 2, 0],
      scaleX: [1, 0.98, 1],
      duration: 4.4,
      delay: 0.05,
    },
  },

  RTail: {
    src: "/butterfly/RTail.webp",
    left: 53,
    top: 40,
    width: 22,
    rotate: 0,
    scaleX: 0.6,
    scaleY: 0.6,
    origin: "8% 5%",
    zIndex: 10,
    motion: {
      rotate: [0, -0.8, 0.35, 0],
      x: [0, 1.5, -0.5, 0],
      y: [0, 1, 0, 0],
      duration: 5.6,
      delay: 0.1,
    },
  },

  LTail: {
    src: "/butterfly/LTail.webp",
    left: 25,
    top: 40,
    width: 22,
    rotate: 0,
    scaleX: 0.6,
    scaleY: 0.6,
    origin: "92% 5%",
    zIndex: 10,
    motion: {
      rotate: [0, 0.8, -0.35, 0],
      x: [0, -1.5, 0.5, 0],
      y: [0, 1, 0, 0],
      duration: 5.6,
      delay: 0.1,
    },
  },
};

const DRAW_ORDER: PartName[] = [
  "LTail",
  "RTail",
  "LBottom",
  "RBottom",
  "LTop",
  "RTop",
  "body",
];

function ButterflyPiece({
  name,
  animatePiece = true,
}: {
  name: PartName;
  animatePiece?: boolean;
}) {
  const part = BUTTERFLY_PARTS[name];
  const reduceMotion = useReducedMotion();
  const enabled = animatePiece && !reduceMotion && Boolean(part.motion);

  return (
    <motion.img
      src={part.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute h-auto select-none object-contain"
      style={{
        left: `${part.left}%`,
        top: `${part.top}%`,
        width: `${part.width}%`,
        zIndex: part.zIndex,
        transformOrigin: part.origin,
        willChange: "transform",
      }}
      initial={{
        rotate: part.rotate,
        scaleX: part.scaleX,
        scaleY: part.scaleY,
      }}
      animate={
        enabled && part.motion
          ? {
              rotate:
                part.motion.rotate?.map((value) => value + part.rotate) ??
                part.rotate,
              x: part.motion.x ?? 0,
              y: part.motion.y ?? 0,
              scaleX:
                part.motion.scaleX?.map((value) => value * part.scaleX) ??
                part.scaleX,
              scaleY:
                part.motion.scaleY?.map((value) => value * part.scaleY) ??
                part.scaleY,
            }
          : {
              rotate: part.rotate,
              x: 0,
              y: 0,
              scaleX: part.scaleX,
              scaleY: part.scaleY,
            }
      }
      transition={
        enabled && part.motion
          ? {
              duration: part.motion.duration,
              delay: part.motion.delay ?? 0,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : { duration: 0 }
      }
    />
  );
}

function ButterflyAssembly({
  animatePieces = true,
}: {
  animatePieces?: boolean;
}) {
  return (
    <div className="absolute inset-0">
      {DRAW_ORDER.map((name) => (
        <ButterflyPiece
          key={name}
          name={name}
          animatePiece={animatePieces}
        />
      ))}
    </div>
  );
}

export function HeroButterfly() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 flex items-center justify-center translate-x-[4%] sm:translate-x-[7%] lg:translate-x-[10%]">
      <motion.div
        className="relative h-[440px] w-[390px] sm:h-[590px] sm:w-[520px] lg:h-[740px] lg:w-[650px] xl:h-[800px] xl:w-[720px]"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={
          reduceMotion
            ? { opacity: 1, scale: 1 }
            : {
                opacity: 1,
                scale: 1,
                y: [-8, 10, -8],
                rotate: [-0.15, 0.15, -0.15],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0.5 }
            : {
                opacity: { duration: 1 },
                scale: { duration: 1 },
                y: {
                  duration: 7.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 7.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        {/* Dreamy concept-04 echo; same layers but no individual flap. */}
        <motion.div
          className="absolute inset-[-5%] opacity-[0.08] blur-[12px] sm:blur-[16px] lg:blur-[20px]"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [4, -5, 4],
                  scale: [1.12, 1.15, 1.12],
                }
          }
          transition={{
            duration: 10.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ButterflyAssembly animatePieces={false} />
        </motion.div>

        <div className="absolute left-1/2 top-[42%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2271B1]/5 blur-3xl sm:h-80 sm:w-80" />

        {/* Foreground: all seven Photoshop pieces animate independently. */}
        <ButterflyAssembly />
      </motion.div>
    </div>
  );
}
