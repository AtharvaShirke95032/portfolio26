"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppIcon, APPS, DOCK_APPS } from "./apps";
import { useOS } from "./OSContext";
import { profile, projects, skillGroups, usedIn } from "@/lib/data";

type Result = { id: string; title: string; hint: string; icon: React.ReactNode; run: () => void };

export default function Spotlight() {
  const os = useOS();
  return <AnimatePresence>{os.spotlight && <Panel key="spot" />}</AnimatePresence>;
}

function Panel() {
  const os = useOS();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const close = () => os.setSpotlight(false);

  const all: Result[] = useMemo(
    () => [
      ...DOCK_APPS.map((id) => ({
        id,
        title: APPS[id].title,
        hint: "Application",
        icon: <AppIcon id={id} size={24} />,
        run: () => os.openApp(id),
      })),
      ...projects.map((p) => ({
        id: p.id,
        title: p.name,
        hint: `Project · ${p.subtitle}`,
        icon: <span className="text-xl">{p.emoji}</span>,
        run: () => os.showProject(p.id),
      })),
      ...skillGroups.flatMap((g) =>
        g.skills.map((s) => {
          const used = usedIn(s.name);
          return {
            id: `skill-${s.name}`,
            title: s.name,
            hint: used.length ? `Skill · used in ${used.join(", ")}` : `Skill · ${g.group}`,
            icon: <span className="grid h-6 w-6 place-items-center rounded-md text-[9px] font-bold text-white" style={{ background: s.color }}>{s.short}</span>,
            run: () => os.openApp("skills"),
          };
        }),
      ),
      { id: "a-theme", title: "Toggle Dark Mode", hint: "Action", icon: <span className="text-xl">🌓</span>, run: os.toggleTheme },
      { id: "a-wall", title: "Next Wallpaper", hint: "Action", icon: <span className="text-xl">🖼️</span>, run: os.nextWallpaper },
      { id: "a-note", title: "New Sticky Note", hint: "Action", icon: <span className="text-xl">🗒️</span>, run: os.addNote },
      {
        id: "a-email",
        title: "Copy Email Address",
        hint: profile.email,
        icon: <span className="text-xl">📋</span>,
        run: () => {
          navigator.clipboard?.writeText(profile.email);
          os.toast("Email copied 📋");
        },
      },
      { id: "a-gh", title: "GitHub", hint: "Open profile ↗", icon: <span className="text-xl">🐙</span>, run: () => window.open(profile.links.github, "_blank") },
      { id: "a-li", title: "LinkedIn", hint: "Open profile ↗", icon: <span className="text-xl">💼</span>, run: () => window.open(profile.links.linkedin, "_blank") },
    ],
    [os],
  );

  const results = q.trim()
    ? all.filter((r) => `${r.title} ${r.hint}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : all.slice(0, 7);

  const run = (r?: Result) => {
    if (!r) return;
    close();
    r.run();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="fixed inset-0 z-[9999] flex justify-center bg-black/10 px-4 pt-[18vh]"
      onPointerDown={(e) => e.target === e.currentTarget && close()}
    >
      <motion.div
        initial={{ scale: 0.96, y: -8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96 }}
        className="glass h-fit w-full max-w-[640px] overflow-hidden rounded-2xl text-ink shadow-2xl"
        style={{ background: "var(--glass-strong)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search size={22} className="text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              }
              if (e.key === "Enter") run(results[sel]);
            }}
            placeholder="Spotlight Search — try “postgres” or “resume”"
            className="w-full bg-transparent text-xl font-light outline-none placeholder:text-muted"
          />
        </div>
        {results.length > 0 && (
          <div className="max-h-[50vh] overflow-auto border-t border-hairline p-1.5">
            {results.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onMouseEnter={() => setSel(i)}
                onClick={() => run(r)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${
                  i === sel ? "bg-accent text-white" : ""
                }`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center">{r.icon}</span>
                <span className="font-medium">{r.title}</span>
                <span className={`ml-auto truncate text-xs ${i === sel ? "text-white/80" : "text-muted"}`}>{r.hint}</span>
              </button>
            ))}
          </div>
        )}
        {results.length === 0 && <div className="border-t border-hairline px-4 py-6 text-center text-sm text-muted">No results. Maybe I should learn that next 🤔</div>}
      </motion.div>
    </motion.div>
  );
}
