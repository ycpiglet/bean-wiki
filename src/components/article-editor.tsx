"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import type { Locale } from "@/i18n/config";

// Preserve heading ids across an edit round-trip so anchors, the TOC, and
// ko/en structural parity survive. StarterKit's Heading drops unknown
// attributes otherwise.
const HeadingId = Extension.create({
  name: "headingId",
  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute("id"),
            renderHTML: (attributes) => (attributes.id ? { id: attributes.id } : {}),
          },
        },
      },
    ];
  },
});

// Add a data-wikilink slug to StarterKit's built-in link mark so the build can
// resolve red links and backlinks. Links are inserted via the picker, never by
// typing markup.
const WikiLinkAttr = Extension.create({
  name: "wikiLinkAttr",
  addGlobalAttributes() {
    return [
      {
        types: ["link"],
        attributes: {
          "data-wikilink": {
            default: null,
            parseHTML: (el) => el.getAttribute("data-wikilink"),
            renderHTML: (attrs) =>
              attrs["data-wikilink"] ? { "data-wikilink": attrs["data-wikilink"] } : {},
          },
        },
      },
    ];
  },
});

function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type EditorCopy = {
  backToArticle: string;
  editing: string;
  previewNotice: string;
  publishNotice: string;
  draftRestored: string;
  draftSaved: string;
  discardDraft: string;
  titleLabel: string;
  summaryLabel: string;
  editSummaryLabel: string;
  editSummaryPlaceholder: string;
  save: string;
  publish: string;
  saving: string;
  published: string;
  viewCommit: string;
  conflict: string;
  authRequired: string;
  loginWithGithub: string;
  loggedInAs: (login: string) => string;
  logout: string;
  needsEditSummary: string;
  savedHtmlHeading: string;
  copy: string;
  copied: string;
  linkPickerTitle: string;
  linkSearchPlaceholder: string;
  linkEmpty: string;
  slugLabel: string;
  slugPlaceholder: string;
  categoryLabel: string;
  levelLabel: string;
  creatingBadge: string;
  toolbar: {
    h2: string;
    h3: string;
    bold: string;
    italic: string;
    strike: string;
    bullet: string;
    ordered: string;
    quote: string;
    link: string;
    unlink: string;
    undo: string;
    redo: string;
  };
};

const COPY: Record<Locale, EditorCopy> = {
  ko: {
    backToArticle: "← 문서로 돌아가기",
    editing: "편집 중",
    previewNotice:
      "미리보기 모드입니다. 게시(GitHub 커밋 → 자동 배포)는 GitHub 로그인 후 활성화됩니다. 지금 작성한 내용은 이 브라우저에 초안으로 자동 저장됩니다.",
    publishNotice:
      "게시하면 변경사항이 GitHub에 커밋되고 약 1~2분 후 사이트에 반영됩니다. 작성 중 내용은 이 브라우저에 초안으로 자동 저장됩니다.",
    draftRestored: "이 브라우저에 저장된 초안을 불러왔습니다.",
    draftSaved: "초안 저장됨",
    discardDraft: "초안 버리기",
    titleLabel: "제목",
    summaryLabel: "요약",
    editSummaryLabel: "편집 요약",
    editSummaryPlaceholder: "무엇을 바꿨는지 한 줄로 적어주세요 (커밋 메시지)",
    save: "저장 (미리보기)",
    publish: "게시",
    saving: "게시 중…",
    published: "게시했습니다. 약 1~2분 후 반영됩니다.",
    viewCommit: "커밋 보기 ↗",
    conflict:
      "편집을 시작한 뒤 이 문서가 변경되었습니다. 새로고침해 최신 내용을 받은 뒤 다시 반영해주세요.",
    authRequired: "게시하려면 GitHub 로그인이 필요합니다.",
    loginWithGithub: "GitHub로 로그인",
    loggedInAs: (login) => `${login} 님으로 로그인됨`,
    logout: "로그아웃",
    needsEditSummary: "편집 요약을 입력해주세요.",
    savedHtmlHeading: "저장될 본문 HTML",
    copy: "HTML 복사",
    copied: "복사됨",
    linkPickerTitle: "연결할 문서 선택",
    linkSearchPlaceholder: "문서 제목 검색…",
    linkEmpty: "일치하는 문서가 없습니다. 없는 문서로 링크하면 붉은 링크가 됩니다.",
    slugLabel: "슬러그 (URL)",
    slugPlaceholder: "영문 소문자·숫자·하이픈 (예: cold-brew)",
    categoryLabel: "분야",
    levelLabel: "난이도",
    creatingBadge: "새 문서",
    toolbar: {
      h2: "제목2",
      h3: "제목3",
      bold: "굵게",
      italic: "기울임",
      strike: "취소선",
      bullet: "글머리 목록",
      ordered: "번호 목록",
      quote: "인용",
      link: "링크",
      unlink: "링크 해제",
      undo: "실행 취소",
      redo: "다시 실행",
    },
  },
  en: {
    backToArticle: "← Back to article",
    editing: "Editing",
    previewNotice:
      "Preview mode. Publishing (commit → auto-deploy) is enabled once you sign in with GitHub. Your work is auto-saved as a draft in this browser.",
    publishNotice:
      "Publishing commits your changes to GitHub; they go live in about 1–2 minutes. Your work is auto-saved as a draft in this browser.",
    draftRestored: "Restored a draft saved in this browser.",
    draftSaved: "Draft saved",
    discardDraft: "Discard draft",
    titleLabel: "Title",
    summaryLabel: "Summary",
    editSummaryLabel: "Edit summary",
    editSummaryPlaceholder: "One line on what changed (commit message)",
    save: "Save (preview)",
    publish: "Publish",
    saving: "Publishing…",
    published: "Published. Live in about 1–2 minutes.",
    viewCommit: "View commit ↗",
    conflict:
      "This article changed since you started editing. Reload to get the latest version, then re-apply your changes.",
    authRequired: "Sign in with GitHub to publish.",
    loginWithGithub: "Sign in with GitHub",
    loggedInAs: (login) => `Signed in as ${login}`,
    logout: "Sign out",
    needsEditSummary: "Please enter an edit summary.",
    savedHtmlHeading: "Body HTML to be saved",
    copy: "Copy HTML",
    copied: "Copied",
    linkPickerTitle: "Link to an article",
    linkSearchPlaceholder: "Search article titles…",
    linkEmpty: "No match. Linking to a missing article creates a red link.",
    slugLabel: "Slug (URL)",
    slugPlaceholder: "lowercase letters, numbers, hyphens (e.g. cold-brew)",
    categoryLabel: "Category",
    levelLabel: "Level",
    creatingBadge: "New article",
    toolbar: {
      h2: "H2",
      h3: "H3",
      bold: "Bold",
      italic: "Italic",
      strike: "Strike",
      bullet: "Bullet list",
      ordered: "Numbered list",
      quote: "Quote",
      link: "Link",
      unlink: "Unlink",
      undo: "Undo",
      redo: "Redo",
    },
  },
};

type Draft = { title: string; summary: string; bodyHtml: string };
type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "published"; url: string }
  | { kind: "conflict" }
  | { kind: "auth" }
  | { kind: "error"; message: string };

export function ArticleEditor({
  slug,
  title,
  summary,
  bodyHtml,
  locale = "ko",
  creating = false,
  articles = [],
  categoryOptions = [],
}: {
  slug: string;
  title: string;
  summary: string;
  bodyHtml: string;
  locale?: Locale;
  creating?: boolean;
  articles?: { slug: string; title: string }[];
  categoryOptions?: string[];
}) {
  const t = COPY[locale];
  const prefix = locale === "en" ? "/en" : "";
  const draftKey = `bean-wiki:draft:${locale}:${slug || "new"}`;

  const [titleValue, setTitleValue] = useState(title);
  const [summaryValue, setSummaryValue] = useState(summary);
  const [editSummary, setEditSummary] = useState("");
  const [slugValue, setSlugValue] = useState(slug);
  const [category, setCategory] = useState(categoryOptions[0] ?? "");
  const [level, setLevel] = useState<"입문" | "중급" | "전문">("입문");
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkFilter, setLinkFilter] = useState("");
  const [draftState, setDraftState] = useState<"idle" | "saved" | "restored">("idle");
  const [savedHtml, setSavedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Publish wiring, hydrated from GET /api/articles/[slug].
  const [commitEnabled, setCommitEnabled] = useState(false);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [login, setLogin] = useState<string | null>(null);
  const [baseSha, setBaseSha] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });

  const titleRef = useRef(titleValue);
  const summaryRef = useRef(summaryValue);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    titleRef.current = titleValue;
    summaryRef.current = summaryValue;
  }, [titleValue, summaryValue]);

  // Ask the server whether publishing is possible and capture the current file
  // sha for optimistic-concurrency conflict detection.
  useEffect(() => {
    let live = true;
    fetch(`/api/articles/${slug || "new"}?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        setCommitEnabled(Boolean(d.commitEnabled));
        setOauthEnabled(Boolean(d.oauthEnabled));
        setLogin(d.login ?? null);
        // baseSha only matters for updates; a new article has no base file.
        if (!creating) setBaseSha(d.sha ?? null);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [slug, locale, creating]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: false } }),
      HeadingId,
      WikiLinkAttr,
    ],
    content: bodyHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "article-content editor-surface",
        "aria-label": t.editing,
      },
    },
    onCreate({ editor: created }) {
      let draft: Draft | null = null;
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) draft = JSON.parse(raw) as Draft;
      } catch {
        draft = null;
      }
      if (draft) {
        setTitleValue(draft.title);
        setSummaryValue(draft.summary);
        created.commands.setContent(draft.bodyHtml);
        setDraftState("restored");
      }
    },
    onUpdate() {
      scheduleSave();
    },
  });

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!editor) return;
      const draft: Draft = {
        title: titleRef.current,
        summary: summaryRef.current,
        bodyHtml: editor.getHTML(),
      };
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setDraftState("saved");
      } catch {
        // ignore quota / privacy-mode failures
      }
    }, 900);
  }, [editor, draftKey]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function discardDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    setTitleValue(title);
    setSummaryValue(summary);
    editor?.commands.setContent(bodyHtml);
    setDraftState("idle");
  }

  // Preview fallback (publishing not connected): surface the exact HTML.
  function showPreview() {
    if (!editor) return;
    setSavedHtml(editor.getHTML());
    setCopied(false);
  }

  // Insert an internal link to the picked article. Wraps the selection, or
  // inserts the article title when there is no selection.
  function insertWikiLink(target: { slug: string; title: string }) {
    if (!editor) return;
    const href = `${prefix}/wiki/${target.slug}`;
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, " ");
    const text = selected || target.title;
    editor
      .chain()
      .focus()
      .insertContent(
        `<a data-wikilink="${target.slug}" href="${href}">${escapeText(text)}</a>`,
      )
      .run();
    setLinkPickerOpen(false);
    setLinkFilter("");
    scheduleSave();
  }

  async function publish() {
    if (!editor) return;
    if (!editSummary.trim()) {
      setSaveState({ kind: "error", message: t.needsEditSummary });
      return;
    }
    setSaveState({ kind: "saving" });
    try {
      const res = await fetch(`/api/articles/${slugValue}?locale=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleValue,
          summary: summaryValue,
          bodyHtml: editor.getHTML(),
          editSummary,
          baseSha: creating ? undefined : baseSha,
          locale,
          ...(creating ? { category, level } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.committed) {
        setSaveState({ kind: "published", url: data.commit?.url ?? "" });
        try {
          localStorage.removeItem(draftKey);
        } catch {
          // ignore
        }
      } else if (res.status === 409) {
        setSaveState({ kind: "conflict" });
      } else if (res.status === 401) {
        setSaveState({ kind: "auth" });
      } else if (res.status === 422 && Array.isArray(data.errors)) {
        setSaveState({ kind: "error", message: data.errors.join(" ") });
      } else {
        setSaveState({ kind: "error", message: data.message ?? `HTTP ${res.status}` });
      }
    } catch (error) {
      setSaveState({
        kind: "error",
        message: error instanceof Error ? error.message : "network error",
      });
    }
  }

  async function copyHtml() {
    if (!savedHtml) return;
    try {
      await navigator.clipboard.writeText(savedHtml);
      setCopied(true);
    } catch {
      // ignore
    }
  }

  const tb = t.toolbar;

  return (
    <main className="editor-page" lang={locale === "en" ? "en" : undefined}>
      <header className="editor-bar shell">
        <Link href={`${prefix}/wiki/${slug}`} className="back-link">
          {t.backToArticle}
        </Link>
        <div className="editor-bar-status">
          {draftState === "saved" && <span>{t.draftSaved}</span>}
          {draftState === "restored" && (
            <>
              <span>{t.draftRestored}</span>
              <button type="button" className="editor-mini" onClick={discardDraft}>
                {t.discardDraft}
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          className="editor-save"
          onClick={commitEnabled ? publish : showPreview}
          disabled={saveState.kind === "saving"}
        >
          {commitEnabled
            ? saveState.kind === "saving"
              ? t.saving
              : t.publish
            : t.save}
        </button>
      </header>

      <div className="editor-shell shell">
        <p className="editor-notice">{commitEnabled ? t.publishNotice : t.previewNotice}</p>

        {login ? (
          <p className="editor-notice">
            {t.loggedInAs(login)} ·{" "}
            <a className="editor-login" href={`/api/auth/logout?returnTo=${prefix}/edit/${slug}`}>
              {t.logout}
            </a>
          </p>
        ) : (
          oauthEnabled && (
            <p className="editor-notice">
              <a className="editor-login" href={`/api/auth/github?returnTo=${prefix}/edit/${slug}`}>
                {t.loginWithGithub}
              </a>
            </p>
          )
        )}

        {saveState.kind === "published" && (
          <p className="editor-banner is-ok" role="status">
            {t.published}{" "}
            {saveState.url && (
              <a href={saveState.url} target="_blank" rel="noreferrer">
                {t.viewCommit}
              </a>
            )}
          </p>
        )}
        {saveState.kind === "conflict" && (
          <p className="editor-banner is-warn" role="alert">
            {t.conflict}
          </p>
        )}
        {saveState.kind === "auth" && (
          <p className="editor-banner is-warn" role="alert">
            {t.authRequired}
          </p>
        )}
        {saveState.kind === "error" && (
          <p className="editor-banner is-warn" role="alert">
            {saveState.message}
          </p>
        )}

        {creating && (
          <>
            <p className="editor-creating-badge">{t.creatingBadge}</p>
            <label className="editor-field">
              <span>{t.slugLabel}</span>
              <input
                type="text"
                value={slugValue}
                placeholder={t.slugPlaceholder}
                onChange={(event) =>
                  setSlugValue(event.target.value.trim().toLowerCase())
                }
              />
            </label>
            <div className="editor-field-row">
              <label className="editor-field">
                <span>{t.categoryLabel}</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categoryOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="editor-field">
                <span>{t.levelLabel}</span>
                <select
                  value={level}
                  onChange={(event) =>
                    setLevel(event.target.value as "입문" | "중급" | "전문")
                  }
                >
                  <option value="입문">입문</option>
                  <option value="중급">중급</option>
                  <option value="전문">전문</option>
                </select>
              </label>
            </div>
          </>
        )}

        <label className="editor-field">
          <span>{t.titleLabel}</span>
          <input
            type="text"
            value={titleValue}
            onChange={(event) => {
              setTitleValue(event.target.value);
              scheduleSave();
            }}
          />
        </label>
        <label className="editor-field">
          <span>{t.summaryLabel}</span>
          <textarea
            rows={2}
            value={summaryValue}
            onChange={(event) => {
              setSummaryValue(event.target.value);
              scheduleSave();
            }}
          />
        </label>

        {editor && (
          <div className="editor-toolbar" role="toolbar" aria-label={t.editing}>
            <button
              type="button"
              aria-pressed={editor.isActive("heading", { level: 2 })}
              className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              {tb.h2}
            </button>
            <button
              type="button"
              aria-pressed={editor.isActive("heading", { level: 3 })}
              className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              {tb.h3}
            </button>
            <span className="editor-sep" aria-hidden="true" />
            <button
              type="button"
              aria-pressed={editor.isActive("bold")}
              className={editor.isActive("bold") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <strong>{tb.bold}</strong>
            </button>
            <button
              type="button"
              aria-pressed={editor.isActive("italic")}
              className={editor.isActive("italic") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <em>{tb.italic}</em>
            </button>
            <button
              type="button"
              aria-pressed={editor.isActive("strike")}
              className={editor.isActive("strike") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              {tb.strike}
            </button>
            <span className="editor-sep" aria-hidden="true" />
            <button
              type="button"
              aria-pressed={editor.isActive("bulletList")}
              className={editor.isActive("bulletList") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              {tb.bullet}
            </button>
            <button
              type="button"
              aria-pressed={editor.isActive("orderedList")}
              className={editor.isActive("orderedList") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              {tb.ordered}
            </button>
            <button
              type="button"
              aria-pressed={editor.isActive("blockquote")}
              className={editor.isActive("blockquote") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              {tb.quote}
            </button>
            <span className="editor-sep" aria-hidden="true" />
            <button
              type="button"
              aria-pressed={linkPickerOpen}
              className={editor.isActive("link") ? "is-active" : ""}
              onClick={() => setLinkPickerOpen((open) => !open)}
            >
              {tb.link}
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive("link")}
            >
              {tb.unlink}
            </button>
            <span className="editor-sep" aria-hidden="true" />
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              {tb.undo}
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              {tb.redo}
            </button>
          </div>
        )}

        {linkPickerOpen && editor && (
          <div className="editor-linkpicker" role="dialog" aria-label={t.linkPickerTitle}>
            <span className="editor-linkpicker-title">{t.linkPickerTitle}</span>
            <input
              type="text"
              autoFocus
              value={linkFilter}
              placeholder={t.linkSearchPlaceholder}
              onChange={(event) => setLinkFilter(event.target.value)}
            />
            <ul>
              {articles
                .filter(
                  (a) =>
                    a.title.toLowerCase().includes(linkFilter.toLowerCase()) ||
                    a.slug.includes(linkFilter.toLowerCase()),
                )
                .slice(0, 8)
                .map((a) => (
                  <li key={a.slug}>
                    <button type="button" onClick={() => insertWikiLink(a)}>
                      <strong>{a.title}</strong>
                      <small>/{a.slug}</small>
                    </button>
                  </li>
                ))}
            </ul>
            {linkFilter.trim() && (
              <p className="editor-linkpicker-hint">{t.linkEmpty}</p>
            )}
          </div>
        )}

        <EditorContent editor={editor} />

        {commitEnabled && (
          <label className="editor-field editor-summary-field">
            <span>{t.editSummaryLabel}</span>
            <input
              type="text"
              value={editSummary}
              placeholder={t.editSummaryPlaceholder}
              onChange={(event) => setEditSummary(event.target.value)}
            />
          </label>
        )}

        {savedHtml !== null && (
          <section className="editor-output">
            <div className="editor-output-head">
              <span>{t.savedHtmlHeading}</span>
              <button type="button" className="editor-mini" onClick={copyHtml}>
                {copied ? t.copied : t.copy}
              </button>
            </div>
            <pre>{savedHtml}</pre>
          </section>
        )}
      </div>
    </main>
  );
}
