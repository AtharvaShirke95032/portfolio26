"use client";

import { Copy, Phone, Send } from "lucide-react";
import { useState } from "react";
import { profile } from "@/lib/data";
import { useOS } from "../os/OSContext";
import { GithubMark, LinkedinMark } from "../os/BrandMarks";

// Mail.app compose window. "Send" hands off to the visitor's mail client.
export default function Contact() {
  const os = useOS();
  const [subject, setSubject] = useState("Let's work together 👋");
  const [body, setBody] = useState("");
  const [from, setFrom] = useState("");

  const send = () => {
    const text = from ? `${body}\n\n— ${from}` : body;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    os.toast("Opening your mail app ✉️");
  };

  const row = "flex items-center gap-2 border-b border-hairline px-4 py-2 text-[13px]";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
        <button
          type="button"
          onClick={send}
          disabled={!body.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1 text-[13px] font-medium text-white disabled:opacity-40"
        >
          <Send size={13} /> Send
        </button>
        <div className="flex items-center gap-1">
          <IconLink href={profile.links.github} label="GitHub">
            <GithubMark className="h-4 w-4" />
          </IconLink>
          <IconLink href={profile.links.linkedin} label="LinkedIn">
            <LinkedinMark className="h-4 w-4" />
          </IconLink>
          <IconLink href={`tel:${profile.phone.replace(/\s/g, "")}`} label={profile.phone}>
            <Phone size={15} />
          </IconLink>
        </div>
      </div>

      <div className={row}>
        <span className="w-16 text-muted">To:</span>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent">{profile.name}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(profile.email);
            os.toast("Email copied 📋");
          }}
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
        >
          <Copy size={12} /> {profile.email}
        </button>
      </div>
      <label className={row}>
        <span className="w-16 text-muted">From:</span>
        <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="your name" className="flex-1 bg-transparent outline-none" />
      </label>
      <label className={row}>
        <span className="w-16 text-muted">Subject:</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 bg-transparent font-medium outline-none" />
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={"Hey Atharva,\n\nWe're hiring a backend dev and…"}
        className="min-h-40 flex-1 resize-none bg-transparent p-4 text-[14px] leading-relaxed outline-none placeholder:text-muted/70"
      />
    </div>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-hairline hover:text-ink"
    >
      {children}
    </a>
  );
}
