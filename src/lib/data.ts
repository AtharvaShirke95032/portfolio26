// Everything personal lives here — edit this file to update the site.
// To use real media, drop files into /public/media and set the `image` fields
// (e.g. image: "/media/outly.png"). Leave them undefined to keep the drawn placeholders.

export const profile = {
  name: "atharva shirke",
  handle: "atharva",
  role: "full-stack developer",
  tagline: "a backend-brained full-stack dev who builds apis that don't flinch",
  location: "panvel, india",
  email: "atharvashirke9503@gmail.com",
  github: "https://github.com/AtharvaShirke95032",
  githubHandle: "AtharvaShirke95032",
  linkedin: "https://www.linkedin.com/in/atharva-shirke-b30949373",
  resume: "/resume.pdf",
  status: "open to internships & full-time roles",
  photo: "/media/me.jpg" as string | undefined,
};

export const music = {
  title: "iPod Touch",
  artist: "now playing",
  src: "/music/track.mp3", // drop an mp3 at public/music/track.mp3
  cover: undefined as string | undefined, // e.g. "/media/cover.jpg"
};

export type Project = {
  id: string;
  name: string;
  file: string;
  kind: string;
  dates: string;
  blurb: string;
  bullets: string[];
  stack: string[];
  stat: { value: string; label: string };
  links: { label: string; href: string }[];
  image?: string;
};

export const projects: Project[] = [
  {
    id: "outly",
    name: "outly",
    file: "outly.mov",
    kind: "location-based social platform",
    dates: "jul 2026 — present",
    blurb:
      "find people and events happening around you. a social app built around where you are, not who you follow.",
    bullets: [
      "20+ postgresql tables for users, events, chats, reviews and notifications",
      "30+ rest apis with node, express and prisma for auth, events, participation and social",
      "real-time chat and live event updates over socket.io",
      "geospatial event discovery with postgresql + maps apis, matched on location and interests",
    ],
    stack: ["React Native", "Expo", "Express.js", "PostgreSQL", "Prisma", "Clerk", "Socket.IO"],
    stat: { value: "30+", label: "rest apis" },
    links: [{ label: "github", href: "https://github.com/AtharvaShirke95032" }],
  },
  {
    id: "readme-ai",
    name: "readme-ai",
    file: "readme-ai.mov",
    kind: "ai-powered cli · npm package",
    dates: "nov 2025 — jan 2026",
    blurb:
      "one npx command reads your project and writes a professional readme for it. zero config, no excuses.",
    bullets: [
      "published to npm with 750+ downloads",
      "zero-configuration npx workflow with automatic project structure detection",
      "google gemini api behind a secure backend with rate limiting for public use",
      "handles many project layouts, cutting manual readme writing to one command",
    ],
    stack: ["Node.js", "Gemini API", "JavaScript", "npm"],
    stat: { value: "750+", label: "npm downloads" },
    links: [{ label: "github", href: "https://github.com/AtharvaShirke95032" }],
  },
  {
    id: "reliance",
    name: "napl compliance system",
    file: "reliance-compliance.app",
    kind: "statutory compliance platform · reliance industries",
    dates: "jul 2026 — aug 2026",
    blurb:
      "one place to track every law a plant has to follow — who owns it, when it's due, and what's overdue. built during my internship at reliance.",
    bullets: [
      "7+ modules: law master, law mapping, compliance status, extension requests, role management, certificates and reports",
      "workflows tracking compliance status, due dates, extensions and overdue activities",
      "role-based access control so each user only sees and signs off what they own",
      "10+ business requirements from the it team turned into shipped features",
    ],
    stack: ["AngularJS", "Express", "SQL", "SSMS"],
    stat: { value: "7+", label: "modules" },
    links: [],
  },
];

export type Entry = {
  id: string;
  kind: "work" | "education" | "leadership";
  title: string;
  org: string;
  dates: string;
  place: string;
  bullets: string[];
  stack?: string[];
};

export const entries: Entry[] = [
  {
    id: "reliance",
    kind: "work",
    title: "software developer intern",
    org: "reliance industries limited",
    dates: "jul 2026 — aug 2026",
    place: "on-site · nagothane, maharashtra",
    bullets: [
      "built parts of the napl law compliance system — 7+ modules for centralized statutory compliance",
      "worked across law master, law mapping, compliance status, extension requests, role management, certificates and reports",
      "implemented workflows tracking compliance status, due dates, extensions and overdue activities",
      "turned 10+ business requirements from the it team into shipped features",
      "contributed to role-based access control and compliance reporting across user roles",
    ],
    stack: ["AngularJS", "Express", "SQL", "SSMS"],
  },
  {
    id: "techfest",
    kind: "leadership",
    title: "core team member & webmaster",
    org: "college tech fest",
    dates: "jan 2023",
    place: "terna engineering college",
    bullets: [
      "led development of the official tech fest website",
      "managed deployment and updates for event comms and registrations",
      "coordinated with design, marketing and operations teams",
      "part of the core organizing team for the whole event",
    ],
  },
  {
    id: "oosc",
    kind: "leadership",
    title: "participant",
    org: "oosc 2025 + hackathon",
    dates: "2025",
    place: "open source",
    bullets: [
      "took part in oosc 2025 and its hackathon",
      "getting hands-on with open-source development and industry practices",
    ],
  },
  {
    id: "terna",
    kind: "education",
    title: "b.tech, computer science & engineering",
    org: "terna engineering college",
    dates: "2023 — 2027",
    place: "navi mumbai, mh",
    bullets: [
      "coursework: data structures & algorithms, dbms, operating systems, computer networks, oop, software engineering",
    ],
  },
];

export const skills: { group: string; color: string; items: string[] }[] = [
  { group: "languages", color: "#3b82f6", items: ["JavaScript", "TypeScript", "SQL", "C++"] },
  { group: "backend", color: "#22c55e", items: ["Node.js", "Express.js", "REST APIs", "Socket.IO", "Prisma"] },
  { group: "frontend", color: "#ec4899", items: ["React.js", "Next.js", "Tailwind CSS", "AngularJS", "Redux", "React Native"] },
  { group: "databases", color: "#f59e0b", items: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Supabase"] },
  { group: "tools", color: "#8b5cf6", items: ["Git", "GitHub", "Postman"] },
];

/** extra places a skill shows up that aren't in a project/experience `stack` (those are matched automatically) */
export const skillUses: Record<string, string[]> = {
  "Node.js": ["outly"],
  "REST APIs": ["outly"],
  "React.js": ["this portfolio"],
  "Next.js": ["this portfolio"],
  TypeScript: ["this portfolio"],
  "Tailwind CSS": ["this portfolio"],
  Git: ["this portfolio"],
  GitHub: ["this portfolio", "readme-ai"],
};
