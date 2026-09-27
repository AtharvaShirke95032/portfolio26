"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { entries, profile, projects, skillUses, skills, type Entry } from "@/lib/data";
import { Media, Photo } from "./arts";
import { MacWindow, useDesktop } from "./desktop";
import { EntryDetail, Pill, ProjectDetail, projectArt } from "./details";
import Draggable from "./Draggable";
import { Folder, GithubIcon, LinkedinIcon, ClassicMac, DocIcon } from "./icons";

function Chip({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-full border-[1.5px] border-neutral-400 bg-white/60 px-4 py-1 text-[14px] font-medium uppercase tracking-wide text-neutral-600">
        {children}
      </span>
    </div>
  );
}

/* ------------------------------ about ------------------------------ */

type Pt = [number, number];

// walks a polyline by arc length: t in [0,1] -> point on the path
function pathSampler(path: Pt[]) {
  const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  return (t: number): Pt => {
    let d = t * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) {
        const k = segs[i] ? Math.min(d / segs[i], 1) : 0;
        const [a, b] = [path[i], path[i + 1]];
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      }
      d -= segs[i];
    }
    return path[path.length - 1];
  };
}

// blends the palette smoothly along the path so colours flow with the folders
function colorAt(colors: string[], t: number) {
  const rgb = (h: string) => [1, 3, 5].map((o) => parseInt(h.slice(o, o + 2), 16));
  const f = t * (colors.length - 1);
  const i = Math.min(Math.floor(f), colors.length - 2);
  const [a, b] = [rgb(colors[i]), rgb(colors[i + 1])];
  return "#" + a.map((v, j) => Math.round(v + (b[j] - v) * (f - i)).toString(16).padStart(2, "0")).join("");
}

function TrailFolder({
  i,
  count,
  flow,
  at,
  colors,
  delay,
  show,
  onHover,
}: {
  i: number;
  count: number;
  flow: MotionValue<number>;
  at: (t: number) => Pt;
  colors: string[];
  delay: number;
  show: boolean;
  onHover: (h: boolean) => void;
}) {
  const t = useTransform(flow, (f) => (f + i / count) % 1);
  const x = useTransform(t, (v) => at(v)[0]);
  const y = useTransform(t, (v) => at(v)[1]);
  // brighter toward the end of the trail, fading in/out at the ends so the loop has no seam
  const opacity = useTransform(t, (v) => (0.35 + v * 0.65) * Math.min(1, v / 0.07, (1 - v) / 0.07));
  // stepped so the folder only re-renders a few times per lap, not every frame
  const color = useTransform(t, (v) => colorAt(colors, Math.round(v * 24) / 24));
  const [fill, setFill] = useState(() => color.get());
  useMotionValueEvent(color, "change", setFill);

  return (
    <motion.div className="absolute left-0 top-0 h-[70px] w-[96px]" style={{ x, y, opacity }}>
      <motion.div
        className="pointer-events-auto h-full w-full"
        initial={{ opacity: 0, y: 24, scale: 0.6 }}
        animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ delay: delay + i * 0.06, type: "spring", stiffness: 420, damping: 22 }}
        whileHover={{ y: -12, scale: 1.12, rotate: -4 }}
        onHoverStart={() => onHover(true)}
        onHoverEnd={() => onHover(false)}
      >
        <Folder color={fill} className="h-full w-full" />
      </motion.div>
    </motion.div>
  );
}

function FolderTrail({
  colors,
  path,
  count,
  className,
  start = 0,
  duration = 22,
}: {
  colors: string[];
  path: Pt[];
  count: number;
  className: string;
  start?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const [shown, setShown] = useState(false);
  if (inView && !shown) setShown(true);
  const reduce = useReducedMotion();
  const at = useMemo(() => pathSampler(path), [path]);

  // the folders ride the path like a conveyor, left to right; hovering one slows the whole trail
  const flow = useMotionValue(0);
  const speed = useRef(1);
  const target = useRef(1);
  useAnimationFrame((_, dt) => {
    if (reduce || !inView) return;
    speed.current += (target.current - speed.current) * Math.min(1, dt / 250);
    flow.set((flow.get() + (dt / 1000 / duration) * speed.current) % 1);
  });
  const onHover = (h: boolean) => (target.current = h ? 0.12 : 1);

  return (
    <div ref={ref} className={`pointer-events-none absolute hidden lg:block ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <TrailFolder key={i} i={i} count={count} flow={flow} at={at} colors={colors} delay={start} show={shown} onHover={onHover} />
      ))}
    </div>
  );
}

// same "V" on both sides: down the left arm, back up the right, then loop
const vPath: Pt[] = [[0, 0], [121, 370], [430, -10]];
const rPath: Pt[] = [[0, 0], [90, 370], [330, -10]];

export function About() {
  const ref = useRef<HTMLElement>(null);
  const para = "text-[clamp(17px,1.6vw,22px)] leading-[1.55] text-neutral-500";
  const hl = "bg-[#fdf3b8] px-1 text-neutral-900 [box-decoration-break:clone]";
  const lines: ReactNode[] = [
    <>hey, i&apos;m atharva — a cs student at terna engineering college (class of &apos;27) who fell hard for the backend.</>,
    <>
      i like the invisible parts: schemas, apis, sockets. <span className={hl}>the stuff that makes an app actually work.</span>
    </>,
    <>
      this summer i interned at reliance industries, building a compliance system across 7+ modules. before that i shipped{" "}
      <span className={hl}>readme-ai, a cli that writes your readme for you — 750+ downloads on npm.</span>
    </>,
    <>right now i&apos;m building outly, a location-based app for finding people and events near you.</>,
    <>
      i&apos;m looking for teams who care about craft. lmk if that&apos;s you.
      <span className="caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-1 bg-neutral-700" />
    </>,
  ];

  return (
    <section id="about" ref={ref} className="relative overflow-hidden py-24">
      <Chip>the story</Chip>
      <FolderTrail className="left-0 top-24 h-[560px] w-[530px]" path={vPath} count={22} colors={["#dcd6fb", "#c9a8f5", "#e77fe0", "#f5a3b8", "#f38a8a"]} />
      <FolderTrail className="right-4 top-24 h-[560px] w-[430px]" start={0.4} path={rPath} count={18} duration={19} colors={["#f0ead0", "#e3d79c", "#cbbd5d", "#a3b85a"]} />

      <div className="relative mx-auto mt-10 max-w-[680px] px-4">
        <Draggable id="notes" bounds={ref} trashable={false}>
          <div className="relative">
            {/* psyduck perched on the notes window */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/_.gif"
              alt="psyduck, confused as usual"
              title="psyduck is also confused about css"
              className="pointer-events-none absolute -top-[104px] right-4 z-10 w-[130px] sm:right-10"
              draggable={false}
            />
            <MacWindow
              tone="notes"
              big
              title="notes"
              icon={<span className="inline-block h-3.5 w-3.5 rounded-[3px] border border-amber-300 bg-linear-to-b from-amber-200 to-white" />}
              bodyClassName="px-6 py-7 sm:px-9"
            >
              <div className="space-y-5">
                {lines.map((l, i) => (
                  <motion.p
                    key={i}
                    className={para}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.12 }}
                  >
                    {l}
                  </motion.p>
                ))}
              </div>
              <div className="mt-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow">
                    <Photo src={profile.photo} alt={profile.name} caption={false} />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[17px] text-neutral-900">{profile.handle},</p>
                    <p className="text-[15px] text-neutral-500">{profile.role}</p>
                  </div>
                </div>
                <span className="-rotate-6 font-hand text-[44px] font-bold leading-none text-neutral-900">atharva</span>
              </div>
            </MacWindow>
          </div>
        </Draggable>
      </div>

      <Draggable id="moai" label="moai" bounds={ref} style={{ position: "absolute", left: "20%", top: "72%" }} className="hidden lg:block" rotate={-8}>
        <span className="text-5xl">🗿</span>
      </Draggable>
      <Draggable id="cat" label="cat" bounds={ref} style={{ position: "absolute", left: "24%", top: "18%" }} className="hidden lg:block" rotate={10}>
        <span className="text-6xl">🐈</span>
      </Draggable>
      <Draggable id="pc2" label="computer" bounds={ref} style={{ position: "absolute", right: "18%", top: "76%" }} className="hidden lg:block" rotate={4}>
        <ClassicMac className="h-20 w-20" />
      </Draggable>
    </section>
  );
}

/* ----------------------------- projects ---------------------------- */

export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const { openModal } = useDesktop();
  return (
    <section id="projects" ref={ref} className="dots relative py-24">
      <Chip>projects</Chip>
      <h2 className="mx-auto mt-6 max-w-xl px-4 text-center text-[clamp(32px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em]">
        things i&apos;ve built <span className="text-neutral-400">(and broke, and fixed)</span>
      </h2>
      <div className="mx-auto mt-14 grid max-w-6xl gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => {
          const open = () => openModal({ title: p.file, content: <ProjectDetail p={p} />, width: 720 });
          return (
            <Draggable key={p.id} id={`proj-${p.id}`} bounds={ref} trashable={false} rotate={[-1.2, 0.8, -0.6][i]} delay={i * 0.08}>
              <MacWindow title={p.file} onZoom={open} bodyClassName="p-1.5">
                <div className="aspect-[16/10] overflow-hidden rounded-md">{projectArt(p)}</div>
                <div className="space-y-3 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{p.name}</h3>
                      <p className="text-[13px] text-neutral-500">{p.kind}</p>
                    </div>
                    <div className="text-right leading-none">
                      <div className="text-2xl font-semibold tracking-tight text-accent">{p.stat.value}</div>
                      <div className="mt-1 text-[11px] text-neutral-400">{p.stat.label}</div>
                    </div>
                  </div>
                  <p className="text-[14px] leading-relaxed text-neutral-600">{p.blurb}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.slice(0, 5).map((s) => (
                      <Pill key={s}>{s}</Pill>
                    ))}
                    {p.stack.length > 5 && <Pill>+{p.stack.length - 5}</Pill>}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[12px] text-neutral-400">{p.dates}</span>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={open}
                      className="glossy-blue rounded-full px-4 py-1 text-[13px] font-medium text-white"
                    >
                      open
                    </button>
                  </div>
                </div>
              </MacWindow>
            </Draggable>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------- experience --------------------------- */

const kinds: { key: "all" | Entry["kind"]; label: string; icon: string }[] = [
  { key: "all", label: "all", icon: "🕘" },
  { key: "work", label: "work", icon: "💼" },
  { key: "education", label: "education", icon: "🎓" },
  { key: "leadership", label: "leadership", icon: "✨" },
];

const kindColor: Record<Entry["kind"], string> = { work: "#7cb6f0", education: "#a3e635", leadership: "#f472b6" };

const verbs = ["shipping", "building", "debugging", "learning", "caffeinated"];

// "where i've been ___" — letters bounce on hover, the last word flips through verbs (click to skip)
function ExpHeading() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % verbs.length), 2400);
    return () => clearInterval(t);
  }, [paused]);
  const v = verbs[i];

  return (
    <h2 className="mx-auto mt-6 max-w-xl select-none px-4 text-center text-[clamp(32px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em]">
      <span className="sr-only">where i&apos;ve been</span>
      <span className="inline-block" aria-hidden>
        {Array.from("where i've been").map((ch, k) =>
          ch === " " ? (
            <span key={k}> </span>
          ) : (
            <motion.span
              key={k}
              className="inline-block cursor-default"
              whileHover={reduce ? undefined : { y: -10, rotate: k % 2 ? 8 : -8, color: "var(--accent)" }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
            >
              {ch}
            </motion.span>
          ),
        )}
      </span>
      <button
        type="button"
        onClick={() => setI((n) => (n + 1) % verbs.length)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        title="click me"
        className="mx-auto mt-1 block cursor-pointer"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={v} className="inline-block text-neutral-400 [perspective:600px]">
            {Array.from(v).map((ch, k) => (
              <motion.span
                key={k}
                className="inline-block origin-bottom"
                initial={{ rotateX: -90, opacity: 0, y: 8 }}
                animate={{ rotateX: 0, opacity: 1, y: 0 }}
                exit={{ rotateX: 90, opacity: 0, y: -8, transition: { duration: 0.15, delay: k * 0.015 } }}
                transition={{ type: "spring", stiffness: 420, damping: 22, delay: k * 0.035 }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </button>
    </h2>
  );
}

function ExpPreview({ e, onOpen }: { e: Entry; onOpen: () => void }) {
  return (
    <motion.div
      key={e.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col p-5"
    >
      {e.id === "reliance" ? (
        <div className="aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-black/5">
          <Media src="/media/reliance-desk.jpg" alt="my desk at reliance">
            {null}
          </Media>
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-linear-to-b from-neutral-50 to-neutral-100 ring-1 ring-black/5">
          <motion.div className="h-24 w-32" initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
            <Folder color={kindColor[e.kind]} className="h-full w-full" />
          </motion.div>
        </div>
      )}
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: kindColor[e.kind] }}>
        {e.kind}
      </p>
      <h3 className="mt-0.5 text-[17px] font-semibold leading-snug tracking-tight">{e.title}</h3>
      <p className="text-[13px] text-neutral-500">{e.org}</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-black/5 pt-3 text-[12px]">
        <dt className="text-neutral-400">when</dt>
        <dd className="text-neutral-700">{e.dates}</dd>
        <dt className="text-neutral-400">where</dt>
        <dd className="text-neutral-700">{e.place}</dd>
      </dl>
      <ul className="mt-3 space-y-1 text-[12.5px] leading-snug text-neutral-600">
        {e.bullets.slice(0, 2).map((b) => (
          <li key={b} className="flex gap-1.5">
            <span className="text-neutral-300">▸</span>
            <span className="line-clamp-2">{b}</span>
          </li>
        ))}
      </ul>
      {e.stack && (
        <div className="mt-3 flex flex-wrap gap-1">
          {e.stack.map((s) => (
            <Pill key={s}>{s}</Pill>
          ))}
        </div>
      )}
      <div className="mt-auto pt-4">
        <button
          onPointerDown={(ev) => ev.stopPropagation()}
          onClick={onOpen}
          className="flex w-full items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-[13px] font-medium text-neutral-700 ring-1 ring-black/5 transition-colors hover:bg-accent hover:text-white"
        >
          read more
          <span aria-hidden>↗</span>
        </button>
      </div>
    </motion.div>
  );
}

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const { openModal } = useDesktop();
  const [filter, setFilter] = useState<(typeof kinds)[number]["key"]>("all");
  const [sel, setSel] = useState<string | null>(entries[0].id);
  const rows = entries.filter((e) => filter === "all" || e.kind === filter);
  const open = (e: Entry) => openModal({ title: e.org, content: <EntryDetail e={e} />, width: 640 });
  const current = entries.find((e) => e.id === sel);

  return (
    <section id="experience" ref={ref} className="relative overflow-hidden py-24">
      <Chip>experience</Chip>
      <ExpHeading />

      {/* desk clutter — all draggable, big screens only */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden xl:block">
        <Draggable id="exp-polaroid" bounds={ref} trashable={false} rotate={-5} delay={0.2} className="pointer-events-auto absolute left-[3%] top-24">
          <div className="light-island w-[190px] bg-white p-2.5 pb-3 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.35)]">
            <div className="aspect-square overflow-hidden">
              <Media src="/media/reliance-desk.jpg" alt="my desk at reliance">
                {null}
              </Media>
            </div>
            <p className="mt-2 text-center font-hand text-[18px] leading-none text-neutral-700">desk @ reliance &apos;26</p>
          </div>
          <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-3 bg-[#f5e6a8]/80" />
        </Draggable>

        <Draggable id="exp-sticky" bounds={ref} trashable={false} rotate={5} delay={0.35} className="pointer-events-auto absolute right-[3%] top-40">
          <div className="light-island w-[170px] bg-[#c7f0d8] p-3.5 font-hand text-[20px] leading-tight text-neutral-800 shadow-[0_8px_16px_-8px_rgba(0,0,0,0.35)]">
            next up:
            <br />
            <span className="line-through decoration-2 opacity-50">intern @ reliance</span>
            <br />
            your team? 👀
          </div>
        </Draggable>

        <Draggable id="exp-broke-cat" bounds={ref} trashable={false} rotate={-3} delay={0.5} className="pointer-events-auto absolute right-[1%] top-[540px]">
          <div className="w-[180px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/broke-cat.png" alt="cat holding an empty wallet" className="w-full drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)]" draggable={false} />
            <p className="-mt-1 text-center font-hand text-[22px] leading-tight text-neutral-600">pls hire 🙏</p>
          </div>
        </Draggable>
      </div>

      <div className="relative mx-auto mt-14 max-w-5xl px-4">
        <Draggable id="finder" bounds={ref} trashable={false}>
          <MacWindow title="experience" big bodyClassName="flex min-h-[420px]">
            <aside className="hidden w-44 shrink-0 space-y-0.5 border-r border-black/5 bg-[#f6f6f6]/80 p-3 text-[14px] sm:block">
              <p className="px-2 pb-1 text-[11px] font-semibold text-neutral-400">favorites</p>
              {kinds.map((k) => (
                <button
                  key={k.key}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setFilter(k.key)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left ${
                    filter === k.key ? "bg-black/[0.07] text-neutral-900" : "text-neutral-500 hover:bg-black/[0.04]"
                  }`}
                >
                  <span>{k.icon}</span>
                  {k.label}
                  <span className="ml-auto text-[11px] text-neutral-400">
                    {k.key === "all" ? entries.length : entries.filter((e) => e.kind === k.key).length}
                  </span>
                </button>
              ))}
              <p className="px-2 pb-1 pt-4 text-[11px] font-semibold text-neutral-400">tags</p>
              {["🔴 shipping", "🟢 learning", "🔵 open to work"].map((t) => (
                <p key={t} className="px-2 py-0.5 text-[13px] text-neutral-500">
                  {t}
                </p>
              ))}
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex gap-1 overflow-x-auto border-b border-black/5 p-2 sm:hidden">
                {kinds.map((k) => (
                  <button
                    key={k.key}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setFilter(k.key)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[13px] ${filter === k.key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-black/5 px-4 py-2 text-[12px] text-neutral-400 sm:grid-cols-[1.4fr_1fr_auto]">
                <span>name</span>
                <span className="hidden sm:block">org</span>
                <span className="text-right">date</span>
              </div>
              <AnimatePresence initial={false} mode="popLayout">
                {rows.map((e, i) => (
                  <motion.button
                    key={e.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18, delay: i * 0.03 }}
                    onPointerDown={(ev) => ev.stopPropagation()}
                    onClick={() => (sel === e.id ? open(e) : setSel(e.id))}
                    onDoubleClick={() => open(e)}
                    className={`group grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left text-[14px] sm:grid-cols-[1.4fr_1fr_auto] ${
                      sel === e.id ? "bg-accent text-white" : i % 2 ? "bg-neutral-50/70 hover:bg-neutral-100" : "hover:bg-neutral-100"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="h-5 w-6 shrink-0 transition-transform group-hover:-rotate-6 group-hover:scale-110">
                        <Folder color={kindColor[e.kind]} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{e.title}</span>
                        <span className={`block truncate text-[12px] sm:hidden ${sel === e.id ? "text-white/85" : "text-neutral-500"}`}>{e.org}</span>
                      </span>
                    </span>
                    <span className={`hidden truncate sm:block ${sel === e.id ? "text-white/85" : "text-neutral-500"}`}>{e.org}</span>
                    <span className={`text-right tabular-nums ${sel === e.id ? "text-white/85" : "text-neutral-400"}`}>{e.dates}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
              {filter === "all" && (
                <a
                  href={`mailto:${profile.email}`}
                  onPointerDown={(ev) => ev.stopPropagation()}
                  className="group mx-3 mt-2 grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[1.4fr_1fr_auto] rounded-lg border-[1.5px] border-dashed border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-400 transition-colors hover:border-accent hover:text-accent"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-5 w-6 shrink-0 opacity-40 transition-all group-hover:rotate-6 group-hover:opacity-100">
                      <Folder color="#d4d4d4" />
                    </span>
                    <span className="truncate">
                      untitled role<span className="sm:hidden"> · your company?</span>
                    </span>
                  </span>
                  <span className="hidden truncate sm:block">your company?</span>
                  <span className="text-right tabular-nums">2027 — ∞</span>
                </a>
              )}
              <p className="px-4 py-3 text-[12px] text-neutral-400">click once to select, again to open ↗</p>
              {/* finder status bar */}
              <div className="mt-auto flex items-center gap-1.5 border-t border-black/5 bg-[#f6f6f6]/80 px-4 py-1.5 text-[11px] text-neutral-400">
                <span className="hidden min-w-0 items-center gap-1.5 sm:flex">
                  <span>macintosh hd</span>›<span>atharva</span>›<span>experience</span>
                  {current && (
                    <>
                      ›<span className="truncate text-neutral-600">{current.org}</span>
                    </>
                  )}
                </span>
                <span className="ml-auto shrink-0">{rows.length} items</span>
              </div>
            </div>
            <div className="hidden w-[270px] shrink-0 border-l border-black/5 lg:block">
              <AnimatePresence mode="wait">{current && <ExpPreview e={current} onOpen={() => open(current)} />}</AnimatePresence>
            </div>
          </MacWindow>
        </Draggable>
      </div>

    </section>
  );
}

/* ------------------------------ skills ----------------------------- */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// "Express.js" and "Express" are the same thing
const norm = (s: string) => s.toLowerCase().replace(/\.js$|[^a-z0-9+]/g, "");

function usedIn(skill: string): string[] {
  const k = norm(skill);
  const fromProjects = projects.filter((p) => p.stack.some((t) => norm(t) === k)).map((p) => (p.id === "reliance" ? "reliance internship" : p.name));
  const fromEntries = entries
    .filter((e) => !projects.some((p) => p.id === e.id) && e.stack?.some((t) => norm(t) === k))
    .map((e) => e.org);
  return [...new Set([...fromProjects, ...fromEntries, ...(skillUses[skill] ?? [])])];
}

const subscribeNarrow = (cb: () => void) => {
  const m = matchMedia("(max-width: 639px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function Skills() {
  const board = useRef<HTMLDivElement>(null);
  const narrow = useSyncExternalStore(subscribeNarrow, () => matchMedia("(max-width: 639px)").matches, () => false);
  const [seed, setSeed] = useState(7);
  const [picked, setPicked] = useState<string | null>(null);
  const chips = useMemo(() => {
    const rnd = seeded(seed);
    const all = skills.flatMap((g) => g.items.map((name) => ({ name, color: g.color })));
    const cols = narrow ? 2 : 5;
    const rowsN = Math.ceil(all.length / cols);
    const [jx, jy, tilt] = narrow ? [4, 1.5, 8] : [6, 8, 16];
    return all
      .map((c) => ({ c, r: rnd() }))
      .sort((a, b) => a.r - b.r)
      .map(({ c }, i) => ({
        ...c,
        left: ((i % cols) / cols) * 88 + rnd() * jx + 1,
        top: (Math.floor(i / cols) / rowsN) * 82 + rnd() * jy + 4,
        rot: (rnd() - 0.5) * tilt,
      }));
  }, [seed, narrow]);

  return (
    <section id="skills" className="relative overflow-hidden py-24">
      {/* minimal backdrop: a hairline grid that fades out toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-position:center_top] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_55%,black_35%,transparent_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 hidden font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 xl:block">
        <span className="absolute left-10">/ toolbox</span>
        <span className="absolute right-10">
          {skills.reduce((n, g) => n + g.items.length, 0)} tools · {skills.length} groups
        </span>
      </div>
      <Chip>skills</Chip>
      <h2 className="mx-auto mt-6 max-w-xl px-4 text-center text-[clamp(32px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em]">
        my toolbox <span className="text-neutral-400">— go ahead, mess it up</span>
      </h2>
      <div className="relative mx-auto mt-14 max-w-5xl px-4">
        {/* crop marks at the window corners */}
        {["-left-1 -top-4", "-right-1 -top-4", "-left-1 -bottom-4", "-right-1 -bottom-4"].map((pos) => (
          <span key={pos} aria-hidden className={`pointer-events-none absolute hidden font-mono text-[14px] leading-none text-neutral-300 md:block ${pos}`}>
            +
          </span>
        ))}
        <MacWindow title="skills.app" big>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-black/5 px-4 py-2.5 text-[13px] text-neutral-500">
            {skills.map((g) => (
              <span key={g.group} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                {g.group}
              </span>
            ))}
            <button onClick={() => setSeed((s) => s + 1)} className="glossy-white ml-auto rounded-full px-3 py-0.5 text-[13px] text-neutral-800">
              🎲 shuffle
            </button>
          </div>
          <div ref={board} className="dots relative h-[660px] overflow-hidden bg-[#fafafa] sm:h-[420px]">
            {/* the janitor, mopping up the corner (sits under the chips so it never blocks one) */}
            <div className="pointer-events-none absolute bottom-0 right-4 w-[92px] sm:w-[110px]" aria-hidden>
              <span className="absolute -bottom-1 left-2 right-0 h-3 rounded-[50%] bg-sky-200/40 blur-[3px]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/mop-fish.webp" alt="" className="relative w-full" draggable={false} />
            </div>
            {chips.map((c, i) => (
              <Draggable
                key={`${seed}-${narrow}-${c.name}`}
                id={`skill-${seed}-${c.name}`}
                bounds={board}
                trashable={false}
                rotate={c.rot}
                delay={i * 0.025}
                style={{ position: "absolute", left: `${c.left}%`, top: `${c.top}%` }}
                onOpen={() => setPicked((p) => (p === c.name ? null : c.name))}
              >
                <span
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[14px] font-medium ring-1 transition-colors sm:text-[15px] ${
                    picked === c.name
                      ? "bg-neutral-900 text-white ring-neutral-900 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.5)]"
                      : "bg-white text-neutral-800 ring-black/10 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_4px_10px_-6px_rgba(0,0,0,0.25)] hover:ring-black/20"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </span>
              </Draggable>
            ))}
          </div>
          {/* status bar: where the picked skill has been used */}
          <div className="flex min-h-10 items-center gap-2 border-t border-black/5 bg-[#f6f6f6]/80 px-4 py-2 text-[13px]">
            <AnimatePresence mode="wait" initial={false}>
              {picked ? (
                <motion.p
                  key={picked}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-neutral-500"
                >
                  <span className="font-medium text-neutral-900">{picked}</span>
                  {usedIn(picked).length ? (
                    <>
                      <span>— used in</span>
                      {usedIn(picked).map((u) => (
                        <span key={u} className="rounded-full bg-white px-2 py-0.5 text-[12px] text-neutral-700 ring-1 ring-black/10">
                          {u}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span>— in the toolbox, no featured project with it yet. ask me about it!</span>
                  )}
                </motion.p>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-neutral-400">
                  <span className="lg:hidden">tap a skill to see where i&apos;ve used it</span>
                  <span className="hidden lg:inline">click a skill to see where i&apos;ve used it · drag to rearrange</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </MacWindow>
        <p className="mt-4 text-center text-[14px] text-neutral-400">also speaks: english · hindi · marathi</p>
      </div>
    </section>
  );
}

/* ------------------------------ contact ---------------------------- */

const templates = [
  { label: "we're hiring", icon: "📌", subject: "an opportunity at …", body: "hey atharva,\n\nwe're hiring for a … role and your work caught our eye. would you be up for a quick chat?\n\n" },
  { label: "let's collab", icon: "🤝", subject: "collab idea", body: "hey atharva,\n\ni'm building … and think we could make something cool together.\n\n" },
  { label: "just saying hi", icon: "👋", subject: "hey 👋", body: "hey atharva,\n\njust wanted to say the site is fun. " },
];

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const send = () => {
    const q = new URLSearchParams({ subject: subject || "hey atharva 👋", body });
    window.location.href = `mailto:${profile.email}?${q.toString().replace(/\+/g, "%20")}`;
  };
  const copy = () => {
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const field = "w-full bg-transparent py-3 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400";

  return (
    <section id="contact" ref={ref} className="dots relative pb-[calc(2rem+env(safe-area-inset-bottom))] pt-24 md:pb-40">
      <Chip>contact</Chip>
      <h2 className="mx-auto mt-6 max-w-xl px-4 text-center text-[clamp(32px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em]">
        say hi <span className="text-neutral-400">— i reply fast</span>
      </h2>
      <div className="mx-auto mt-14 grid max-w-5xl items-start gap-8 px-4 md:grid-cols-[1.5fr_1fr]">
        <Draggable id="compose" bounds={ref} trashable={false} className="min-w-0">
          <MacWindow
            title="new message"
            big
            icon={<span className="text-[13px] leading-none text-neutral-400">✉︎</span>}
          >
            <div onPointerDown={(e) => e.stopPropagation()}>
              {/* mail-style header fields */}
              <div className="flex items-center gap-3 border-b border-black/5 px-5 py-2.5">
                <span className="w-14 shrink-0 text-[13px] text-neutral-400 sm:w-[72px]">to</span>
                <span className="flex min-w-0 items-center gap-2 rounded-full bg-neutral-100 py-0.5 pl-0.5 pr-3 ring-1 ring-black/5">
                  <span className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                    <Photo src={profile.photo} alt="" caption={false} />
                  </span>
                  <span className="truncate text-[14px] text-neutral-800">{profile.email}</span>
                </span>
                <button
                  onClick={copy}
                  className="ml-auto shrink-0 rounded-md px-2 py-1 text-[12px] text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                >
                  {copied ? "copied ✓" : "copy"}
                </button>
              </div>
              <label className="flex items-center gap-3 border-b border-black/5 px-5">
                <span className="w-14 shrink-0 text-[13px] text-neutral-400 sm:w-[72px]">subject</span>
                <input className={`${field} min-w-0`} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="let's build something" />
              </label>
              {/* one-tap starters */}
              <div className="flex items-center gap-3 border-b border-black/5 bg-neutral-50/70 px-5 py-2">
                <span className="w-14 shrink-0 text-[13px] text-neutral-400 sm:w-[72px]">start with</span>
                <div className="flex flex-wrap gap-1.5">
                {templates.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      setSubject(t.subject);
                      setBody(t.body);
                    }}
                    className="rounded-full bg-white px-2.5 py-0.5 text-[12px] text-neutral-600 ring-1 ring-black/10 transition-colors hover:text-neutral-900 hover:ring-black/20"
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
                </div>
              </div>
              <textarea
                className={`${field} block min-h-[200px] resize-none px-5 leading-relaxed`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                }}
                placeholder="hey atharva, loved the trash can. we're hiring for…"
                aria-label="message"
              />
              <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-[#f6f6f6]/80 px-5 py-3">
                <span className="text-[12px] text-neutral-400">
                  <span className="hidden sm:inline">
                  <kbd className="rounded border border-black/10 bg-white px-1 font-sans">⌘</kbd>{" "}
                  <kbd className="rounded border border-black/10 bg-white px-1 font-sans">↵</kbd> to send ·{" "}
                  </span>
                  opens your mail app
                </span>
                <button onClick={send} className="glossy-blue flex shrink-0 items-center gap-1.5 rounded-full px-5 py-1.5 text-[15px] font-medium text-white">
                  send
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M1.5 1.8 15 8 1.5 14.2l1.6-5.4L10 8 3.1 7.2Z" />
                  </svg>
                </button>
              </div>
            </div>
          </MacWindow>
        </Draggable>

        <div className="min-w-0 space-y-4">
          {[
            { href: profile.github, label: "github", sub: `@${profile.githubHandle}`, icon: <GithubIcon className="h-5 w-5" />, bg: "bg-neutral-900" },
            { href: profile.linkedin, label: "linkedin", sub: "atharva shirke", icon: <LinkedinIcon className="h-5 w-5" />, bg: "bg-[#0a66c2]" },
            { href: profile.resume, label: "resume.pdf", sub: "one page, no fluff", icon: <DocIcon className="h-5 w-5" />, bg: "bg-rose-500" },
          ].map((l, i) => (
            <Draggable key={l.label} id={`link-${l.label}`} bounds={ref} trashable={false} rotate={[-1.5, 1, -0.5][i]}
              onOpen={() => window.open(l.href, "_blank")}>
              <div className="window-shadow flex items-center gap-3 rounded-xl bg-white p-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-white ${l.bg}`}>{l.icon}</span>
                <span className="leading-tight">
                  <span className="block text-[16px] font-medium text-neutral-900">{l.label}</span>
                  <span className="text-[13px] text-neutral-500">{l.sub}</span>
                </span>
                <span className="ml-auto text-neutral-300">↗</span>
              </div>
            </Draggable>
          ))}
          <div className="flex items-end gap-3 pt-1">
            <p className="flex-1 pb-2 font-hand text-[22px] leading-tight text-neutral-500">
              based in {profile.location.split(",")[0]} — happy to relocate or go remote.
            </p>
            <Draggable id="facetime-cat" touchDrag bounds={ref} trashable={false} rotate={2.5} delay={0.2} className="w-[180px] shrink-0 sm:w-[230px]">
              <MacWindow title="facetime" bodyClassName="bg-white">
                {/* only the video stays light (hides the gif's white edges); the caption follows the theme */}
                <div className="light-island relative bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/media/cat-eat.webp" alt="a cat eating, staring into the camera" className="aspect-square w-full object-cover" draggable={false} />
                  <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" style={{ animation: "blink 1.2s steps(1) infinite" }} />
                    live
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-black/5 px-3 py-2">
                  <span className="text-[12px] leading-tight text-neutral-600">me, waiting for your email</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] text-white">✕</span>
                </div>
              </MacWindow>
            </Draggable>
          </div>
        </div>
      </div>
      <footer className="mt-16 px-4 text-center text-[13px] text-neutral-400 md:mt-24">
        made with ☕ and way too many tabs · © {new Date().getFullYear()} {profile.name}
      </footer>
    </section>
  );
}
