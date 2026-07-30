"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Snapshot = {
  likes: { total: number; agent: number; viewerLiked: boolean };
  views: number;
  comments: { deletedAt: string | null }[];
  viewer: { signedIn: boolean };
};

type ArticleEngagementProps = {
  slug: string;
  title: string;
  path: string;
};

const SCRAP_PREFIX = "beanwiki:scrap:v1:";

export function ArticleEngagement({
  slug,
  title,
  path,
}: ArticleEngagementProps) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [pending, setPending] = useState(false);
  const [scrapped, setScrapped] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/articles/${slug}/feedback`, {
        cache: "no-store",
      });
      if (response.ok) {
        setData(normalizeSnapshot((await response.json()) as Partial<Snapshot>));
      }
    } catch {
      // Keep the last known snapshot when a background refresh fails.
    }
  }, [slug]);

  useEffect(() => {
    const scrapTimer = window.setTimeout(() => {
      setScrapped(window.localStorage.getItem(`${SCRAP_PREFIX}${slug}`) === "1");
    }, 0);
    const controller = new AbortController();
    void fetch(`/api/articles/${slug}/feedback`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((snapshot: Snapshot | null) => {
        if (snapshot) setData(normalizeSnapshot(snapshot));
      })
      .catch(() => undefined);
    const refresh = () => void load();
    window.addEventListener("beanwiki:feedback", refresh);
    return () => {
      window.clearTimeout(scrapTimer);
      controller.abort();
      window.removeEventListener("beanwiki:feedback", refresh);
    };
  }, [load, slug]);

  async function toggleLike() {
    if (!data) return;
    if (!data.viewer.signedIn) {
      setStatus("좋아요는 로그인 후 계정에 저장할 수 있습니다.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(`/api/articles/${slug}/feedback`, {
        method: data.likes.viewerLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "like",
          liked: !data.likes.viewerLiked,
        }),
      });
      if (!response.ok) {
        setStatus("좋아요를 저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
        return;
      }
      setStatus(
        data.likes.viewerLiked ? "좋아요를 취소했습니다." : "좋아요를 남겼습니다.",
      );
      window.dispatchEvent(new Event("beanwiki:feedback"));
    } catch {
      setStatus("좋아요를 저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  function toggleScrap() {
    const next = !scrapped;
    setScrapped(next);
    if (next) window.localStorage.setItem(`${SCRAP_PREFIX}${slug}`, "1");
    else window.localStorage.removeItem(`${SCRAP_PREFIX}${slug}`);
    setStatus(
      next
        ? "이 브라우저의 스크랩에 저장했습니다."
        : "이 브라우저의 스크랩에서 삭제했습니다.",
    );
  }

  async function shareArticle() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} · Bean Wiki`, url });
        setStatus("공유 메뉴를 열었습니다.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("문서 주소를 복사했습니다.");
    } catch {
      setStatus("주소를 복사하지 못했습니다. 브라우저 주소창에서 복사해 주세요.");
    }
  }

  function exportArticle() {
    const heading = document.querySelector(".wiki-title")?.innerHTML ?? `<h1>${escapeText(title)}</h1>`;
    const content = document.querySelector(".article-content")?.innerHTML ?? "";
    const resources = document.querySelector(".article-resources")?.innerHTML ?? "";
    const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${escapeText(title)} · Bean Wiki</title>
<style>body{max-width:760px;margin:48px auto;padding:0 24px;color:#26231f;font:16px/1.85 system-ui,sans-serif}h1{font-size:2.4rem;line-height:1.2}h2{margin-top:3rem}img{max-width:100%;height:auto}figcaption{color:#655f57;font-size:.85rem}a{color:#335f45}nav,button,.article-engagement,.article-contributors,.article-meta,.article-tags{display:none}</style>
</head><body><header>${heading}</header><main>${content}${resources}</main>
<footer><p>출처: <a href="${window.location.href}">${window.location.href}</a></p></footer></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${slug}.html`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setStatus("오프라인에서 열 수 있는 HTML 문서로 내보냈습니다.");
  }

  const commentCount =
    data?.comments.filter((item) => !item.deletedAt).length ?? 0;
  const loginHref = `/account?returnTo=${encodeURIComponent(path)}`;

  return (
    <div className="article-action-area">
      <div className="article-engagement" aria-label="문서 활동과 도구">
        <div className="article-engagement-primary">
          <button
            type="button"
            className={data?.likes.viewerLiked ? "is-liked" : undefined}
            onClick={() => void toggleLike()}
            disabled={pending || !data}
            aria-pressed={data?.likes.viewerLiked ?? false}
          >
            <HeartIcon filled={data?.likes.viewerLiked ?? false} />
            <span>좋아요</span>
            <strong>{(data?.likes.total ?? 0).toLocaleString("ko-KR")}</strong>
          </button>
          <a href="#reader-conversation">
            <ChatIcon />
            <span>댓글</span>
            <strong>{commentCount}</strong>
          </a>
        </div>
        <div className="article-engagement-tools">
          <span className="article-action-metric" title="누적 문서 조회">
            <EyeIcon />
            <strong>{(data?.views ?? 0).toLocaleString("ko-KR")}</strong>
            <small>조회</small>
          </span>
          <button
            type="button"
            className={scrapped ? "is-active" : undefined}
            onClick={toggleScrap}
            aria-pressed={scrapped}
            title="현재 브라우저에 저장"
          >
            <BookmarkIcon filled={scrapped} />
            <span>{scrapped ? "스크랩됨" : "스크랩"}</span>
          </button>
          <button type="button" onClick={() => void shareArticle()}>
            <ShareIcon />
            <span>공유</span>
          </button>
          <details className="article-action-more">
            <summary>
              <MoreIcon />
              <span>더 보기</span>
            </summary>
            <div className="article-action-menu">
              <button
                type="button"
                onClick={(event) => {
                  exportArticle();
                  event.currentTarget.closest("details")?.removeAttribute("open");
                }}
              >
                <DownloadIcon />
                <span>
                  <strong>내보내기</strong>
                  <small>HTML 파일로 저장</small>
                </span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  window.print();
                }}
              >
                <PrintIcon />
                <span>
                  <strong>인쇄</strong>
                  <small>인쇄용 화면 열기</small>
                </span>
              </button>
            </div>
          </details>
        </div>
      </div>
      <div className="article-action-help">
        <p role="status" aria-live="polite">{status}</p>
        {data && !data.viewer.signedIn && (
          <Link href={loginHref}>로그인하면 좋아요·활동 기록이 계정에 저장됩니다 →</Link>
        )}
      </div>
    </div>
  );
}

function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      {children}
    </svg>
  );
}

function EyeIcon() {
  return (
    <Icon>
      <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
      <circle cx="12" cy="12" r="2.7" />
    </Icon>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <Icon className={filled ? "filled" : undefined}>
      <path d="M20.8 5.7c-2-2-5.2-1.9-7.1.1L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.2Z" />
    </Icon>
  );
}

function ChatIcon() {
  return <Icon><path d="M4 5.5h16v11H9l-5 3v-14Z" /></Icon>;
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return <Icon className={filled ? "filled" : undefined}><path d="M6.5 3.5h11v17L12 17l-5.5 3.5v-17Z" /></Icon>;
}

function ShareIcon() {
  return (
    <Icon>
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="m8.2 10.9 7.6-4.6M8.2 13.1l7.6 4.6" />
    </Icon>
  );
}

function MoreIcon() {
  return (
    <Icon>
      <circle cx="5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="19" cy="12" r="1.3" />
    </Icon>
  );
}

function DownloadIcon() {
  return <Icon><path d="M12 3v12m-4-4 4 4 4-4M4 20h16" /></Icon>;
}

function PrintIcon() {
  return (
    <Icon>
      <path d="M7 8V3h10v5M7 17H4v-7h16v7h-3M7 14h10v7H7v-7Z" />
      <circle cx="17" cy="12" r=".5" />
    </Icon>
  );
}

function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeSnapshot(value: Partial<Snapshot>): Snapshot {
  return {
    likes: {
      total: value.likes?.total ?? 0,
      agent: value.likes?.agent ?? 0,
      viewerLiked: value.likes?.viewerLiked ?? false,
    },
    views: typeof value.views === "number" ? value.views : 0,
    comments: Array.isArray(value.comments) ? value.comments : [],
    viewer: { signedIn: value.viewer?.signedIn ?? false },
  };
}
