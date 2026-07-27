import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { beginnerCurriculum } from "@/content/beginner-curriculum";

export const metadata: Metadata = {
  title: "초보자 학습 경로",
  description: "커피의 가장 기초부터 맛 평가까지 이어지는 10편 학습 경로입니다.",
  alternates: { canonical: "/learning-path" },
};

export default function LearningPathPage() {
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
        <header className="community-hero learning-path-hero">
          <span className="eyebrow"><i aria-hidden="true" /> STARTER COURSE · 10 ARTICLES</span>
          <h1>기초부터 한 편씩,<br />한 잔을 이해하는 순서.</h1>
          <p>
            한 번에 열 편을 기획하고 한 편씩 집필·검증·개정합니다.
            읽기 → 직접 해보기 → 글별 퀴즈 순서로 진행하세요.
          </p>
        </header>

        <ol className="curriculum-list">
          {beginnerCurriculum.map((module) => (
            <li key={module.slug}>
              <span>{String(module.order).padStart(2, "0")}</span>
              <div>
                <small>{module.status}</small>
                <h2>{module.title}</h2>
                <p>{module.question}</p>
                <aside><strong>직접 해보기</strong>{module.practice}</aside>
              </div>
              <Link href={`/wiki/${module.slug}`}>
                {module.status === "집필 완료" ? "학습 시작" : "현재 글 읽기"} →
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
