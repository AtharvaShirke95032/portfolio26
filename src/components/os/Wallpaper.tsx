"use client";

import { motion } from "motion/react";
import { useOS } from "./OSContext";

// Each wallpaper: sky gradient + 4 wave layers (back → front), with light and dark variants.
const PALETTES: { light: string[]; dark: string[] }[] = [
  // sonoma sunset
  {
    light: ["#ffd6a5", "#ffadad", "#f48fb1", "#ba68c8", "#7e57c2", "#5e35b1"],
    dark: ["#2a1846", "#1b1030", "#6a2c70", "#8e3b7a", "#3f1d6b", "#1e0f3c"],
  },
  // ocean
  {
    light: ["#c2f0ff", "#8ecae6", "#74c0fc", "#4dabf7", "#1c7ed6", "#1864ab"],
    dark: ["#0b2239", "#061525", "#0f4c75", "#1b6ca8", "#0a3d62", "#062340"],
  },
  // mint hills
  {
    light: ["#f1ffe0", "#c9f2c7", "#96e6b3", "#5fd3a1", "#2bb58f", "#12836d"],
    dark: ["#0e2a24", "#07191a", "#135e4b", "#1a7f64", "#0f4d3f", "#07302a"],
  },
  // peach dusk
  {
    light: ["#fff1e6", "#ffd8be", "#ffb38a", "#ff8c61", "#e8603c", "#b83b26"],
    dark: ["#2b1510", "#170b08", "#7a2e1b", "#a8431f", "#5e2213", "#33130b"],
  },
];

const WAVES = [
  "M0 420 C 240 330, 480 470, 760 400 S 1240 300, 1440 380 L1440 900 L0 900 Z",
  "M0 520 C 300 440, 560 600, 860 520 S 1260 430, 1440 500 L1440 900 L0 900 Z",
  "M0 640 C 260 560, 620 720, 940 640 S 1300 580, 1440 640 L1440 900 L0 900 Z",
  "M0 760 C 320 690, 700 820, 1000 750 S 1320 710, 1440 760 L1440 900 L0 900 Z",
];

export default function Wallpaper() {
  const { wallpaper, theme } = useOS();
  const c = PALETTES[wallpaper][theme];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        key={`${wallpaper}-${theme}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${c[1]} 0%, ${c[0]} 55%, ${c[2]} 100%)` }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            {WAVES.map((_, i) => (
              <linearGradient key={i} id={`wg${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c[i + 2]} />
                <stop offset="1" stopColor={c[Math.min(i + 3, 5)]} />
              </linearGradient>
            ))}
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.05" />
              </feComponentTransfer>
            </filter>
          </defs>
          {WAVES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill={`url(#wg${i})`}
              opacity={0.92}
              animate={{ x: [0, i % 2 ? -30 : 30, 0] }}
              transition={{ duration: 18 + i * 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ scaleX: 1.06 }}
            />
          ))}
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </motion.div>
    </div>
  );
}
