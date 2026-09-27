"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { entries, profile, projects, skills, type Entry } from "@/lib/data";
import { Photo } from "./arts";
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

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const { openModal } = useDesktop();
  const [filter, setFilter] = useState<(typeof kinds)[number]["key"]>("all");
  const [sel, setSel] = useState<string | null>(null);
  const rows = entries.filter((e) => filter === "all" || e.kind === filter);
  const open = (e: Entry) => openModal({ title: e.org, content: <EntryDetail e={e} />, width: 640 });

  return (
    <section id="experience" ref={ref} className="relative py-24">
      <Chip>experience</Chip>
      <h2 className="mx-auto mt-6 max-w-xl px-4 text-center text-[clamp(32px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em]">
        where i&apos;ve been <span className="text-neutral-400">shipping</span>
      </h2>
      <div className="mx-auto mt-14 max-w-5xl px-4">
        <Draggable id="finder" bounds={ref} trashable={false}>
          <MacWindow title="experience" big bodyClassName="flex min-h-[360px]">
            <aside className="hidden w-48 shrink-0 space-y-0.5 border-r border-black/5 bg-[#f6f6f6]/80 p-3 text-[14px] sm:block">
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
                </button>
              ))}
              <p className="px-2 pb-1 pt-4 text-[11px] font-semibold text-neutral-400">tags</p>
              {["🔴 shipping", "🟢 learning", "🔵 open to work"].map((t) => (
                <p key={t} className="px-2 py-0.5 text-[13px] text-neutral-500">
                  {t}
                </p>
              ))}
            </aside>
            <div className="min-w-0 flex-1">
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
              <div className="grid grid-cols-[1.4fr_1fr_auto] gap-3 border-b border-black/5 px-4 py-2 text-[12px] text-neutral-400 md:grid-cols-[1.4fr_1fr_0.8fr_auto]">
                <span>name</span>
                <span>org</span>
                <span className="hidden md:block">kind</span>
                <span className="text-right">date</span>
              </div>
              {rows.map((e, i) => (
                <button
                  key={e.id}
                  onPointerDown={(ev) => ev.stopPropagation()}
                  onClick={() => (sel === e.id ? open(e) : setSel(e.id))}
                  onDoubleClick={() => open(e)}
                  className={`grid w-full grid-cols-[1.4fr_1fr_auto] items-center gap-3 px-4 py-3 text-left text-[14px] md:grid-cols-[1.4fr_1fr_0.8fr_auto] ${
                    sel === e.id ? "bg-accent text-white" : i % 2 ? "bg-neutral-50/70" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-5 w-6 shrink-0">
                      <Folder color={e.kind === "work" ? "#7cb6f0" : e.kind === "education" ? "#a3e635" : "#f472b6"} />
                    </span>
                    <span className="truncate font-medium">{e.title}</span>
                  </span>
                  <span className={`truncate ${sel === e.id ? "text-white/85" : "text-neutral-500"}`}>{e.org}</span>
                  <span className={`hidden md:block ${sel === e.id ? "text-white/85" : "text-neutral-400"}`}>{e.kind}</span>
                  <span className={`text-right tabular-nums ${sel === e.id ? "text-white/85" : "text-neutral-400"}`}>{e.dates}</span>
                </button>
              ))}
              <p className="px-4 py-4 text-[12px] text-neutral-400">click once to select, again to open ↗</p>
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

export function Skills() {
  const board = useRef<HTMLDivElement>(null);
  const [seed, setSeed] = useState(7);
  const chips = useMemo(() => {
    const rnd = seeded(seed);
    const all = skills.flatMap((g) => g.items.map((name) => ({ name, color: g.color })));
    const cols = 5;
    const rowsN = Math.ceil(all.length / cols);
    return all
      .map((c) => ({ c, r: rnd() }))
      .sort((a, b) => a.r - b.r)
      .map(({ c }, i) => ({
        ...c,
        left: ((i % cols) / cols) * 88 + rnd() * 6 + 1,
        top: (Math.floor(i / cols) / rowsN) * 82 + rnd() * 8 + 4,
        rot: (rnd() - 0.5) * 16,
      }));
  }, [seed]);

  return (
    <section id="skills" className="relative py-24">
      <Chip>skills</Chip>
      <h2 className="mx-auto mt-6 max-w-xl px-4 text-center text-[clamp(32px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em]">
        my toolbox <span className="text-neutral-400">— go ahead, mess it up</span>
      </h2>
      <div className="mx-auto mt-14 max-w-5xl px-4">
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
          <div ref={board} className="dots relative h-[520px] overflow-hidden bg-[#fafafa] sm:h-[420px]">
            {chips.map((c, i) => (
              <Draggable
                key={`${seed}-${c.name}`}
                id={`skill-${seed}-${c.name}`}
                bounds={board}
                trashable={false}
                rotate={c.rot}
                delay={i * 0.025}
                style={{ position: "absolute", left: `${c.left}%`, top: `${c.top}%` }}
              >
                <span
                  className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-[14px] font-medium text-neutral-800 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)] sm:text-[15px]"
                  style={{ boxShadow: `0 0 0 1.5px ${c.color}, 0 6px 14px -6px ${c.color}` }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </span>
              </Draggable>
            ))}
          </div>
        </MacWindow>
        <p className="mt-4 text-center text-[14px] text-neutral-400">also speaks: english · hindi · marathi</p>
      </div>
    </section>
  );
}

/* ------------------------------ contact ---------------------------- */

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const send = () => {
    const q = new URLSearchParams({ subject: subject || "hey atharva 👋", body });
    window.location.href = `mailto:${profile.email}?${q.toString().replace(/\+/g, "%20")}`;
  };
  const field = "w-full bg-transparent py-2.5 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400";

  return (
    <section id="contact" ref={ref} className="dots relative pb-40 pt-24">
      <Chip>contact</Chip>
      <h2 className="mx-auto mt-6 max-w-xl px-4 text-center text-[clamp(32px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em]">
        say hi <span className="text-neutral-400">— i reply fast</span>
      </h2>
      <div className="mx-auto mt-14 grid max-w-5xl items-start gap-8 px-4 md:grid-cols-[1.5fr_1fr]">
        <Draggable id="compose" bounds={ref} trashable={false}>
          <MacWindow title="new message" big>
            <div className="px-5" onPointerDown={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 border-b border-black/5">
                <span className="w-16 text-[14px] text-neutral-400">to:</span>
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[14px] text-sky-700">{profile.email}</span>
              </div>
              <label className="flex items-center gap-2 border-b border-black/5">
                <span className="w-16 text-[14px] text-neutral-400">subject:</span>
                <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="let's build something" />
              </label>
              <textarea
                className={`${field} min-h-[180px] resize-none`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="hey atharva, loved the trash can. we're hiring for…"
                aria-label="message"
              />
              <div className="flex items-center justify-between border-t border-black/5 py-3">
                <span className="text-[12px] text-neutral-400">opens your mail app</span>
                <button onClick={send} className="glossy-blue rounded-full px-5 py-1.5 text-[15px] font-medium text-white">
                  send ↗
                </button>
              </div>
            </div>
          </MacWindow>
        </Draggable>

        <div className="space-y-4">
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
          <p className="px-1 pt-2 font-hand text-[22px] leading-tight text-neutral-500">based in {profile.location} — happy to relocate or go remote.</p>
        </div>
      </div>
      <footer className="mt-24 text-center text-[13px] text-neutral-400">
        made with ☕ and way too many tabs · © {new Date().getFullYear()} {profile.name}
      </footer>
    </section>
  );
}
