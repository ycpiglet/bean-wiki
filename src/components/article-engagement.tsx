"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Snapshot = {
  likes: { total: number; agent: number; viewerLiked: boolean };
  views: number;
  comments: { deletedAt: string | null }[];
  viewer: { signedIn: boolean };
};

export function ArticleEngagement({ slug }: { slug: string }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/articles/${slug}/feedback`, {
      cache: "no-store",
    });
    if (response.ok) {
      setData(normalizeSnapshot((await response.json()) as Partial<Snapshot>));
    }
  }, [slug]);

  useEffect(() => {
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
      controller.abort();
      window.removeEventListener("beanwiki:feedback", refresh);
    };
  }, [load, slug]);

  async function toggleLike() {
    if (!data) return;
    if (!data.viewer.signedIn) return;
    setPending(true);
    const response = await fetch(`/api/articles/${slug}/feedback`, {
      method: data.likes.viewerLiked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "like",
        liked: !data.likes.viewerLiked,
      }),
    });
    setPending(false);
    if (!response.ok) return;
    window.dispatchEvent(new Event("beanwiki:feedback"));
  }

  const commentCount =
    data?.comments.filter((item) => !item.deletedAt).length ?? 0;

  return (
    <div className="article-engagement" aria-label="문서 활동">
      <span title="누적 문서 조회">
        <EyeIcon />
        <strong>{(data?.views ?? 0).toLocaleString("ko-KR")}</strong>
        조회
      </span>
      <button
        type="button"
        className={data?.likes.viewerLiked ? "is-liked" : undefined}
        onClick={() => void toggleLike()}
        disabled={pending || !data?.viewer.signedIn}
        aria-pressed={data?.likes.viewerLiked ?? false}
        title={
          data?.viewer.signedIn
            ? data.likes.viewerLiked
              ? "좋아요 취소"
              : "좋아요"
            : "로그인 후 좋아요를 누를 수 있습니다"
        }
      >
        <HeartIcon filled={data?.likes.viewerLiked ?? false} />
        <strong>{(data?.likes.total ?? 0).toLocaleString("ko-KR")}</strong>
        좋아요
      </button>
      <a href="#reader-conversation">
        <ChatIcon />
        <strong>{commentCount}</strong>
        댓글
      </a>
      {data && !data.viewer.signedIn && (
        <Link href={`/account?returnTo=${encodeURIComponent(`/wiki/${slug}`)}`}>
          참여하려면 로그인
        </Link>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
      <circle cx="12" cy="12" r="2.7" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        className={filled ? "filled" : undefined}
        d="M20.8 5.7c-2-2-5.2-1.9-7.1.1L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.2Z"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 5.5h16v11H9l-5 3v-14Z" />
    </svg>
  );
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
