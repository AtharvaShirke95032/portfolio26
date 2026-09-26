"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { APPS } from "./apps";
import { useOS, type AppId } from "./OSContext";
import { useViewport } from "./useViewport";

export const MENUBAR_H = 28;
export const DOCK_SPACE = 84;

type Geo = { x: number; y: number; w: number; h: number };

let cascade = 0;

function initialGeo(id: AppId, vw: number, vh: number): Geo {
  const { size } = APPS[id];
  const w = Math.min(size.w, vw - 32);
  const h = Math.min(size.h, vh - MENUBAR_H - DOCK_SPACE - 16);
  const offset = (cascade++ % 5) * 28;
  const x = Math.max(16, Math.round((vw - w) / 2) + offset - 56);
  const y = Math.max(MENUBAR_H + 8, Math.round((vh - DOCK_SPACE - h) / 2) + offset - 28);
  return { x, y, w, h };
}

export default function Window({ id }: { id: AppId }) {
  const os = useOS();
  const state = os.windows[id];
  const app = APPS[id];
  const { w: vw, h: vh, mobile } = useViewport();
  const [geo, setGeo] = useState<Geo>(() => initialGeo(id, vw, vh));
  const [animating, setAnimating] = useState(false);
  const drag = useRef<{ px: number; py: number; g: Geo; mode: string } | null>(null);
  const isFront = os.focused === id;

  const full = state.maximized || mobile;
  // clamped at render so windows stay reachable when the browser shrinks
  const box: Geo = full
    ? { x: 0, y: MENUBAR_H, w: vw, h: vh - MENUBAR_H - (mobile ? DOCK_SPACE - 8 : DOCK_SPACE) }
    : {
        w: Math.min(geo.w, vw - 16),
        h: Math.min(geo.h, vh - MENUBAR_H - 16),
        x: Math.min(Math.max(geo.x, -geo.w + 120), vw - 120),
        y: Math.min(Math.max(geo.y, MENUBAR_H), vh - 60),
      };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const mode = e.currentTarget.dataset.mode ?? "move";
    os.focusApp(id);
    if (full) return;
    if (mode === "move" && (e.target as HTMLElement).closest("button,input,a,[data-nodrag]")) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, g: box, mode };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (d.mode === "move") {
      setGeo({
        ...d.g,
        x: Math.min(Math.max(d.g.x + dx, -d.g.w + 100), vw - 100),
        y: Math.min(Math.max(d.g.y + dy, MENUBAR_H), vh - 40),
      });
    } else {
      setGeo({
        ...d.g,
        w: d.mode.includes("e") ? Math.max(320, d.g.w + dx) : d.g.w,
        h: d.mode.includes("s") ? Math.max(220, d.g.h + dy) : d.g.h,
      });
    }
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const toggleMax = () => {
    setAnimating(true);
    os.toggleMax(id);
    setTimeout(() => setAnimating(false), 320);
  };

  const Content = app.Content;

  return (
    <motion.div
      role="dialog"
      aria-label={app.title}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={
        state.minimized
          ? { opacity: 0, scale: 0.2, y: vh - box.y - 40 }
          : { opacity: 1, scale: 1, y: 0 }
      }
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.14 } }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      onPointerDownCapture={() => os.focusApp(id)}
      className={`window-shadow absolute flex flex-col overflow-hidden bg-window text-ink ${
        full && !mobile ? "rounded-none" : mobile ? "rounded-t-2xl" : "rounded-xl"
      } ${animating ? "transition-[left,top,width,height,border-radius] duration-300 ease-out" : ""} ${
        state.minimized ? "pointer-events-none" : ""
      }`}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, zIndex: 100 + state.z, transformOrigin: "50% 100%" }}
    >
      {/* title bar */}
      <div
        data-mode="move"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={(e) => {
          if (!mobile && !(e.target as HTMLElement).closest("button")) toggleMax();
        }}
        className={`no-select relative z-10 flex h-11 shrink-0 items-center gap-2 px-4 ${
          app.sidebar ? "absolute inset-x-0 top-0" : "border-b border-hairline bg-sidebar/60"
        } ${full ? "" : "cursor-grab active:cursor-grabbing"}`}
      >
        <TrafficLights
          active={isFront}
          onClose={() => os.closeApp(id)}
          onMin={() => os.minimizeApp(id)}
          onMax={mobile ? undefined : toggleMax}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 text-center text-[13px] font-semibold ${
            isFront ? "text-ink" : "text-muted"
          } ${app.sidebar ? "pl-40" : ""}`}
        >
          {app.title}
        </div>
      </div>

      <div className={`thin-scroll relative min-h-0 flex-1 ${app.sidebar ? "" : "overflow-auto"}`}>
        <Content />
      </div>

      {!full && (
        <>
          <div data-mode="e" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize" />
          <div data-mode="s" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize" />
          <div data-mode="se" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize" />
        </>
      )}
    </motion.div>
  );
}

export function TrafficLights({
  active = true,
  onClose,
  onMin,
  onMax,
}: {
  active?: boolean;
  onClose?: () => void;
  onMin?: () => void;
  onMax?: () => void;
}) {
  const light = (color: string, glyph: string, label: string, fn?: () => void) => (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        fn?.();
      }}
      disabled={!fn}
      className="grid h-3 w-3 place-items-center rounded-full text-[9px] font-black leading-none text-black/0 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)] transition-colors group-hover:text-black/55 disabled:opacity-40"
      style={{ background: active || !fn ? color : "var(--hairline)" }}
    >
      {glyph}
    </button>
  );
  return (
    <div className="group relative z-20 flex items-center gap-2">
      {light("#ff5f57", "×", "Close", onClose)}
      {light("#febc2e", "−", "Minimize", onMin)}
      {light("#28c840", "+", "Zoom", onMax)}
    </div>
  );
}
