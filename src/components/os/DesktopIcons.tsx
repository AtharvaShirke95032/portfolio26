"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import Draggable from "./Draggable";
import { AppIcon } from "./apps";
import { useOS, type AppId } from "./OSContext";
import { projects } from "@/lib/data";

type Bounds = React.RefObject<HTMLElement | null>;

type Icon = { id: string; label: string; emoji: string; glyph: React.ReactNode; open: () => void };

export default function DesktopIcons({ bounds }: { bounds: Bounds }) {
  const os = useOS();
  const [selected, setSelected] = useState<string | null>(null);

  const app = (a: AppId) => <AppIcon id={a} size={52} />;
  const icons: Icon[] = [
    { id: "i-about", label: "about-me.txt", emoji: "📄", glyph: <FileGlyph ext="TXT" color="#3b82f6" />, open: () => os.openApp("about") },
    { id: "i-projects", label: "Projects", emoji: "📁", glyph: <FolderGlyph />, open: () => os.openApp("projects") },
    { id: "i-resume", label: "Resume.pdf", emoji: "📄", glyph: <FileGlyph ext="PDF" color="#ef4444" />, open: () => os.openApp("resume") },
    ...projects.slice(0, 2).map((p) => ({
      id: `i-${p.id}`,
      label: p.id === "outly" ? "Outly.app" : "readme-ai",
      emoji: p.emoji,
      glyph: (
        <div className={`grid h-[52px] w-[52px] place-items-center rounded-[12px] bg-gradient-to-br text-2xl shadow-md ${p.color}`}>{p.emoji}</div>
      ),
      open: () => os.showProject(p.id),
    })),
    { id: "i-skills", label: "Skills", emoji: "🧰", glyph: app("skills"), open: () => os.openApp("skills") },
    { id: "i-contact", label: "contact.vcf", emoji: "✉️", glyph: app("contact"), open: () => os.openApp("contact") },
  ];

  return (
    <AnimatePresence>
      {icons.map(
        (ic, i) =>
          !os.trashed(ic.id) && (
            <Draggable
              key={`${ic.id}-${os.tidyKey}`}
              item={{ id: ic.id, label: ic.label, emoji: ic.emoji }}
              bounds={bounds}
              className="max-sm:!left-[var(--mx)] max-sm:!top-[var(--my)] sm:right-5"
              style={
                {
                  top: 44 + i * 96,
                  "--mx": `${16 + (i % 4) * 25}%`,
                  "--my": `calc(100% - ${Math.floor(i / 4) === 0 ? 290 : 190}px)`,
                } as React.CSSProperties
              }
              onTap={(e) => {
                setSelected(ic.id);
                // touch has no double-click: one tap opens
                if (e.pointerType === "touch") ic.open();
              }}
              onDoubleClick={ic.open}
            >
              <div className="flex w-[84px] flex-col items-center gap-1 text-center">
                <div className={`rounded-lg p-1 ${selected === ic.id ? "bg-black/25 dark:bg-white/20" : ""}`}>{ic.glyph}</div>
                <span
                  className={`rounded px-1.5 text-[12px] font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] ${
                    selected === ic.id ? "bg-accent" : ""
                  }`}
                >
                  {ic.label}
                </span>
              </div>
            </Draggable>
          ),
      )}
    </AnimatePresence>
  );
}

function FolderGlyph() {
  return (
    <svg width="56" height="52" viewBox="0 0 56 46" aria-hidden className="drop-shadow-md">
      <path d="M2 6a4 4 0 014-4h14l5 5h25a4 4 0 014 4v2H2z" fill="#4aa8f0" />
      <rect x="2" y="10" width="52" height="34" rx="4" fill="#6cc0fb" />
      <rect x="2" y="10" width="52" height="3" fill="#fff" opacity="0.35" />
    </svg>
  );
}

function FileGlyph({ ext, color }: { ext: string; color: string }) {
  return (
    <svg width="44" height="54" viewBox="0 0 44 54" aria-hidden className="drop-shadow-md">
      <path d="M2 4a3 3 0 013-3h24l13 13v36a3 3 0 01-3 3H5a3 3 0 01-3-3z" fill="#fff" />
      <path d="M29 1v10a3 3 0 003 3h10" fill="#e5e7eb" />
      {[22, 27, 32].map((y) => (
        <rect key={y} x="8" y={y} width="26" height="2" rx="1" fill="#d1d5db" />
      ))}
      <rect x="6" y="38" width="32" height="10" rx="2" fill={color} />
      <text x="22" y="46" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily="system-ui">
        {ext}
      </text>
    </svg>
  );
}
