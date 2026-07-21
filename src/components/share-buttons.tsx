"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/site";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}${path}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url,
  )}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; ignore
    }
  }

  return (
    <div className="share-buttons">
      <span className="share-label">이 문서 공유</span>
      <a href={twitter} target="_blank" rel="noreferrer">
        X
      </a>
      <a href={linkedin} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <button type="button" onClick={copyLink} aria-live="polite">
        {copied ? "복사됨 ✓" : "링크 복사"}
      </button>
    </div>
  );
}
