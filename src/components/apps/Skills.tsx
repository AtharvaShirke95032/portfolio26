"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { profile, skillGroups, usedIn, type Skill } from "@/lib/data";

export default function Skills() {
  const [picked, setPicked] = useState<Skill | null>(null);
  const used = picked ? usedIn(picked.name) : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold tracking-tight">Toolbox</h2>
      <p className="text-sm text-muted">Click an icon to see where I&apos;ve used it.</p>

      <AnimatePresence mode="wait">
        {picked && (
          <motion.div
            key={picked.name}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl bg-hairline/70 p-3 text-[13px]"
          >
            <Tile skill={picked} size={36} />
            <div>
              <div className="font-semibold">{picked.name}</div>
              <div className="text-muted">
                {used.length ? <>Used in {used.join(" · ")}</> : "In the toolbox — ready for the next project 🔧"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {skillGroups.map((g) => (
        <section key={g.group} className="mt-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.group}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2">
            {g.skills.map((s) => (
              <motion.button
                key={s.name}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.92, rotate: -4 }}
                onClick={() => setPicked(picked?.name === s.name ? null : s)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-center ${
                  picked?.name === s.name ? "bg-accent/15 ring-1 ring-accent" : "hover:bg-hairline/60"
                }`}
              >
                <Tile skill={s} size={44} />
                <span className="text-[11px] leading-tight">{s.name}</span>
              </motion.button>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-hairline/60 p-3">
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Soft skills</h3>
          <p className="text-[13px]">Communication · Teamwork · Critical Thinking · Decision Making</p>
        </div>
        <div className="rounded-xl bg-hairline/60 p-3">
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Languages</h3>
          <p className="text-[13px]">{profile.languages.join(" · ")}</p>
        </div>
      </section>
    </div>
  );
}

function Tile({ skill, size }: { skill: Skill; size: number }) {
  const light = ["#f7df1e", "#61dafb", "#3ecf8e", "#38bdf8"].includes(skill.color);
  return (
    <span
      className="grid place-items-center rounded-[11px] font-mono font-bold shadow-md"
      style={{
        width: size,
        height: size,
        background: skill.color,
        color: light ? "#111" : "#fff",
        fontSize: size * (skill.short.length > 3 ? 0.26 : 0.34),
      }}
    >
      {skill.short}
    </span>
  );
}
