"use client";

import { AnimatePresence, motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { useOS } from "../os/OSContext";
import { useViewport } from "../os/useViewport";
import { projects } from "@/lib/data";
import { Btn } from "./About";

// Finder-style: sidebar of projects, details on the right.
export default function Projects() {
  const os = useOS();
  const { mobile } = useViewport();
  const p = projects.find((x) => x.id === os.projectId) ?? projects[0];

  return (
    <div className="flex h-full max-sm:flex-col">
      <aside className="no-select w-48 shrink-0 bg-sidebar px-2 pb-3 pt-12 backdrop-blur max-sm:w-full max-sm:pt-12">
        <div className="px-2 pb-1 text-[11px] font-semibold text-muted">Projects</div>
        <nav className="max-sm:flex max-sm:gap-1 max-sm:overflow-x-auto">
          {projects.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => os.showProject(x.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] max-sm:w-auto max-sm:shrink-0 ${
                x.id === p.id ? "bg-black/10 font-medium dark:bg-white/15" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span>{x.emoji}</span>
              <span className="truncate">{x.name}</span>
            </button>
          ))}
        </nav>
        {!mobile && (
          <>
            <div className="mt-4 px-2 pb-1 text-[11px] font-semibold text-muted">Tags</div>
            {[
              ["#ff5f57", "Shipped"],
              ["#febc2e", "In progress"],
              ["#28c840", "Open source"],
            ].map(([c, t]) => (
              <div key={t} className="flex items-center gap-2 px-2 py-1 text-[13px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                {t}
              </div>
            ))}
          </>
        )}
      </aside>

      <div className="thin-scroll min-w-0 flex-1 overflow-auto bg-window sm:pt-11">
        <AnimatePresence mode="wait">
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-6"
          >
            <header className="flex items-start gap-4">
              <div
                className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${p.color}`}
              >
                {p.emoji}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-tight">{p.name}</h2>
                <p className="text-sm text-muted">{p.subtitle}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {p.role} · {p.period}
                </p>
              </div>
            </header>

            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={`${p.name} screenshot`} className="mt-5 w-full rounded-xl border border-hairline" />
            )}

            <div className="mt-5 grid grid-cols-3 gap-2">
              {p.stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-hairline/70 p-3">
                  <div className="text-lg font-bold leading-tight">{s.value}</div>
                  <div className="text-[11px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            <ul className="mt-5 space-y-2 text-[13.5px] leading-relaxed">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span key={s} className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[11px]">
                  {s}
                </span>
              ))}
            </div>

            {p.links.length > 0 && (
              <div className="mt-6 flex gap-2">
                {p.links.map((l) => (
                  <Btn key={l.href + l.label} href={l.href}>
                    {l.label} <ExternalLink size={12} />
                  </Btn>
                ))}
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
