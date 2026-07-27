import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "@/lib/chatgpt-auth";
import { levelFromXp, levelTitle } from "@/lib/learning-progress";
import { getProfile } from "@/lib/platform-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "내 계정",
  description: "Bean Wiki 경험치, 레벨과 활동 기록을 확인합니다.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getChatGPTUser();
  let account: Awaited<ReturnType<typeof getProfile>> | null = null;
  if (user) {
    try {
      account = await getProfile(user);
    } catch {
      account = null;
    }
  }
  const xp = account?.profile?.xp ?? 0;
  const level = levelFromXp(xp);

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

      <div className="shell account-page">
        {!user ? (
          <section className="account-signin">
            <span className="eyebrow">OPTIONAL ACCOUNT</span>
            <h1>읽기는 누구나,<br />기록은 로그인부터.</h1>
            <p>
              문서 열람은 계속 공개입니다. 로그인하면 기기와 관계없이 경험치,
              레벨, 평가, 댓글과 제안 기록을 이어갈 수 있습니다.
            </p>
            <a className="primary-button" href={chatGPTSignInPath("/account")}>
              ChatGPT로 로그인
            </a>
          </section>
        ) : (
          <section className="account-dashboard">
            <div className="account-intro">
              <span>LEVEL {String(level.level).padStart(2, "0")}</span>
              <h1>{user.displayName}님의<br />커피 지식 기록</h1>
              <p>{levelTitle(level.level)} · {xp} XP</p>
              <div className="xp-track">
                <i style={{ width: `${level.percent}%` }} />
              </div>
              <small>다음 레벨까지 {level.nextTarget - xp} XP</small>
            </div>
            <div className="account-stats">
              <div><strong>{account?.stats.article_view ?? 0}</strong><span>읽은 문서</span></div>
              <div><strong>{account?.stats.quiz_correct ?? 0}</strong><span>맞힌 퀴즈</span></div>
              <div><strong>{account?.stats.review ?? 0}</strong><span>아티클 평가</span></div>
              <div><strong>{account?.stats.post ?? 0}</strong><span>커뮤니티 글</span></div>
            </div>
            <nav className="account-actions">
              <Link href="/learning-path">초보자 학습 이어가기</Link>
              <Link href="/suggestions">새 글 제안하기</Link>
              <Link href="/discover">오늘의 커피 찾기</Link>
              <a href={chatGPTSignOutPath("/account")}>로그아웃</a>
            </nav>
          </section>
        )}
      </div>
    </main>
  );
}
