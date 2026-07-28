import type { Metadata } from "next";
import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { PaletteColorCard } from "@/components/palette-color-card";
import { PrimaryNav } from "@/components/primary-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { brandPalette } from "@/design/brand-colors";

export const metadata: Metadata = {
  title: "브랜드 컬러",
  description:
    "Bean Wiki 브랜드 컬러 — 커피 체리에서 카페 베이커리까지, 실제 소재에서 가져온 색과 복사 가능한 HEX.",
};

export default function ColorGuide() {
  const sources = Object.values(brandPalette.sources);

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
          <Link href="/" className="back-link">
            ← 홈으로
          </Link>
          <HeaderSearchButton locale="ko" />
          <ThemeToggle />
          <AccountMenu locale="ko" />
          <MobileNav />
        </div>
      </header>

      <div className="shell palette-page">
        <header className="wiki-title">
          <h1>Bean Wiki 브랜드 컬러</h1>
          <p>
            Bean Wiki의 색은 팔레트보다 먼저 장면에서 시작됩니다. 수확
            바구니의 체리, 아직 열을 만나지 않은 생두, 첫 크랙 직후의
            캐러멜 향, 65°C의 벨벳 밀크와 카페 쇼케이스의 페이스트리까지.
            이름을 읽는 것만으로도 한 잔의 온도와 향이 떠오르도록
            골랐습니다.
          </p>
        </header>

        <div className="palette-note">
          <span>HOW THE COLORS FLOW</span>
          <p>
            기본 순서는 색상 코드순이 아니라 커피에서 카페로 이어지는 소재의
            흐름입니다. 같은 그룹에서는 밝고 깨끗한 색에서 채도가 높은 색,
            깊게 구워진 색으로 이동합니다. HEX 문자열은 색의 가까움을
            나타내지 않기 때문에, 내부 검증은 사람의 지각에 가까운 OKLCH
            밝기와 색상군을 사용합니다.
          </p>
        </div>

        {brandPalette.groups.map((group) => (
          <section key={group.id} className="palette-group">
            <h2>{group.title}</h2>
            <p className="palette-desc">{group.description}</p>
            <div className="palette-grid">
              {group.swatches.map((swatch) => (
                <PaletteColorCard key={swatch.id} swatch={swatch} />
              ))}
            </div>
          </section>
        ))}

        <section className="palette-research" aria-labelledby="palette-research-title">
          <span>RESEARCHED MATERIALS</span>
          <h2 id="palette-research-title">실제 소재에서, 과장 없이</h2>
          <p>{brandPalette.disclaimer}</p>
          <details>
            <summary>참고한 전문 자료 {sources.length}개 보기</summary>
            <ul>
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </div>
    </main>
  );
}
