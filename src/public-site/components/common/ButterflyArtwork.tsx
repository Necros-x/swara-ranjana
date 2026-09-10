import React from "react";
import { motion } from "motion/react";

export interface ButterflyArtworkProps {
  className?: string;
  variant?:
    | "full"
    | "right-wing-hero"
    | "left-wing"
    | "mirrored-backdrop"
    | "subtle-watermark"
    | "cobalt-focus";
  animate?: boolean;
  opacity?: number;
  glow?: boolean;
}

export const ButterflyArtwork: React.FC<ButterflyArtworkProps> = ({
  className = "",
  variant = "full",
  animate = true,
  opacity = 1,
  glow = true,
}) => {
  // Base SVG rendering an intricate, organic, sharp editorial butterfly
  const renderSingleWing = (isRight: boolean = true) => {
    const rightWingTransform = "translate(20, 0) rotate(-5)";

    const leftWingTransform = "scale(-1, 1) translate(20, 0) rotate(-5)";

    const transform = isRight ? rightWingTransform : leftWingTransform;

    return (
      <g transform={transform} style={{ transformOrigin: "150px 250px" }}>
        <defs>
          {/* Vibrant Cobalt Gradient matching cvr 1.jpg and cvr 2-2.jpg */}
          <radialGradient
            id={`cobaltEyeUpper_${isRight ? "R" : "L"}`}
            cx="68%"
            cy="38%"
            r="48%"
          >
            <stop offset="0%" stopColor="#4BB0FF" />
            <stop offset="35%" stopColor="#2271B1" />
            <stop offset="70%" stopColor="#124A7A" />
            <stop offset="100%" stopColor="#0B253D" />
          </radialGradient>

          <radialGradient
            id={`cobaltEyeLower_${isRight ? "R" : "L"}`}
            cx="55%"
            cy="50%"
            r="55%"
          >
            <stop offset="0%" stopColor="#3FA4F5" />
            <stop offset="45%" stopColor="#2271B1" />
            <stop offset="80%" stopColor="#0F385B" />
            <stop offset="100%" stopColor="#091A2A" />
          </radialGradient>

          {/* Ethereal Smudge Filter */}
          <filter
            id={`smokeBlur_${isRight ? "R" : "L"}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
        </defs>

        {/* --- UPPER FOREWING --- */}
        {/* Outer Wing Silhouette */}
        <path
          d="M 150 180
             C 170 140, 205 90, 240 45
             C 248 35, 255 30, 258 35
             C 245 52, 230 75, 218 90
             C 240 82, 268 76, 290 85
             C 275 100, 250 120, 235 130
             C 260 135, 292 148, 310 175
             C 285 180, 250 182, 228 185
             C 265 205, 295 238, 298 275
             C 280 270, 255 250, 230 230
             C 245 258, 250 295, 238 325
             C 222 305, 205 275, 185 245
             C 165 230, 155 210, 150 180 Z"
          fill="#FEFFFF"
          stroke="#0E1721"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Shading/Smoky Interior plumes */}
        <path
          d="M 175 160
             C 200 120, 225 80, 245 58
             C 230 85, 210 110, 200 130
             C 225 118, 255 110, 270 118
             C 248 135, 220 150, 205 165
             C 238 168, 268 182, 278 210
             C 255 212, 225 210, 200 205
             C 230 225, 255 252, 255 278
             C 238 270, 215 248, 195 228
             C 205 252, 208 278, 198 298
             C 188 280, 175 252, 165 220 Z"
          fill="none"
          stroke="#0E1721"
          strokeWidth="2.2"
          opacity="0.85"
        />

        {/* Upper Wing Cobalt Eye Pool (Signature feature) */}
        <path
          d="M 188 140
             C 215 110, 250 100, 265 115
             C 275 130, 255 158, 225 170
             C 200 178, 182 165, 188 140 Z"
          fill={`url(#cobaltEyeUpper_${isRight ? "R" : "L"})`}
          stroke="#0E1721"
          strokeWidth="2"
        />

        {/* Cobalt Inner Core Whisper */}
        <path
          d="M 205 135
             C 222 120, 245 118, 252 126
             C 256 135, 242 148, 226 154
             C 212 158, 202 150, 205 135 Z"
          fill="#4BB0FF"
          opacity="0.75"
        />

        {/* Upper Wing Outer Spikes / Flame Points */}
        <path d="M 240 45 Q 260 22 285 10 Q 265 35 258 35" fill="#0E1721" />
        <path d="M 290 85 Q 318 70 340 60 Q 312 85 305 92" fill="#0E1721" />
        <path
          d="M 310 175 Q 338 170 355 172 Q 330 188 320 192"
          fill="#0E1721"
        />

        {/* --- LOWER HINDWING --- */}
        <path
          d="M 150 225
             C 170 235, 195 260, 210 295
             C 225 330, 220 370, 200 405
             C 185 430, 160 445, 145 440
             C 140 438, 142 420, 148 400
             C 135 418, 120 430, 105 425
             C 112 405, 128 375, 138 340
             C 142 320, 145 280, 150 225 Z"
          fill="#FEFFFF"
          stroke="#0E1721"
          strokeWidth="3"
        />

        {/* Lower Wing Cobalt Tear Drop (Signature feature) */}
        <path
          d="M 160 280
             C 185 295, 202 330, 195 365
             C 188 395, 168 410, 152 400
             C 142 385, 145 350, 152 315
             C 155 300, 156 290, 160 280 Z"
          fill={`url(#cobaltEyeLower_${isRight ? "R" : "L"})`}
          stroke="#0E1721"
          strokeWidth="2"
        />

        {/* Lower Wing Inner Highlight */}
        <path
          d="M 166 310
             C 178 322, 188 345, 182 368
             C 176 385, 165 390, 158 382
             C 152 370, 155 345, 160 325 Z"
          fill="#4BB0FF"
          opacity="0.65"
        />

        {/* Feather serration strokes */}
        <path
          d="M 210 295 Q 235 315 250 338 Q 225 338 215 328"
          fill="#0E1721"
        />
        <path
          d="M 200 405 Q 215 435 220 460 Q 198 440 190 425"
          fill="#0E1721"
        />

        {/* Long Graceful Tail Streamer (Curling down) */}
        <path
          d="M 148 400
             C 155 450, 170 510, 165 570
             C 160 620, 140 660, 130 680
             C 125 690, 120 685, 125 675
             C 135 650, 150 610, 152 560
             C 155 500, 145 440, 140 395"
          fill="none"
          stroke="#0E1721"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 130 680
             C 138 700, 152 710, 158 705
             C 164 700, 160 685, 150 675"
          fill="none"
          stroke="#2271B1"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    );
  };

  if (variant === "right-wing-hero") {
    return (
      <motion.div
        className={`relative select-none pointer-events-none ${className}`}
        initial={animate ? { opacity: 0, x: 40 } : false}
        animate={animate ? { opacity: opacity, x: 0 } : false}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          viewBox="140 0 250 720"
          className="w-full h-full object-contain overflow-visible drop-shadow-[0_15px_30px_rgba(14,23,33,0.06)]"
          style={{ maxHeight: "100%" }}
        >
          {renderSingleWing(true)}
        </svg>
      </motion.div>
    );
  }

  if (variant === "left-wing") {
    return (
      <motion.div
        className={`relative select-none pointer-events-none ${className}`}
        initial={animate ? { opacity: 0, x: -40 } : false}
        animate={animate ? { opacity: opacity, x: 0 } : false}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          viewBox="-100 0 250 720"
          className="w-full h-full object-contain overflow-visible"
        >
          {renderSingleWing(false)}
        </svg>
      </motion.div>
    );
  }

  if (variant === "subtle-watermark") {
    return (
      <div
        className={`absolute select-none pointer-events-none overflow-hidden ${className}`}
        style={{ opacity }}
      >
        <svg
          viewBox="0 0 300 720"
          className="w-full h-full object-contain opacity-25 filter blur-[0.5px]"
        >
          {renderSingleWing(false)}
          {renderSingleWing(true)}
        </svg>
      </div>
    );
  }

  // Full symmetrical butterfly (Matches cvr 2-2.jpg)
  return (
    <motion.div
      className={`relative select-none ${className}`}
      initial={animate ? { opacity: 0, scale: 0.96 } : false}
      animate={animate ? { opacity: opacity, scale: 1 } : false}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg
        viewBox="-80 0 460 740"
        className={`w-full h-full object-contain overflow-visible ${
          glow ? "drop-shadow-[0_10px_35px_rgba(34,113,177,0.12)]" : ""
        }`}
      >
        {/* Center Body & Antennae */}
        <g id="butterfly-body">
          {/* Head & Antennae */}
          <path
            d="M 148 160 C 145 130, 135 105, 125 90"
            fill="none"
            stroke="#0E1721"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 152 160 C 155 130, 165 105, 175 90"
            fill="none"
            stroke="#0E1721"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Antenna tips with cobalt dot */}
          <circle cx="125" cy="90" r="2.2" fill="#2271B1" />
          <circle cx="175" cy="90" r="2.2" fill="#2271B1" />

          {/* Thorax and Abdomen */}
          <ellipse cx="150" cy="190" rx="4.5" ry="25" fill="#0E1721" />
          <ellipse cx="150" cy="245" rx="3.5" ry="32" fill="#0E1721" />
          <ellipse cx="150" cy="210" rx="2.5" ry="12" fill="#2271B1" />
        </g>

        {/* Left Wing - gentle flap */}
        <motion.g
          style={{
            transformOrigin: "150px 210px",
          }}
          animate={
            animate
              ? {
                  scaleX: [1, 0.955, 1],
                  rotate: [0, 1.2, 0],
                }
              : undefined
          }
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {renderSingleWing(false)}
        </motion.g>

        {/* Right Wing - gentle flap */}
        <motion.g
          style={{
            transformOrigin: "150px 210px",
          }}
          animate={
            animate
              ? {
                  scaleX: [1, 0.955, 1],
                  rotate: [0, -1.2, 0],
                }
              : undefined
          }
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {renderSingleWing(true)}
        </motion.g>
      </svg>
    </motion.div>
  );
};
