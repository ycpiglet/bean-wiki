import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { PrimaryNav } from "@/components/primary-nav";
import { AccountMenu } from "@/components/account-menu";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

// Public-facing palette stories. Functional roles and color values remain in
// globals.css and docs/DESIGN.md; this page intentionally speaks in scenes,
// aromas, textures, and temperatures instead of implementation language.
export const metadata: Metadata = {
  title: "브랜드 컬러",
  description:
    "Bean Wiki 브랜드 컬러 — 커피 체리에서 한 잔까지, 커피의 여정에서 가져온 색.",
};

type Swatch = {
  brandName: string;
  token: string;
  story: string;
};

type PaletteGroup = {
  title: string;
  description: string;
  swatches: Swatch[];
};

const groups: PaletteGroup[] = [
  {
    title: "체리가 익는 아침",
    description:
      "농장에서 건조대까지, 커피가 아직 한 잔이 되기 전의 생생한 색입니다.",
    swatches: [
      {
        brandName: "피커스 바스켓 체리",
        token: "--cherry",
        story:
          "첫 수확이 시작되는 이른 아침, 바구니 가장 위에서 햇빛을 받는 잘 익은 체리의 붉은빛입니다. 한 모금 전의 설렘을 닮았습니다.",
      },
      {
        brandName: "체리 잼 레드",
        token: "--cherry-deep",
        story:
          "잘 익은 커피 체리를 천천히 졸였을 때 남을 것 같은 깊은 붉은색입니다. 달콤하지만 가볍지만은 않은 장면을 만듭니다.",
      },
      {
        brandName: "프레시 그린빈",
        token: "--green-bean",
        story:
          "황마 자루를 열었을 때 마주치는 생두의 부드러운 초록빛입니다. 아직 로스팅되지 않은 가능성과 갓 시작한 하루를 담았습니다.",
      },
      {
        brandName: "선베드 파치먼트",
        token: "--parchment",
        story:
          "햇볕 좋은 건조대 위에서 바삭하게 마르는 파치먼트의 담백한 베이지입니다. 한낮의 온도와 느긋한 시간을 떠올립니다.",
      },
      {
        brandName: "허니 프로세스 골드",
        token: "--honey",
        story:
          "점액질이 남은 체리가 햇빛 아래 천천히 마를 때 번지는 황금빛입니다. 이름처럼 달콤한 기분을 한 스푼 더합니다.",
      },
    ],
  },
  {
    title: "로스터가 듣는 색",
    description:
      "크랙 소리와 설탕의 갈변, 초콜릿 향이 차례로 깊어지는 로스팅룸의 팔레트입니다.",
    swatches: [
      {
        brandName: "퍼스트 크랙 캐러멜",
        token: "--roast-light",
        story:
          "첫 번째 크랙이 톡 터지고, 로스팅룸에 캐러멜과 구운 설탕의 향이 번지는 순간의 색입니다. 밝고 경쾌한 갈색입니다.",
      },
      {
        brandName: "브라운 슈거 로스트",
        token: "--roast-medium",
        story:
          "갈색 설탕이 가장 맛있게 녹아드는 순간처럼 편안하고 균형 잡힌 브라운입니다. 매일 마셔도 질리지 않는 한 잔의 중심을 닮았습니다.",
      },
      {
        brandName: "다크 초콜릿 크랙",
        token: "--roast-dark",
        story:
          "열이 한 단계 깊어지며 다크 초콜릿과 토스트 향이 겹치는 순간의 브라운입니다. 작지만 선명한 긴장감을 더합니다.",
      },
      {
        brandName: "바닐라빈 블랙",
        token: "--espresso",
        story:
          "바닐라빈을 길게 갈랐을 때 보이는, 검정보다 조금 따뜻한 짙은 갈색입니다. 깊고 우아하지만 너무 무겁지 않습니다.",
      },
    ],
  },
  {
    title: "잔 위의 온도",
    description:
      "에스프레소 크레마와 벨벳 밀크처럼, 손끝과 입술에 가장 가까운 두 가지 색입니다.",
    swatches: [
      {
        brandName: "에스프레소 크레마 골드",
        token: "--crema",
        story:
          "갓 내린 에스프레소 위, 호랑이 무늬 사이로 반짝이는 크레마의 금빛입니다. 짧은 한 잔에도 풍성한 첫인상을 남깁니다.",
      },
      {
        brandName: "65° 벨벳 밀크",
        token: "--foam",
        story:
          "65°C에 맞춰 스티밍한 우유가 벨벳처럼 흐를 때의 따뜻한 크림색입니다. 라떼 위 작은 하트를 기다리는 기분을 담았습니다.",
      },
    ],
  },
  {
    title: "카페를 채우는 빛",
    description:
      "설탕, 비스킷, 크림과 피처처럼 조용히 공간을 채우며 다른 색을 편안하게 받아주는 톤입니다.",
    swatches: [
      {
        brandName: "슈가 화이트",
        token: "--paper",
        story:
          "각설탕을 막 꺼냈을 때 보이는, 완전한 흰색보다 한 톤 따뜻한 화이트입니다. 햇살 좋은 창가 자리처럼 편안합니다.",
      },
      {
        brandName: "오트 비스킷 베이지",
        token: "--paper-deep",
        story:
          "오븐에서 막 나온 오트 비스킷의 가장자리처럼 고소하고 차분한 베이지입니다. 조용한 오후의 테이블을 닮았습니다.",
      },
      {
        brandName: "바닐라 크림",
        token: "--cream",
        story:
          "차가운 크림 위에 바닐라 한 방울을 떨어뜨린 듯 부드러운 색입니다. 무엇을 올려도 한결 포근하게 받아줍니다.",
      },
      {
        brandName: "에스프레소 마키아토 블랙",
        token: "--ink",
        story:
          "진한 에스프레소 위에 하얀 점 하나를 올리기 직전의 깊은 색입니다. 작고 또렷한 문장처럼 공간의 중심을 잡아줍니다.",
      },
      {
        brandName: "스테인리스 피처 그레이",
        token: "--muted",
        story:
          "오픈 직전 깨끗이 닦아둔 스팀 피처에 아침빛이 얹힌 색입니다. 반짝임은 덜고 프로다운 여유만 남겼습니다.",
      },
    ],
  },
  {
    title: "바 안의 작은 장면",
    description:
      "앞치마, 워시드 탱크, 로스터 드럼과 오트 라떼까지. 카페의 하루에서 슬쩍 데려온 포인트 컬러입니다.",
    swatches: [
      {
        brandName: "로스터스 에이프런 그린",
        token: "--olive",
        story:
          "오래 입은 로스터의 앞치마에 커피 잎과 생두 먼지가 자연스럽게 스민 듯한 그린입니다. 일 잘하는 사람의 편안함이 있습니다.",
      },
      {
        brandName: "레인포레스트 미스트",
        token: "--sage",
        story:
          "비가 그친 산지의 커피밭 위, 젖은 잎 사이로 옅은 안개가 머무는 순간의 색입니다. 숨을 한 번 고르게 합니다.",
      },
      {
        brandName: "웜 드럼 코퍼",
        token: "--copper",
        story:
          "로스터 드럼이 예열되고 구릿빛 표면에 온기가 번지는 순간을 닮았습니다. 공간에 활기와 손맛을 더합니다.",
      },
      {
        brandName: "워시드 탱크 블루",
        token: "--blue",
        story:
          "세척 가공 탱크에 맑은 물을 채운 이른 아침의 푸른빛입니다. 깨끗한 산미처럼 시원하고 또렷합니다.",
      },
      {
        brandName: "커핑 베리",
        token: "--berry",
        story:
          "커핑 스푼 끝에서 뜻밖의 베리 한 방울을 발견했을 때의 색입니다. 진지한 테이블에 작은 농담을 건넵니다.",
      },
      {
        brandName: "오트 라떼 샌드",
        token: "--sand",
        story:
          "오트 라떼의 고소한 베이지와 밝은 원목 카운터가 만나는 색입니다. 오래 머물고 싶은 카페의 온도를 닮았습니다.",
      },
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
            Bean Wiki의 색은 팔레트보다 먼저 장면에서 시작됩니다. 수확
            바구니의 체리, 첫 크랙 직후의 캐러멜 향, 65°C의 벨벳 밀크.
            이름을 읽는 것만으로도 한 잔의 온도와 향이 떠오르도록 골랐습니다.
          </p>
        </header>

        <div className="palette-note">
          <span>HOW TO FEEL THE PALETTE</span>
          <p>
            완벽하게 맞춰 쓰기보다 오늘의 기분에 가까운 장면을 골라보세요.
            어떤 날은 프레시 그린빈, 어떤 밤은 바닐라빈 블랙이면 충분합니다.
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
                  <p>{swatch.story}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
