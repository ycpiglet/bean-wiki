import type { Article } from "@/content/types";

const article = {
  slug: "cupping-basics",
  title: "커핑은 왜 표준화할까",
  summary:
    "커피를 같은 조건에서 비교하기 위한 커핑의 목적과 기본적인 평가 원칙을 알아봅니다.",
  category: "센서리",
  level: "입문",
  readingTime: "9분",
  updatedAt: "2026. 07. 20.",
  accent: "berry",
  fact: "커핑의 핵심은 특정 추출법을 잘 구현하는 것이 아니라 샘플 간 조건을 최대한 같게 만드는 것입니다.",
  sections: [
    {
      id: "purpose",
      title: "비교할 수 있는 공통 조건을 만듭니다",
      paragraphs: [
        "커핑은 생산, 구매, 로스팅과 품질 관리 과정에서 커피를 비교하기 위한 관능평가 방식입니다. 용기, 비율, 분쇄, 물, 시간과 온도를 통제하면 샘플 자체의 차이에 집중할 수 있습니다.",
      ],
    },
    {
      id: "observe",
      title: "뜨거울 때부터 식을 때까지 관찰합니다",
      paragraphs: [
        "온도가 내려가면 향의 휘발 정도와 맛의 지각이 달라집니다. 한 시점의 강한 인상보다 여러 온도 구간에서 향미, 후미, 산미, 단맛, 질감과 균형이 어떻게 변하는지 살핍니다.",
      ],
      points: [
        "향의 종류보다 먼저 강도와 선명도를 확인합니다.",
        "좋고 싫다는 판단과 관찰한 특성을 구분해 기록합니다.",
        "반복 컵을 통해 샘플 내부의 균일성과 결점을 확인합니다.",
      ],
    },
    {
      id: "calibration",
      title: "점수보다 캘리브레이션이 먼저입니다",
      paragraphs: [
        "관능평가는 사람의 감각을 사용하는 측정입니다. 평가자들이 용어와 강도의 기준을 맞추고, 서로 다른 판단의 근거를 대화하는 캘리브레이션이 중요합니다.",
        "초심자는 구체적인 향미 이름을 맞히려 하기보다 산미의 강도, 단맛의 지속성, 질감의 무게처럼 비교하기 쉬운 축부터 연습하는 것이 좋습니다.",
      ],
    },
  ],
  related: ["coffee-processing", "roast-development", "water-for-coffee"],
  tags: ["커핑", "관능평가", "센서리"],
  history: [{ date: "2026. 07. 20.", note: "커핑 표준화 원칙 초안 작성" }],
} satisfies Article;

export default article;
