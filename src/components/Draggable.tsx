"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDesktop } from "./desktop";

type Props = {
  id: string;
  label?: string;
  children: ReactNode;
  bounds?: RefObject<HTMLElement | null>;
  style?: CSSProperties;
  className?: string;
  rotate?: number;
  delay?: number;
  /** can be dropped into the trash can */
  trashable?: boolean;
  /** fired on a click that wasn't a drag */
  onOpen?: () => void;
  /** stay draggable on phones/tablets too (everything else is tap-only there) */
  touchDrag?: boolean;
  title?: string;
};

function overTrash(el: HTMLElement | null, x: number, y: number) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20;
}

// phones/tablets: dragging would hijack the swipe meant to scroll the page,
// so things there are tap-only
const TOUCH_QUERY = "(max-width: 1023px), (pointer: coarse)";
const subscribeTouch = (cb: () => void) => {
  const m = matchMedia(TOUCH_QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
export const useTapOnly = () => useSyncExternalStore(subscribeTouch, () => matchMedia(TOUCH_QUERY).matches, () => false);

export default function Draggable({
  id,
  label,
  children,
  bounds,
  style,
  className = "",
  rotate = 0,
  delay = 0,
  trashable = true,
  onOpen,
  title,
  touchDrag = false,
}: Props) {
  const { nextZ, trashRef, deskTrashRef, trash, isTrashed, setTrashHot } = useDesktop();
  const overAnyTrash = (x: number, y: number) => overTrash(trashRef.current, x, y) || overTrash(deskTrashRef.current, x, y);
  const [z, setZ] = useState<number | undefined>(undefined);
  const dragged = useRef(false);
  const gone = isTrashed(id);
  const tapOnly = useTapOnly() && !touchDrag;

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key={id}
          title={title}
          className={`select-none ${
            tapOnly ? (onOpen ? "cursor-pointer" : "") : `touch-none active:cursor-grabbing ${onOpen ? "cursor-pointer" : "cursor-grab"}`
          } ${className}`}
          style={{ ...style, zIndex: z ?? style?.zIndex }}
          drag={!tapOnly}
          dragConstraints={bounds}
          dragElastic={0.15}
          dragTransition={{ power: 0.15, timeConstant: 180 }}
          initial={{ opacity: 0, scale: 0.6, rotate }}
          animate={{ opacity: 1, scale: 1, rotate, transition: { delay, type: "spring", stiffness: 260, damping: 20 } }}
          exit={{ opacity: 0, scale: 0.1, transition: { duration: 0.25 } }}
          whileHover={{ scale: 1.03 }}
          whileDrag={{ scale: 1.06, rotate: rotate * 0.4, cursor: "grabbing" }}
          onPointerDown={() => setZ(nextZ())}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDrag={(e) => {
            if (!trashable) return;
            const p = e as PointerEvent;
            setTrashHot(overAnyTrash(p.clientX, p.clientY));
          }}
          onDragEnd={(e) => {
            setTrashHot(false);
            const p = e as PointerEvent;
            if (trashable && overAnyTrash(p.clientX, p.clientY)) {
              trash({ id, label: label ?? id });
            }
            setTimeout(() => (dragged.current = false), 0);
          }}
          onClick={() => {
            if (!dragged.current) onOpen?.();
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
