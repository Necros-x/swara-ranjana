"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

export function PublicPageLoader() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);

  return (
    <motion.div
      id="public-experience-loader"
      className="fixed inset-0 z-[200] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#FEFFFF] px-6 text-[#0E1721]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.65,
        ease: [0.76, 0, 0.24, 1],
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading Swara Ranjana"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2271B1]/[0.035] blur-3xl sm:h-[620px] sm:w-[620px]" />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.15 : 0.7,
            delay: reduceMotion ? 0 : 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mb-5 font-mono text-[9px] uppercase tracking-[0.38em] text-[#2271B1] sm:text-[10px]"
        >
          Live Musical Experience • 2026
        </motion.div>

        <div className="overflow-hidden px-3 pb-1">
          <motion.h1
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: reduceMotion ? 0.2 : 0.85,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="font-gemola text-[clamp(2.8rem,10vw,5.6rem)] font-light leading-[0.9] tracking-[-0.045em] text-[#0E1721]"
          >
            SWARA RANJANA
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduceMotion ? 0.15 : 0.6,
            delay: reduceMotion ? 0 : 0.45,
          }}
          className="relative mt-8 h-px w-[200px] overflow-hidden bg-[#C2CBD2]/70"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-full bg-[#2271B1]"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 1.45,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }
            }
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.55 }}
          className="mt-5 font-mono text-[9px] uppercase tracking-[0.24em] text-[#7D8A95]"
        >
          Preparing the experience
        </motion.p>
      </div>
    </motion.div>
  );
}
