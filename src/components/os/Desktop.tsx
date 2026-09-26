"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { OSProvider, useOS } from "./OSContext";
import { MusicProvider } from "./MusicContext";
import Wallpaper from "./Wallpaper";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import Window from "./Window";
import Stickers from "./Stickers";
import Widgets from "./Widgets";
import DesktopIcons from "./DesktopIcons";
import Spotlight from "./Spotlight";
import Boot from "./Boot";
import { useViewport } from "./useViewport";
import { useHydrated } from "./useNow";
import { profile } from "@/lib/data";

export default function Desktop() {
  // The desktop depends on viewport, theme and clock — render it in the browser only.
  if (!useHydrated()) return null;
  return (
    <OSProvider>
      <MusicProvider>
        <Shell />
      </MusicProvider>
    </OSProvider>
  );
}

function Shell() {
  const os = useOS();
  const bounds = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const { mobile } = useViewport();

  const onBooted = useCallback(() => {
    // greet desktop visitors with the About window; phones start on the desktop
    if (window.innerWidth >= 640) setTimeout(() => os.openApp("about"), 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [os.bootKey]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input,textarea,[contenteditable]");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        os.setSpotlight(!os.spotlight);
      } else if (e.key === "Escape" && !typing) {
        if (os.spotlight) os.setSpotlight(false);
        else if (os.focused) os.closeApp(os.focused);
        setMenu(null);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        os.setSpotlight(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [os]);

  const openWindows = os.order;

  return (
    <main
      className="fixed inset-0 overflow-hidden"
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest("[role=dialog],input,textarea")) return;
        e.preventDefault();
        setMenu({ x: Math.min(e.clientX, window.innerWidth - 230), y: Math.min(e.clientY, window.innerHeight - 220) });
      }}
      onPointerDown={() => menu && setMenu(null)}
    >
      <Wallpaper />
      <MenuBar />

      {/* big name on the wallpaper */}
      <div className="no-select pointer-events-none absolute inset-x-0 bottom-[96px] text-center text-white/90 max-sm:hidden">
        <h1 className="text-[clamp(56px,9vw,140px)] font-semibold leading-[0.9] tracking-[-0.04em] [text-shadow:0_4px_30px_rgba(0,0,0,0.15)]">
          {profile.first.toLowerCase()}.
        </h1>
        <p className="mt-2 text-sm font-medium tracking-[0.3em] text-white/75 uppercase">{profile.title} · {profile.location}</p>
      </div>

      <div ref={bounds} className="absolute inset-x-0 bottom-[76px] top-7">
        <Widgets bounds={bounds} />
        <Stickers bounds={bounds} />
        <DesktopIcons bounds={bounds} />
      </div>

      {mobile && (
        <div className="no-select pointer-events-none absolute inset-x-0 top-[calc(2.5rem+250px)] px-5 text-white">
          <h1 className="text-5xl font-semibold tracking-tight">{profile.first.toLowerCase()}.</h1>
          <p className="text-xs font-medium tracking-[0.2em] text-white/80 uppercase">{profile.title}</p>
        </div>
      )}

      <AnimatePresence>
        {openWindows.map((id) => (
          <Window key={`${id}-${os.windows[id].session}`} id={id} />
        ))}
      </AnimatePresence>

      <Dock />
      <Spotlight />

      <AnimatePresence>
        {menu && <ContextMenu key="ctx" x={menu.x} y={menu.y} close={() => setMenu(null)} />}
      </AnimatePresence>

      <Toasts />
      <Boot key={os.bootKey} onDone={onBooted} />
    </main>
  );
}

function ContextMenu({ x, y, close }: { x: number; y: number; close: () => void }) {
  const os = useOS();
  const items: ([string, () => void] | "sep")[] = [
    ["New Sticky Note", os.addNote],
    "sep",
    ["Change Wallpaper", os.nextWallpaper],
    [os.theme === "dark" ? "Use Light Mode" : "Use Dark Mode", os.toggleTheme],
    ["Tidy Up", os.tidyUp],
    "sep",
    ["Open Trash", () => os.openApp("trash")],
    ["Spotlight…", () => os.setSpotlight(true)],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ duration: 0.1 }}
      onPointerDown={(e) => e.stopPropagation()}
      className="glass fixed z-[9500] w-56 origin-top-left rounded-lg p-1 text-[13px] text-ink shadow-xl"
      style={{ left: x, top: y, background: "var(--glass-strong)" }}
    >
      {items.map((it, i) =>
        it === "sep" ? (
          <div key={i} className="mx-2 my-1 h-px bg-hairline" />
        ) : (
          <button
            key={it[0]}
            type="button"
            onClick={() => {
              close();
              it[1]();
            }}
            className="block w-full rounded-md px-2.5 py-1 text-left hover:bg-accent hover:text-white"
          >
            {it[0]}
          </button>
        ),
      )}
    </motion.div>
  );
}

function Toasts() {
  const { toasts } = useOS();
  return (
    <div className="pointer-events-none fixed right-3 top-9 z-[9800] flex w-72 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="glass rounded-2xl px-4 py-3 text-sm font-medium text-ink shadow-lg"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
