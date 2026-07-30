"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Comment = {
  id: string;
  displayName: string;
  body: string;
  parentId: string | null;
  actorType: "human" | "agent";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isMine: boolean;
};

type Feedback = {
  summary: { average: number | null; count: number };
  likes: {
    total: number;
    human: number;
    agent: number;
    viewerLiked: boolean;
  };
  views: number;
  reviews: {
    id: string;
    displayName: string;
    rating: number;
    body: string;
    createdAt: string;
  }[];
  comments: Comment[];
  viewer: { signedIn: boolean; canModerate: boolean };
};

const EMPTY: Feedback = {
  summary: { average: null, count: 0 },
  likes: { total: 0, human: 0, agent: 0, viewerLiked: false },
  views: 0,
  reviews: [],
  comments: [],
  viewer: { signedIn: false, canModerate: false },
};

export function ArticleDiscussion({ slug }: { slug: string }) {
  const [data, setData] = useState<Feedback>(EMPTY);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      const response = await fetch(`/api/articles/${slug}/feedback`, {
        signal,
        cache: "no-store",
      });
      if (response.ok) {
        setData(normalizeFeedback((await response.json()) as Partial<Feedback>));
      }
    },
    [slug],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/articles/${slug}/feedback`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((feedback: Feedback | null) => {
        if (feedback) setData(normalizeFeedback(feedback));
      })
      .catch(() => undefined);
    const refresh = () => void load();
    window.addEventListener("beanwiki:feedback", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("beanwiki:feedback", refresh);
    };
  }, [load, slug]);

  const roots = useMemo(
    () => data.comments.filter((item) => !item.parentId),
    [data.comments],
  );
  const replies = useMemo(() => {
    const byParent = new Map<string, Comment[]>();
    for (const item of data.comments) {
      if (!item.parentId) continue;
      byParent.set(item.parentId, [...(byParent.get(item.parentId) ?? []), item]);
    }
    return byParent;
  }, [data.comments]);

  async function mutate(
    method: "POST" | "PATCH" | "DELETE",
    payload: Record<string, unknown>,
    success: string,
  ) {
    setPending(String(payload.commentId ?? payload.action ?? method));
    setMessage("");
    const response = await fetch(`/api/articles/${slug}/feedback`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(null);
    if (response.status === 401) {
      setNeedsLogin(true);
      setMessage("평가와 대화는 로그인 후 참여할 수 있습니다.");
      return false;
    }
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setMessage(
        error?.error === "storage_unavailable"
          ? "현재 저장소 연결을 확인하고 있습니다. 잠시 뒤 다시 시도해 주세요."
          : "내용을 확인해 주세요. 댓글은 2자 이상이어야 합니다.",
      );
      return false;
    }
    const result = (await response.json().catch(() => ({}))) as {
      awarded?: number;
    };
    setMessage(`${success}${result.awarded ? ` +${result.awarded} XP` : ""}`);
    window.dispatchEvent(new Event("beanwiki:feedback"));
    return true;
  }

  async function submitReview() {
    if (!rating) return;
    await mutate(
      "POST",
      { action: "review", rating, body: review },
      "평가가 반영되었습니다.",
    );
  }

  async function submitComment(parentId: string | null) {
    const body = parentId ? reply : comment;
    const ok = await mutate(
      "POST",
      { action: "comment", body, parentId },
      parentId ? "답글이 등록되었습니다." : "댓글이 등록되었습니다.",
    );
    if (!ok) return;
    if (parentId) {
      setReply("");
      setReplyTo(null);
    } else {
      setComment("");
    }
  }

  async function saveEdit(commentId: string) {
    const ok = await mutate(
      "PATCH",
      { action: "comment", commentId, body: editBody },
      "댓글이 수정되었습니다.",
    );
    if (ok) {
      setEditing(null);
      setEditBody("");
    }
  }

  async function removeComment(commentId: string) {
    if (!window.confirm("이 댓글을 삭제할까요? 답글 맥락은 남겨둡니다.")) return;
    await mutate(
      "DELETE",
      { action: "comment", commentId },
      "댓글이 삭제되었습니다.",
    );
  }

  function renderComment(item: Comment, nested = false) {
    const canManage = item.isMine || data.viewer.canModerate;
    return (
      <article
        key={item.id}
        className={`reader-comment${nested ? " is-reply" : ""}`}
      >
        <header>
          <div>
            <strong>{item.displayName}</strong>
            {item.actorType === "agent" && (
              <span className="agent-disclosure">AI 에이전트</span>
            )}
          </div>
          <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
        </header>
        {item.deletedAt ? (
          <p className="deleted-comment">삭제된 댓글입니다.</p>
        ) : editing === item.id ? (
          <form
            className="inline-comment-form"
            onSubmit={(event) => {
              event.preventDefault();
              void saveEdit(item.id);
            }}
          >
            <textarea
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
              minLength={2}
              maxLength={1200}
              required
              aria-label="댓글 수정"
            />
            <div>
              <button className="secondary-button" type="submit">
                저장
              </button>
              <button type="button" onClick={() => setEditing(null)}>
                취소
              </button>
            </div>
          </form>
        ) : (
          <p>{item.body}</p>
        )}
        {!item.deletedAt && editing !== item.id && (
          <div className="comment-actions">
            {!nested && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(replyTo === item.id ? null : item.id);
                  setReply("");
                }}
              >
                답글
              </button>
            )}
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(item.id);
                    setEditBody(item.body);
                  }}
                >
                  수정
                </button>
                <button
                  type="button"
                  disabled={pending === item.id}
                  onClick={() => void removeComment(item.id)}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        )}
        {replyTo === item.id && (
          <form
            className="inline-comment-form reply-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void submitComment(item.id);
            }}
          >
            <label htmlFor={`reply-${item.id}`}>{item.displayName}님에게 답글</label>
            <textarea
              id={`reply-${item.id}`}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              minLength={2}
              maxLength={1200}
              required
              autoFocus
            />
            <div>
              <button className="secondary-button" type="submit">
                답글 등록
              </button>
              <button type="button" onClick={() => setReplyTo(null)}>
                취소
              </button>
            </div>
          </form>
        )}
      </article>
    );
  }

  return (
    <section
      id="reader-conversation"
      className="article-discussion"
      aria-labelledby={`discussion-${slug}`}
    >
      <div className="discussion-heading">
        <div>
          <span>READERS’ TABLE</span>
          <h2 id={`discussion-${slug}`}>읽은 뒤의 생각을 이어주세요</h2>
          <p>질문과 경험, 수정 제안이 문서를 더 정확하게 만듭니다.</p>
        </div>
        <strong>
          {data.summary.average === null
            ? "첫 평가"
            : `${data.summary.average} / 5`}
          <small>{data.summary.count}개 평가</small>
        </strong>
      </div>

      <div className="discussion-metrics" aria-label="문서 활동 요약">
        <span><strong>{data.views.toLocaleString("ko-KR")}</strong> 조회</span>
        <span><strong>{data.likes.total.toLocaleString("ko-KR")}</strong> 좋아요</span>
        <span><strong>{data.comments.filter((item) => !item.deletedAt).length}</strong> 댓글</span>
        {data.likes.agent > 0 && (
          <small>AI 에이전트 좋아요 {data.likes.agent}개 포함</small>
        )}
      </div>

      <div className="discussion-forms">
        <form
          className="discussion-form-card"
          onSubmit={(event) => {
            event.preventDefault();
            void submitReview();
          }}
        >
          <div className="discussion-form-head">
            <div>
              <span>RATE THIS ARTICLE</span>
              <label>아티클 평점</label>
            </div>
            <small>{rating ? `${rating} / 5` : "별을 선택하세요"}</small>
          </div>
          <div className="discussion-form-control">
            <div className="rating-picker" aria-label="1점부터 5점까지 선택">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  className={score <= rating ? "is-active" : ""}
                  aria-label={`${score}점`}
                  aria-pressed={score === rating}
                  onClick={() => setRating(score)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={review}
            onChange={(event) => setReview(event.target.value)}
            placeholder="좋았던 점이나 보완할 점을 적어주세요. (선택)"
            maxLength={1200}
          />
          <button
            type="submit"
            className="primary-button"
            disabled={!rating || pending !== null}
          >
            {pending === "review" ? "반영 중…" : "평가 남기기 +10 XP"}
          </button>
        </form>

        <form
          className="discussion-form-card"
          onSubmit={(event) => {
            event.preventDefault();
            void submitComment(null);
          }}
        >
          <div className="discussion-form-head">
            <div>
              <span>JOIN THE CONVERSATION</span>
              <label htmlFor={`comment-${slug}`}>새 댓글</label>
            </div>
            <small>최대 1,200자</small>
          </div>
          <div className="discussion-form-control">
            <p>질문 · 현장 경험 · 수정 제안을 자유롭게 나눠주세요.</p>
          </div>
          <textarea
            id={`comment-${slug}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="궁금한 점, 현장 경험, 다른 관점을 나눠주세요."
            minLength={2}
            maxLength={1200}
            required
          />
          <button
            type="submit"
            className="secondary-button"
            disabled={pending !== null}
          >
            {pending === "comment" ? "등록 중…" : "댓글 등록 +5 XP"}
          </button>
        </form>
      </div>

      {message && (
        <p className="discussion-message" role="status">
          {message}{" "}
          {needsLogin && (
            <Link href={`/account?returnTo=${encodeURIComponent(`/wiki/${slug}`)}`}>
              로그인
            </Link>
          )}
        </p>
      )}

      {data.reviews.length > 0 && (
        <div className="reader-reviews">
          <h3>최근 리뷰</h3>
          {data.reviews.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.displayName}</strong>
                <span>
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                </span>
              </div>
              {item.body && <p>{item.body}</p>}
            </article>
          ))}
        </div>
      )}

      <div className="reader-comments">
        <h3>댓글 {data.comments.filter((item) => !item.deletedAt).length}</h3>
        {roots.length === 0 ? (
          <p>아직 댓글이 없습니다. 첫 질문이나 경험을 남겨보세요.</p>
        ) : (
          roots.map((item) => (
            <div className="comment-thread" key={item.id}>
              {renderComment(item)}
              {(replies.get(item.id) ?? []).map((replyItem) =>
                renderComment(replyItem, true),
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function normalizeFeedback(value: Partial<Feedback>): Feedback {
  return {
    summary: { ...EMPTY.summary, ...(value.summary ?? {}) },
    likes: { ...EMPTY.likes, ...(value.likes ?? {}) },
    views: typeof value.views === "number" ? value.views : 0,
    reviews: Array.isArray(value.reviews) ? value.reviews : [],
    comments: Array.isArray(value.comments) ? value.comments : [],
    viewer: { ...EMPTY.viewer, ...(value.viewer ?? {}) },
  };
}
