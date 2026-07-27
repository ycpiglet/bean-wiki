"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Feedback = {
  summary: { average: number | null; count: number };
  reviews: {
    id: string;
    displayName: string;
    rating: number;
    body: string;
    createdAt: string;
  }[];
  comments: {
    id: string;
    displayName: string;
    body: string;
    parentId: string | null;
    createdAt: string;
  }[];
};

const EMPTY: Feedback = {
  summary: { average: null, count: 0 },
  reviews: [],
  comments: [],
};

export function ArticleDiscussion({ slug }: { slug: string }) {
  const [data, setData] = useState<Feedback>(EMPTY);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState<"review" | "comment" | null>(null);
  const [message, setMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  async function load(signal?: AbortSignal) {
    const response = await fetch(`/api/articles/${slug}/feedback`, { signal });
    if (response.ok) setData((await response.json()) as Feedback);
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/articles/${slug}/feedback`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((feedback: Feedback | null) => {
        if (feedback) setData(feedback);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [slug]);

  async function submit(action: "review" | "comment") {
    setPending(action);
    setMessage("");
    const response = await fetch(`/api/articles/${slug}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        action === "review"
          ? { action, rating, body: review }
          : { action, body: comment },
      ),
    });
    setPending(null);
    if (response.status === 401) {
      setNeedsLogin(true);
      setMessage("평가와 댓글은 로그인 후 작성할 수 있습니다.");
      return;
    }
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setMessage(
        error?.error === "storage_unavailable"
          ? "현재 이 배포에서는 저장 기능을 사용할 수 없습니다."
          : "내용을 확인해 주세요. 댓글은 2자 이상이어야 합니다.",
      );
      return;
    }
    const result = (await response.json()) as { awarded?: number };
    setMessage(
      `${action === "review" ? "평가" : "댓글"}가 반영되었습니다.${result.awarded ? ` +${result.awarded} XP` : ""}`,
    );
    if (action === "comment") setComment("");
    await load();
  }

  return (
    <section className="article-discussion" aria-labelledby={`discussion-${slug}`}>
      <div className="discussion-heading">
        <div>
          <span>독자 평가</span>
          <h2 id={`discussion-${slug}`}>이 글이 이해에 도움이 되었나요?</h2>
        </div>
        <strong>
          {data.summary.average === null ? "첫 평가를 남겨주세요" : `${data.summary.average} / 5`}
          <small>{data.summary.count}개 평가</small>
        </strong>
      </div>

      <div className="discussion-forms">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (rating) void submit("review");
          }}
        >
          <label>아티클 평점</label>
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
          <textarea
            value={review}
            onChange={(event) => setReview(event.target.value)}
            placeholder="어떤 부분이 좋았거나 보완되면 좋을지 적어주세요. (선택)"
            maxLength={1200}
          />
          <button type="submit" className="primary-button" disabled={!rating || pending !== null}>
            {pending === "review" ? "반영 중…" : "평가 남기기 +10 XP"}
          </button>
        </form>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit("comment");
          }}
        >
          <label htmlFor={`comment-${slug}`}>댓글</label>
          <textarea
            id={`comment-${slug}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="질문, 경험, 다른 관점을 나눠주세요."
            minLength={2}
            maxLength={1200}
            required
          />
          <button type="submit" className="secondary-button" disabled={pending !== null}>
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
                <span>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
              </div>
              {item.body && <p>{item.body}</p>}
            </article>
          ))}
        </div>
      )}

      <div className="reader-comments">
        <h3>댓글 {data.comments.length}</h3>
        {data.comments.length === 0 ? (
          <p>아직 댓글이 없습니다. 첫 질문이나 경험을 남겨보세요.</p>
        ) : (
          data.comments.map((item) => (
            <article key={item.id}>
              <strong>{item.displayName}</strong>
              <p>{item.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
