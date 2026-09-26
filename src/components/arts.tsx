"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Shows a real image when `src` is set, otherwise the drawn placeholder. */
export function Media({ src, alt, children, className = "" }: { src?: string; alt: string; children: ReactNode; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} draggable={false} />;
  }
  return <div className={`h-full w-full ${className}`}>{children}</div>;
}

/* npx readme-ai, typed out on a loop */
const script = [
  { t: "$ npx readme-ai", c: "text-neutral-100" },
  { t: "✔ scanning project structure…", c: "text-emerald-400" },
  { t: "✔ found: express, prisma, react", c: "text-emerald-400" },
  { t: "✦ asking gemini nicely…", c: "text-violet-300" },
  { t: "✔ wrote README.md (142 lines)", c: "text-emerald-400" },
  { t: "done in 3.1s ✨", c: "text-amber-300" },
];

export function TerminalArt({ big }: { big?: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (script.length + 3)), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`h-full w-full bg-[#0f1115] p-3 font-mono ${big ? "text-sm" : "text-[10px]"} leading-relaxed`}>
      {script.slice(0, Math.min(step + 1, script.length)).map((l) => (
        <div key={l.t} className={l.c}>
          {l.t}
        </div>
      ))}
      <span className="caret inline-block h-3 w-1.5 translate-y-0.5 bg-neutral-300" />
    </div>
  );
}

/* outly: a tiny phone map with pulsing event pins */
export function PhoneArt() {
  const pins = [
    { x: 30, y: 30, c: "#ec4899", e: "🎸" },
    { x: 65, y: 45, c: "#3b82f6", e: "☕" },
    { x: 42, y: 66, c: "#22c55e", e: "🏀" },
    { x: 72, y: 22, c: "#f59e0b", e: "🎨" },
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e8efe4]">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
        <path d="M0 40 Q40 35 100 55" stroke="#fff" strokeWidth="5" fill="none" />
        <path d="M35 0 Q45 50 30 100" stroke="#fff" strokeWidth="4" fill="none" />
        <path d="M70 0 L80 100" stroke="#fff" strokeWidth="3" fill="none" />
        <path d="M0 80 L100 72" stroke="#fff" strokeWidth="2.5" fill="none" />
        <rect x="50" y="60" width="18" height="14" rx="3" fill="#c9dfc1" />
        <rect x="8" y="6" width="16" height="20" rx="3" fill="#bfd7f2" />
      </svg>
      {pins.map((p, i) => (
        <div key={i} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <span
            className="absolute -left-2 -top-2 h-4 w-4 rounded-full"
            style={{ background: p.c, animation: `ping-soft 1.8s ${i * 0.4}s ease-out infinite` }}
          />
          <span
            className="relative -left-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[11px] shadow"
            style={{ background: p.c }}
          >
            {p.e}
          </span>
        </div>
      ))}
      <div className="absolute inset-x-2 bottom-2 rounded-lg bg-white/95 p-2 shadow">
        <div className="text-[10px] font-semibold text-neutral-800">open mic @ bandra · 0.8 km</div>
        <div className="mt-0.5 flex items-center gap-1 text-[9px] text-neutral-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 23 going · starts 8pm
        </div>
      </div>
      <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-neutral-700 shadow">
        📍 near you
      </div>
    </div>
  );
}

/* reliance: compliance dashboard */
export function DashboardArt() {
  const rows = [
    { n: "factories act §7", s: "compliant", c: "bg-emerald-100 text-emerald-700" },
    { n: "env. clearance", s: "extension", c: "bg-amber-100 text-amber-700" },
    { n: "boiler cert.", s: "overdue", c: "bg-rose-100 text-rose-700" },
    { n: "fire noc", s: "compliant", c: "bg-emerald-100 text-emerald-700" },
    { n: "labour returns", s: "due 12d", c: "bg-sky-100 text-sky-700" },
  ];
  return (
    <div className="flex h-full w-full bg-white text-[9px]">
      <div className="w-[26%] space-y-1.5 bg-[#0b3a6e] p-2 text-white/80">
        <div className="mb-2 font-bold text-white">napl</div>
        {["law master", "mapping", "status", "extensions", "roles", "reports"].map((m, i) => (
          <div key={m} className={`rounded px-1 py-0.5 ${i === 2 ? "bg-white/20 text-white" : ""}`}>
            {m}
          </div>
        ))}
      </div>
      <div className="flex-1 p-2">
        <div className="mb-2 grid grid-cols-3 gap-1.5">
          {[
            ["92%", "compliant"],
            ["7", "modules"],
            ["3", "overdue"],
          ].map(([v, l]) => (
            <div key={l} className="rounded bg-neutral-50 p-1 ring-1 ring-neutral-200">
              <div className="text-[12px] font-bold text-neutral-800">{v}</div>
              <div className="text-neutral-400">{l}</div>
            </div>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.n} className="flex items-center justify-between border-b border-neutral-100 py-1">
            <span className="text-neutral-600">{r.n}</span>
            <span className={`rounded-full px-1.5 ${r.c}`}>{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* code editor w/ an express route */
export function CodeArt() {
  const K = "text-[#ff7ab2]";
  const S = "text-[#ffa14f]";
  const F = "text-[#6bdfff]";
  const C = "text-neutral-500";
  return (
    <div className="h-full w-full bg-[#1f1f24] p-3 font-mono text-[10px] leading-[1.6] text-neutral-200">
      <div className={C}>{"// outly/api/events.ts"}</div>
      <div>
        <span className={K}>router</span>.<span className={F}>get</span>(<span className={S}>&quot;/nearby&quot;</span>,{" "}
        <span className={K}>async</span> (req, res) =&gt; {"{"}
      </div>
      <div className="pl-3">
        <span className={K}>const</span> {"{ lat, lng }"} = req.query;
      </div>
      <div className="pl-3">
        <span className={K}>const</span> events = <span className={K}>await</span> prisma.
        <span className={F}>$queryRaw</span>`
      </div>
      <div className={`pl-6 ${S}`}>SELECT * FROM events</div>
      <div className={`pl-6 ${S}`}>WHERE ST_DWithin(geo, …, 5000)</div>
      <div className="pl-3">`;</div>
      <div className="pl-3">
        res.<span className={F}>json</span>(events);
      </div>
      <div>{"});"}</div>
    </div>
  );
}

/** Real photo (or the drawn placeholder) with the little hello caption on top. */
export function Photo({ src, alt, caption = true }: { src?: string; alt: string; caption?: boolean }) {
  if (!src) return <PhotoArt />;
  return (
    <div className="relative h-full w-full">
      <Media src={src} alt={alt} className="object-[50%_20%]">
        {null}
      </Media>
      {caption && (
        <div className="absolute bottom-2 left-2 right-2 rounded bg-black/40 px-1.5 py-0.5 text-center text-[9px] text-white backdrop-blur-sm">
          hey there, it&apos;s atharva 👋
        </div>
      )}
    </div>
  );
}

export function PhotoArt({ hint = "public/media/me.jpg" }: { hint?: string }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden bg-linear-to-b from-[#cfe0f5] via-[#e6d9f3] to-[#f7d9d0]">
      <svg viewBox="0 0 100 100" className="h-[78%] w-[78%] text-neutral-700/80" aria-hidden>
        <circle cx="50" cy="36" r="17" fill="currentColor" />
        <path d="M18 100c0-20 14-34 32-34s32 14 32 34Z" fill="currentColor" />
        <rect x="38" y="31" width="10" height="6" rx="2" fill="none" stroke="#f5f5f5" strokeWidth="1.8" />
        <rect x="52" y="31" width="10" height="6" rx="2" fill="none" stroke="#f5f5f5" strokeWidth="1.8" />
        <path d="M48 34h4" stroke="#f5f5f5" strokeWidth="1.8" />
      </svg>
      <div className="absolute bottom-2 left-2 right-2 rounded bg-black/40 px-1.5 py-0.5 text-center text-[9px] text-white backdrop-blur-sm">
        hey there, it&apos;s atharva 👋
      </div>
      <span className="sr-only">placeholder — add {hint}</span>
    </div>
  );
}
