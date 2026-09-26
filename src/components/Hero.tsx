"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { CodeArt, DashboardArt, Media, PhoneArt, PhotoArt, TerminalArt } from "./arts";
import { MacWindow, useDesktop } from "./desktop";
import {
  CodeDetail,
  EntryDetail,
  PhotoDetail,
  ProjectDetail,
  ProjectsFinder,
  entryById,
  projectById,
} from "./details";
import Draggable from "./Draggable";
import { BeachBall, DocIcon, Folder, Kaomoji, MailIcon, MailSticker, NameTag, OldComputer, PdfFile } from "./icons";

/** A floating mac window: red = trash it, green = open it big. */
function FloatWindow({
  id,
  file,
  w,
  h,
  pos,
  bounds,
  delay,
  rotate,
  onOpen,
  className = "",
  children,
}: {
  id: string;
  file: string;
  w: number;
  h: number;
  pos: CSSProperties;
  bounds: RefObject<HTMLElement | null>;
  delay: number;
  rotate?: number;
  onOpen: () => void;
  className?: string;
  children: ReactNode;
}) {
  const { trash } = useDesktop();
  return (
    <Draggable id={id} label={file} bounds={bounds} style={{ position: "absolute", ...pos }} delay={delay} rotate={rotate} onOpen={onOpen} className={className}>
      <MacWindow showX onClose={() => trash({ id, label: file })} onZoom={onOpen} bodyClassName="p-1.5">
        <div className="overflow-hidden rounded-md" style={{ width: w, height: h }}>
          {children}
        </div>
      </MacWindow>
      <p className="mt-2 text-center text-[13px] text-neutral-400">{file}</p>
    </Draggable>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { openModal } = useDesktop();
  const openProject = (id: string) => {
    const p = projectById(id);
    openModal({ title: p.file, content: <ProjectDetail p={p} />, width: 720 });
  };
  const lg = "hidden lg:block";

  return (
    <section id="top" ref={ref} className="dots relative min-h-[100svh] overflow-hidden pt-[52px] lg:min-h-[900px]">
      {/* center copy */}
      <div className="pointer-events-none relative z-0 flex min-h-[calc(100svh-52px)] flex-col items-center justify-center px-4 text-center lg:min-h-[848px]">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[13px] text-neutral-500 ring-1 ring-black/5 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {profile.status}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="text-[clamp(56px,9.5vw,140px)] font-semibold leading-[0.9] tracking-[-0.05em] text-neutral-950"
        >
          {profile.name.split(" ")[0]}
          <br className="sm:hidden" /> {profile.name.split(" ")[1]}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 max-w-md text-[clamp(17px,2vw,24px)] leading-snug text-neutral-800"
        >
          {profile.tagline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="pointer-events-auto mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <a
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            className="glossy-blue flex items-center justify-center gap-2.5 rounded-full px-7 py-3 text-[18px] font-medium text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <DocIcon className="h-5 w-5" /> view resume
          </a>
          <a
            href="#contact"
            className="glossy-white flex items-center justify-center gap-2.5 rounded-full px-7 py-3 text-[18px] font-medium text-neutral-900 transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <MailIcon className="h-5 w-5" /> say hi
          </a>
        </motion.div>
        <p className="mt-4 text-[14px] text-neutral-400">
          full-stack · {profile.location} · <span className="hidden sm:inline">psst, everything here is draggable</span>
          <span className="sm:hidden">drag stuff around</span>
        </p>
      </div>

      {/* ---------- floating desktop junk ---------- */}
      <FloatWindow id="w-photo" file="me.png" w={150} h={200} pos={{ left: "7%", top: "13%" }} bounds={ref} delay={0.1} className={lg}
        onOpen={() => openModal({ title: "me.png", content: <PhotoDetail />, width: 460 })}>
        <Media src={profile.photo} alt={profile.name}>
          <PhotoArt />
        </Media>
      </FloatWindow>

      <Draggable id="tag-blue" label="name tag" bounds={ref} style={{ position: "absolute", left: "4%", top: "15%" }} className="lg:!left-[23%] lg:!top-[10%]" delay={0.2} rotate={-4}>
        <NameTag name={profile.handle} />
      </Draggable>

      <Draggable id="k1" label="^ ω ^" bounds={ref} style={{ position: "absolute", left: "29%", top: "25%" }} className={lg} delay={0.3}>
        <Kaomoji start={0} />
      </Draggable>

      <FloatWindow id="w-readme" file="readme-ai.mov" w={240} h={130} pos={{ left: "38%", top: "8%" }} bounds={ref} delay={0.15} className={lg}
        onOpen={() => openProject("readme-ai")}>
        <TerminalArt />
      </FloatWindow>

      <Draggable id="k2" label="shrug" bounds={ref} style={{ position: "absolute", left: "61%", top: "16%" }} className={lg} delay={0.35}>
        <Kaomoji start={3} />
      </Draggable>

      <Draggable id="ball" label="beach ball" bounds={ref} style={{ position: "absolute", right: "10%", top: "86%" }} className="lg:!left-[56%] lg:!right-auto lg:!top-[34%]" delay={0.5}>
        <BeachBall className="h-7 w-7" />
      </Draggable>

      <FloatWindow id="w-outly" file="outly.mov" w={300} h={170} pos={{ right: "5%", top: "13%" }} bounds={ref} delay={0.2} className={lg}
        onOpen={() => openProject("outly")}>
        <PhoneArt />
      </FloatWindow>

      <Draggable id="mail" label="you've got mail" bounds={ref} style={{ position: "absolute", right: "4%", top: "12%" }} className="lg:!right-[28%] lg:!top-[20%]" delay={0.4} rotate={3}
        onOpen={() => (window.location.href = `mailto:${profile.email}`)} title="email me">
        <MailSticker />
      </Draggable>

      <Draggable id="tag-red" label="name tag (red)" bounds={ref} style={{ position: "absolute", right: "5%", top: "40%" }} className={lg} delay={0.45} rotate={-6}>
        <NameTag name="full-stack" color="#e5262c" />
      </Draggable>

      <Draggable id="sticky" label="sticky note" bounds={ref} style={{ position: "absolute", left: "3%", top: "44%" }} className={lg} delay={0.55} rotate={-3}>
        <div className="w-[150px] bg-[#fff59d] p-3 font-hand text-[19px] leading-tight text-neutral-800 shadow-[0_8px_16px_-8px_rgba(0,0,0,0.35)]">
          psst — drag anything into the trash in the dock ↓
          <br />
          (you can put it back)
        </div>
      </Draggable>

      <Draggable id="folder-projects" label="projects folder" bounds={ref} style={{ position: "absolute", left: "8%", top: "80%" }} className="lg:!left-[20%] lg:!top-[31%]" delay={0.6}
        onOpen={() => openModal({ title: "projects", content: <ProjectsFinder />, width: 620 })} title="double the fun: click to open">
        <Folder className="h-[56px] w-[70px]" label="projects" />
      </Draggable>

      <FloatWindow id="w-reliance" file="reliance-compliance.app" w={300} h={170} pos={{ left: "4%", top: "64%" }} bounds={ref} delay={0.25} className={lg}
        onOpen={() => openModal({ title: "reliance.app", content: <EntryDetail e={entryById("reliance")} />, width: 640 })}>
        <DashboardArt />
      </FloatWindow>

      <Draggable id="k3" label="(¬_¬)" bounds={ref} style={{ position: "absolute", left: "27%", top: "71%" }} className={lg} delay={0.4}>
        <Kaomoji start={1} />
      </Draggable>

      <Draggable id="k4" label="{ ^-^ }" bounds={ref} style={{ position: "absolute", right: "20%", top: "55%" }} className={lg} delay={0.4}>
        <Kaomoji start={2} />
      </Draggable>

      <FloatWindow id="w-code" file="events.ts" w={230} h={190} pos={{ right: "3%", top: "62%" }} bounds={ref} delay={0.3} rotate={1} className={lg}
        onOpen={() => openModal({ title: "events.ts", content: <CodeDetail />, width: 560 })}>
        <CodeArt />
      </FloatWindow>

      <Draggable id="pdf" label="resume.pdf" bounds={ref} style={{ position: "absolute", left: "31%", top: "82%" }} className={lg} delay={0.65}
        onOpen={() => window.open(profile.resume, "_blank")}>
        <PdfFile label="resume.pdf" />
      </Draggable>

      <Draggable id="folder-skills" label="skills folder" bounds={ref} style={{ position: "absolute", right: "30%", top: "80%" }} className={lg} delay={0.7}
        onOpen={() => document.getElementById("skills")?.scrollIntoView()}>
        <Folder color="#f472b6" className="h-[56px] w-[70px]" label="skills" />
      </Draggable>

      <Draggable id="computer" label="old computer" bounds={ref} style={{ position: "absolute", left: "48%", top: "86%" }} className={lg} delay={0.75} rotate={-6}>
        <OldComputer className="h-16 w-16" />
      </Draggable>
    </section>
  );
}
