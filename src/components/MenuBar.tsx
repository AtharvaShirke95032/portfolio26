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
  return (
    <a href="#top" aria-label="back to top" className="absolute left-1/2 -translate-x-1/2">
      {/* curled-up cat — wiggles hello on hover */}
      <motion.img
        src="/media/logo-cat.png"
        alt=""
        className="dark-invert h-9 w-auto select-none"
        draggable={false}
        whileHover={{ rotate: [0, -10, 8, -4, 0], scale: 1.08, transition: { duration: 0.6 } }}
        whileTap={{ scale: 0.92 }}
      />
    </a>
  );
}

const subscribeTheme = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};
const themeNow = () => document.documentElement.dataset.theme ?? "light";

function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, themeNow, () => "light");
  const dark = theme === "dark";
  const flip = () => {
    const root = document.documentElement;
    const next = dark ? "light" : "dark";
    // animate colours only for the switch itself, not on every hover
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTimeout(() => root.classList.remove("theme-switching"), 400);
  };
  return (
    <button
      onClick={flip}
      aria-label={dark ? "switch to light theme" : "switch to dark theme"}
      title={dark ? "light mode" : "dark mode"}
      className="relative flex h-[18px] w-[18px] items-center justify-center transition-colors hover:text-neutral-900"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.svg
          key={theme}
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          {dark ? (
            <>
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
            </>
          ) : (
            <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7Z" />
          )}
        </motion.svg>
      </AnimatePresence>
    </button>
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
            <ThemeToggle />
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
