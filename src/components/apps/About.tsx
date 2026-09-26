"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useOS } from "../os/OSContext";
import { education, profile, projects } from "@/lib/data";

// Styled after "About This Mac" — but the specs are me.
export default function About() {
  const os = useOS();
  const [more, setMore] = useState(false);

  const specs: [string, string][] = [
    ["Chip", "Node.js + PostgreSQL"],
    ["Memory", `${projects[1].stats[0].value} npm downloads`],
    ["Startup Disk", `${education.school.replace(" Engineering College", "")} '${education.period.slice(-2)}`],
    ["Currently", `Building ${projects[0].name} ${projects[0].emoji}`],
    ["Serial Number", "AtharvaShirke95032"],
    ["macOS", "Panvel 26.0"],
  ];

  return (
    <div className="flex flex-col items-center px-8 pb-8 pt-6 text-center">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo}
          alt={profile.name}
          className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-neutral-700"
        />
        <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-white text-lg shadow dark:bg-neutral-800" title="Hi!">
          👋
        </span>
      </div>
      <h1 className="mt-4 text-[28px] font-bold tracking-tight">{profile.name}</h1>
      <p className="text-sm text-muted">{profile.title}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-hairline px-2.5 py-1">
          <MapPin size={12} /> {profile.location}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-green-700 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {profile.status}
        </span>
      </div>

      <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-ink/80">{profile.tagline}</p>

      <dl className="mt-5 w-full max-w-sm space-y-1.5 text-[13px]">
        {specs.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      {more && (
        <div className="mt-5 w-full max-w-sm space-y-3 rounded-xl bg-hairline/60 p-4 text-left text-[13px] leading-relaxed">
          <p>{profile.summary}</p>
          <ul className="space-y-1">
            {profile.funFacts.map((f) => (
              <li key={f}>✦ {f}</li>
            ))}
          </ul>
          <p className="text-muted">Speaks: {profile.languages.join(" · ")}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Btn onClick={() => setMore((m) => !m)}>{more ? "Less Info" : "More Info…"}</Btn>
        <Btn onClick={() => os.openApp("projects")}>View Projects</Btn>
        <Btn primary onClick={() => os.openApp("contact")}>
          Say Hi
        </Btn>
      </div>
      <p className="mt-6 text-[11px] text-muted">™ and © 2003–2026 {profile.name}. All rights reserved.</p>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  primary,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  href?: string;
}) {
  const cls = `inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-medium shadow-sm transition active:scale-[0.97] ${
    primary
      ? "bg-accent text-white hover:brightness-110"
      : "bg-white text-ink ring-1 ring-black/10 hover:bg-neutral-50 dark:bg-neutral-700 dark:ring-white/10 dark:hover:bg-neutral-600"
  }`;
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
