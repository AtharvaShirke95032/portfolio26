"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "motion/react";

type Trashed = { id: string; label: string };
type ModalSpec = { title: string; content: ReactNode; width?: number; tone?: "default" | "notes" | "dark" };

type DesktopCtx = {
  nextZ: () => number;
  trashRef: RefObject<HTMLDivElement | null>;
  deskTrashRef: RefObject<HTMLDivElement | null>;
  trashed: Trashed[];
  trash: (item: Trashed) => void;
  restore: (id: string) => void;
  emptyTrash: () => void;
  isTrashed: (id: string) => boolean;
  openModal: (spec: ModalSpec) => void;
  closeModal: () => void;
  trashHot: boolean;
  setTrashHot: (hot: boolean) => void;
};

const Ctx = createContext<DesktopCtx | null>(null);

export function useDesktop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDesktop must be used inside <DesktopProvider>");
  return ctx;
}

export function DesktopProvider({ children }: { children: ReactNode }) {
  const z = useRef(20);
  const trashRef = useRef<HTMLDivElement | null>(null);
  const deskTrashRef = useRef<HTMLDivElement | null>(null);
  const [trashed, setTrashed] = useState<Trashed[]>([]);
  const [emptied, setEmptied] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalSpec | null>(null);
  const [trashHot, setTrashHot] = useState(false);

  const nextZ = useCallback(() => ++z.current, []);
  const trash = useCallback(
    (item: Trashed) => setTrashed((t) => (t.some((x) => x.id === item.id) ? t : [...t, item])),
    [],
  );
  const restore = useCallback((id: string) => setTrashed((t) => t.filter((x) => x.id !== id)), []);
  const emptyTrash = useCallback(() => {
    setEmptied((e) => [...e, ...trashed.map((t) => t.id)]);
    setTrashed([]);
  }, [trashed]);
  const isTrashed = useCallback(
    (id: string) => trashed.some((t) => t.id === id) || emptied.includes(id),
    [trashed, emptied],
  );
  const openModal = useCallback((spec: ModalSpec) => setModal(spec), []);
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  return (
    <Ctx.Provider
      value={{
        nextZ,
        trashRef,
        deskTrashRef,
        trashed,
        trash,
        restore,
        emptyTrash,
        isTrashed,
        openModal,
        closeModal,
        trashHot,
        setTrashHot,
      }}
    >
      {children}
      <AnimatePresence>
        {modal && (
          <motion.div
            key="modal"
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-neutral-400/30 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={modal.title}
              className="w-full"
              style={{ maxWidth: modal.width ?? 640 }}
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MacWindow title={modal.title} tone={modal.tone} onClose={() => setModal(null)} big>
                <div className="max-h-[78vh] overflow-y-auto no-scrollbar">{modal.content}</div>
              </MacWindow>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------------ */

export function TrafficLights({
  onClose,
  onMin,
  onZoom,
  big,
}: {
  onClose?: () => void;
  onMin?: () => void;
  onZoom?: () => void;
  big?: boolean;
}) {
  const size = big ? "h-3.5 w-3.5" : "h-3 w-3";
  const btn = `${size} rounded-full flex items-center justify-center text-[8px] font-bold leading-none text-black/0 group-hover/tl:text-black/60 transition-colors`;
  const stop = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };
  return (
    <div className="group/tl flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
      <button aria-label="close" onClick={stop(onClose)} className={`${btn} bg-[#ff5f57] ring-1 ring-black/10`}>
        ×
      </button>
      <button aria-label="minimize" onClick={stop(onMin)} className={`${btn} bg-[#febc2e] ring-1 ring-black/10`}>
        –
      </button>
      <button aria-label="zoom" onClick={stop(onZoom)} className={`${btn} bg-[#28c840] ring-1 ring-black/10`}>
        +
      </button>
    </div>
  );
}

export function MacWindow({
  title,
  icon,
  children,
  onClose,
  onMin,
  onZoom,
  tone = "default",
  big,
  className = "",
  bodyClassName = "",
  showX,
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onMin?: () => void;
  onZoom?: () => void;
  tone?: "default" | "notes" | "dark";
  big?: boolean;
  className?: string;
  bodyClassName?: string;
  showX?: boolean;
}) {
  const bar =
    tone === "notes"
      ? "win-bar-notes bg-linear-to-b from-[#f3edd5] to-[#e9e1c3] border-b border-black/10"
      : tone === "dark"
        ? "bg-[#2a2a2c] border-b border-black/60 text-neutral-400"
        : "win-bar bg-linear-to-b from-[#f6f6f6] to-[#e8e8e8] border-b border-black/10";
  return (
    <div
      className={`window-shadow overflow-hidden rounded-xl ${tone === "dark" ? "bg-[#1c1c1e]" : "bg-white"} ${className}`}
    >
      <div className={`relative flex items-center px-3 ${big ? "h-10" : "h-7"} ${bar}`}>
        <TrafficLights onClose={onClose} onMin={onMin} onZoom={onZoom} big={big} />
        {title && (
          <div
            className={`pointer-events-none absolute inset-x-16 flex items-center justify-center gap-1.5 truncate ${
              big ? "text-[15px]" : "text-[11px]"
            } ${tone === "dark" ? "text-neutral-400" : "text-neutral-500"}`}
          >
            {icon}
            <span className="truncate">{title}</span>
          </div>
        )}
        {showX && <span className="ml-auto text-[11px] text-neutral-400">✕</span>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
