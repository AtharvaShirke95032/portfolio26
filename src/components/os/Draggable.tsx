"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { overTrash, useOS, type TrashItem } from "./OSContext";

let zCounter = 10;

type Props = {
  item: TrashItem;
  bounds: React.RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
  rotate?: number;
  children: React.ReactNode;
  onTap?: (e: PointerEvent) => void;
  onDoubleClick?: () => void;
};

// Anything on the desktop you can fling around — and drop on the dock's trash.
export default function Draggable({ item, bounds, className = "", style, rotate = 0, children, onTap, onDoubleClick }: Props) {
  const os = useOS();
  const [z, setZ] = useState(10);

  return (
    <motion.div
      drag
      dragConstraints={bounds}
      dragElastic={0.15}
      dragTransition={{ power: 0.25, timeConstant: 180 }}
      initial={{ opacity: 0, scale: 0.6, rotate }}
      animate={{ opacity: 1, scale: 1, rotate }}
      exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.03 }}
      whileDrag={{ scale: 1.08, rotate: rotate + 4, cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onPointerDown={() => setZ(++zCounter)}
      onDrag={(_, info) => os.setTrashHot(overTrash(info.point.x - window.scrollX, info.point.y - window.scrollY))}
      onDragEnd={(_, info) => {
        os.setTrashHot(false);
        if (overTrash(info.point.x - window.scrollX, info.point.y - window.scrollY)) os.toTrash(item);
      }}
      onTap={(e) => onTap?.(e as PointerEvent)}
      onDoubleClick={onDoubleClick}
      className={`no-select absolute cursor-grab touch-none ${className}`}
      style={{ ...style, zIndex: z }}
    >
      {children}
    </motion.div>
  );
}
