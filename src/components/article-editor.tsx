"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Locale } from "@/i18n/config";

type EditorCopy = {
  backToArticle: string;
  editing: string;
  previewNotice: string;
  draftRestored: string;
  draftSaved: string;
  discardDraft: string;
  titleLabel: string;
  summaryLabel: string;
  save: string;
  savedHtmlHeading: string;
  copy: string;
  copied: string;
  toolbar: {
    h2: string;
    h3: string;
    bold: string;
    italic: string;
    strike: string;
    bullet: string;
    ordered: string;
    quote: string;
    undo: string;
    redo: string;
  };
};

const COPY: Record<Locale, EditorCopy> = {
  ko: {
    backToArticle: "← 문서로 돌아가기",
    editing: "편집 중",
    previewNotice:
      "미리보기 모드입니다. 실제 저장(GitHub 커밋 → 자동 배포)은 로그인 연동 후 활성화됩니다. 지금 작성한 내용은 이 브라우저에 초안으로 자동 저장됩니다.",
    draftRestored: "이 브라우저에 저장된 초안을 불러왔습니다.",
    draftSaved: "초안 저장됨",
    discardDraft: "초안 버리기",
    titleLabel: "제목",
    summaryLabel: "요약",
    save: "저장 (미리보기)",
    savedHtmlHeading: "저장될 본문 HTML",
    copy: "HTML 복사",
    copied: "복사됨",
    toolbar: {
      h2: "제목2",
      h3: "제목3",
      bold: "굵게",
      italic: "기울임",
      strike: "취소선",
      bullet: "글머리 목록",
      ordered: "번호 목록",
      quote: "인용",
      undo: "실행 취소",
      redo: "다시 실행",
    },
  },
  en: {
    backToArticle: "← Back to article",
    editing: "Editing",
    previewNotice:
      "Preview mode. Saving to GitHub (commit → auto-deploy) is enabled once login is wired up. Your work is auto-saved as a draft in this browser.",
    draftRestored: "Restored a draft saved in this browser.",
    draftSaved: "Draft saved",
    discardDraft: "Discard draft",
    titleLabel: "Title",
    summaryLabel: "Summary",
    save: "Save (preview)",
    savedHtmlHeading: "Body HTML to be saved",
    copy: "Copy HTML",
    copied: "Copied",
    toolbar: {
      h2: "H2",
      h3: "H3",
      bold: "Bold",
      italic: "Italic",
      strike: "Strike",
      bullet: "Bullet list",
      ordered: "Numbered list",
      quote: "Quote",
      undo: "Undo",
      redo: "Redo",
    },
  },
};

type Draft = { title: string; summary: string; bodyHtml: string };

export function ArticleEditor({
  slug,
  title,
  summary,
  bodyHtml,
  locale = "ko",
}: {
  slug: string;
  title: string;
  summary: string;
  bodyHtml: string;
  locale?: Locale;
}) {
  const t = COPY[locale];
  const prefix = locale === "en" ? "/en" : "";
  const draftKey = `bean-wiki:draft:${locale}:${slug}`;

  const [titleValue, setTitleValue] = useState(title);
  const [summaryValue, setSummaryValue] = useState(summary);
  const [draftState, setDraftState] = useState<"idle" | "saved" | "restored">(
    "idle",
  );
  const [savedHtml, setSavedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Refs hold the latest field values so the debounced save reads current data
  // without re-subscribing on every keystroke. Synced via effect (ref writes
  // during render are disallowed).
  const titleRef = useRef(titleValue);
  const summaryRef = useRef(summaryValue);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    titleRef.current = titleValue;
    summaryRef.current = summaryValue;
  }, [titleValue, summaryValue]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: bodyHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "article-content editor-surface",
        "aria-label": t.editing,
      },
    },
    // Restore a locally-saved draft once the editor exists (client-only, so no
    // hydration mismatch and no setState-in-effect).
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

  // Debounced draft autosave (tag_manual pattern). Reads current field values
  // via refs and the live editor HTML.
  function scheduleSave() {
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
  }

  // Clear the pending timer on unmount.
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

  function onSave() {
    if (!editor) return;
    setSavedHtml(editor.getHTML());
    setCopied(false);
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
        <button type="button" className="editor-save" onClick={onSave}>
          {t.save}
        </button>
      </header>

      <div className="editor-shell shell">
        <p className="editor-notice">{t.previewNotice}</p>

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

        <EditorContent editor={editor} />

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
