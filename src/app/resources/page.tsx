import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { resources, type ResourceKind } from "@/content/resources";

export const metadata: Metadata = {
  title: "참고 자료실",
  description: "Bean Wiki가 검증에 사용하는 커피 논문, 서적, 표준, 보고서와 강의를 모았습니다.",
  alternates: { canonical: "/resources" },
};

const kinds: ResourceKind[] = ["논문", "서적", "표준·보고서", "강의"];

export default function ResourcesPage() {
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

      <div className="shell resources-page">
        <header className="community-hero">
          <span className="eyebrow"><i aria-hidden="true" /> REFERENCE LIBRARY</span>
          <h1>주장보다 먼저,<br />확인할 수 있는 근거.</h1>
          <p>
            동료평가 논문, 전문 서적, 기관 표준과 공개 강의를 한곳에
            모았습니다. DOI와 기관 원문을 우선 연결합니다.
          </p>
          <div className="resource-summary">
            {kinds.map((kind) => (
              <span key={kind}>{kind} {resources.filter((item) => item.kind === kind).length}</span>
            ))}
          </div>
        </header>

        {kinds.map((kind) => (
          <section className="resource-group" key={kind}>
            <div>
              <span>{kind}</span>
              <h2>{kind === "논문" ? "연구에서 확인하기" : kind === "서적" ? "한 권으로 깊게 읽기" : kind === "표준·보고서" ? "현재 기준과 산업 데이터" : "체계적으로 배우기"}</h2>
            </div>
            <div className="resource-grid">
              {resources.filter((item) => item.kind === kind).map((resource) => (
                <article key={resource.id}>
                  <div>
                    <span>{resource.kind}</span>
                    {resource.openAccess && <em>OPEN ACCESS</em>}
                  </div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <small>{resource.citation}</small>
                  <a href={resource.url} target="_blank" rel="noreferrer">
                    원문·공식 페이지 보기 ↗
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
