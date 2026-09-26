"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const GREETINGS = ["hello", "नमस्ते", "नमस्कार", "hola", "bonjour"];

function seenThisSession() {
  // ?skip bypasses the intro (handy for direct links)
  if (new URLSearchParams(location.search).has("skip")) return true;
  try {
    return sessionStorage.getItem("booted") === "1";
  } catch {
    return false;
  }
}

// macOS-style "hello" screen. Shown once per browser session; click to skip.
// The parent remounts it (via key) to replay it on "Restart…".
export default function Boot({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(() => !seenThisSession());
  const [i, setI] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!visible) {
      if (!done.current) onDone();
      done.current = true;
      return;
    }
    const tick = setInterval(() => setI((n) => n + 1), 520);
    const end = setTimeout(finish, 520 * GREETINGS.length + 200);
    return () => {
      clearInterval(tick);
      clearTimeout(end);
    };
    // runs once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (done.current) return;
    done.current = true;
    try {
      sessionStorage.setItem("booted", "1");
    } catch {}
    setVisible(false);
    onDone();
  }

  const word = GREETINGS[Math.min(i, GREETINGS.length - 1)];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5 }}
          onClick={finish}
          className="no-select fixed inset-0 z-[10000] flex cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-[#1b1030] via-[#3a1c5c] to-[#0b2239] text-white"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={word}
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.22 }}
              className="font-hand text-7xl sm:text-8xl"
            >
              {word}
            </motion.h1>
          </AnimatePresence>
          <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: (520 * GREETINGS.length) / 1000, ease: "easeInOut" }}
            />
          </div>
          <p className="mt-4 text-xs text-white/50">click anywhere to skip</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
