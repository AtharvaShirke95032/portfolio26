"use client";

import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
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
  title?: string;
};

function overTrash(el: HTMLElement | null, x: number, y: number) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20;
}

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
}: Props) {
  const { nextZ, trashRef, trash, isTrashed, setTrashHot } = useDesktop();
  const [z, setZ] = useState<number | undefined>(undefined);
  const dragged = useRef(false);
  const gone = isTrashed(id);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key={id}
          title={title}
          className={`touch-none select-none ${onOpen ? "cursor-pointer" : "cursor-grab"} active:cursor-grabbing ${className}`}
          style={{ ...style, zIndex: z ?? style?.zIndex }}
          drag
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
            setTrashHot(overTrash(trashRef.current, p.clientX, p.clientY));
          }}
          onDragEnd={(e) => {
            setTrashHot(false);
            const p = e as PointerEvent;
            if (trashable && overTrash(trashRef.current, p.clientX, p.clientY)) {
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
