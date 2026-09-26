"use client";

import { useSyncExternalStore } from "react";

// Current time, ticking every `ms`. Null during hydration so server and client markup match.
export function useNow(ms = 1000) {
  const t = useSyncExternalStore(
    (cb) => {
      const id = setInterval(cb, ms);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / ms) * ms,
    () => 0,
  );
  return t ? new Date(t) : null;
}

const noop = () => () => {};

// True once running in the browser.
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
