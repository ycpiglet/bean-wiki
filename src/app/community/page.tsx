import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { CommunityBoard } from "@/components/community-board";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "커피 경험과 질문을 나누는 Bean Wiki 자유게시판과 공지사항입니다.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
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
          <AccountMenu locale="ko" />
          <MobileNav />
        </div>
      </header>

      <div className="shell community-page">
        <header className="community-hero">
          <span className="eyebrow"><i aria-hidden="true" /> COMMUNITY</span>
          <h1>한 사람의 경험을<br />모두의 다음 질문으로.</h1>
          <p>
            레시피 기록, 장비 고민, 산지 이야기와 문서 제안을 자유롭게 나누세요.
            서로 다른 감각을 존중하고, 확인 가능한 근거를 환영합니다.
          </p>
        </header>
        <CommunityBoard />
      </div>
    </main>
  );
}
