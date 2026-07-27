import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";

// Brand color guide — the coffee lifecycle palette, from cherry to cup.
// Values here are the light-theme canon; CSS tokens live in globals.css and
// docs/DESIGN.md is the written SSOT. Update all three together.
export const metadata: Metadata = {
  title: "색상 가이드",
  description:
    "Bean Wiki 브랜드 컬러 — 커피 체리에서 한 잔까지, 커피의 여정에서 가져온 색.",
  robots: { index: false, follow: false },
};

type Swatch = {
  name: string;
  token: string;
  hex: string;
  darkHex?: string;
  note: string;
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
      { name: "커피 체리", token: "--cherry", hex: "#a03d36", darkHex: "#cd7a6e", note: "잘 익은 체리. 강조·중요 톤" },
      { name: "체리 딥", token: "--cherry-deep", hex: "#712a28", darkHex: "#a75950", note: "완숙 체리의 어두운 면" },
      { name: "생두", token: "--green-bean", hex: "#7d8f69", darkHex: "#9db184", note: "가공을 마친 그린빈" },
      { name: "파치먼트", token: "--parchment", hex: "#e3d4b4", darkHex: "#d9c8a6", note: "내과피. 옅은 배경 톤" },
      { name: "허니", token: "--honey", hex: "#c08a3e", darkHex: "#d9a95e", note: "점액질을 남긴 허니 프로세스" },
    ],
  },
  {
    title: "로스팅 단계",
    description:
      "브랜드의 중심축. 로스팅이 진행될수록 갈변이 깊어지는 단계를 따릅니다. 색도계(Agtron) 번호는 대략적 대응이며 절대 기준이 아닙니다.",
    swatches: [
      { name: "라이트 로스트", token: "--roast-light", hex: "#a26a42", darkHex: "#c08a5c", note: "시나몬 근방 (Agtron ~85)" },
      { name: "미디엄 로스트", token: "--roast-medium", hex: "#7c5233", darkHex: "#c89e6f", note: "시티 근방 (Agtron ~55) · 프라이머리" },
      { name: "다크 로스트", token: "--roast-dark", hex: "#4e3524", darkHex: "#8d6844", note: "프렌치 근방 (Agtron ~35)" },
      { name: "에스프레소", token: "--espresso", hex: "#2b1d13", darkHex: "#3a2a1c", note: "가장 짙은 배경·다크 패널" },
    ],
  },
  {
    title: "한 잔",
    description: "추출된 커피의 표면. 크레마의 금갈색과 우유 거품의 밝은 크림색.",
    swatches: [
      { name: "크레마", token: "--crema", hex: "#c99b5f", darkHex: "#d9b586", note: "다크 패널 위 강조 텍스트" },
      { name: "폼(우유 거품)", token: "--foam", hex: "#f6efe3", darkHex: "#efe6d6", note: "가장 밝은 표면" },
    ],
  },
  {
    title: "지면(중립)",
    description: "종이 질감의 바탕과 잉크. 라이트/다크 테마에서 서로 반전됩니다.",
    swatches: [
      { name: "페이퍼", token: "--paper", hex: "#f4f0e7", darkHex: "#14170f", note: "페이지 배경" },
      { name: "페이퍼 딥", token: "--paper-deep", hex: "#e8e1d4", darkHex: "#1b1f16", note: "눌린 면·카드" },
      { name: "크림", token: "--cream", hex: "#fbf8f1", darkHex: "#1e2318", note: "입력·표면" },
      { name: "잉크", token: "--ink", hex: "#182019", darkHex: "#ece7da", note: "기본 텍스트" },
      { name: "뮤트", token: "--muted", hex: "#62675f", darkHex: "#a0a394", note: "보조 텍스트" },
    ],
  },
  {
    title: "분야 액센트",
    description:
      "6개 분야에 1:1로 묶인 색. 문서 배지·콜아웃·분야 카드가 사용하며, check-content가 문서와 분야의 액센트 일치를 강제합니다.",
    swatches: [
      { name: "올리브 — 커피 기초", token: "--olive", hex: "#6f7d48", darkHex: "#a6b673", note: "콜아웃 tip 톤" },
      { name: "세이지 — 산지와 생두", token: "--sage", hex: "#78907e", darkHex: "#93aa98", note: "" },
      { name: "코퍼 — 로스팅", token: "--copper", hex: "#ad6740", darkHex: "#cf8560", note: "콜아웃 warn 톤" },
      { name: "블루 — 추출", token: "--blue", hex: "#577d8d", darkHex: "#7ba7b8", note: "콜아웃 note 톤" },
      { name: "베리 — 센서리", token: "--berry", hex: "#8b5964", darkHex: "#bd8593", note: "콜아웃 important 톤" },
      { name: "샌드 — 카페와 장비", token: "--sand", hex: "#a2875d", darkHex: "#c3a877", note: "" },
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
        <div className="header-tools">
          <Link href="/" className="back-link">
            ← 홈으로
          </Link>
          <ThemeToggle />
          <AccountMenu locale="ko" />
        </div>
      </header>

      <div className="shell palette-page">
        <header className="wiki-title">
          <h1>색상 가이드</h1>
          <p>
            Bean Wiki의 색은 커피의 여정에서 옵니다 — 익은 체리의 붉은색에서
            생두의 녹색, 로스팅의 갈색을 지나 크레마와 우유 거품까지. 프라이머리
            액센트는 <strong>미디엄 로스트 브라운</strong>(<code>--brand</code>)입니다.
          </p>
        </header>

        <div className="palette-note">
          <p>
            사용 규칙: 컴포넌트는 hex를 직접 쓰지 말고 토큰(
            <code>var(--roast-medium)</code> 등)을 참조하세요. 다크 테마 값은
            <code>[data-theme=&quot;dark&quot;]</code> 토큰 블록에서 한 번만
            바뀝니다. 문서 기준은 <code>docs/DESIGN.md</code>.
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
                    style={{ backgroundColor: swatch.hex }}
                    aria-hidden="true"
                  />
                  <strong>{swatch.name}</strong>
                  <code>{swatch.token}</code>
                  <small>
                    {swatch.hex}
                    {swatch.darkHex ? ` · 다크 ${swatch.darkHex}` : ""}
                  </small>
                  {swatch.note && <p>{swatch.note}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
