import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { PaletteColorCard } from "@/components/palette-color-card";
import { PrimaryNav } from "@/components/primary-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { brandPalette } from "@/design/brand-colors";

const paletteNameFont = localFont({
  src: "./fonts/LINESeedKR-Bd.woff2",
  variable: "--font-palette-name",
  weight: "700",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["Pretendard", "Apple SD Gothic Neo", "sans-serif"],
  adjustFontFallback: false,
});

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

      <div className={`shell palette-page ${paletteNameFont.variable}`}>
        <header className="wiki-title">
          <h1>Bean Wiki 브랜드 컬러</h1>
          <p>
            Bean Wiki의 색은 팔레트보다 먼저 장면에서 시작됩니다. 익숙한
            산지의 그린빈과 커피 체리, 첫 크랙을 지나는 로스트, 93°C
            브루잉과 65°C의 벨벳 스팀 밀크, 베이커리와 카페 바의 도구까지.
            이름을 읽는 것만으로도 한 잔의 온도와 향이 떠오르도록
            골랐습니다.
          </p>
        </header>

        <div className="palette-note">
          <span>SPECIFIC NAME, CLEAR SCENE</span>
          <p>
            이름은 억지로 글자 수를 맞추지 않습니다. 산지·메뉴·도구 뒤에
            그린빈, 커피 체리, 크레마처럼 눈앞에 그려지는 대상을 붙이고,
            데스크톱에서는 네 장씩 한 줄로 읽히도록 글자 크기와 카드 폭을
            맞췄습니다. 파트별 개수도 소재의 밀도에 따라 다르며, 모든 HEX는
            출처를 바탕으로 만든 브랜드 근사값입니다.
          </p>
        </div>

        {brandPalette.groups.map((group) => (
          <section
            key={group.id}
            className="palette-group"
            data-palette-group={group.id}
            data-palette-count={group.swatches.length}
          >
            <div className="palette-group-heading">
              <h2>{group.title}</h2>
              <span>{group.swatches.length} COLORS</span>
            </div>
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
