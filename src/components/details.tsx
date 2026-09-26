"use client";

import type { ReactNode } from "react";
import { entries, profile, projects, type Entry, type Project } from "@/lib/data";
import { CodeArt, DashboardArt, Media, PhoneArt, Photo, TerminalArt } from "./arts";
import { useDesktop } from "./desktop";
import { Folder } from "./icons";

export function projectArt(p: Project, big?: boolean): ReactNode {
  const art =
    p.id === "outly" ? <PhoneArt /> : p.id === "readme-ai" ? <TerminalArt big={big} /> : <DashboardArt />;
  return (
    <Media src={p.image} alt={p.name}>
      {art}
    </Media>
  );
}

export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[12px] text-neutral-700 ring-1 ring-black/5"
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

export function ProjectDetail({ p }: { p: Project }) {
  return (
    <div>
      <div className="h-64 overflow-hidden border-b border-black/5 sm:h-80">{projectArt(p, true)}</div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
            <p className="text-sm text-neutral-500">{p.kind}</p>
          </div>
          <span className="text-sm text-neutral-400">{p.dates}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-neutral-700">{p.blurb}</p>
        <ul className="space-y-1.5 text-[14px] text-neutral-600">
          {p.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-neutral-300">▸</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <Pill key={s}>{s}</Pill>
          ))}
        </div>
        {p.links.length > 0 && (
          <div className="flex gap-2 pt-1">
            {p.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="glossy-blue rounded-full px-4 py-1.5 text-sm font-medium text-white"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EntryDetail({ e }: { e: Entry }) {
  return (
    <div>
      {e.id === "reliance" && (
        <div className="aspect-[4/3] overflow-hidden border-b border-black/5">
          <Media src="/media/reliance-desk.jpg" alt="my desk at reliance: thinkpad, monitor full of express controllers">
            {null}
          </Media>
        </div>
      )}
      <div className="space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">{e.kind}</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{e.title}</h3>
          <p className="text-neutral-500">
            {e.org} · {e.dates}
          </p>
          <p className="text-sm text-neutral-400">{e.place}</p>
        </div>
        <ul className="space-y-1.5 text-[14px] text-neutral-600">
          {e.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-neutral-300">▸</span>
              {b}
            </li>
          ))}
        </ul>
        {e.stack && (
          <div className="flex flex-wrap gap-1.5">
            {e.stack.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PhotoDetail() {
  return (
    <div className="aspect-[4/5] w-full">
      <Photo src={profile.photo} alt={profile.name} />
    </div>
  );
}

export function CodeDetail() {
  return (
    <div className="h-72">
      <CodeArt />
    </div>
  );
}

export function ProjectsFinder() {
  const { openModal, closeModal } = useDesktop();
  const goTo = (id: string) => {
    closeModal();
    // let the modal start its exit before scrolling underneath it
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
  };
  const colors = ["#7cb6f0", "#f472b6", "#a78bfa"];
  return (
    <div className="flex min-h-[260px]">
      <aside className="hidden w-40 shrink-0 space-y-1 border-r border-black/5 bg-neutral-50/80 p-3 text-[13px] text-neutral-500 sm:block">
        <p className="px-2 text-[11px] font-semibold text-neutral-400">favorites</p>
        <p className="rounded-md bg-black/5 px-2 py-1 text-neutral-800">📁 projects</p>
        <button onClick={() => goTo("experience")} className="block w-full rounded-md px-2 py-1 text-left hover:bg-black/5">
          🗂 experience
        </button>
        <a href={profile.resume} target="_blank" rel="noreferrer" className="block rounded-md px-2 py-1 hover:bg-black/5">
          📄 resume.pdf
        </a>
      </aside>
      <div className="grid flex-1 grid-cols-2 content-start gap-6 p-6 sm:grid-cols-3">
        {projects.map((p, i) => (
          <button
            key={p.id}
            onClick={() => openModal({ title: p.file, content: <ProjectDetail p={p} />, width: 720 })}
            className="group flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-sky-50"
          >
            <div className="h-16 w-20 transition-transform group-hover:-translate-y-1">
              <Folder color={colors[i % colors.length]} />
            </div>
            <span className="text-center text-[13px] text-neutral-700">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* stuff that lives in the bin forever */
const junk = [
  { icon: "📚", name: "50gb study material", meta: "50 GB · never opened" },
  { icon: "📄", name: "resume_final_FINAL_v7(2).pdf", meta: "212 KB" },
  { icon: "📦", name: "node_modules", meta: "1.9 GB · 184,203 items" },
  { icon: "🛌", name: "sleep schedule", meta: "corrupted" },
  { icon: "🧪", name: "todo-app-attempt-14", meta: "abandoned at 80%" },
  { icon: "🐛", name: 'console.log("here")', meta: "x 347" },
  { icon: "📁", name: "untitled folder (9)", meta: "empty, like the others" },
  { icon: "🏋️", name: "gym_plan_2025.txt", meta: "last modified jan 2" },
];

export function TrashView() {
  const { trashed, restore, emptyTrash } = useDesktop();
  return (
    <div className="p-6">
      <ul className="divide-y divide-black/5">
        {junk.map((j) => (
          <li key={j.name} className="flex items-center justify-between gap-3 py-2 text-[14px]">
            <span className="flex min-w-0 items-center gap-2 text-neutral-700">
              <span>{j.icon}</span>
              <span className="truncate">{j.name}</span>
            </span>
            <span className="shrink-0 text-[12px] text-neutral-400">{j.meta}</span>
          </li>
        ))}
      </ul>
      {trashed.length === 0 ? (
        <p className="pt-6 text-center text-[13px] text-neutral-400">
          drag stuff here from the desktop, or hit the red button on any window.
        </p>
      ) : (
        <>
          <p className="pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">you threw away</p>
          <ul className="divide-y divide-black/5">
            {trashed.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-[14px]">
                <span className="text-neutral-700">🗑 {t.label}</span>
                <button onClick={() => restore(t.id)} className="rounded-full px-3 py-1 text-accent hover:bg-sky-50">
                  put back
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button onClick={emptyTrash} className="glossy-white rounded-full px-4 py-1.5 text-sm">
              empty trash
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export const entryById = (id: string) => entries.find((e) => e.id === id)!;
export const projectById = (id: string) => projects.find((p) => p.id === id)!;
