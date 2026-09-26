"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { profile } from "@/lib/data";
import { useDesktop } from "./desktop";
import { TrashView } from "./details";
import { DocIcon, GithubIcon, LinkedinIcon, MailIcon, TrashCan } from "./icons";

type Item = { label: string; href: string; bg: string; icon: ReactNode; external?: boolean };

const items: Item[] = [
  { label: "about", href: "#about", bg: "linear-gradient(#fff6c9,#f5d86a)", icon: <span className="text-[22px]">📝</span> },
  { label: "projects", href: "#projects", bg: "linear-gradient(#9fd0ff,#4c9bf0)", icon: <span className="text-[22px]">📁</span> },
  { label: "experience", href: "#experience", bg: "linear-gradient(#3a3a3c,#111)", icon: <span className="font-mono text-[13px] font-bold text-emerald-400">&gt;_</span> },
  { label: "skills", href: "#skills", bg: "linear-gradient(#ffd0ea,#f472b6)", icon: <span className="text-[22px]">🧩</span> },
  { label: "contact", href: "#contact", bg: "linear-gradient(#bff0c8,#34c759)", icon: <MailIcon className="h-6 w-6 text-white" /> },
  { label: "github", href: profile.github, bg: "linear-gradient(#444,#0d0d0d)", icon: <GithubIcon className="h-6 w-6 text-white" />, external: true },
  { label: "linkedin", href: profile.linkedin, bg: "linear-gradient(#3b8fd9,#0a66c2)", icon: <LinkedinIcon className="h-5 w-5 text-white" />, external: true },
  { label: "resume.pdf", href: profile.resume, bg: "linear-gradient(#fff,#e5e5e5)", icon: <DocIcon className="h-6 w-6 text-rose-500" />, external: true },
];

function DockIcon({ item, mouseX }: { item: Item; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - b.x - b.width / 2;
  });
  const size = useSpring(useTransform(distance, [-140, 0, 140], [44, 72, 44]), { stiffness: 400, damping: 28 });

  return (
    <motion.a
      ref={ref}
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      aria-label={item.label}
      style={{ width: size, height: size, background: item.bg }}
      className="group relative flex shrink-0 items-center justify-center rounded-[22%] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_2px_6px_rgba(0,0,0,0.2)] ring-1 ring-black/10"
      whileTap={{ y: -14 }}
    >
      {item.icon}
      <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-neutral-800/90 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {item.label}
      </span>
    </motion.a>
  );
}

function DockTrash() {
  const { trashRef, trashed, trashHot, openModal } = useDesktop();
  return (
    <div ref={trashRef} className="group relative">
      <button
        aria-label="trash"
        onClick={() => openModal({ title: "trash", content: <TrashView />, width: 480 })}
        className="flex h-[46px] w-[44px] items-end justify-center pb-0.5"
      >
        <TrashCan full={trashed.length > 0} hot={trashHot} />
      </button>
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-800/90 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        trash{trashed.length > 0 && ` (${trashed.length})`}
      </span>
    </div>
  );
}

export default function Dock() {
  const mouseX = useMotionValue(Infinity);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[940] hidden justify-center md:flex">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex h-[62px] items-end gap-2.5 rounded-2xl border border-white/60 bg-white/45 px-2.5 pb-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
      >
        {items.map((it, i) => (
          <div key={it.label} className="flex items-end">
            {i === 5 && <div className="mr-2.5 h-10 w-px self-center bg-black/15" />}
            <DockIcon item={it} mouseX={mouseX} />
          </div>
        ))}
        <div className="h-10 w-px self-center bg-black/15" />
        <DockTrash />
      </motion.div>
    </div>
  );
}
