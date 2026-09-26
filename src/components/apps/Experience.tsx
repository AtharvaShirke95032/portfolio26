"use client";

import { Briefcase, GraduationCap, Trophy, Users } from "lucide-react";
import { achievements, education, experience, projects } from "@/lib/data";

export default function ExperienceApp() {
  const fest = projects.find((p) => p.id === "techfest");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold tracking-tight">Where I&apos;ve been</h2>
      <p className="text-sm text-muted">Internships, leadership, school — newest first.</p>

      <ol className="relative mt-6 space-y-6 border-l-2 border-hairline pl-6">
        {experience.map((e) => (
          <Entry key={e.org} icon={<Briefcase size={14} />} color="#f59e0b">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[15px] font-semibold">{e.role}</h3>
              <span className="text-xs text-muted">{e.period}</span>
            </div>
            <p className="text-[13px] text-muted">
              {e.org} · {e.kind} · {e.place}
            </p>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
              {e.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-muted">–</span>
                  {p}
                </li>
              ))}
            </ul>
            <Stack items={e.stack} />
          </Entry>
        ))}

        {fest && (
          <Entry icon={<Users size={14} />} color="#10b981">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[15px] font-semibold">{fest.role}</h3>
              <span className="text-xs text-muted">{fest.period}</span>
            </div>
            <p className="text-[13px] text-muted">College Tech Fest · Leadership</p>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
              {fest.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-muted">–</span>
                  {p}
                </li>
              ))}
            </ul>
          </Entry>
        )}

        <Entry icon={<GraduationCap size={14} />} color="#6366f1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-[15px] font-semibold">{education.degree}</h3>
            <span className="text-xs text-muted">{education.period}</span>
          </div>
          <p className="text-[13px] text-muted">
            {education.school} · {education.place}
          </p>
          <Stack items={education.coursework} />
        </Entry>

        <Entry icon={<Trophy size={14} />} color="#ec4899">
          <h3 className="text-[15px] font-semibold">Awards & achievements</h3>
          <ul className="mt-1 space-y-1 text-[13px]">
            {achievements.map((a) => (
              <li key={a}>🏅 {a}</li>
            ))}
          </ul>
        </Entry>
      </ol>
    </div>
  );
}

function Entry({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <li className="relative">
      <span
        className="absolute -left-[37px] top-0 grid h-6 w-6 place-items-center rounded-full text-white ring-4 ring-[var(--window)]"
        style={{ background: color }}
      >
        {icon}
      </span>
      {children}
    </li>
  );
}

function Stack({ items }: { items: string[] }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="rounded-full bg-hairline px-2.5 py-0.5 text-[11px] font-medium">
          {s}
        </span>
      ))}
    </div>
  );
}
