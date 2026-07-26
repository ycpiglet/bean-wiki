"use client";

import { useSyncExternalStore } from "react";

// Platform-aware search-shortcut label: "⌘ K" on Apple devices, "Ctrl K"
// elsewhere. The keyboard handler already accepts both; only the HINT was
// hardcoded to the Mac symbol, which confused Windows/Linux users.
// useSyncExternalStore with a constant store is the hydration-safe way to read
// a client-only value: the server snapshot renders "Ctrl K" (the majority
// case) and Apple devices correct to "⌘ K" on hydration.
const subscribe = () => () => {};
const getSnapshot = () =>
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "")
    ? "⌘ K"
    : "Ctrl K";
const getServerSnapshot = () => "Ctrl K";

export function useShortcutLabel(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
