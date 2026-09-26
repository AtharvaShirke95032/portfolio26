"use client";

import {
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  Mail,
  Music2,
  Trash2,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { AppId } from "./OSContext";
import About from "../apps/About";
import Projects from "../apps/Projects";
import ExperienceApp from "../apps/Experience";
import Skills from "../apps/Skills";
import Resume from "../apps/Resume";
import Contact from "../apps/Contact";
import MusicApp from "../apps/Music";
import TrashApp from "../apps/Trash";

export type AppDef = {
  id: AppId;
  title: string;
  menuName: string;
  icon: LucideIcon;
  gradient: string;
  size: { w: number; h: number };
  Content: React.ComponentType;
  sidebar?: boolean; // content draws its own full-bleed sidebar under the title bar
};

export const APPS: Record<AppId, AppDef> = {
  about: {
    id: "about",
    title: "About Atharva",
    menuName: "About",
    icon: UserRound,
    gradient: "linear-gradient(160deg,#6ee7f9,#3b82f6 55%,#4f46e5)",
    size: { w: 460, h: 600 },
    Content: About,
  },
  projects: {
    id: "projects",
    title: "Projects",
    menuName: "Finder",
    icon: FolderOpen,
    gradient: "linear-gradient(160deg,#7dd3fc,#0ea5e9 60%,#0369a1)",
    size: { w: 820, h: 560 },
    Content: Projects,
    sidebar: true,
  },
  experience: {
    id: "experience",
    title: "Experience",
    menuName: "Experience",
    icon: BriefcaseBusiness,
    gradient: "linear-gradient(160deg,#fcd34d,#f59e0b 55%,#b45309)",
    size: { w: 640, h: 580 },
    Content: ExperienceApp,
  },
  skills: {
    id: "skills",
    title: "Skills",
    menuName: "Skills",
    icon: Wrench,
    gradient: "linear-gradient(160deg,#a7f3d0,#10b981 55%,#047857)",
    size: { w: 620, h: 560 },
    Content: Skills,
  },
  resume: {
    id: "resume",
    title: "Resume.pdf",
    menuName: "Preview",
    icon: FileText,
    gradient: "linear-gradient(160deg,#fecaca,#f87171 55%,#dc2626)",
    size: { w: 680, h: 720 },
    Content: Resume,
  },
  contact: {
    id: "contact",
    title: "New Message",
    menuName: "Mail",
    icon: Mail,
    gradient: "linear-gradient(160deg,#93c5fd,#3b82f6 50%,#1d4ed8)",
    size: { w: 560, h: 540 },
    Content: Contact,
  },
  music: {
    id: "music",
    title: "Music",
    menuName: "Music",
    icon: Music2,
    gradient: "linear-gradient(160deg,#fda4af,#f43f5e 55%,#be123c)",
    size: { w: 400, h: 560 },
    Content: MusicApp,
  },
  trash: {
    id: "trash",
    title: "Trash",
    menuName: "Finder",
    icon: Trash2,
    gradient: "linear-gradient(160deg,#e5e7eb,#9ca3af)",
    size: { w: 520, h: 400 },
    Content: TrashApp,
  },
};

export const DOCK_APPS: AppId[] = ["about", "projects", "experience", "skills", "resume", "contact", "music"];

export function AppIcon({ id, size = 48, className = "" }: { id: AppId; size?: number | string; className?: string }) {
  const app = APPS[id];
  const Icon = app.icon;
  if (id === "trash") return <TrashCan size={size} className={className} />;
  return (
    <div
      className={`relative grid place-items-center overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] ${className}`}
      style={{ width: size, height: size, borderRadius: "23%", background: app.gradient }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      <Icon className="relative text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" width="52%" height="52%" strokeWidth={2} />
    </div>
  );
}

export function TrashCan({ size = 48, full = false, className = "" }: { size?: number | string; full?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="can" x1="0" x2="1">
          <stop offset="0" stopColor="#d7dbe0" />
          <stop offset="0.5" stopColor="#f5f7fa" />
          <stop offset="1" stopColor="#c3c8cf" />
        </linearGradient>
      </defs>
      {full && (
        <g>
          <path d="M20 16 L30 6 L38 14 L44 8 L48 18 Z" fill="#fde68a" stroke="#d6b44a" strokeWidth="1" />
          <rect x="22" y="9" width="12" height="9" rx="1" fill="#fff" stroke="#bbb" transform="rotate(-14 28 13)" />
        </g>
      )}
      <path d="M13 18 H51 L47 58 Q46.5 61 43.5 61 H20.5 Q17.5 61 17 58 Z" fill="url(#can)" stroke="#9aa1aa" strokeWidth="1" />
      {[22, 28, 34, 40].map((x) => (
        <path key={x} d={`M${x + 1} 24 L${x + 1.5} 55`} stroke="#9aa1aa" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      ))}
      <rect x="11" y="15" width="42" height="5" rx="2.5" fill="#e7eaee" stroke="#9aa1aa" strokeWidth="1" />
    </svg>
  );
}
