"use client";

import { Pause, Play, SkipBack, SkipForward, Volume1, Volume2 } from "lucide-react";
import { useMusic } from "../os/MusicContext";
import { Equalizer, Vinyl } from "../os/Widgets";

export default function MusicApp() {
  const m = useMusic();
  return (
    <div className="flex h-full flex-col">
      <div className="relative grid place-items-center overflow-hidden px-6 py-8" style={{ background: m.track.cover }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative">
          <Vinyl spinning={m.playing} size={180} />
        </div>
      </div>
      <div className="px-6 pt-4 text-center">
        <div className="text-lg font-semibold">{m.track.title}</div>
        <div className="text-sm text-muted">{m.track.artist}</div>
      </div>
      <div className="flex items-center justify-center gap-8 py-4">
        <button type="button" aria-label="Previous" onClick={m.prev} className="hover:scale-110 active:scale-95">
          <SkipBack size={24} fill="currentColor" />
        </button>
        <button
          type="button"
          aria-label={m.playing ? "Pause" : "Play"}
          onClick={m.toggle}
          className="grid h-14 w-14 place-items-center rounded-full bg-ink text-window hover:scale-105 active:scale-95"
        >
          {m.playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
        </button>
        <button type="button" aria-label="Next" onClick={m.next} className="hover:scale-110 active:scale-95">
          <SkipForward size={24} fill="currentColor" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-8 text-muted">
        <Volume1 size={16} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={m.volume}
          onChange={(e) => m.setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="flex-1 accent-[var(--accent)]"
        />
        <Volume2 size={16} />
      </div>
      <ul className="mt-4 flex-1 border-t border-hairline px-3 py-2">
        {m.tracks.map((t, i) => {
          const active = t === m.track;
          return (
            <li key={t.title}>
              <button
                type="button"
                onClick={() => m.select(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] ${active ? "bg-hairline" : "hover:bg-hairline/60"}`}
              >
                <span className="h-8 w-8 shrink-0 rounded-md" style={{ background: t.cover }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{t.title}</span>
                  <span className="block truncate text-xs text-muted">{t.kind === "synth" ? "generated live in your browser" : t.artist}</span>
                </span>
                {active && <Equalizer playing={m.playing} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
