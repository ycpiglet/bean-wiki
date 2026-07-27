import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { SuggestionBoard } from "@/components/suggestion-board";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "질문과 제안",
  description: "궁금한 내용, 새 글, 내용 보완과 기능 아이디어를 제안하세요.",
  alternates: { canonical: "/suggestions" },
};

export default function SuggestionsPage() {
  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/" className="back-link">← 홈으로</Link>
          <HeaderSearchButton locale="ko" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>
      <div className="shell community-page">
        <header className="community-hero">
          <span className="eyebrow"><i aria-hidden="true" /> IDEA INBOX</span>
          <h1>궁금함이 다음 문서의<br />첫 문장이 됩니다.</h1>
          <p>
            “이 내용이 궁금해요”, “이 글이 있었으면 좋겠어요”를 남겨주세요.
            접수된 제안은 공개 목록으로 쌓이고 집필 로드맵의 근거가 됩니다.
          </p>
        </header>
        <SuggestionBoard />
      </div>
    </main>
  );
}
