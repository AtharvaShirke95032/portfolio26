"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LofiEngine, PRESETS } from "@/lib/lofi";
import { music } from "@/lib/data";

export type Track = { title: string; artist: string; cover: string; kind: "file" | "synth"; index: number };

type Music = {
  playing: boolean;
  track: Track;
  tracks: Track[];
  toggle: () => void;
  next: () => void;
  prev: () => void;
  select: (i: number) => void;
  volume: number;
  setVolume: (v: number) => void;
};

const Ctx = createContext<Music | null>(null);

const synthTracks: Track[] = PRESETS.map((p, i) => ({
  title: p.title,
  artist: "atharva.fm · live synth",
  cover: p.cover,
  kind: "synth",
  index: i,
}));

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>(synthTracks);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const engine = useRef<LofiEngine | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  // If the user dropped a real mp3 in /public/music, put it at the top of the list.
  useEffect(() => {
    let cancelled = false;
    fetch(music.src, { method: "HEAD" })
      .then((r) => {
        const type = r.headers.get("content-type") ?? "";
        if (!cancelled && r.ok && type.startsWith("audio")) {
          setTracks([
            { title: music.title, artist: music.artist, cover: PRESETS[0].cover, kind: "file", index: -1 },
            ...synthTracks,
          ]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const stopAll = () => {
    engine.current?.stop();
    audio.current?.pause();
  };

  const playTrack = useCallback(
    async (t: Track) => {
      stopAll();
      if (t.kind === "file") {
        if (!audio.current) {
          audio.current = new Audio(music.src);
          audio.current.loop = true;
        }
        audio.current.volume = volume;
        await audio.current.play().catch(() => {});
      } else {
        engine.current ??= new LofiEngine();
        engine.current.setVolume(volume);
        await engine.current.start(PRESETS[t.index]);
      }
    },
    [volume],
  );

  const toggle = useCallback(() => {
    if (playing) {
      stopAll();
      setPlaying(false);
    } else {
      playTrack(tracks[current]);
      setPlaying(true);
    }
  }, [playing, tracks, current, playTrack]);

  const select = useCallback(
    (i: number) => {
      const idx = (i + tracks.length) % tracks.length;
      setCurrent(idx);
      playTrack(tracks[idx]);
      setPlaying(true);
    },
    [tracks, playTrack],
  );

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    engine.current?.setVolume(v);
    if (audio.current) audio.current.volume = v;
  }, []);

  useEffect(() => () => stopAll(), []);

  return (
    <Ctx.Provider
      value={{
        playing,
        track: tracks[current] ?? tracks[0],
        tracks,
        toggle,
        next: () => select(current + 1),
        prev: () => select(current - 1),
        select,
        volume,
        setVolume,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useMusic() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMusic must be used inside <MusicProvider>");
  return v;
}
