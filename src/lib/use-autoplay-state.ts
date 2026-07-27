"use client";

import { useEffect, useState } from "react";

type AutoplayState = {
  allowed: boolean;
  reducedMotion: boolean;
};

/**
 * Autoplay is available only while the page is visible and the visitor has
 * not requested reduced motion. Components still own their explicit pause
 * and interaction states.
 */
export function useAutoplayState() {
  const [state, setState] = useState<AutoplayState>({
    allowed: false,
    reducedMotion: false,
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const reducedMotion = media.matches;
      const allowed =
        !reducedMotion && document.visibilityState === "visible";
      setState((current) =>
        current.allowed === allowed &&
        current.reducedMotion === reducedMotion
          ? current
          : { allowed, reducedMotion },
      );
    };

    sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return state;
}
