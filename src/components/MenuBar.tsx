"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { music, profile } from "@/lib/data";
import { BatteryIcon, BluetoothIcon, HeadphonesIcon, SparkIcon, WifiIcon } from "./icons";

const links = ["about", "projects", "experience", "skills", "contact"];

const subscribeClock = (cb: () => void) => {
  const t = setInterval(cb, 15_000);
  return () => clearInterval(t);
};
const timeNow = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toUpperCase();

function Clock() {
  const time = useSyncExternalStore(subscribeClock, timeNow, () => "\u00a0");
  return <span className="tabular-nums">{time}</span>;
}

function Logo() {
  const [happy, setHappy] = useState(false);
  return (
    <a
      href="#top"
      aria-label="back to top"
      className="absolute left-1/2 -translate-x-1/2"
      onMouseEnter={() => setHappy(true)}
      onMouseLeave={() => setHappy(false)}
    >
      <svg viewBox="0 0 64 36" className="h-8 w-14 text-neutral-900" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <motion.path
          animate={{ d: happy ? "M6 10 L12 4 L18 10" : "M6 8 L18 8" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
        <path d="M18 8 L34 30 L52 30" />
        <motion.path
          animate={{ d: happy ? "M44 10 L50 4 L56 10" : "M40 8 L58 8" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
      </svg>
    </a>
  );
}

function MusicPill({ open }: { open: boolean }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = async () => {
    const a = audio.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    try {
      await a.play();
      setPlaying(true);
      setMissing(false);
    } catch {
      setMissing(true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.9 }}
          className="fixed right-4 top-[58px] z-[900] cursor-grab touch-none active:cursor-grabbing sm:right-24"
        >
          <div className="relative flex w-[290px] items-center gap-3 overflow-hidden rounded-2xl bg-white/85 p-2 pr-2.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.08] backdrop-blur-xl">
            {/* cover — turns into a spinning record while playing */}
            <div
              className="relative h-11 w-11 shrink-0 overflow-hidden bg-linear-to-br from-sky-300 via-indigo-300 to-pink-300 shadow-sm transition-[border-radius] duration-300"
              style={{ borderRadius: playing ? 999 : 10, animation: playing ? "spin-slow 6s linear infinite" : undefined }}
            >
              {music.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={music.cover} alt="" className="h-full w-full object-cover" draggable={false} />
              )}
              {playing && <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 ring-1 ring-black/10" />}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                listening rn to
                <span className="flex h-2.5 items-end gap-[2px]" aria-hidden>
                  {[0.9, 0.5, 1, 0.7].map((h, i) => (
                    <span
                      key={i}
                      className="w-[2px] origin-bottom rounded-full bg-accent"
                      style={{ height: `${h * 10}px`, animation: playing ? `eq ${0.6 + i * 0.13}s ease-in-out infinite` : undefined, opacity: playing ? 1 : 0.35 }}
                    />
                  ))}
                </span>
              </div>
              <div className="truncate text-[15px] font-semibold text-neutral-900">{music.title}</div>
              {missing ? (
                <div className="truncate text-[11px] text-rose-500">add public/music/track.mp3</div>
              ) : (
                music.artist && <div className="truncate text-[12px] text-neutral-500">{music.artist}</div>
              )}
            </div>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggle}
              aria-label={playing ? "pause" : "play"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M7 4.5v15l13-7.5z" />
                </svg>
              )}
            </button>
            {/* hairline progress along the bottom */}
            <span className="absolute inset-x-0 bottom-0 h-[2px] bg-black/5">
              <span className="block h-full bg-accent" style={{ width: `${progress * 100}%` }} />
            </span>
            <audio
              ref={audio}
              src={music.src}
              loop
              preload="none"
              onError={() => setMissing(true)}
              onTimeUpdate={(e) => {
                const a = e.currentTarget;
                if (a.duration) setProgress(a.currentTime / a.duration);
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MenuBar() {
  const [pill, setPill] = useState(false);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[950] border-b border-black/[0.07] bg-[#f4f4f3]/80 backdrop-blur-xl">
        <nav className="relative mx-auto flex h-[52px] items-center px-4 text-[15px] sm:px-6 lg:text-[17px]">
          <a href="#top" className="font-semibold text-neutral-900">
            {profile.handle}
          </a>
          <div className="ml-5 hidden gap-5 text-neutral-500 lg:flex">
            {links.map((l) => (
              <a key={l} href={`#${l}`} className="transition-colors hover:text-neutral-900">
                {l}
              </a>
            ))}
          </div>
          <Logo />
          <div className="ml-auto flex items-center gap-4 text-neutral-400">
            <WifiIcon className="hidden h-[18px] w-[18px] md:block" />
            <button
              onClick={() => setPill((p) => !p)}
              aria-label="toggle music player"
              className={`hidden transition-colors hover:text-neutral-900 sm:block ${pill ? "text-neutral-700" : ""}`}
            >
              <HeadphonesIcon className="h-[18px] w-[18px]" />
            </button>
            <BluetoothIcon className="hidden h-[16px] w-[16px] md:block" />
            <BatteryIcon className="hidden h-[16px] w-[28px] md:block" />
            <span className="hidden text-neutral-400 sm:inline">
              <Clock />
            </span>
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-1.5 font-medium text-accent transition-opacity hover:opacity-75"
            >
              <SparkIcon className="h-4 w-4" />
              hire atharva
            </a>
          </div>
        </nav>
      </header>
      <MusicPill open={pill} />
    </>
  );
}
