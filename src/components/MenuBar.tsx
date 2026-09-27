"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
    <a href="#top" aria-label="back to top" className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
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

function flipTheme(dark: boolean) {
  const root = document.documentElement;
  const next = dark ? "light" : "dark";
  // animate colours only for the switch itself, not on every hover
  root.classList.add("theme-switching");
  root.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#121214" : "#f4f4f3");
  try {
    localStorage.setItem("theme", next);
  } catch {}
  setTimeout(() => root.classList.remove("theme-switching"), 400);
}

function ThemeGlyph({ dark, className }: { dark: boolean; className: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.svg
        key={dark ? "sun" : "moon"}
        viewBox="0 0 24 24"
        className={className}
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
  );
}

function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, themeNow, () => "light");
  const dark = theme === "dark";
  return (
    <button
      onClick={() => flipTheme(dark)}
      aria-label={dark ? "switch to light theme" : "switch to dark theme"}
      title={dark ? "light mode" : "dark mode"}
      className="relative flex h-[18px] w-[18px] items-center justify-center transition-colors hover:text-neutral-900"
    >
      <ThemeGlyph dark={dark} className="h-[18px] w-[18px]" />
    </button>
  );
}

type Music = ReturnType<typeof useMusic>;

function useMusic() {
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

  const element = (
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
  );
  return { playing, missing, progress, toggle, element };
}

function Cover({ playing, className }: { playing: boolean; className: string }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-linear-to-br from-sky-300 via-indigo-300 to-pink-300 shadow-sm transition-[border-radius] duration-300 ${className}`}
      style={{ borderRadius: playing ? 999 : 12, animation: playing ? "spin-slow 6s linear infinite" : undefined }}
    >
      {music.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={music.cover} alt="" className="h-full w-full object-cover" draggable={false} />
      )}
      {playing && <span className="absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 ring-1 ring-black/10" />}
    </div>
  );
}

function Eq({ playing, className = "" }: { playing: boolean; className?: string }) {
  return (
    <span className={`flex items-end gap-[2px] ${className}`} aria-hidden>
      {[0.9, 0.5, 1, 0.7].map((h, i) => (
        <span
          key={i}
          className="w-[2px] origin-bottom rounded-full bg-accent"
          style={{ height: `${h * 100}%`, animation: playing ? `eq ${0.6 + i * 0.13}s ease-in-out infinite` : undefined, opacity: playing ? 1 : 0.35 }}
        />
      ))}
    </span>
  );
}

function PlayIcon({ playing, className }: { playing: boolean; className: string }) {
  return playing ? (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={`ml-0.5 ${className}`} fill="currentColor" aria-hidden>
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}

function MusicPill({ open, m }: { open: boolean; m: Music }) {
  const { playing, missing, progress, toggle } = m;
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
            <Cover playing={playing} className="h-11 w-11" />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                listening rn to
                <Eq playing={playing} className="h-2.5" />
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
              <PlayIcon playing={playing} className="h-4 w-4" />
            </button>
            {/* hairline progress along the bottom */}
            <span className="absolute inset-x-0 bottom-0 h-[2px] bg-black/5">
              <span className="block h-full bg-accent" style={{ width: `${progress * 100}%` }} />
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const sections = [
  { id: "top", label: "home" },
  { id: "about", label: "about" },
  { id: "projects", label: "projects" },
  { id: "experience", label: "experience" },
  { id: "skills", label: "skills" },
  { id: "contact", label: "contact" },
];

function ControlIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="7" rx="3.5" />
      <circle cx="16.5" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
      <rect x="3" y="13" width="18" height="7" rx="3.5" fill="currentColor" />
      <circle cx="7.5" cy="16.5" r="1.6" className="fill-[var(--background)]" stroke="none" />
    </svg>
  );
}

/** phone/tablet navigation, styled like macOS control center */
function ControlCenter({ open, onClose, m }: { open: boolean; onClose: () => void; m: Music }) {
  const theme = useSyncExternalStore(subscribeTheme, themeNow, () => "light");
  const dark = theme === "dark";
  const tile = "cc-tile rounded-[22px]";
  const pill = `${tile} flex h-14 items-center gap-2.5 px-4 text-[15px]`;
  const pop = (i: number) => ({
    initial: { opacity: 0, scale: 0.92, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { delay: 0.03 * i, type: "spring" as const, stiffness: 420, damping: 28 } },
  });

  const go = (id: string) => {
    onClose();
    // let the panel close before scrolling so the jump lands where it should
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          // tapping anywhere that isn't a tile (empty space, gaps between tiles) closes it
          onClick={(e) => {
            if (!(e.target as Element).closest("a, button, .cc-tile")) onClose();
          }}
          className="dots fixed inset-x-0 bottom-0 top-[52px] z-[940] overflow-y-auto bg-[var(--background)] px-4 pb-10 pt-6 lg:hidden"
        >
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between px-1 pb-3 text-[15px] text-neutral-400">
              <Clock />
              <BatteryIcon className="h-[16px] w-[28px]" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="grid gap-2.5">
                <motion.div {...pop(0)} className={`${pill} text-neutral-500`}>
                  <WifiIcon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">open to work</span>
                </motion.div>
                <motion.button
                  {...pop(1)}
                  onClick={() => flipTheme(dark)}
                  className={`${pill} text-neutral-500`}
                  aria-label={dark ? "switch to light theme" : "switch to dark theme"}
                >
                  <ThemeGlyph dark={dark} className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{dark ? "light mode" : "dark mode"}</span>
                </motion.button>
                <motion.a {...pop(2)} href={`mailto:${profile.email}`} className={`${pill} justify-center font-medium text-accent`}>
                  <SparkIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">hire atharva</span>
                </motion.a>
              </div>

              {/* now playing */}
              <motion.button {...pop(1)} onClick={m.toggle} aria-label={m.playing ? "pause music" : "play music"} className={`${tile} flex flex-col p-4 text-left`}>
                <div className="flex w-full items-start justify-between">
                  <Cover playing={m.playing} className="aspect-square w-[60%]" />
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <PlayIcon playing={m.playing} className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-auto flex w-full items-end justify-between gap-2 pt-3">
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[16px] font-medium text-neutral-900">{music.title}</span>
                    <span className={`block truncate text-[13px] ${m.missing ? "text-rose-500" : "text-neutral-400"}`}>
                      {m.missing ? "track missing" : (music.artist ?? "listening rn")}
                    </span>
                  </span>
                  <Eq playing={m.playing} className="mb-1 h-4 shrink-0" />
                </div>
              </motion.button>

              {sections.map((sec, i) => (
                <motion.button
                  key={sec.id}
                  {...pop(3 + i)}
                  onClick={() => go(sec.id)}
                  className={`${tile} flex h-[88px] items-center justify-center text-[17px] font-medium text-neutral-900 active:scale-[0.97]`}
                >
                  {sec.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MenuBar() {
  const [pill, setPill] = useState(false);
  const [cc, setCc] = useState(false);
  const m = useMusic();

  // lock page scroll + close on escape while the control center is up
  useEffect(() => {
    if (!cc) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCc(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [cc]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[950] border-b border-black/[0.07] bg-[#f4f4f3]/80 backdrop-blur-xl">
        <nav className="relative mx-auto flex h-[52px] items-center px-4 text-[15px] sm:px-6 lg:text-[17px]">
          <a href="#top" className="hidden font-semibold text-neutral-900 lg:block">
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
            <WifiIcon className="hidden h-[18px] w-[18px] lg:block" />
            <button
              onClick={() => setPill((p) => !p)}
              aria-label="toggle music player"
              className={`hidden transition-colors hover:text-neutral-900 lg:block ${pill ? "text-neutral-700" : ""}`}
            >
              <HeadphonesIcon className="h-[18px] w-[18px]" />
            </button>
            <span className="hidden lg:contents">
              <ThemeToggle />
            </span>
            <BluetoothIcon className="hidden h-[16px] w-[16px] lg:block" />
            <BatteryIcon className="hidden h-[16px] w-[28px] lg:block" />
            <span className="hidden text-neutral-400 lg:inline">
              <Clock />
            </span>
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-1.5 font-medium text-accent transition-opacity hover:opacity-75"
            >
              <SparkIcon className="h-4 w-4" />
              <span className="lg:hidden">hire me</span>
              <span className="hidden lg:inline">hire atharva</span>
            </a>
            <button
              onClick={() => setCc((o) => !o)}
              aria-label={cc ? "close menu" : "open menu"}
              aria-expanded={cc}
              className={`-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-neutral-800 transition-colors lg:hidden ${cc ? "bg-black/5" : ""}`}
            >
              <ControlIcon className="h-[22px] w-[22px]" />
            </button>
          </div>
        </nav>
      </header>
      <MusicPill open={pill} m={m} />
      <ControlCenter open={cc} onClose={() => setCc(false)} m={m} />
      {m.element}
    </>
  );
}
