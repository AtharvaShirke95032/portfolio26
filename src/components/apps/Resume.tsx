"use client";

import { Download, ExternalLink } from "lucide-react";
import { profile } from "@/lib/data";
import { useViewport } from "../os/useViewport";
import { Btn } from "./About";

// Preview.app-style PDF viewer.
export default function Resume() {
  const { mobile } = useViewport();
  return (
    <div className="flex h-full flex-col bg-neutral-200 dark:bg-neutral-800">
      <div className="flex items-center justify-between gap-2 border-b border-hairline bg-window px-4 py-2">
        <span className="truncate text-xs text-muted">{profile.name} — 1 page</span>
        <div className="flex gap-2">
          <Btn href={profile.resume}>
            <ExternalLink size={13} /> Open
          </Btn>
          <a
            href={profile.resume}
            download="Atharva-Shirke-Resume.pdf"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm hover:brightness-110"
          >
            <Download size={13} /> Download
          </a>
        </div>
      </div>
      {mobile ? (
        // most phone browsers can't render a PDF inside an iframe
        <div className="grid flex-1 place-items-center p-8 text-center">
          <div>
            <div className="text-6xl">📄</div>
            <p className="mt-3 text-sm text-muted">Tap “Open” to view the resume.</p>
          </div>
        </div>
      ) : (
        <iframe src={`${profile.resume}#view=FitH&toolbar=0`} title="Resume" className="min-h-0 w-full flex-1 border-0" />
      )}
    </div>
  );
}
