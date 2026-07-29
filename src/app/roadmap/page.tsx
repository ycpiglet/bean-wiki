import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { PrimaryNav } from "@/components/primary-nav";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopicRoadmap } from "@/components/topic-roadmap";
import { plannedTopicCount, topicTracks } from "@/content/topic-plan";

export const metadata: Metadata = {
  title: "주제 기획실",
  description: "12개 연구 트랙, 120개 커피 문서의 우선순위와 집필 초점을 공개합니다.",
  alternates: { canonical: "/roadmap" },
};

export default function RoadmapPage() {
  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <PrimaryNav />
        <div className="header-tools">
          <Link href="/" className="back-link">← 홈으로</Link>
          <HeaderSearchButton locale="ko" />
          <ThemeToggle />
          <AccountMenu locale="ko" />
          <MobileNav />
        </div>
      </header>

      <div className="shell roadmap-page">
        <header className="community-hero">
          <span className="eyebrow"><i aria-hidden="true" /> DEEP RESEARCH ROADMAP</span>
          <h1>{plannedTopicCount}편으로 확장하는<br />커피 지식의 전체 지도.</h1>
          <p>
            식물학에서 추출, 감각, 역사, 건강과 무역까지 12개 트랙을
            설계했습니다. P0 25편은 먼저 깊게 만들 핵심 문서입니다.
          </p>
          <div className="roadmap-legend">
            <span><b>P0</b> 핵심 25편</span>
            <span><b>P1</b> 연결망 확장</span>
            <span><b>P2</b> 전문 아카이브</span>
          </div>
        </header>
        <TopicRoadmap tracks={topicTracks} />
      </div>
    </main>
  );
}
