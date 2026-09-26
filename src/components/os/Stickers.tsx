"use client";

import { AnimatePresence } from "motion/react";
import Draggable from "./Draggable";
import { useOS } from "./OSContext";
import { profile, projects } from "@/lib/data";

type Bounds = React.RefObject<HTMLElement | null>;

// Positions are percentages of the desktop so the layout breathes on any screen.
export default function Stickers({ bounds }: { bounds: Bounds }) {
  const os = useOS();
  const show = (id: string) => !os.trashed(id);

  return (
    <AnimatePresence>
      {show("polaroid") && (
        <Draggable
          key={`polaroid-${os.tidyKey}`}
          item={{ id: "polaroid", label: "me.jpg (polaroid)", emoji: "📸" }}
          bounds={bounds}
          rotate={-5}
          className="left-[6%] top-[46%] max-sm:left-[8%] max-sm:top-[40%] sm:left-[27%] sm:top-[12%]"
          onDoubleClick={() => os.openApp("about")}
        >
          <div className="w-[150px] rounded-sm bg-white p-2.5 pb-3 shadow-[0_12px_30px_rgba(0,0,0,0.3)] sm:w-[190px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.photo}
              alt={profile.name}
              draggable={false}
              className="aspect-[4/5] w-full object-cover"
            />
            <p className="font-hand mt-2 text-center text-xl leading-none text-neutral-800">that&apos;s me :)</p>
          </div>
          <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
        </Draggable>
      )}

      {show("hello-note") && (
        <Draggable
          key={`note-${os.tidyKey}`}
          item={{ id: "hello-note", label: "hello.sticky", emoji: "🗒️" }}
          bounds={bounds}
          rotate={3}
          className="right-[6%] top-[46%] max-sm:top-[44%] sm:left-[45%] sm:right-auto sm:top-[10%]"
        >
          <div className="w-[170px] bg-[#fff59d] p-4 pt-5 shadow-[0_10px_24px_rgba(0,0,0,0.25)] sm:w-[220px]">
            <p className="font-hand text-[22px] leading-[1.05] text-neutral-800 sm:text-[26px]">
              hi, i&apos;m {profile.first.toLowerCase()} 👋
            </p>
            <p className="font-hand mt-2 text-lg leading-tight text-neutral-700 sm:text-xl">
              i build backends that don&apos;t fall over. drag stuff around, double-click icons, right-click the wallpaper ✨
            </p>
          </div>
        </Draggable>
      )}

      {show("npm-badge") && (
        <Draggable
          key={`npm-${os.tidyKey}`}
          item={{ id: "npm-badge", label: "750+ downloads badge", emoji: "📦" }}
          bounds={bounds}
          className="left-[31%] top-[58%] max-sm:hidden"
          onDoubleClick={() => os.showProject("readme-ai")}
        >
          <SpinBadge />
        </Draggable>
      )}

      {show("stamp") && (
        <Draggable
          key={`stamp-${os.tidyKey}`}
          item={{ id: "stamp", label: "HIRE ME stamp", emoji: "🟥" }}
          bounds={bounds}
          rotate={-12}
          className="left-[47%] top-[50%] max-sm:hidden"
          onDoubleClick={() => os.openApp("contact")}
        >
          <div className="rounded-lg border-[3px] border-[#e5484d] px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[#e5484d] mix-blend-multiply dark:mix-blend-normal">
            <div className="text-2xl leading-none">hire me</div>
            <div className="text-center text-[9px] tracking-[0.35em]">approved ✓</div>
          </div>
        </Draggable>
      )}

      {show("node-hex") && (
        <Draggable
          key={`node-${os.tidyKey}`}
          item={{ id: "node-hex", label: "node.js sticker", emoji: "🟩" }}
          bounds={bounds}
          rotate={8}
          className="left-[59%] top-[40%] max-sm:hidden"
        >
          <svg width="92" height="104" viewBox="0 0 92 104" className="drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)]">
            <path d="M46 2 L88 26 L88 78 L46 102 L4 78 L4 26 Z" fill="#fff" />
            <path d="M46 9 L82 30 L82 74 L46 95 L10 74 L10 30 Z" fill="#539e43" />
            <text x="46" y="58" textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff" fontFamily="var(--font-geist-mono)">
              node
            </text>
          </svg>
        </Draggable>
      )}

      {[
        { id: "pill-backend", text: "</> backend brain", cls: "left-[22%] top-[74%]", bg: "#111", fg: "#fff", r: -4 },
        { id: "pill-pg", text: "postgres enjoyer 🐘", cls: "left-[42%] top-[70%]", bg: "#336791", fg: "#fff", r: 3 },
        { id: "pill-panvel", text: `📍 ${profile.location}`, cls: "left-[60%] top-[64%]", bg: "#fff", fg: "#111", r: -2 },
        {
          id: "pill-outly",
          text: `${projects[0].emoji} now building: ${projects[0].name}`,
          cls: "left-[38%] top-[84%]",
          bg: "linear-gradient(90deg,#fb923c,#ec4899)",
          fg: "#fff",
          r: 2,
        },
      ].map(
        (p) =>
          show(p.id) && (
            <Draggable
              key={`${p.id}-${os.tidyKey}`}
              item={{ id: p.id, label: p.text, emoji: "🏷️" }}
              bounds={bounds}
              rotate={p.r}
              className={`${p.cls} max-sm:hidden`}
              onDoubleClick={p.id === "pill-outly" ? () => os.showProject("outly") : undefined}
            >
              <div
                className="whitespace-nowrap rounded-full border-2 border-white px-4 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                style={{ background: p.bg, color: p.fg }}
              >
                {p.text}
              </div>
            </Draggable>
          ),
      )}

      {os.notes.map(
        (n, i) =>
          show(n.id) && (
            <Draggable
              key={n.id}
              item={{ id: n.id, label: "sticky note", emoji: "🗒️" }}
              bounds={bounds}
              rotate={((i * 37) % 9) - 4}
              className="left-[40%] top-[30%]"
              style={{ marginLeft: i * 24, marginTop: i * 24 }}
            >
              <div className="w-[200px] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.25)]" style={{ background: n.color }}>
                <div className="mb-1 h-3 cursor-grab" />
                <textarea
                  autoFocus
                  value={n.text}
                  onChange={(e) => os.updateNote(n.id, e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  placeholder="write something…"
                  className="font-hand h-32 w-full resize-none bg-transparent text-xl leading-tight text-neutral-800 outline-none placeholder:text-neutral-500"
                />
              </div>
            </Draggable>
          ),
      )}
    </AnimatePresence>
  );
}

function Tape({ className = "" }: { className?: string }) {
  return <div className={`absolute h-6 w-20 bg-white/55 shadow-sm backdrop-blur-[1px] ${className}`} />;
}

function SpinBadge() {
  const text = "• 750+ npm downloads • readme-ai ";
  return (
    <div className="relative grid h-32 w-32 place-items-center rounded-full bg-[#cb3837] text-white shadow-[0_10px_24px_rgba(0,0,0,0.3)] ring-4 ring-white">
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-[spin_14s_linear_infinite]">
        <defs>
          <path id="circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text fontSize="10.4" fontWeight="700" letterSpacing="1.2" fill="currentColor">
          <textPath href="#circle">{text.repeat(1)}</textPath>
        </text>
      </svg>
      <span className="text-2xl font-black">npm</span>
    </div>
  );
}
