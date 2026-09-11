"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
/**
 * ============================================================================
 * GLOBAL BUTTERFLY CONTROLLER
 * ============================================================================
 *
 * Change the whole composition from here instead of touching the JSX below.
 *
 * x / y        -> move the ENTIRE butterfly
 * scale        -> resize the ENTIRE butterfly
 * rotate       -> resting rotation of the ENTIRE butterfly
 *
 * hover        -> whole-butterfly floating movement
 * backdrop     -> larger blurred copy behind the main butterfly
 */
export const BUTTERFLY_GLOBAL = {
  x: 42,
  y: 100,
  scale: 1,
  rotate: 0,

  hover: {
    enabled: true,
    distance: 10,
    rotate: 0.15,
    duration: 7.2,
  },

  backdrop: {
    enabled: true,

    // Bigger than the foreground butterfly
    scale: 1.52,

    // Position relative to the main butterfly
    x: -8,
    y: -4,

    // Soft/faded treatment
    opacity: 0.11,
    blur: 22,

    // Very slow independent background drift
    drift: 6,
    breathe: 0.025,
    duration: 11,
  },
} as const;

export type ButterflyPose = "hero" | "corrected";

/**
 * Corrected pose for compact/mobile containers and every HeroButterfly use
 * outside the desktop homepage hero.
 *
 * TWEAK ONLY THESE THREE VALUES:
 * topWingY:    more negative = top wings move UP
 * bottomWingY: more positive = bottom wings move DOWN
 * tailY:       more positive = tails move DOWN
 *
 * The "hero" pose always returns zero offsets, so the current desktop homepage
 * butterfly stays exactly as it is.
 */
export const BUTTERFLY_CORRECTION = {
  topWingY: -2,
  bottomWingY: 7,
  tailY: 10,
} as const;

function getPartYOffset(name: PartName, pose: ButterflyPose) {
  if (pose === "hero") return 0;

  switch (name) {
    case "RTop":
    case "LTop":
      return BUTTERFLY_CORRECTION.topWingY;

    case "RBottom":
    case "LBottom":
      return BUTTERFLY_CORRECTION.bottomWingY;

    case "RTail":
    case "LTail":
      return BUTTERFLY_CORRECTION.tailY;

    default:
      return 0;
  }
}

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
  pose = "corrected",
  rapidFlap = false,
}: {
  name: PartName;
  animatePiece?: boolean;
  pose?: ButterflyPose;
  rapidFlap?: boolean;
}) {
  const part = BUTTERFLY_PARTS[name];
  const reduceMotion = useReducedMotion();
  const enabled = animatePiece && !reduceMotion && Boolean(part.motion);
  const topWing = name === "RTop" || name === "LTop";
  const bottomWing = name === "RBottom" || name === "LBottom";
  const flapWing = topWing || bottomWing;
  const direction = name.startsWith("R") ? -1 : 1;

  const rapidAnimation =
    rapidFlap && flapWing
      ? {
          rotate: topWing
            ? [
                part.rotate,
                part.rotate + 12 * direction,
                part.rotate,
                part.rotate + 10 * direction,
                part.rotate,
              ]
            : [
                part.rotate,
                part.rotate + 6 * direction,
                part.rotate,
                part.rotate + 5 * direction,
                part.rotate,
              ],
          x: [0, 0, 0, 0, 0],
          y: topWing ? [0, -3, 0, -2, 0] : [0, 2, 0, 2, 0],
          scaleX: topWing
            ? [
                part.scaleX,
                part.scaleX * 0.88,
                part.scaleX,
                part.scaleX * 0.9,
                part.scaleX,
              ]
            : [
                part.scaleX,
                part.scaleX * 0.94,
                part.scaleX,
                part.scaleX * 0.95,
                part.scaleX,
              ],
          scaleY: part.scaleY,
        }
      : null;

  return (
    <motion.img
      src={part.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute h-auto select-none object-contain"
      style={{
        left: `${part.left}%`,
        top: `${part.top + getPartYOffset(name, pose)}%`,
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
        rapidAnimation ??
        (enabled && part.motion
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
            })
      }
      transition={
        rapidAnimation
          ? {
              duration: 0.58,
              repeat: 0,
              ease: "easeInOut",
            }
          : enabled && part.motion
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
  pose = "corrected",
  rapidFlap = false,
}: {
  animatePieces?: boolean;
  pose?: ButterflyPose;
  rapidFlap?: boolean;
}) {
  return (
    <div className="absolute inset-0">
      {DRAW_ORDER.map((name) => (
        <ButterflyPiece
          key={name}
          name={name}
          animatePiece={animatePieces}
          pose={pose}
          rapidFlap={rapidFlap}
        />
      ))}
    </div>
  );
}

type HeroButterflyProps = {
  variant?: "foreground" | "backdrop";
  pose?: ButterflyPose;
};

export function HeroButterfly({
  variant = "foreground",
  pose = "corrected",
}: HeroButterflyProps) {
  const reduceMotion = useReducedMotion();
  const global = BUTTERFLY_GLOBAL;
  const isBackdrop = variant === "backdrop";
  const [rapidFlap, setRapidFlap] = useState(false);
  const hoverLocked = useRef(false);
  const flapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flapTimer.current) clearTimeout(flapTimer.current);
    };
  }, []);

  const startHoverFlap = () => {
    if (isBackdrop || reduceMotion || hoverLocked.current) return;

    hoverLocked.current = true;
    setRapidFlap(true);

    if (flapTimer.current) clearTimeout(flapTimer.current);
    flapTimer.current = setTimeout(() => {
      setRapidFlap(false);
    }, 620);
  };

  const resetHoverFlap = () => {
    hoverLocked.current = false;
  };

  const baseX = isBackdrop ? global.x + global.backdrop.x : global.x;
  const baseY = isBackdrop ? global.y + global.backdrop.y : global.y;
  const baseScale = isBackdrop
    ? global.scale * global.backdrop.scale
    : global.scale;

  const hoverDistance = isBackdrop
    ? global.backdrop.drift
    : global.hover.enabled
      ? global.hover.distance
      : 0;

  const hoverRotate = isBackdrop
    ? 0.06
    : global.hover.enabled
      ? global.hover.rotate
      : 0;

  const duration = isBackdrop
    ? global.backdrop.duration
    : global.hover.duration;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-auto"
      onMouseEnter={startHoverFlap}
      onMouseLeave={resetHoverFlap}
    >
      <motion.div
        className="relative h-[440px] w-[390px] sm:h-[590px] sm:w-[520px] lg:h-[740px] lg:w-[650px] xl:h-[800px] xl:w-[720px]"
        style={
          isBackdrop
            ? {
                filter: `blur(${global.backdrop.blur}px)`,
                transformOrigin: "50% 45%",
              }
            : undefined
        }
        initial={{
          opacity: isBackdrop ? global.backdrop.opacity : 0,
          x: baseX,
          y: baseY,
          scale: baseScale * (isBackdrop ? 1 : 0.97),
          rotate: global.rotate,
        }}
        animate={
          reduceMotion
            ? {
                opacity: isBackdrop ? global.backdrop.opacity : 1,
                x: baseX,
                y: baseY,
                scale: baseScale,
                rotate: global.rotate,
              }
            : {
                opacity: isBackdrop ? global.backdrop.opacity : 1,
                x: baseX,
                y: [
                  baseY - hoverDistance,
                  baseY + hoverDistance,
                  baseY - hoverDistance,
                ],
                scale: isBackdrop
                  ? [
                      baseScale,
                      baseScale + global.backdrop.breathe,
                      baseScale,
                    ]
                  : baseScale,
                rotate: [
                  global.rotate - hoverRotate,
                  global.rotate + hoverRotate,
                  global.rotate - hoverRotate,
                ],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0.5 }
            : {
                opacity: { duration: 1 },
                scale: isBackdrop
                  ? {
                      duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : { duration: 1 },
                x: { duration: 1 },
                y: {
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        {!isBackdrop && (
          <div className="absolute left-1/2 top-[42%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2271B1]/5 blur-3xl sm:h-80 sm:w-80" />
        )}

        {/* Same seven layers. Backdrop is static pieces; foreground keeps part motion. */}
        <ButterflyAssembly
          animatePieces={!isBackdrop}
          pose={pose}
          rapidFlap={rapidFlap}
        />
      </motion.div>
    </div>
  );
}
