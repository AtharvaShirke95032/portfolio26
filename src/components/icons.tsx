"use client";

import { useId, useState } from "react";

type P = { className?: string };

export const WifiIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 18.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Zm-4.3-3.1a6.1 6.1 0 0 1 8.6 0l-1.5 1.5a4 4 0 0 0-5.6 0l-1.5-1.5Zm-3.2-3.2a10.6 10.6 0 0 1 15 0l-1.5 1.5a8.5 8.5 0 0 0-12 0l-1.5-1.5ZM1.3 9a15.1 15.1 0 0 1 21.4 0l-1.5 1.5a13 13 0 0 0-18.4 0L1.3 9Z" />
  </svg>
);

export const HeadphonesIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M4 17v-4a8 8 0 0 1 16 0v4" strokeLinecap="round" />
    <rect x="3" y="14" width="4" height="7" rx="1.5" fill="currentColor" />
    <rect x="17" y="14" width="4" height="7" rx="1.5" fill="currentColor" />
  </svg>
);

export const BluetoothIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="m7 7 10 10-5 5V2l5 5L7 17" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BatteryIcon = ({ className }: P) => (
  <svg viewBox="0 0 30 16" className={className} fill="none" aria-hidden>
    <rect x="1" y="1.5" width="25" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="27.5" y="5.5" width="1.8" height="5" rx="0.9" fill="currentColor" />
    <path d="M14.5 3.5 10 8.6h3.6l-1.3 4 4.6-5.2h-3.6l1.2-3.9Z" fill="currentColor" />
  </svg>
);

export const SparkIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2c.6 4.7 2.9 7 7.6 7.6-4.7.6-7 2.9-7.6 7.6-.6-4.7-2.9-7-7.6-7.6C9.1 9 11.4 6.7 12 2Zm6.5 12c.3 2.1 1.3 3.1 3.5 3.5-2.2.3-3.2 1.3-3.5 3.5-.3-2.2-1.4-3.2-3.5-3.5 2.1-.4 3.2-1.4 3.5-3.5Z" />
  </svg>
);

export const DocIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V9h5.5L13 3.5ZM8 13h8v1.6H8V13Zm0 3.4h8V18H8v-1.6Z" />
  </svg>
);

export const MailIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GithubIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C15.4 4.8 16.4 5 16.4 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const LinkedinIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.8h4V21H3V9.8Zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.8Z" />
  </svg>
);

/* ---------------- stickers ---------------- */

export function Folder({ color = "#7cb6f0", className, label }: P & { color?: string; label?: string }) {
  const id = `f${color.replace("#", "")}`;
  return (
    <div className={`flex flex-col items-center gap-1 ${className ?? ""}`}>
      <svg viewBox="0 0 64 50" className="h-full w-full drop-shadow-sm" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.95" />
            <stop offset="1" stopColor={color} />
          </linearGradient>
        </defs>
        <path d="M4 6a4 4 0 0 1 4-4h14l5 5h29a4 4 0 0 1 4 4v3H4V6Z" fill={color} style={{ filter: "brightness(0.88)" }} />
        <rect x="2" y="11" width="60" height="37" rx="4" fill={`url(#${id})`} />
        <rect x="2" y="11" width="60" height="3" rx="1.5" fill="#fff" opacity="0.35" />
      </svg>
      {label && (
        <span className="rounded bg-white/70 px-1.5 text-[11px] leading-4 text-neutral-700 backdrop-blur-sm">{label}</span>
      )}
    </div>
  );
}

export function TrashCan({ full, hot }: { full?: boolean; hot?: boolean }) {
  return (
    <svg viewBox="0 0 60 70" className={`h-full w-full transition-transform ${hot ? "scale-125" : ""}`} aria-hidden>
      <defs>
        <linearGradient id="tc" x1="0" x2="1">
          <stop offset="0" stopColor="#c9ccd1" />
          <stop offset="0.5" stopColor="#f4f5f7" />
          <stop offset="1" stopColor="#b8bbc0" />
        </linearGradient>
        <pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0h4v4" fill="none" stroke="#9aa0a6" strokeWidth="0.6" opacity="0.6" />
        </pattern>
      </defs>
      {full && (
        <g>
          <path d="M14 14c4-8 10-6 12-2 3-6 11-6 13 0 4-4 9 0 8 5H12c-1-2 0-3 2-3Z" fill="#fef3c7" stroke="#d6c38d" />
          <rect x="22" y="6" width="12" height="10" rx="1" fill="#93c5fd" transform="rotate(-14 28 11)" />
          <rect x="33" y="7" width="10" height="9" rx="1" fill="#f9a8d4" transform="rotate(12 38 11)" />
        </g>
      )}
      <ellipse cx="30" cy="16" rx="22" ry="5" fill="#e5e7eb" stroke="#9ca3af" />
      <path d="M8 16 12 64a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4l4-48" fill="url(#tc)" stroke="#9ca3af" />
      <path d="M8 16 12 64a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4l4-48" fill="url(#mesh)" />
      <ellipse cx="30" cy="16" rx="22" ry="5" fill="none" stroke="#6b7280" strokeWidth="1.2" />
    </svg>
  );
}

export function NameTag({ name, color = "#1f45d6", rotate = 0 }: { name: string; color?: string; rotate?: number }) {
  return (
    <div
      className="w-[118px] overflow-hidden rounded-[4px] bg-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="px-2 pb-1 pt-1.5 text-center leading-none text-white" style={{ background: color }}>
        <div className="text-[9px] font-black tracking-wide">HELLO</div>
        <div className="text-[6px] font-semibold">my name is</div>
      </div>
      <div className="flex h-11 items-center justify-center font-hand text-[26px] font-bold text-neutral-900">{name}</div>
      <div className="h-2" style={{ background: color }} />
    </div>
  );
}

export function BeachBall({ className }: P) {
  return (
    <div
      className={`rounded-full shadow-[inset_-2px_-3px_6px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.2)] ${className ?? ""}`}
      style={{
        background:
          "conic-gradient(from 0deg, #ff3b30, #ff9500, #ffcc00, #34c759, #5ac8fa, #007aff, #af52de, #ff2d55, #ff3b30)",
        animation: "spin-slow 1.4s linear infinite",
      }}
    />
  );
}

/** Beige classic mac: rainbow stripes on screen, happy mac face on hover. */
export function ClassicMac({ className = "" }: P) {
  const id = useId().replace(/:/g, "");
  const stripes = ["#5ebd3e", "#ffb900", "#f78200", "#e23838", "#973999", "#009cdf"];
  return (
    <svg viewBox="0 0 64 80" className={`group ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f3e8" />
          <stop offset="1" stopColor="#ddd6c3" />
        </linearGradient>
        <linearGradient id={`${id}-bezel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfc8b4" />
          <stop offset="1" stopColor="#ebe6d8" />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-screen`}>
          <rect x="13" y="11" width="38" height="30" rx="5" />
        </clipPath>
      </defs>
      {/* shadow + foot */}
      <ellipse cx="32" cy="77" rx="26" ry="2.5" fill="#000" opacity="0.12" />
      <rect x="7" y="66" width="50" height="10" rx="2.5" fill="#c9c1ab" stroke="#a79f89" strokeWidth="0.8" />
      {/* body */}
      <rect x="5" y="3" width="54" height="68" rx="6" fill={`url(#${id}-body)`} stroke="#b5ad97" strokeWidth="0.9" />
      <rect x="6" y="4" width="52" height="2" rx="1" fill="#fff" opacity="0.7" />
      {/* bezel + screen */}
      <rect x="10" y="8" width="44" height="36" rx="6" fill={`url(#${id}-bezel)`} />
      <rect x="12" y="10" width="40" height="32" rx="5.5" fill="#1d1d1f" />
      <g clipPath={`url(#${id}-screen)`}>
        <rect x="13" y="11" width="38" height="30" fill="#ccccff" />
        {/* happy mac */}
        <g fill="#111">
          <rect x="24" y="19" width="2" height="4" />
          <rect x="38" y="19" width="2" height="4" />
          <path d="M32 18h2v8h-3v-2h1Z" />
          <path d="M25 30h2v2h10v-2h2v2h-2v2H27v-2h-2Z" />
        </g>
        <g className="transition-opacity duration-200 group-hover:opacity-0">
          {stripes.map((c, i) => (
            <rect key={c} x="13" y={11 + i * 5} width="38" height="5.2" fill={c} />
          ))}
        </g>
        <rect x="13" y="11" width="38" height="30" fill={`url(#${id}-gloss)`} />
      </g>
      {/* rainbow badge + floppy slot */}
      <g>
        {stripes.map((c, i) => (
          <rect key={c} x="11" y={55 + i} width="4" height="1" fill={c} />
        ))}
      </g>
      <rect x="31" y="56" width="20" height="2.4" rx="1.2" fill="#3a372f" />
      <rect x="44" y="55" width="7" height="1" rx="0.5" fill="#b5ad97" />
    </svg>
  );
}

export function PdfFile({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[62px] w-[50px] rounded-[3px] bg-white shadow-[0_3px_8px_-2px_rgba(0,0,0,0.3)] ring-1 ring-black/10">
        <div className="absolute right-0 top-0 h-3 w-3 rounded-bl-[3px] bg-neutral-200" />
        <div className="absolute inset-x-2 top-4 space-y-1">
          {[80, 100, 60, 90, 70].map((w, i) => (
            <div key={i} className="h-[2px] rounded bg-neutral-300" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-sm bg-red-500 px-1 text-[8px] font-bold text-white">
          PDF
        </div>
      </div>
      <span className="rounded bg-white/70 px-1.5 text-[11px] leading-4 text-neutral-700">{label}</span>
    </div>
  );
}

const faces = ["^ ω ^", "(¬_¬)", "{ ^-^ }", "¯\\_(ツ)_/¯", "(•‿•)", "ʕ•ᴥ•ʔ", "(╯°□°)╯", "(っ˘ڡ˘ς)", "( ˘▽˘)っ♨", "◉_◉"];

export function Kaomoji({ start = 0, className }: { start?: number; className?: string }) {
  const [i, setI] = useState(start);
  return (
    <button
      onClick={() => setI((v) => (v + 1) % faces.length)}
      className={`whitespace-nowrap font-mono text-2xl text-neutral-800 ${className ?? ""}`}
      aria-label="change face"
    >
      {faces[i]}
    </button>
  );
}

export function MailSticker() {
  return (
    <div className="flex h-[72px] w-[96px] flex-col items-center justify-center rounded-sm bg-gradient-to-b from-[#1b2a9b] to-[#101a6b] shadow-md ring-1 ring-black/30">
      <div className="text-3xl leading-none">📬</div>
      <div className="mt-1 text-[11px] font-bold italic text-white [text-shadow:1px_1px_0_#000]">You&apos;ve Got Mail</div>
    </div>
  );
}
