"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";

type Commit = {
  sha: string;
  message: string;
  date: string;
  author: string;
  htmlUrl: string;
};

const COPY = {
  ko: {
    back: "← 문서로 돌아가기",
    heading: "문서 역사",
    loading: "불러오는 중…",
    empty: "커밋 기록을 불러올 수 없습니다.",
    viewDiff: "변경 내용 보기 ↗",
    restore: "이 버전으로 복원",
    restoring: "복원 중…",
    restored: "복원했습니다. 약 1~2분 후 반영됩니다.",
    current: "현재",
    confirm: "이 버전으로 되돌립니다. 현재 내용을 덮어쓰는 새 커밋이 생성됩니다. 계속할까요?",
  },
  en: {
    back: "← Back to article",
    heading: "Article history",
    loading: "Loading…",
    empty: "Could not load the commit history.",
    viewDiff: "View changes ↗",
    restore: "Restore this version",
    restoring: "Restoring…",
    restored: "Restored. Live in about 1–2 minutes.",
    current: "current",
    confirm: "Roll back to this version? A new commit will overwrite the current content. Continue?",
  },
} as const;

export function ArticleHistory({
  slug,
  title,
  locale = "ko",
}: {
  slug: string;
  title: string;
  locale?: Locale;
}) {
  const t = COPY[locale];
  const prefix = locale === "en" ? "/en" : "";
  const [commits, setCommits] = useState<Commit[] | null>(null);
  const [canRestore, setCanRestore] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/articles/${slug}/history?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        setCommits(Array.isArray(d.commits) ? d.commits : []);
        setCanRestore(Boolean(d.canRestore));
      })
      .catch(() => setCommits([]));
    return () => {
      live = false;
    };
  }, [slug, locale]);

  async function restore(sha: string) {
    if (!window.confirm(t.confirm)) return;
    setBusy(sha);
    try {
      const res = await fetch(`/api/articles/${slug}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha, locale }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="history-page shell" lang={locale === "en" ? "en" : undefined}>
      <Link href={`${prefix}/wiki/${slug}`} className="back-link">
        {t.back}
      </Link>
      <h1 className="history-heading">
        {t.heading}
        <small>{title}</small>
      </h1>

      {done && <p className="editor-banner is-ok">{t.restored}</p>}

      {commits === null ? (
        <p className="history-empty">{t.loading}</p>
      ) : commits.length === 0 ? (
        <p className="history-empty">{t.empty}</p>
      ) : (
        <ol className="history-list">
          {commits.map((commit, index) => (
            <li key={commit.sha}>
              <div className="history-entry">
                <p className="history-message">{commit.message}</p>
                <p className="history-meta">
                  <span>{commit.author}</span>
                  {commit.date && (
                    <time dateTime={commit.date}>
                      {new Date(commit.date).toLocaleString(locale === "en" ? "en-US" : "ko-KR")}
                    </time>
                  )}
                  <code>{commit.sha.slice(0, 7)}</code>
                  {index === 0 && <span className="history-current">{t.current}</span>}
                </p>
              </div>
              <div className="history-actions">
                <a href={commit.htmlUrl} target="_blank" rel="noreferrer">
                  {t.viewDiff}
                </a>
                {canRestore && index !== 0 && (
                  <button type="button" onClick={() => restore(commit.sha)} disabled={busy !== null}>
                    {busy === commit.sha ? t.restoring : t.restore}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
