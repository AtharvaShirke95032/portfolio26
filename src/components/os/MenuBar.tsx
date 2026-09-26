"use client";

import { AnimatePresence, motion } from "motion/react";
import { BatteryFull, Headphones, Moon, Search, Sun, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APPS, DOCK_APPS } from "./apps";
import { useOS } from "./OSContext";
import { useMusic } from "./MusicContext";
import { useNow } from "./useNow";
import { profile } from "@/lib/data";

type Item = { label: string; shortcut?: string; action?: () => void } | "sep";

export default function MenuBar() {
  const os = useOS();
  const music = useMusic();
  const now = useNow(1000);
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  const appName = os.focused ? APPS[os.focused].menuName : "Finder";

  const menus: { name: string; bold?: boolean; items: Item[] }[] = [
    {
      name: appName,
      bold: true,
      items: [
        { label: `About ${profile.first}`, action: () => os.openApp("about") },
        "sep",
        { label: "Download Resume", action: () => window.open(profile.resume, "_blank") },
        { label: "Say Hi…", action: () => os.openApp("contact") },
        "sep",
        { label: "Restart…", action: os.reboot },
      ],
    },
    {
      name: "File",
      items: [
        { label: "New Sticky Note", shortcut: "⌘N", action: os.addNote },
        { label: "Open Resume.pdf", action: () => os.openApp("resume") },
        "sep",
        { label: "Close Window", shortcut: "⌘W", action: () => os.focused && os.closeApp(os.focused) },
      ],
    },
    {
      name: "View",
      items: [
        { label: os.theme === "dark" ? "Light Mode" : "Dark Mode", action: os.toggleTheme },
        { label: "Next Wallpaper", action: os.nextWallpaper },
        { label: "Tidy Up Desktop", action: os.tidyUp },
      ],
    },
    {
      name: "Go",
      items: [
        ...DOCK_APPS.map((id) => ({ label: APPS[id].title, action: () => os.openApp(id) })),
        "sep" as const,
        { label: "GitHub ↗", action: () => window.open(profile.links.github, "_blank") },
        { label: "LinkedIn ↗", action: () => window.open(profile.links.linkedin, "_blank") },
      ],
    },
    {
      name: "Help",
      items: [
        { label: "Spotlight Search", shortcut: "⌘K", action: () => os.setSpotlight(true) },
        "sep",
        { label: "Tip: drag everything", action: () => os.toast("Stickers, widgets, icons, windows — all draggable ✋") },
        { label: "Tip: right-click desktop", action: () => os.toast("Right-click the wallpaper for more options 🖱️") },
        { label: "Tip: the trash is real", action: () => os.toast("Drag a sticker onto the Trash in the dock 🗑️") },
      ],
    },
  ];

  return (
    <div
      ref={ref}
      className="glass no-select fixed inset-x-0 top-0 z-[9000] flex h-7 items-center justify-between border-x-0 border-t-0 px-2 text-[13px] text-ink"
    >
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Meow"
          onClick={() => {
            setOpen(null);
            os.toast("meow 🐱");
          }}
          className="rounded px-2.5 py-0.5 text-[15px] leading-none hover:bg-black/10 dark:hover:bg-white/15"
        >
          <CatLogo />
        </button>
        {menus.map((m, i) => (
          <div key={m.name + i} className={`relative ${i > 1 ? "max-sm:hidden" : ""}`}>
            <button
              type="button"
              onClick={() => setOpen(open === m.name ? null : m.name)}
              onMouseEnter={() => open && setOpen(m.name)}
              className={`rounded px-2.5 py-0.5 ${m.bold ? "font-semibold" : ""} ${
                open === m.name ? "bg-black/10 dark:bg-white/15" : ""
              }`}
            >
              {m.name}
            </button>
            <AnimatePresence>
              {open === m.name && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.12 }}
                  className="glass absolute left-0 top-7 min-w-56 rounded-lg p-1 shadow-xl"
                  style={{ background: "var(--glass-strong)" }}
                >
                  {m.items.map((it, j) =>
                    it === "sep" ? (
                      <div key={j} className="mx-2 my-1 h-px bg-hairline" />
                    ) : (
                      <button
                        key={j}
                        type="button"
                        onClick={() => {
                          setOpen(null);
                          it.action?.();
                        }}
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left hover:bg-accent hover:text-white"
                      >
                        {it.label}
                        {it.shortcut && <span className="ml-6 opacity-50">{it.shortcut}</span>}
                      </button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-0.5">
        <MenuIcon label={music.playing ? "Pause music" : "Play music"} onClick={music.toggle}>
          <Headphones size={15} className={music.playing ? "text-accent" : ""} />
        </MenuIcon>
        <MenuIcon label="Toggle appearance" onClick={os.toggleTheme}>
          {os.theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </MenuIcon>
        <span className="flex items-center gap-1 px-1.5 max-sm:hidden" title="100% — powered by chai ☕">
          <BatteryFull size={18} />
        </span>
        <span className="px-1.5 max-sm:hidden" title="Connected to: localhost">
          <Wifi size={15} />
        </span>
        <MenuIcon label="Spotlight" onClick={() => os.setSpotlight(true)}>
          <Search size={14} />
        </MenuIcon>
        <span className="px-2 tabular-nums" suppressHydrationWarning>
          {now
            ? `${now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}  ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
            : ""}
        </span>
      </div>
    </div>
  );
}

function MenuIcon({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-6 place-items-center rounded px-1.5 hover:bg-black/10 dark:hover:bg-white/15"
    >
      {children}
    </button>
  );
}

function CatLogo() {
  return (
    <svg width="16" height="15" viewBox="0 0 24 22" fill="currentColor" aria-hidden>
      <path d="M3 1l5 5.2A11 11 0 0112 5.6c1.4 0 2.8.2 4 .6L21 1l1 9.5c.6 1.3 1 2.7 1 4.2C23 19 18.1 22 12 22S1 19 1 14.7c0-1.5.4-2.9 1-4.2L3 1z" />
      <circle cx="8" cy="14" r="1.4" fill="var(--glass-strong)" />
      <circle cx="16" cy="14" r="1.4" fill="var(--glass-strong)" />
    </svg>
  );
}
