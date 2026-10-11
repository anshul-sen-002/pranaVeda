"use client";

import { useSyncExternalStore } from "react";

/**
 * Current calendar year, resolved on the client only.
 *
 * Next.js 16 prerenders server components at build time, so calling
 * `new Date()` directly in the footer would bake the build year into the HTML
 * (and Next blocks it outright).
 *
 * `useSyncExternalStore` is the idiomatic way to read a value that only exists
 * in the browser: React passes us the server snapshot for hydration, then
 * subscribes and swaps in the real client value. No effect, no extra render,
 * and no server/client mismatch.
 */
function subscribe() {
  // The year can only change if the tab stays open across new year's eve.
  // Nothing to unsubscribe from for that case, so a no-op is correct here.
  return () => {};
}

function getSnapshot() {
  return String(new Date().getFullYear());
}

function getServerSnapshot() {
  return "";
}

export function CopyrightYear() {
  const year = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <>{year}</>;
}
