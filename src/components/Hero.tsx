"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { CodeArt, Media, PhoneArt, Photo, TerminalArt } from "./arts";
import { MacWindow, useDesktop } from "./desktop";
import {
  CodeDetail,
  EntryDetail,
  TrashView,
  PhotoDetail,
  ProjectDetail,
  ProjectsFinder,
  entryById,
  projectById,
} from "./details";
import Draggable from "./Draggable";
import { BeachBall, DocIcon, Folder, Kaomoji, MailIcon, ClassicMac, PdfFile } from "./icons";

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
    <Draggable touchDrag id={id} label={file} bounds={bounds} style={{ position: "absolute", ...pos }} delay={delay} rotate={rotate} onOpen={onOpen} className={className}>
      <MacWindow showX onClose={() => trash({ id, label: file })} onZoom={onOpen} bodyClassName="p-1.5">
        <div className="overflow-hidden rounded-md" style={{ width: w, height: h }}>
          {children}
        </div>
      </MacWindow>
      <p className="mt-2 text-center text-[13px] text-neutral-400">{file}</p>
    </Draggable>
  );
}

/** The retro recycle bin by the sticky note. Drop things on it, click to peek inside. */
function DeskTrash({ className, style }: { className?: string; style: CSSProperties }) {
  const { deskTrashRef, trashed, trashHot, openModal } = useDesktop();
  return (
    <div ref={deskTrashRef} className={`group z-10 ${className}`} style={style}>
      <button
        aria-label="recycle bin"
        onClick={() => openModal({ title: "recycle bin", content: <TrashView />, width: 480 })}
        className={`flex flex-col items-center gap-1 transition-transform ${trashHot ? "scale-115 -rotate-6" : "group-hover:-translate-y-0.5"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/retro/recycle.png" alt="" className="h-[62px] w-auto [filter:hue-rotate(100deg)_saturate(1.6)]" draggable={false} />
        <span className="rounded bg-white/70 px-1.5 text-[11px] leading-4 text-neutral-700">
          recycle bin{trashed.length > 0 && ` (${trashed.length})`}
        </span>
      </button>
    </div>
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
    <section id="top" ref={ref} className="dots relative min-h-[max(100svh,760px)] overflow-hidden pt-[52px] lg:min-h-[900px]">
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
          full-stack · {profile.location} · <span className="hidden lg:inline">psst, everything here is draggable</span>
          <span className="lg:hidden">drag stuff around</span>
        </p>
      </div>

      {/* ---------- phone + tablet desk: smaller copies so the hero isn't bare ---------- */}
      <FloatWindow id="m-photo" file="me.png" w={92} h={100} pos={{ left: "4%", top: "8%" }} bounds={ref} delay={0.1} rotate={-3} className="lg:hidden"
        onOpen={() => openModal({ title: "me.png", content: <PhotoDetail />, width: 460 })}>
        <Photo src={profile.photo} alt={profile.name} caption={false} />
      </FloatWindow>

      <Draggable touchDrag id="m-k1" label="^ ω ^" bounds={ref} style={{ position: "absolute", left: "37%", top: "12%" }} className="lg:hidden" delay={0.3}>
        <Kaomoji start={0} />
      </Draggable>

      <Draggable touchDrag id="m-mc-cat" label="minecraft cat" bounds={ref} style={{ position: "absolute", left: "34%", top: "83%" }} className="lg:hidden" delay={0.45} rotate={-3}
        title="do not disturb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/minecraft-cat.png" alt="minecraft cat lying down" className="w-[120px] drop-shadow-[0_6px_6px_rgba(0,0,0,0.18)]" draggable={false} />
      </Draggable>

      <Draggable touchDrag id="m-pdf" label="resume.pdf" bounds={ref} style={{ position: "absolute", right: "7%", top: "80%" }} className="lg:hidden" delay={0.65}
        onOpen={() => window.open(profile.resume, "_blank")}>
        <PdfFile label="resume.pdf" />
      </Draggable>

      {/* ---------- floating desktop junk ---------- */}
      <FloatWindow id="w-photo" file="me.png" w={150} h={200} pos={{ left: "7%", top: "13%" }} bounds={ref} delay={0.1} className={lg}
        onOpen={() => openModal({ title: "me.png", content: <PhotoDetail />, width: 460 })}>
        <Photo src={profile.photo} alt={profile.name} />
      </FloatWindow>

      <Draggable touchDrag id="nerd-cat" label="nerd cat" bounds={ref} style={{ position: "absolute", right: "4%", top: "8%" }} className="lg:!right-auto lg:!left-[23%] lg:!top-[10%]" delay={0.2} rotate={-4}
        title="um, actually…">
        <div className="w-[92px] bg-white p-1.5 pb-5 sm:w-[118px] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.4)] ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/nerd-cat.png" alt="nerd cat" className="aspect-square w-full object-cover" draggable={false} />
          <p className="mt-1 text-center font-hand text-[15px] leading-none text-neutral-700">um, actually…</p>
        </div>
      </Draggable>

      <Draggable touchDrag id="k1" label="^ ω ^" bounds={ref} style={{ position: "absolute", left: "30%", top: "31%" }} className={lg} delay={0.3}>
        <Kaomoji start={0} />
      </Draggable>

      <FloatWindow id="w-readme" file="readme-ai.mov" w={240} h={130} pos={{ left: "38%", top: "8%" }} bounds={ref} delay={0.15} className={lg}
        onOpen={() => openProject("readme-ai")}>
        <TerminalArt />
      </FloatWindow>

      <Draggable touchDrag id="k2" label="shrug" bounds={ref} style={{ position: "absolute", left: "61%", top: "16%" }} className={lg} delay={0.35}>
        <Kaomoji start={3} />
      </Draggable>

      <Draggable touchDrag id="ball" label="beach ball" bounds={ref} style={{ position: "absolute", left: "58%", top: "22%" }} className="lg:!left-[56%] lg:!top-[34%]" delay={0.5}>
        <BeachBall className="h-7 w-7" />
      </Draggable>

      <FloatWindow id="w-outly" file="outly.mov" w={300} h={170} pos={{ right: "5%", top: "13%" }} bounds={ref} delay={0.2} className={lg}
        onOpen={() => openProject("outly")}>
        <PhoneArt />
      </FloatWindow>

      <Draggable touchDrag id="mc-cat" label="minecraft cat" bounds={ref} style={{ position: "absolute", right: "3%", top: "46%" }} className={lg} delay={0.45} rotate={-3}
        title="do not disturb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/minecraft-cat.png" alt="minecraft cat lying down" className="w-[190px] drop-shadow-[0_6px_6px_rgba(0,0,0,0.18)]" draggable={false} />
      </Draggable>

      <Draggable touchDrag id="sticky" label="sticky note" bounds={ref} style={{ position: "absolute", left: "3%", top: "44%" }} className={lg} delay={0.55} rotate={-3}>
        <div className="light-island w-[150px] bg-[#fff59d] p-3 font-hand text-[19px] leading-tight text-neutral-800 shadow-[0_8px_16px_-8px_rgba(0,0,0,0.35)]">
          psst — drag anything into the bin →
          <br />
          (you can put it back)
        </div>
      </Draggable>

      <DeskTrash className={lg} style={{ position: "absolute", left: "calc(3% + 168px)", top: "47%" }} />

      <Draggable touchDrag id="folder-projects" label="projects folder" bounds={ref} style={{ position: "absolute", left: "8%", top: "80%" }} className="lg:!left-[20%] lg:!top-[31%]" delay={0.6}
        onOpen={() => openModal({ title: "projects", content: <ProjectsFinder />, width: 620 })} title="double the fun: click to open">
        <Folder className="h-[56px] w-[70px]" label="projects" />
      </Draggable>

      <FloatWindow id="w-reliance" file="ex-reliance-intern" w={240} h={180} pos={{ right: "3%", top: "62%" }} bounds={ref} delay={0.25} className={lg}
        onOpen={() => openModal({ title: "ex-reliance-intern", content: <EntryDetail e={entryById("reliance")} />, width: 640 })}>
        <Media src="/media/reliance-desk.jpg" alt="my desk at reliance: thinkpad, monitor full of express controllers">
          {null}
        </Media>
      </FloatWindow>

      <Draggable touchDrag id="k3" label="(¬_¬)" bounds={ref} style={{ position: "absolute", left: "27%", top: "71%" }} className={lg} delay={0.4}>
        <Kaomoji start={1} />
      </Draggable>

      <Draggable touchDrag id="k4" label="{ ^-^ }" bounds={ref} style={{ position: "absolute", right: "20%", top: "55%" }} className={lg} delay={0.4}>
        <Kaomoji start={2} />
      </Draggable>

      <FloatWindow id="w-code" file="events.ts" w={230} h={190} pos={{ left: "4%", top: "64%" }} bounds={ref} delay={0.3} rotate={1} className={lg}
        onOpen={() => openModal({ title: "events.ts", content: <CodeDetail />, width: 560 })}>
        <CodeArt />
      </FloatWindow>

      <Draggable touchDrag id="pdf" label="resume.pdf" bounds={ref} style={{ position: "absolute", left: "31%", top: "82%" }} className={lg} delay={0.65}
        onOpen={() => window.open(profile.resume, "_blank")}>
        <PdfFile label="resume.pdf" />
      </Draggable>

      <Draggable touchDrag id="folder-skills" label="skills folder" bounds={ref} style={{ position: "absolute", right: "30%", top: "80%" }} className={lg} delay={0.7}
        onOpen={() => document.getElementById("skills")?.scrollIntoView()}>
        <Folder color="#f472b6" className="h-[56px] w-[70px]" label="skills" />
      </Draggable>

      <Draggable touchDrag id="computer" label="classic mac" bounds={ref} style={{ position: "absolute", left: "48%", top: "86%" }} className={lg} delay={0.75} rotate={-6}>
        <ClassicMac className="h-16 w-16" />
      </Draggable>
    </section>
  );
}
