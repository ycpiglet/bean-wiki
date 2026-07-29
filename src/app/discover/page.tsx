import type { Metadata } from "next";
import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { BeanMark } from "@/components/bean-logo";
import { PrimaryNav } from "@/components/primary-nav";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { RecommendationExplorer } from "@/components/recommendation-explorer";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "커피 추천",
  description: "매장, 메뉴, 원두와 레시피를 평가 근거와 출처로 탐색합니다.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverPage() {
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

      <div className="shell community-page">
        <header className="community-hero recommendation-hero">
          <span className="eyebrow"><i aria-hidden="true" /> TASTE DISCOVERY</span>
          <h1>취향을 말하면,<br />근거 있는 한 잔으로.</h1>
          <p>
            매장·메뉴·원두 평가와 검증된 레시피를 한곳에서 비교합니다.
            외부 앱에서 들어온 데이터는 원출처와 평가 수를 숨기지 않습니다.
          </p>
        </header>
        <RecommendationExplorer />
      </div>
    </main>
  );
}
