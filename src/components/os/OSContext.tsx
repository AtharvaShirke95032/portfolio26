"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AppId =
  | "about"
  | "projects"
  | "experience"
  | "skills"
  | "resume"
  | "contact"
  | "music"
  | "trash";

export type WinState = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  z: number;
  // bumps every time the window is (re)opened so it gets fresh geometry
  session: number;
};

export type TrashItem = { id: string; label: string; emoji: string };

export type Note = { id: string; text: string; color: string };

type Toast = { id: number; text: string };

type OS = {
  windows: Record<AppId, WinState>;
  order: AppId[]; // front-most last
  focused: AppId | null;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  toggleMax: (id: AppId) => void;
  focusApp: (id: AppId) => void;

  theme: "light" | "dark";
  toggleTheme: () => void;
  wallpaper: number;
  nextWallpaper: () => void;

  projectId: string;
  showProject: (id: string) => void;

  trash: TrashItem[];
  trashed: (id: string) => boolean;
  toTrash: (item: TrashItem) => void;
  putBack: (id: string) => void;
  emptyTrash: () => void;
  gone: Set<string>;
  trashHot: boolean;
  setTrashHot: (v: boolean) => void;

  notes: Note[];
  addNote: () => void;
  updateNote: (id: string, text: string) => void;

  tidyKey: number;
  tidyUp: () => void;

  spotlight: boolean;
  setSpotlight: (v: boolean) => void;

  toasts: Toast[];
  toast: (text: string) => void;

  reboot: () => void;
  bootKey: number;
};

const Ctx = createContext<OS | null>(null);

export const WALLPAPERS = 4;

const APP_IDS: AppId[] = ["about", "projects", "experience", "skills", "resume", "contact", "music", "trash"];
const NOTE_COLORS = ["#fff59d", "#ffcc80", "#b3e5fc", "#c5e1a5", "#f8bbd0"];

function initialWindows(): Record<AppId, WinState> {
  const out = {} as Record<AppId, WinState>;
  for (const id of APP_IDS) out[id] = { open: false, minimized: false, maximized: false, z: 0, session: 0 };
  return out;
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState(initialWindows);
  const [zTop, setZTop] = useState(1);
  // the pre-paint script in layout.tsx already picked the theme
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const [wallpaper, setWallpaper] = useState(() => {
    try {
      const w = Number(localStorage.getItem("wallpaper"));
      if (Number.isInteger(w) && w >= 0 && w < WALLPAPERS) return w;
    } catch {}
    return 0;
  });
  const [projectId, setProjectId] = useState("outly");
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [gone, setGone] = useState<Set<string>>(() => new Set());
  const [trashHot, setTrashHot] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tidyKey, setTidyKey] = useState(0);
  const [spotlight, setSpotlight] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bootKey, setBootKey] = useState(0);

  const bringFront = useCallback(
    (id: AppId, patch: Partial<WinState> = {}) => {
      const z = zTop + 1;
      setZTop(z);
      setWindows((w) => ({ ...w, [id]: { ...w[id], ...patch, z } }));
    },
    [zTop],
  );

  const openApp = useCallback(
    (id: AppId) => {
      const cur = windows[id];
      if (cur.open) bringFront(id, { minimized: false });
      else bringFront(id, { open: true, minimized: false, maximized: false, session: cur.session + 1 });
    },
    [windows, bringFront],
  );

  const closeApp = useCallback((id: AppId) => {
    setWindows((w) => ({ ...w, [id]: { ...w[id], open: false, minimized: false } }));
  }, []);

  const minimizeApp = useCallback((id: AppId) => {
    setWindows((w) => ({ ...w, [id]: { ...w[id], minimized: true } }));
  }, []);

  const toggleMax = useCallback(
    (id: AppId) => bringFront(id, { maximized: !windows[id].maximized }),
    [windows, bringFront],
  );

  const focusApp = useCallback(
    (id: AppId) => {
      if (windows[id].z !== zTop) bringFront(id);
    },
    [windows, zTop, bringFront],
  );

  const order = useMemo(
    () => APP_IDS.filter((id) => windows[id].open).sort((a, b) => windows[a].z - windows[b].z),
    [windows],
  );
  const visible = order.filter((id) => !windows[id].minimized);
  const focused = visible.length ? visible[visible.length - 1] : null;

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      store("theme", next);
      return next;
    });
  }, []);

  const nextWallpaper = useCallback(() => {
    setWallpaper((w) => {
      const next = (w + 1) % WALLPAPERS;
      store("wallpaper", String(next));
      return next;
    });
  }, []);

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const toTrash = useCallback(
    (item: TrashItem) => {
      setTrash((t) => (t.some((x) => x.id === item.id) ? t : [...t, item]));
      toast(`${item.emoji} moved to Trash`);
    },
    [toast],
  );
  const putBack = useCallback((id: string) => setTrash((t) => t.filter((x) => x.id !== id)), []);
  const emptyTrash = useCallback(() => {
    setGone((g) => {
      const next = new Set(g);
      trash.forEach((t) => next.add(t.id));
      return next;
    });
    setTrash([]);
  }, [trash]);
  const trashed = useCallback((id: string) => gone.has(id) || trash.some((t) => t.id === id), [trash, gone]);

  const addNote = useCallback(() => {
    setNotes((n) => [
      ...n,
      { id: `note-${Date.now()}`, text: "", color: NOTE_COLORS[n.length % NOTE_COLORS.length] },
    ]);
  }, []);
  const updateNote = useCallback((id: string, text: string) => {
    setNotes((n) => n.map((x) => (x.id === id ? { ...x, text } : x)));
  }, []);

  const tidyUp = useCallback(() => setTidyKey((k) => k + 1), []);

  const reboot = useCallback(() => {
    try {
      sessionStorage.removeItem("booted");
    } catch {}
    setWindows(initialWindows());
    setBootKey((k) => k + 1);
  }, []);

  const value: OS = {
    windows,
    order,
    focused,
    openApp,
    closeApp,
    minimizeApp,
    toggleMax,
    focusApp,
    theme,
    toggleTheme,
    wallpaper,
    nextWallpaper,
    projectId,
    showProject: (id) => {
      setProjectId(id);
      openApp("projects");
    },
    trash,
    trashed,
    toTrash,
    putBack,
    emptyTrash,
    gone,
    trashHot,
    setTrashHot,
    notes,
    addNote,
    updateNote,
    tidyKey,
    tidyUp,
    spotlight,
    setSpotlight,
    toasts,
    toast,
    reboot,
    bootKey,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOS() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOS must be used inside <OSProvider>");
  return v;
}

// Checks whether a screen point is over the dock's trash can.
export function overTrash(x: number, y: number) {
  const el = document.getElementById("dock-trash");
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const pad = 14;
  return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;
}
