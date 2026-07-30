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
  const activeCommentCount = useMemo(
    () => data.comments.filter((item) => !item.deletedAt).length,
    [data.comments],
  );
  const writtenReviews = useMemo(
    () => data.reviews.filter((item) => item.body.trim().length > 0),
    [data.reviews],
  );

  async function mutate(
    method: "POST" | "PATCH" | "DELETE",
    payload: Record<string, unknown>,
    success: string,
  ) {
    setPending(String(payload.commentId ?? payload.action ?? method));
    setMessage("");
    setNeedsLogin(false);
    try {
      const response = await fetch(`/api/articles/${slug}/feedback`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
    } catch {
      setMessage("연결이 원활하지 않습니다. 잠시 뒤 다시 시도해 주세요.");
      return false;
    } finally {
      setPending(null);
    }
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

  async function submitContribution() {
    const body = comment.trim();
    const hasComment = body.length >= 2;
    const hasRating = rating > 0;
    if (!hasComment && !hasRating) return;

    setPending("contribution");
    setMessage("");
    setNeedsLogin(false);

    try {
      const requests: {
        kind: "review" | "comment";
        response: Promise<Response>;
      }[] = [];

      if (hasRating) {
        requests.push({
          kind: "review",
          response: fetch(`/api/articles/${slug}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "review", rating }),
          }),
        });
      }
      if (hasComment) {
        requests.push({
          kind: "comment",
          response: fetch(`/api/articles/${slug}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "comment", body, parentId: null }),
          }),
        });
      }

      const settled = await Promise.allSettled(
        requests.map(async ({ kind, response }) => {
          const resolved = await response;
          const payload = (await resolved.json().catch(() => ({}))) as {
            awarded?: number;
            error?: string;
          };
          return { kind, response: resolved, payload };
        }),
      );
      const results = settled.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const rejectedKinds = settled.flatMap((result, index) =>
        result.status === "rejected" ? [requests[index].kind] : [],
      );

      const succeeded = results.filter(({ response }) => response.ok);
      const failed = results.filter(({ response }) => !response.ok);
      const reviewSucceeded = succeeded.some(({ kind }) => kind === "review");
      const commentSucceeded = succeeded.some(({ kind }) => kind === "comment");
      const failedKinds = [
        ...failed.map(({ kind }) => kind),
        ...rejectedKinds,
      ];
      const unauthorized = failed.some(
        ({ response }) => response.status === 401,
      );
      if (reviewSucceeded) setRating(0);
      if (commentSucceeded) setComment("");

      if (succeeded.length > 0) {
        const awarded = succeeded.reduce(
          (total, { payload }) => total + (payload.awarded ?? 0),
          0,
        );
        const successLabel =
          reviewSucceeded && commentSucceeded
            ? "평가가 반영되었고 댓글이 등록되었습니다."
            : reviewSucceeded
              ? "평가가 반영되었습니다."
              : "댓글이 등록되었습니다.";
        const retryLabel =
          failedKinds.includes("review") && failedKinds.includes("comment")
            ? "평가와 댓글은 다시 시도해 주세요."
            : failedKinds.includes("review")
              ? "평가는 다시 시도해 주세요."
              : "댓글은 다시 시도해 주세요.";
        setNeedsLogin(unauthorized);
        setMessage(
          failedKinds.length > 0
            ? `${successLabel} ${retryLabel}`
            : `${successLabel}${awarded ? ` +${awarded} XP` : ""}`,
        );
        window.dispatchEvent(new Event("beanwiki:feedback"));
        return;
      }

      if (unauthorized) {
        setNeedsLogin(true);
        setMessage("평가와 대화는 로그인 후 참여할 수 있습니다.");
        return;
      }
      if (rejectedKinds.length > 0) {
        setMessage("연결이 원활하지 않습니다. 잠시 뒤 다시 시도해 주세요.");
        return;
      }
      setMessage(
        failed.some(({ payload }) => payload.error === "storage_unavailable")
          ? "현재 저장소 연결을 확인하고 있습니다. 잠시 뒤 다시 시도해 주세요."
          : "내용을 확인해 주세요. 댓글은 2자 이상이어야 합니다.",
      );
    } catch {
      setMessage("연결이 원활하지 않습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setPending(null);
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
          <span className="comment-avatar" aria-hidden="true">
            {commentInitials(item.displayName)}
          </span>
          <div className="comment-author">
            <div>
              <strong>{item.displayName}</strong>
              {item.actorType === "agent" && (
                <span className="agent-disclosure">AI 에이전트</span>
              )}
            </div>
            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </div>
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
                aria-expanded={replyTo === item.id}
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
          <h2 id={`discussion-${slug}`}>독자 대화</h2>
          <p>질문과 경험, 수정 제안을 남겨 문서를 함께 다듬어주세요.</p>
        </div>
        <div className="discussion-summary" aria-label="독자 반응 요약">
          <span className="discussion-rating-summary">
            <b aria-hidden="true">★</b>
            <strong>
              {data.summary.average === null ? "—" : data.summary.average}
            </strong>
            <small>{data.summary.count}명 평가</small>
          </span>
          <span className="discussion-comment-summary">
            <strong>{activeCommentCount}</strong>
            <small>댓글</small>
          </span>
        </div>
      </div>

      <form
        className="discussion-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void submitContribution();
        }}
      >
        <div className="discussion-composer-heading">
          <span className="composer-avatar" aria-hidden="true">BW</span>
          <div>
            <label htmlFor={`comment-${slug}`}>의견을 남겨주세요</label>
            <p>댓글만, 별점만, 또는 둘 다 남길 수 있습니다.</p>
          </div>
          <small>{comment.length.toLocaleString("ko-KR")} / 1,200</small>
        </div>
        <textarea
          id={`comment-${slug}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="궁금한 점, 현장 경험, 다른 관점이나 수정 제안을 나눠주세요."
          minLength={2}
          maxLength={1200}
        />
        <div className="discussion-composer-footer">
          <fieldset className="composer-rating">
            <legend>
              이 글이 도움이 되었나요?
              <small>별점은 선택 사항</small>
            </legend>
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
              {rating > 0 && (
                <button
                  type="button"
                  className="rating-clear"
                  onClick={() => setRating(0)}
                >
                  선택 취소
                </button>
              )}
            </div>
          </fieldset>
          <button
            type="submit"
            className="primary-button discussion-submit"
            disabled={
              pending !== null ||
              (rating === 0 && comment.trim().length < 2) ||
              (comment.trim().length === 1)
            }
          >
            {pending === "contribution"
              ? "등록 중…"
              : rating > 0 && comment.trim().length >= 2
                ? "평가와 댓글 등록"
                : rating > 0
                  ? "평가 남기기"
                  : "댓글 등록"}
          </button>
        </div>
      </form>

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

      {writtenReviews.length > 0 && (
        <details className="reader-review-archive">
          <summary>이전 평가 의견 {writtenReviews.length}개 보기</summary>
          <div>
            {writtenReviews.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.displayName}</strong>
                  <span aria-label={`${item.rating}점`}>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </span>
                </div>
                {item.body && <p>{item.body}</p>}
              </article>
            ))}
          </div>
        </details>
      )}

      <div className="reader-comments">
        <div className="reader-comments-heading">
          <h3>댓글 {activeCommentCount}</h3>
          <span>오래된 대화부터</span>
        </div>
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

function commentInitials(displayName: string) {
  const compact = displayName.trim().replace(/\s+/g, "");
  return compact.slice(0, 2).toUpperCase() || "BW";
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
