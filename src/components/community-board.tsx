"use client";

import { useEffect, useMemo, useState } from "react";
import { recordPostWritten } from "@/lib/learning-progress";

type Board = "notice" | "free";
type CommunityPost = {
  id: string;
  board: Board;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  views: number;
  pinned?: boolean;
};

const STORAGE_KEY = "bean-wiki-community-v1";

const seedPosts: CommunityPost[] = [
  {
    id: "notice-welcome",
    board: "notice",
    title: "Bean Wiki 커뮤니티 운영 원칙",
    body: "서로의 감각과 경험이 다를 수 있음을 전제로 이야기해 주세요. 사실 주장에는 확인 가능한 출처를, 개인 경험에는 맥락을 덧붙이면 더 좋은 기록이 됩니다.",
    author: "Bean Wiki 편집팀",
    createdAt: "2026. 07. 26.",
    views: 128,
    pinned: true,
  },
  {
    id: "notice-roadmap",
    board: "notice",
    title: "120개 문서 주제 로드맵을 공개했습니다",
    body: "과학·역사·지속가능성·카페 운영까지 커피 지식 지도를 넓혔습니다. 주제 기획실에서 우선순위와 글마다 다룰 질문을 확인해 주세요.",
    author: "Bean Wiki 편집팀",
    createdAt: "2026. 07. 26.",
    views: 94,
    pinned: true,
  },
  {
    id: "free-dial-in",
    board: "free",
    title: "오늘의 다이얼인 기록: 케냐 워시드",
    body: "15g, 240g, 92℃에서 시작해 분쇄도를 한 단계 굵게 바꾸니 거친 후미가 줄었습니다. 비슷한 원두를 드신 분들의 기록도 궁금해요.",
    author: "초보브루어",
    createdAt: "2026. 07. 25.",
    views: 37,
  },
  {
    id: "free-books",
    board: "free",
    title: "로스팅 입문 서적을 어떤 순서로 읽으면 좋을까요?",
    body: "열 전달 기초부터 프로파일 해석까지 차근차근 공부하려고 합니다. 위키의 참고 자료실과 함께 볼 만한 순서를 추천해 주세요.",
    author: "첫배치",
    createdAt: "2026. 07. 24.",
    views: 52,
  },
];

function loadPosts() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? ([...seedPosts, ...JSON.parse(raw)] as CommunityPost[]) : seedPosts;
  } catch {
    return seedPosts;
  }
}

export function CommunityBoard() {
  const [board, setBoard] = useState<Board>("free");
  const [posts, setPosts] = useState<CommunityPost[]>(seedPosts);
  const [selected, setSelected] = useState<CommunityPost | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPosts(loadPosts()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visible = useMemo(
    () =>
      posts
        .filter((post) => post.board === board)
        .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))),
    [board, posts],
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    const cleanAuthor = author.trim() || "익명의 커피인";
    if (cleanTitle.length < 3 || cleanBody.length < 10) {
      setMessage("제목은 3자, 내용은 10자 이상 입력해 주세요.");
      return;
    }
    const post: CommunityPost = {
      id: crypto.randomUUID(),
      board: "free",
      title: cleanTitle,
      body: cleanBody,
      author: cleanAuthor,
      createdAt: new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
      views: 0,
    };
    const localPosts = posts.filter((item) => !seedPosts.some((seed) => seed.id === item.id));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([post, ...localPosts]));
    setPosts((current) => [post, ...current]);
    const { awarded } = recordPostWritten(post.id);
    setMessage(
      `글을 이 브라우저에 저장했습니다.${awarded ? ` +${awarded} XP` : ""}`,
    );
    setTitle("");
    setBody("");
    setAuthor("");
    setComposerOpen(false);
    setBoard("free");
  }

  function openPost(post: CommunityPost) {
    setSelected(post);
    setPosts((current) =>
      current.map((item) =>
        item.id === post.id ? { ...item, views: item.views + 1 } : item,
      ),
    );
  }

  return (
    <div className="community-board">
      <div className="board-toolbar">
        <div className="board-tabs" role="tablist" aria-label="게시판 선택">
          <button
            type="button"
            role="tab"
            aria-selected={board === "free"}
            className={board === "free" ? "is-active" : ""}
            onClick={() => {
              setBoard("free");
              setSelected(null);
            }}
          >
            자유게시판
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={board === "notice"}
            className={board === "notice" ? "is-active" : ""}
            onClick={() => {
              setBoard("notice");
              setSelected(null);
            }}
          >
            공지사항
          </button>
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

      {message && <p className="form-message" role="status">{message}</p>}

      {composerOpen && (
        <form className="board-composer" onSubmit={submit}>
          <div>
            <label htmlFor="community-author">이름</label>
            <input
              id="community-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              maxLength={30}
              placeholder="익명의 커피인"
            />
          </div>
          <div>
            <label htmlFor="community-title">제목</label>
            <input
              id="community-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
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
              maxLength={2000}
              required
              placeholder="레시피, 관찰, 질문과 맥락을 함께 적어 주세요."
            />
          </div>
          <small>글 작성 경험치는 하루 최대 3회까지 지급됩니다.</small>
          <button type="submit" className="primary-button">브라우저에 저장 +20 XP</button>
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
            <span>{selected.author}</span>
            <span>{selected.createdAt}</span>
            <span>조회 {selected.views + 1}</span>
          </div>
          <p>{selected.body}</p>
        </article>
      ) : (
        <div className="board-list" role="tabpanel">
          <div className="board-list-head" aria-hidden="true">
            <span>제목</span><span>작성자</span><span>조회</span>
          </div>
          {visible.map((post) => (
            <button type="button" key={post.id} onClick={() => openPost(post)}>
              <span>
                {post.pinned && <em>공지</em>}
                <strong>{post.title}</strong>
                <small>{post.createdAt}</small>
              </span>
              <span>{post.author}</span>
              <span>{post.views}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
