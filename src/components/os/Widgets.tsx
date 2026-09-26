"use client";

import { AnimatePresence } from "motion/react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import Draggable from "./Draggable";
import { useOS } from "./OSContext";
import { useMusic } from "./MusicContext";
import { useNow } from "./useNow";
import { profile } from "@/lib/data";

type Bounds = React.RefObject<HTMLElement | null>;

const widgetCls = "glass rounded-[22px] text-ink shadow-[0_10px_30px_rgba(0,0,0,0.18)]";

export default function Widgets({ bounds }: { bounds: Bounds }) {
  const os = useOS();
  const show = (id: string) => !os.trashed(id);

  return (
    <AnimatePresence>
      {show("w-clock") && (
        <Draggable key={`clock-${os.tidyKey}`} item={{ id: "w-clock", label: "Clock widget", emoji: "🕒" }} bounds={bounds} className="left-4 top-10 sm:left-6 sm:top-12">
          <ClockWidget />
        </Draggable>
      )}
      {show("w-status") && (
        <Draggable key={`status-${os.tidyKey}`} item={{ id: "w-status", label: "Calendar widget", emoji: "📅" }} bounds={bounds} className="left-[calc(1rem+150px)] top-10 sm:left-[calc(1.5rem+180px)] sm:top-12">
          <StatusWidget />
        </Draggable>
      )}
      {show("w-music") && (
        <Draggable key={`music-${os.tidyKey}`} item={{ id: "w-music", label: "Now Playing widget", emoji: "🎧" }} bounds={bounds} className="left-4 top-[calc(2.5rem+150px)] sm:left-6 sm:top-[calc(3rem+180px)]">
          <NowPlaying />
        </Draggable>
      )}
      {show("w-weather") && (
        <Draggable key={`weather-${os.tidyKey}`} item={{ id: "w-weather", label: "Weather widget", emoji: "🌤️" }} bounds={bounds} className="left-6 top-[calc(3rem+312px)] max-sm:hidden">
          <WeatherWidget />
        </Draggable>
      )}
    </AnimatePresence>
  );
}

function ClockWidget() {
  const now = useNow(1000);
  const s = now ? now.getSeconds() : 0;
  const m = now ? now.getMinutes() + s / 60 : 0;
  const h = now ? (now.getHours() % 12) + m / 60 : 0;
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line
      x1="50"
      y1="50"
      x2="50"
      y2={50 - len}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      transform={`rotate(${deg} 50 50)`}
    />
  );
  return (
    <div className={`${widgetCls} grid h-[140px] w-[140px] place-items-center sm:h-[170px] sm:w-[170px]`}>
      <svg viewBox="0 0 100 100" className="h-[84%] w-[84%]">
        <circle cx="50" cy="50" r="48" className="fill-white dark:fill-neutral-900" />
        {Array.from({ length: 12 }, (_, i) => (
          <text
            key={i}
            x={50 + 37 * Math.sin(((i + 1) * Math.PI) / 6)}
            y={50 - 37 * Math.cos(((i + 1) * Math.PI) / 6) + 3.5}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            className="fill-neutral-800 dark:fill-neutral-200"
          >
            {i + 1}
          </text>
        ))}
        {now && (
          <>
            {hand(h * 30, 22, 3.4, "currentColor")}
            {hand(m * 6, 32, 2.4, "currentColor")}
            {hand(s * 6, 36, 1, "#ff9f0a")}
          </>
        )}
        <circle cx="50" cy="50" r="2.4" fill="#ff9f0a" />
        <text x="50" y="70" textAnchor="middle" fontSize="6" className="fill-neutral-400">
          PANVEL
        </text>
      </svg>
    </div>
  );
}

function StatusWidget() {
  const now = useNow(60_000);
  return (
    <div className={`${widgetCls} flex h-[140px] w-[140px] flex-col p-3.5 sm:h-[170px] sm:w-[170px] sm:p-4`}>
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#ff453a]">
        {now?.toLocaleDateString("en-US", { weekday: "long" }) ?? " "}
      </div>
      <div className="text-4xl font-light leading-none sm:text-5xl">{now?.getDate() ?? " "}</div>
      <div className="mt-auto space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          available for work
        </div>
        <div className="rounded-md border-l-[3px] border-[#bf5af2] bg-[#bf5af2]/15 px-2 py-1 text-[10px] leading-tight sm:text-[11px]">
          ship Outly 🚀
          <div className="text-muted">all day</div>
        </div>
      </div>
    </div>
  );
}

function WeatherWidget() {
  return (
    <div
      className="w-[356px] rounded-[22px] p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
      style={{ background: "linear-gradient(160deg,#4facfe,#2563eb)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{profile.location.split(",")[0]} ➤</div>
          <div className="text-5xl font-extralight leading-tight">29°</div>
        </div>
        <div className="text-right text-xs">
          <div className="text-3xl">🌤️</div>
          <div className="font-semibold">Mostly Shipping</div>
          <div className="opacity-80">H:100% L:0 bugs</div>
        </div>
      </div>
      <div className="mt-3 flex justify-between border-t border-white/25 pt-2 text-center text-[11px]">
        {[
          ["Now", "☕"],
          ["10AM", "💻"],
          ["1PM", "🍛"],
          ["4PM", "🐛"],
          ["7PM", "🚀"],
          ["2AM", "🌙"],
        ].map(([t, e]) => (
          <div key={t}>
            <div className="opacity-80">{t}</div>
            <div className="text-base">{e}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NowPlaying() {
  const music = useMusic();
  const os = useOS();
  return (
    <div className={`${widgetCls} flex w-[296px] items-center gap-3 p-3 sm:w-[356px]`}>
      <button
        type="button"
        aria-label="Open Music"
        onClick={() => os.openApp("music")}
        className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl shadow-md"
        style={{ background: music.track.cover }}
      >
        <Vinyl spinning={music.playing} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          {music.playing ? "Now Playing" : "Paused"}
        </div>
        <div className="truncate text-sm font-semibold">{music.track.title}</div>
        <div className="truncate text-xs text-muted">{music.track.artist}</div>
        <div className="mt-1.5 flex items-center gap-3">
          <IconBtn label="Previous" onClick={music.prev}>
            <SkipBack size={16} fill="currentColor" />
          </IconBtn>
          <IconBtn label={music.playing ? "Pause" : "Play"} onClick={music.toggle}>
            {music.playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </IconBtn>
          <IconBtn label="Next" onClick={music.next}>
            <SkipForward size={16} fill="currentColor" />
          </IconBtn>
          <Equalizer playing={music.playing} />
        </div>
      </div>
    </div>
  );
}

export function Vinyl({ spinning, size = 44 }: { spinning: boolean; size?: number }) {
  return (
    <div
      className="rounded-full shadow-lg"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle, #f5f5f5 0 13%, #111 14% 17%, #222 18% 30%, #111 31% 33%, #1d1d1d 34% 48%, #111 49%)",
        animation: "spin 3s linear infinite",
        animationPlayState: spinning ? "running" : "paused",
      }}
    />
  );
}

export function Equalizer({ playing }: { playing: boolean }) {
  return (
    <div className="ml-auto flex h-4 items-end gap-[3px]" aria-hidden>
      {[0.9, 0.6, 1.1, 0.75].map((d, i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-accent"
          style={{
            height: "100%",
            animation: `eq ${d}s ease-in-out ${i * 0.1}s infinite`,
            animationPlayState: playing ? "running" : "paused",
            transform: playing ? undefined : "scaleY(0.25)",
          }}
        />
      ))}
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerDownCapture={(e) => e.stopPropagation()}
      className="text-ink transition-transform hover:scale-110 active:scale-95"
    >
      {children}
    </button>
  );
}
