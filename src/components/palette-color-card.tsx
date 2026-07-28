"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { BrandSwatch } from "@/design/brand-colors";

type CopyState = "idle" | "copied" | "error";

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function legacyCopy(value: string) {
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Copy command was rejected");
}

export function PaletteColorCard({ swatch }: { swatch: BrandSwatch }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copyHex = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(swatch.hex);
        } catch {
          legacyCopy(swatch.hex);
        }
      } else {
        legacyCopy(swatch.hex);
      }
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2600);
  };

  const chipStyle =
    swatch.family === "silver"
      ? ({
          "--palette-swatch": swatch.hex,
          background:
            "linear-gradient(135deg, #909692 0%, var(--palette-swatch) 32%, #eef0ec 49%, var(--palette-swatch) 68%, #969c98 100%)",
        } as CSSProperties)
      : { backgroundColor: swatch.hex };

  return (
    <article className="palette-card">
      <span className="palette-chip" style={chipStyle} aria-hidden="true" />
      <strong>{swatch.brandName}</strong>
      <small className="palette-english-name" lang="en">
        {swatch.englishName}
      </small>
      <div className="palette-code-row">
        <span>HEX</span>
        <code>{swatch.hex}</code>
        <button
          type="button"
          onClick={copyHex}
          aria-label={`${swatch.brandName} 색상값 ${swatch.hex} 복사`}
          title={`${swatch.hex} 복사`}
        >
          <CopyIcon />
        </button>
      </div>
      <span
        className={`palette-copy-status is-${copyState}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {copyState === "copied"
          ? "색상값을 복사했습니다."
          : copyState === "error"
            ? "자동 복사가 차단되었습니다. HEX 값을 직접 선택해 주세요."
            : ""}
      </span>
      <p>{swatch.story}</p>
    </article>
  );
}
