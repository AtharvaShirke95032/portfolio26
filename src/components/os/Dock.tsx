"use client";

import { motion, useAnimationControls, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { AppIcon, APPS, DOCK_APPS, TrashCan } from "./apps";
import { useOS, type AppId } from "./OSContext";
import { profile } from "@/lib/data";
import { useViewport } from "./useViewport";
import { GithubMark, LinkedinMark } from "./BrandMarks";

export default function Dock() {
  const os = useOS();
  const mouseX = useMotionValue(Infinity);
  const { mobile } = useViewport();
  const base = mobile ? 40 : 50;
  const apps = mobile ? DOCK_APPS.filter((a) => a !== "music") : DOCK_APPS;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-[9000] flex justify-center">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="glass pointer-events-auto flex items-end gap-1.5 rounded-[22px] px-2 pb-1.5 pt-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
      >
        {apps.map((id) => (
          <DockApp key={id} id={id} mouseX={mouseX} base={base} />
        ))}
        {!mobile && (
          <>
            <Divider />
            <DockLink label="GitHub" href={profile.links.github} mouseX={mouseX} base={base} bg="#1f2328">
              <GithubMark className="h-[55%] w-[55%] text-white" />
            </DockLink>
            <DockLink label="LinkedIn" href={profile.links.linkedin} mouseX={mouseX} base={base} bg="#0a66c2">
              <LinkedinMark className="h-[50%] w-[50%] text-white" />
            </DockLink>
          </>
        )}
        <Divider />
        <DockItem
          label={os.trash.length ? `Trash (${os.trash.length})` : "Trash"}
          mouseX={mouseX}
          base={base}
          running={os.windows.trash.open}
          onClick={() => os.openApp("trash")}
          id="dock-trash"
          hot={os.trashHot}
        >
          {(s) => <TrashCan size={s} full={os.trash.length > 0} />}
        </DockItem>
      </motion.div>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 mb-1 h-10 w-px self-center bg-black/15 dark:bg-white/20" />;
}

function DockApp({ id, mouseX, base }: { id: AppId; mouseX: MotionValue<number>; base: number }) {
  const os = useOS();
  const w = os.windows[id];
  return (
    <DockItem
      label={APPS[id].title}
      mouseX={mouseX}
      base={base}
      running={w.open}
      bounceOnClick={!w.open}
      onClick={() => {
        if (w.open && !w.minimized && os.focused === id) os.minimizeApp(id);
        else os.openApp(id);
      }}
    >
      {(s) => <AppIcon id={id} size={s} />}
    </DockItem>
  );
}

function DockLink({
  label,
  href,
  mouseX,
  base,
  bg,
  children,
}: {
  label: string;
  href: string;
  mouseX: MotionValue<number>;
  base: number;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <DockItem label={label} mouseX={mouseX} base={base} onClick={() => window.open(href, "_blank", "noopener")}>
      {(s) => (
        <div
          className="grid place-items-center shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
          style={{ width: s, height: s, borderRadius: "23%", background: bg }}
        >
          {children}
        </div>
      )}
    </DockItem>
  );
}

function DockItem({
  label,
  mouseX,
  base,
  running,
  onClick,
  children,
  bounceOnClick,
  id,
  hot,
}: {
  label: string;
  mouseX: MotionValue<number>;
  base: number;
  running?: boolean;
  onClick: () => void;
  children: (size: string) => React.ReactNode;
  bounceOnClick?: boolean;
  id?: string;
  hot?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const controls = useAnimationControls();
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - r.left - r.width / 2 : Infinity;
  });
  const sizeRaw = useTransform(distance, [-150, 0, 150], [base, base * 1.65, base]);
  const size = useSpring(sizeRaw, { mass: 0.1, stiffness: 170, damping: 14 });

  return (
    <motion.button
      ref={ref}
      id={id}
      type="button"
      aria-label={label}
      onClick={() => {
        if (bounceOnClick) controls.start({ y: [0, -22, 0, -10, 0], transition: { duration: 0.7 } });
        onClick();
      }}
      style={{ width: size, height: size }}
      animate={hot ? { scale: 1.25 } : { scale: 1 }}
      className="group relative flex flex-col items-center outline-none"
    >
      <span className="glass pointer-events-none absolute -top-10 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
      <motion.div animate={controls} className="h-full w-full">
        {children("100%")}
      </motion.div>
      <span
        className={`absolute -bottom-1 h-1 w-1 rounded-full bg-black/70 transition-opacity dark:bg-white/80 ${
          running ? "opacity-100" : "opacity-0"
        }`}
      />
    </motion.button>
  );
}
