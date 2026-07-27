import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { PrimaryNav } from "@/components/primary-nav";
import { AccountMenu } from "@/components/account-menu";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

// Brand color guide — the coffee lifecycle palette, from cherry to cup.
// Values here are the light-theme canon; CSS tokens live in globals.css and
// docs/DESIGN.md is the written SSOT. Update all three together.
export const metadata: Metadata = {
  title: "브랜드 컬러",
  description:
    "Bean Wiki 브랜드 컬러 — 커피 체리에서 한 잔까지, 커피의 여정에서 가져온 색.",
};

type Swatch = {
  brandName: string;
  token: string;
  hex: string;
  darkHex?: string;
  role: string;
};

type PaletteGroup = {
  title: string;
  description: string;
  swatches: Swatch[];
};

const groups: PaletteGroup[] = [
  {
    title: "열매와 생두",
    description:
      "수확에서 가공까지. 익은 체리의 붉은색과 생두의 청록빛 녹색, 파치먼트와 허니 프로세스의 노란 계열.",
    swatches: [
      { brandName: "과테말라 루비 체리", token: "--cherry", hex: "#a03d36", darkHex: "#cd7a6e", role: "중요 상태와 오답을 또렷하게 구분하는 붉은 강조 톤" },
      { brandName: "안티구아 나이트 체리", token: "--cherry-deep", hex: "#712a28", darkHex: "#a75950", role: "체리 계열에 깊이와 대비를 더하는 어두운 보조 톤" },
      { brandName: "에티오피아 예가체프 그린빈", token: "--green-bean", hex: "#7d8f69", darkHex: "#9db184", role: "생두 단계와 긍정적인 진행 상태를 나타내는 톤" },
      { brandName: "코스타리카 타라주 파치먼트", token: "--parchment", hex: "#e3d4b4", darkHex: "#d9c8a6", role: "라이프사이클 정보를 받치는 옅은 배경 톤" },
      { brandName: "코스타리카 골든 허니", token: "--honey", hex: "#c08a3e", darkHex: "#d9a95e", role: "허니 프로세스와 성취 정보를 강조하는 금빛 보조 톤" },
    ],
  },
  {
    title: "로스팅 단계",
    description:
      "브랜드의 중심축. 로스팅이 진행될수록 갈변이 깊어지는 단계를 따릅니다. 색도계(Agtron) 번호는 대략적 대응이며 절대 기준이 아닙니다.",
    swatches: [
      { brandName: "퍼스트 크랙 시나몬", token: "--roast-light", hex: "#a26a42", darkHex: "#c08a5c", role: "로스팅 그라데이션의 밝은 지점 (Agtron ~85)" },
      { brandName: "빈위키 시티 로스트", token: "--roast-medium", hex: "#7c5233", darkHex: "#c89e6f", role: "링크·버튼·포커스에 쓰는 프라이머리 브랜드 톤 (Agtron ~55)" },
      { brandName: "애프터 크랙 프렌치", token: "--roast-dark", hex: "#4e3524", darkHex: "#8d6844", role: "호버와 다크 패널 그라데이션의 강한 톤 (Agtron ~35)" },
      { brandName: "미드나이트 에스프레소", token: "--espresso", hex: "#2b1d13", darkHex: "#3a2a1c", role: "원두 마크와 상시 다크 패널에 쓰는 가장 짙은 톤" },
    ],
  },
  {
    title: "한 잔",
    description: "추출된 커피의 표면. 크레마의 금갈색과 우유 거품의 밝은 크림색.",
    swatches: [
      { brandName: "나폴리 골든 크레마", token: "--crema", hex: "#c99b5f", darkHex: "#d9b586", role: "다크 패널 위 강조 텍스트와 원두 크리즈 톤" },
      { brandName: "플랫화이트 밀크 폼", token: "--foam", hex: "#f6efe3", darkHex: "#efe6d6", role: "역상 텍스트와 가장 밝은 표면에 쓰는 톤" },
    ],
  },
  {
    title: "지면(중립)",
    description: "종이 질감의 바탕과 잉크. 라이트/다크 테마에서 서로 반전됩니다.",
    swatches: [
      { brandName: "브루 노트 페이퍼", token: "--paper", hex: "#f4f0e7", darkHex: "#14170f", role: "페이지 전체를 이루는 기본 배경" },
      { brandName: "웻 필터 베이지", token: "--paper-deep", hex: "#e8e1d4", darkHex: "#1b1f16", role: "카드처럼 한 단계 눌린 중첩 표면" },
      { brandName: "오트 크림", token: "--cream", hex: "#fbf8f1", darkHex: "#1e2318", role: "입력창과 에디터를 포함한 밝은 표면" },
      { brandName: "바리스타 로그 잉크", token: "--ink", hex: "#182019", darkHex: "#ece7da", role: "제목과 기본 텍스트에 쓰는 가장 강한 전경색" },
      { brandName: "모카 포트 그레이", token: "--muted", hex: "#62675f", darkHex: "#a0a394", role: "보조 설명과 라벨의 위계를 낮추는 전경색" },
    ],
  },
  {
    title: "분야 액센트 패밀리",
    description:
      "12개 카테고리가 공유하는 6개 액센트 패밀리. 문서 배지·콜아웃·분야 카드가 사용하며, check-content가 문서와 분야의 액센트 일치를 강제합니다.",
    swatches: [
      { brandName: "커피 리프 올리브", token: "--olive", hex: "#6f7d48", darkHex: "#a6b673", role: "커피 기초·커피와 건강 분야, tip 콜아웃" },
      { brandName: "안데스 미스트 세이지", token: "--sage", hex: "#78907e", darkHex: "#93aa98", role: "산지와 생두·지속가능성과 거래 분야" },
      { brandName: "로스터 드럼 코퍼", token: "--copper", hex: "#ad6740", darkHex: "#cf8560", role: "로스팅·커피 역사와 문화 분야, warn 콜아웃" },
      { brandName: "워시드 스테이션 블루", token: "--blue", hex: "#577d8d", darkHex: "#7ba7b8", role: "추출·커피 과학 분야, note 콜아웃" },
      { brandName: "커핑 테이블 베리", token: "--berry", hex: "#8b5964", darkHex: "#bd8593", role: "센서리·음료와 레시피 분야, important 콜아웃" },
      { brandName: "카페 카운터 샌드", token: "--sand", hex: "#a2875d", darkHex: "#c3a877", role: "카페와 장비·카페 운영과 품질 분야" },
    ],
  },
];

export default function ColorGuide() {
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
            Bean Wiki의 색은 커피의 여정에서 옵니다 — 익은 체리의 붉은색에서
            생두의 녹색, 로스팅의 갈색을 지나 크레마와 우유 거품까지. 프라이머리
            액센트는 <strong>빈위키 시티 로스트</strong>(<code>--brand</code>)입니다.
          </p>
        </header>

        <div className="palette-note">
          <p>
            브랜드명에 포함된 지역명은 커피의 여정을 떠올리게 하는 무드명이며,
            해당 지역의 공식 색상 표준이나 원산지 인증을 뜻하지 않습니다. 개발
            시에는 브랜드명을 코드에 쓰지 말고 기능 토큰(
            <code>var(--roast-medium)</code> 등)을 참조하세요. 다크 테마 값은
            <code>[data-theme=&quot;dark&quot;]</code> 토큰 블록에서 한 번만
            바뀌며, 문서 기준은 <code>docs/DESIGN.md</code>입니다.
          </p>
        </div>

        {groups.map((group) => (
          <section key={group.title} className="palette-group">
            <h2>{group.title}</h2>
            <p className="palette-desc">{group.description}</p>
            <div className="palette-grid">
              {group.swatches.map((swatch) => (
                <div key={swatch.token} className="palette-card">
                  <span
                    className="palette-chip"
                    style={{ backgroundColor: `var(${swatch.token})` }}
                    aria-hidden="true"
                  />
                  <strong>{swatch.brandName}</strong>
                  <p>{swatch.role}</p>
                  <code>{swatch.token}</code>
                  <small>
                    {swatch.hex}
                    {swatch.darkHex ? ` · 다크 ${swatch.darkHex}` : ""}
                  </small>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
