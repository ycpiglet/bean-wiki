"use client";

import type { FocusEvent } from "react";
import { useEffect, useState } from "react";
import type { HomeHighlight } from "@/content/home-highlights";
import { useAutoplayState } from "@/lib/use-autoplay-state";
import { AutoplayToggle } from "@/components/autoplay-toggle";

type KnowledgeDialProps = {
  items: HomeHighlight[];
};

export function KnowledgeDial({ items }: KnowledgeDialProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const { allowed: autoplayAllowed, reducedMotion } = useAutoplayState();

  useEffect(() => {
    if (!autoplayAllowed || paused || interacting || items.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [autoplayAllowed, interacting, items.length, paused]);

  if (!items.length) return null;

  const current = items[index];

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setInteracting(false);
    }
  }

  function move(delta: 1 | -1) {
    const nextIndex = (index + delta + items.length) % items.length;
    setIndex(nextIndex);
    setAnnouncement(
      `${nextIndex + 1}번째 지식 다이얼: ${items[nextIndex].title}`,
    );
  }

  return (
    <section className="intro-strip" aria-label="Bean Wiki 지식 다이얼">
      <div
        className="shell intro-strip-inner"
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={handleBlur}
      >
        <span className="knowledge-dial-kicker">KNOWLEDGE DIAL</span>
        <div className="knowledge-dial-window" aria-live="off">
          <div className="knowledge-dial-item" key={current.id}>
            <strong>{current.title}</strong>
            <p>{current.body}</p>
          </div>
        </div>
        <div className="knowledge-dial-controls">
          <span aria-hidden="true">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </span>
          <button type="button" aria-label="이전 지식 문구" onClick={() => move(-1)}>
            ←
          </button>
          <button type="button" aria-label="다음 지식 문구" onClick={() => move(1)}>
            →
          </button>
          {reducedMotion ? (
            <span className="motion-status">자동 전환 꺼짐</span>
          ) : (
            <AutoplayToggle
              paused={paused}
              onToggle={() => setPaused((value) => !value)}
            />
          )}
        </div>
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </div>
    </section>
  );
}
