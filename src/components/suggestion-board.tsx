"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Suggestion = {
  id: string;
  displayName: string;
  kind: string;
  title: string;
  body: string;
  status: string;
  createdAt: string;
};

const kinds = ["궁금한 내용", "새 글 제안", "내용 보완", "기능 제안"];

export function SuggestionBoard() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [kind, setKind] = useState(kinds[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function load(signal?: AbortSignal) {
    const response = await fetch("/api/suggestions", { signal });
    if (response.ok) {
      const data = (await response.json()) as { suggestions: Suggestion[] };
      setItems(data.suggestions);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/suggestions", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { suggestions: Suggestion[] } | null) => {
        if (data) setItems(data.suggestions);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, title, body }),
    });
    setPending(false);
    if (response.status === 401) {
      setMessage("로그인 후 제안을 남길 수 있습니다.");
      return;
    }
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setMessage(
        error?.error === "storage_unavailable"
          ? "현재 이 배포에서는 제안 저장 기능을 사용할 수 없습니다."
          : "제목은 4자, 설명은 10자 이상 적어주세요.",
      );
      return;
    }
    const result = (await response.json()) as { awarded?: number };
    setTitle("");
    setBody("");
    setMessage(`제안이 접수되었습니다.${result.awarded ? ` +${result.awarded} XP` : ""}`);
    await load();
  }

  return (
    <div className="suggestion-layout">
      <form className="suggestion-form" onSubmit={submit}>
        <span>새 제안</span>
        <label>
          제안 유형
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            {kinds.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          한 줄 제목
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 디카페인은 어떻게 만들어지나요?"
            minLength={4}
            maxLength={100}
            required
          />
        </label>
        <label>
          궁금한 맥락
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="왜 궁금한지, 어떤 수준의 글을 원하는지 알려주세요."
            minLength={10}
            maxLength={2000}
            required
          />
        </label>
        <button className="primary-button" disabled={pending}>
          {pending ? "접수 중…" : "제안 보내기 +10 XP"}
        </button>
        {message && (
          <p role="status">
            {message}{" "}
            {message.startsWith("로그인") && (
              <Link href="/account?returnTo=%2Fsuggestions">로그인</Link>
            )}
          </p>
        )}
      </form>

      <section className="suggestion-list" aria-label="접수된 제안">
        <div>
          <span>IDEA INBOX</span>
          <strong>{items.length}개의 독자 제안</strong>
        </div>
        {items.length === 0 ? (
          <p className="empty-state">아직 공개된 제안이 없습니다. 첫 질문을 남겨주세요.</p>
        ) : (
          items.map((item) => (
            <article key={item.id}>
              <div>
                <span>{item.kind}</span>
                <small>{item.status}</small>
              </div>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <small>{item.displayName}</small>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
