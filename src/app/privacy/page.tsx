import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description:
    "Bean Wiki가 어떤 정보를 다루고 다루지 않는지에 대한 안내입니다.",
  alternates: {
    canonical: "/privacy",
    languages: { ko: "/privacy", en: "/en/privacy" },
  },
};

export default function PrivacyPage() {
  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/" className="back-link">
            ← 홈으로
          </Link>
          <LanguageSwitcher locale="ko" href="/en/privacy" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="breadcrumbs">
          <Link href="/">홈</Link>
          <span aria-hidden="true">/</span>
          <span>개인정보 처리방침</span>
        </div>

        <div className="section-heading">
          <div>
            <span className="section-index">PRIVACY</span>
            <h2>개인정보 처리방침</h2>
          </div>
          <p>Bean Wiki가 무엇을 다루고, 무엇을 다루지 않는지 정리했습니다.</p>
        </div>

        <div className="policy">
          <h3>수집하지 않는 정보</h3>
          <p>
            Bean Wiki는 정적 웹사이트입니다. 회원가입이나 로그인이 없으며,
            이름·이메일 같은 개인정보를 수집하는 서버 기능이 없습니다.
          </p>

          <h3>브라우저에 저장되는 정보</h3>
          <p>
            아래 정보는 편의 기능을 위해 사용자의 브라우저(localStorage)에만
            저장되며, 서버로 전송되지 않습니다. 브라우저 데이터를 지우면 함께
            삭제됩니다.
          </p>
          <ul>
            <li>테마 설정(라이트/다크) — 다시 방문했을 때 선택을 기억하기 위함</li>
            <li>최근 검색어 — 검색창에서 빠르게 다시 찾기 위함</li>
          </ul>

          <h3>분석 도구</h3>
          <p>
            현재 별도의 사용자 추적·분석 도구를 사용하지 않습니다. 향후 도입할
            경우 이 문서를 갱신하고 어떤 데이터가 다뤄지는지 밝히겠습니다.
          </p>

          <h3>호스팅과 접속 기록</h3>
          <p>
            사이트는 Vercel에서 호스팅됩니다. 호스팅 사업자는 서비스 제공을 위해
            일반적인 접속 로그(예: IP, 요청 시각)를 남길 수 있으며, 이는 Bean
            Wiki가 직접 수집·보관하는 정보가 아닙니다.
          </p>

          <h3>문의</h3>
          <p>
            문의나 정정 요청은{" "}
            <a
              href="https://github.com/ycpiglet/bean-wiki/issues"
              target="_blank"
              rel="noreferrer"
            >
              GitHub 저장소
            </a>
            를 통해 남겨주세요.
          </p>
        </div>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · 함께 만드는 열린 커피 백과사전</p>
        <a
          href="https://github.com/ycpiglet/bean-wiki"
          target="_blank"
          rel="noreferrer"
        >
          이 위키에 기여하기 ↗
        </a>
      </footer>
    </main>
  );
}
