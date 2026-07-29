import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { PrimaryNav } from "@/components/primary-nav";
import { ContactForm } from "@/components/contact-form";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "문의",
  description: "내용 오류, 출처, 기능, 커뮤니티, 교육 협업에 관해 Bean Wiki에 문의하세요.",
  alternates: { canonical: "/contact" },
};

const faq = [
  ["문서의 오류는 어떻게 제보하나요?", "문서 주소와 잘못된 문장, 확인한 출처를 함께 적어 주세요. 내용 검토가 가장 빨라집니다."],
  ["새 주제를 제안할 수 있나요?", "네. 질문과 제안 탭에서 원하는 글, 궁금한 맥락과 예상 독자를 공개 제안으로 남길 수 있습니다."],
  ["강의나 교육 협업도 가능한가요?", "교육 목적, 대상, 일정과 원하는 범위를 협업 제안으로 남겨 주세요."],
  ["계정 기록은 어디에 저장되나요?", "로그인한 사용자의 경험치, 커뮤니티 글, 평가와 제안은 계정에 연결된 서비스 데이터베이스에 보관됩니다."],
];

export default function ContactPage() {
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

      <div className="shell contact-page">
        <header className="community-hero">
          <span className="eyebrow"><i aria-hidden="true" /> CONTACT</span>
          <h1>더 정확하고 유용한 위키를<br />함께 만들어 주세요.</h1>
          <p>
            내용 오류와 출처 제보부터 기능 제안, 커뮤니티 신고, 교육 협업까지
            검토에 필요한 맥락을 남겨 주세요.
          </p>
        </header>

        <div className="contact-layout">
          <ContactForm />
          <aside className="contact-faq">
            <span>자주 묻는 질문</span>
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
            <Link href="/roadmap">주제 기획실 먼저 보기 →</Link>
            <Link href="/suggestions">질문과 새 글 제안 남기기 →</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
