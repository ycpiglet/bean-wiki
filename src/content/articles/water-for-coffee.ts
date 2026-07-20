import type { Article } from "@/content/types";

const article = {
  slug: "water-for-coffee",
  title: "커피를 위한 물의 기초",
  summary:
    "경도와 알칼리도가 추출과 산미 인상에 어떤 역할을 하는지 실전적인 언어로 정리합니다.",
  category: "추출",
  level: "전문",
  readingTime: "7분",
  updatedAt: "2026. 07. 20.",
  accent: "blue",
  fact: "물은 커피 음료의 대부분을 차지하며, 미네랄 조성은 추출과 맛의 인상을 동시에 바꿉니다.",
  sections: [
    {
      id: "hardness",
      title: "경도는 하나의 숫자보다 구성 성분이 중요합니다",
      paragraphs: [
        "커피 맥락에서 경도는 주로 칼슘과 마그네슘 같은 다가 양이온과 관련됩니다. 이온의 종류와 농도는 커피 성분의 추출과 감각적 인상에 서로 다른 영향을 줄 수 있습니다.",
      ],
    },
    {
      id: "alkalinity",
      title: "알칼리도는 산을 완충합니다",
      paragraphs: [
        "알칼리도는 물이 산을 중화하는 능력을 나타냅니다. 알칼리도가 높으면 산미가 둔하게 느껴질 수 있고, 지나치게 낮으면 날카롭고 불안정하게 느껴질 수 있습니다.",
        "경도와 알칼리도는 같은 개념이 아니므로 총용존고형물 수치 하나만 보고 추출용 물을 판단하기 어렵습니다.",
      ],
    },
    {
      id: "practice",
      title: "측정하고, 기록하고, 맛으로 검증합니다",
      paragraphs: [
        "원수와 정수 후 물을 주기적으로 측정하고 필터 교체 시점, 레시피와 관능 결과를 함께 기록하세요. 장비 보호를 위한 수질과 원하는 향미를 위한 수질을 동시에 고려해야 합니다.",
      ],
    },
  ],
  related: ["extraction-basics", "cupping-basics", "coffee-cherry-to-bean"],
  tags: ["추출", "물", "미네랄"],
  history: [{ date: "2026. 07. 20.", note: "물 화학 기초 초안 작성" }],
} satisfies Article;

export default article;
