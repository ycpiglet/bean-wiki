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
    title: "원두가 가진 색",
    description:
      "같은 산지라도 로트와 가공에 따라 색은 달라집니다. 생두 테이블 위에서 발견한 한순간을 무드 이름으로 기록했습니다.",
    swatches: [
      {
        brandName: "케냐 커피체리 레드",
        token: "--cherry",
        story:
          "수확 바구니에서 가장 잘 익은 체리만 골라냈을 때 만나는 또렷한 붉은빛입니다. 새콤달콤한 과즙이 금방이라도 터질 듯한 색입니다.",
      },
      {
        brandName: "내추럴 드라이 체리",
        token: "--cherry-deep",
        story:
          "잘 익은 체리가 건조대 위에서 햇빛과 시간을 머금으며 와인빛으로 깊어지는 순간입니다. 과일의 달콤함과 긴 여운을 함께 담았습니다.",
      },
      {
        brandName: "에티오피아 워시드 그린빈",
        token: "--green-bean",
        story:
          "워시드 생두를 손바닥 위에 펼쳤을 때 보이는 푸른 기가 살짝 도는 연한 올리브입니다. 아직 열을 만나지 않은 향의 가능성을 닮았습니다.",
      },
      {
        brandName: "르완다 파치먼트 베이지",
        token: "--parchment",
        story:
          "아프리칸 베드 위에서 천천히 마른 파치먼트의 담백한 베이지입니다. 손끝에 바스락거리는 얇은 껍질과 고요한 오후를 떠올립니다.",
      },
      {
        brandName: "코스타리카 허니 파치먼트",
        token: "--honey",
        story:
          "점액질을 남긴 채 건조되는 생두에 햇빛이 스며들 때의 따뜻한 골드입니다. 이름만으로도 꿀 한 스푼 같은 기분을 더합니다.",
      },
      {
        brandName: "브라질 옐로 버번",
        token: "--yellow-bourbon",
        story:
          "붉은색 대신 노랗게 익는 옐로 버번 체리에서 가져온 골든 옐로입니다. 햇살과 잘 익은 과일을 한 알에 담은 듯 밝게 웃습니다.",
      },
      {
        brandName: "콜롬비아 핑크 버번",
        token: "--pink-bourbon",
        story:
          "분홍과 코랄 사이에서 익어가는 핑크 버번 체리의 사랑스러운 색입니다. 진지한 커핑 테이블에도 가벼운 설렘을 놓아줍니다.",
      },
      {
        brandName: "수마트라 웻헐 제이드",
        token: "--wet-hulled",
        story:
          "수분을 머금은 채 껍질을 벗긴 생두에서 마주치는 짙고 촉촉한 청록빛입니다. 열대의 비와 흙 내음이 은근하게 겹칩니다.",
      },
      {
        brandName: "파나마 게이샤 실버그린",
        token: "--geisha-silver",
        story:
          "정성스럽게 선별한 생두 표면에 은빛과 연두가 얇게 포개진 듯한 색입니다. 화려하게 말하기보다 조용히 향을 예고합니다.",
      },
      {
        brandName: "인도 몬순드 말라바 골드",
        token: "--monsooned-gold",
        story:
          "몬순의 습한 바람을 지나며 생두가 옅은 짚빛으로 변하는 장면에서 가져왔습니다. 오래된 창고에 들어온 부드러운 햇살 같습니다.",
      },
      {
        brandName: "피베리 올리브",
        token: "--peaberry-olive",
        story:
          "납작한 두 알 대신 동그랗게 여문 피베리를 굴려볼 때 보이는 단단한 올리브빛입니다. 작고 동그란 생김새만큼 이름도 경쾌합니다.",
      },
      {
        brandName: "디카페인 그린빈 토프",
        token: "--decaf-green",
        story:
          "카페인을 덜어내는 공정을 지난 생두의 차분한 녹갈색을 닮았습니다. 늦은 밤에도 부담 없이 고르는 한 잔처럼 부드럽습니다.",
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
            바구니의 체리, 아직 열을 만나지 않은 생두, 첫 크랙 직후의
            캐러멜 향과 65°C의 벨벳 밀크. 이름을 읽는 것만으로도 한 잔의
            온도와 향이 떠오르도록 골랐습니다.
          </p>
        </header>

        <div className="palette-note">
          <span>HOW TO FEEL THE PALETTE</span>
          <p>
            완벽하게 맞춰 쓰기보다 오늘의 기분에 가까운 장면을 골라보세요.
            어떤 날은 에티오피아 워시드 그린빈, 어떤 밤은 바닐라빈 블랙이면
            충분합니다.
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
