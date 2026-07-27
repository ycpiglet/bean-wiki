"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Board = "notice" | "free";
type CommunityPost = {
  id: string;
  board: Board;
  title: string;
  body: string;
  displayName: string;
  createdAt: string;
  pinned?: boolean;
};

const notices: CommunityPost[] = [
  {
    id: "notice-welcome",
    board: "notice",
    title: "Bean Wiki 커뮤니티 운영 원칙",
    body: "서로의 감각과 경험이 다를 수 있음을 전제로 이야기해 주세요. 사실 주장에는 확인 가능한 출처를, 개인 경험에는 맥락을 덧붙이면 더 좋은 기록이 됩니다.",
    displayName: "Bean Wiki 편집팀",
    createdAt: "2026. 07. 27.",
    pinned: true,
  },
  {
    id: "notice-account",
    board: "notice",
    title: "계정 기반 커뮤니티와 경험치 기록을 시작합니다",
    body: "공개 열람은 그대로 유지됩니다. 글 작성, 평가, 댓글과 제안은 ChatGPT 로그인 후 계정에 안전하게 연결됩니다.",
    displayName: "Bean Wiki 편집팀",
    createdAt: "2026. 07. 27.",
    pinned: true,
  },
];

export function CommunityBoard() {
  const [board, setBoard] = useState<Board>("free");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selected, setSelected] = useState<CommunityPost | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function load(signal?: AbortSignal) {
    const response = await fetch("/api/community", { signal });
    if (!response.ok) return;
    const data = (await response.json()) as { posts: CommunityPost[] };
    setPosts(data.posts);
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/community", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { posts: CommunityPost[] } | null) => {
        if (data) setPosts(data.posts);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const visible = useMemo(
    () =>
      board === "notice"
        ? notices
        : posts.filter((post) => post.board === "free"),
    [board, posts],
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const response = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board: "free", title, body }),
    });
    setPending(false);
    if (response.status === 401) {
      setMessage("로그인 후 글을 작성할 수 있습니다.");
      return;
    }
    if (!response.ok) {
      setMessage("제목은 4자, 내용은 10자 이상 적어주세요.");
      return;
    }
    const result = (await response.json()) as { awarded?: number };
    setMessage(`글이 등록되었습니다.${result.awarded ? ` +${result.awarded} XP` : ""}`);
    setTitle("");
    setBody("");
    setComposerOpen(false);
    await load();
  }

  return (
    <div className="community-board">
      <div className="board-toolbar">
        <div className="board-tabs" role="tablist" aria-label="게시판 선택">
          {(["free", "notice"] as Board[]).map((item) => (
            <button
              type="button"
              role="tab"
              key={item}
              aria-selected={board === item}
              className={board === item ? "is-active" : ""}
              onClick={() => {
                setBoard(item);
                setSelected(null);
              }}
            >
              {item === "free" ? "자유게시판" : "공지사항"}
            </button>
          ))}
        </div>
        {board === "free" && (
          <button
            type="button"
            className="primary-button board-write"
            onClick={() => setComposerOpen((open) => !open)}
          >
            {composerOpen ? "작성 닫기" : "새 글 쓰기"}
          </button>
        )}
      </div>

      {message && (
        <p className="form-message" role="status">
          {message}{" "}
          {message.startsWith("로그인") && (
            <Link href="/signin-with-chatgpt?return_to=%2Fcommunity">로그인</Link>
          )}
        </p>
      )}

      {composerOpen && (
        <form className="board-composer" onSubmit={submit}>
          <div>
            <label htmlFor="community-title">제목</label>
            <input
              id="community-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              minLength={4}
              required
              placeholder="함께 이야기하고 싶은 커피 주제"
            />
          </div>
          <div>
            <label htmlFor="community-body">내용</label>
            <textarea
              id="community-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={7}
              maxLength={3000}
              minLength={10}
              required
              placeholder="레시피, 관찰, 질문과 맥락을 함께 적어 주세요."
            />
          </div>
          <small>작성자 이름과 경험치는 로그인한 계정에 연결됩니다.</small>
          <button type="submit" className="primary-button" disabled={pending}>
            {pending ? "등록 중…" : "글 등록 +20 XP"}
          </button>
        </form>
      )}

      {selected ? (
        <article className="board-detail">
          <button type="button" className="text-button" onClick={() => setSelected(null)}>
            ← 목록으로
          </button>
          <span>{selected.board === "notice" ? "공지사항" : "자유게시판"}</span>
          <h2>{selected.title}</h2>
          <div className="board-post-meta">
            <span>{selected.displayName}</span>
            <span>{selected.createdAt.slice(0, 10)}</span>
          </div>
          <p>{selected.body}</p>
        </article>
      ) : (
        <div className="board-list" role="tabpanel">
          <div className="board-list-head" aria-hidden="true">
            <span>제목</span><span>작성자</span><span>상태</span>
          </div>
          {visible.length === 0 ? (
            <p className="empty-state">아직 게시글이 없습니다. 첫 기록을 남겨주세요.</p>
          ) : (
            visible.map((post) => (
              <button type="button" key={post.id} onClick={() => setSelected(post)}>
                <span>
                  {post.pinned && <em>공지</em>}
                  <strong>{post.title}</strong>
                  <small>{post.createdAt.slice(0, 10)}</small>
                </span>
                <span>{post.displayName}</span>
                <span>{post.pinned ? "필독" : "공개"}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
