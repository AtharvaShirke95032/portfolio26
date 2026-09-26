"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

// Encoded as one string so the snapshot is stable between renders.
const snap = () => `${window.innerWidth}x${window.innerHeight}`;
const serverSnap = () => "1280x800";

export function useViewport() {
  const [w, h] = useSyncExternalStore(subscribe, snap, serverSnap).split("x").map(Number);
  return { w, h, mobile: w < 640 };
}
