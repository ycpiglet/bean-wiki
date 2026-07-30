"use client";

import { useEffect, useRef } from "react";

// Fires one page-view beacon per mount at /api/telemetry/v1/views.
//
// WHERE THIS IS MEANT TO BE MOUNTED (not wired up yet, by design):
//   src/app/wiki/[slug]/page.tsx           entityType="article", entityKey={slug}
//   src/app/glossary/page.tsx              entityType="glossary"
//   src/app/topics/[topic]/page.tsx        entityType="topic"
//   src/app/tags/[tag]/page.tsx            entityType="tag"
//   src/app/quiz/page.tsx                  entityType="quiz"
// Render it as the last child of the page body; it renders nothing.
//
// It is deliberately fire-and-forget: no state, no error surface, no retry. A
// lost beacon costs one row in a traffic table, so nothing here is allowed to
// throw into a reader's render.

const ENDPOINT = "/api/telemetry/v1/views";

export type ViewBeaconProps = {
  /** One of the catalogued entity types; omit for an unattributed page view. */
  entityType?: "article" | "glossary" | "topic" | "tag" | "page" | "quiz";
  /** Slug or term. Required whenever `entityType` is set. */
  entityKey?: string;
  locale?: "ko" | "en";
  /** Defaults to the current pathname. */
  path?: string;
};

export function ViewBeacon({
  entityType,
  entityKey,
  locale = "ko",
  path,
}: ViewBeaconProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    try {
      const body = JSON.stringify({
        path: path ?? window.location.pathname,
        entityType: entityType ?? "",
        entityKey: entityKey ?? "",
        locale,
      });

      // sendBeacon survives the page being closed mid-navigation and never
      // blocks the main thread. It returns false when the browser refuses to
      // queue the payload, in which case we fall back.
      if (typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }

      void fetch(ENDPOINT, {
        method: "POST",
        body,
        keepalive: true,
        headers: { "content-type": "application/json" },
      }).catch(() => {
        // Telemetry is never worth surfacing to a reader.
      });
    } catch {
      // Same: a blocked Blob constructor or a disabled fetch is not an error
      // the page should know about.
    }
  }, [entityType, entityKey, locale, path]);

  return null;
}

export default ViewBeacon;
