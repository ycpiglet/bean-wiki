import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { QuizRunner } from "@/components/quiz-runner";
import { LearningDashboard } from "@/components/learning-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { quiz } from "@/content/quiz";

export const metadata: Metadata = {
  title: "커피 퀴즈",
  description:
    "추출·로스팅·센서리 지식을 문항으로 점검하세요. 모든 해설은 Bean Wiki 문서로 이어집니다.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  const levels = ["입문", "중급", "전문"] as const;

  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/wiki" className="back-link">
            ← 모든 문서
          </Link>
          <HeaderSearchButton locale="ko" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <div className="shell quiz-page">
        <header className="wiki-title">
          <span className="eyebrow">
            <i aria-hidden="true" />
            COFFEE QUIZ
          </span>
          <h1>알고 있는지, 문항으로 확인하기</h1>
          <p>
            총 {quiz.length}문항. 정답을 고르면 해설과 근거 문서가 함께
            열립니다. 난이도별로 골라 풀 수 있고, 점수는 브라우저를 벗어나지
            않습니다.
          </p>
          <div className="quiz-stats">
            {levels.map((level) => (
              <span key={level}>
                {level} {quiz.filter((q) => q.level === level).length}문항
              </span>
            ))}
          </div>
        </header>

        <LearningDashboard />
        <QuizRunner questions={quiz} />
      </div>
    </main>
  );
}
