import type { Article } from "@/content/types";

const article = {
  slug: "extraction-basics",
  title: "추출의 기본: 농도와 수율",
  summary:
    "진한 커피와 많이 추출된 커피의 차이를 이해하고, 레시피를 체계적으로 조정하는 기준을 배웁니다.",
  category: "추출",
  level: "입문",
  readingTime: "8분",
  updatedAt: "2026. 07. 20.",
  accent: "blue",
  fact: "농도는 잔 안의 진하기를, 추출 수율은 원두에서 얼마나 많은 성분을 꺼냈는지를 나타냅니다.",
  sections: [
    {
      id: "two-measures",
      title: "농도와 수율은 서로 다른 값입니다",
      paragraphs: [
        "농도는 완성된 음료 중 커피에서 녹아 나온 고형분이 차지하는 비율입니다. 같은 원두를 사용해도 물을 적게 쓰면 더 진한 커피가 될 수 있습니다.",
        "추출 수율은 투입한 원두 질량 중 물에 녹아 음료로 이동한 성분의 비율입니다. 진하기만으로는 원두가 충분히 추출되었는지 판단할 수 없기 때문에 두 값을 함께 봅니다.",
      ],
    },
    {
      id: "variables",
      title: "추출을 움직이는 주요 변수",
      paragraphs: [
        "분쇄도가 가늘수록 물과 닿는 표면적이 늘어나고 흐름의 저항도 커집니다. 일반적으로 추출이 빨라지지만, 채널링이나 미분 이동처럼 균일성을 해치는 변수도 함께 커질 수 있습니다.",
      ],
      points: [
        "분쇄도와 입자 분포",
        "커피와 물의 비율",
        "물의 온도와 미네랄 조성",
        "접촉 시간과 교반",
        "커피층을 통과하는 물의 균일성",
      ],
    },
    {
      id: "dial-in",
      title: "한 번에 하나씩 바꿉니다",
      paragraphs: [
        "레시피를 조정할 때는 먼저 목표 음료량과 비율을 정하고 분쇄도로 시간을 맞추는 방식이 재현하기 쉽습니다. 맛을 기록하고 한 번에 한 변수만 바꾸면 원인과 결과를 비교할 수 있습니다.",
        "신맛, 쓴맛 같은 단어 하나만으로 과소·과다 추출을 단정하지 마세요. 향의 선명도, 단맛, 질감, 후미와 전체 균형을 함께 평가하는 것이 중요합니다.",
      ],
    },
  ],
  related: ["water-for-coffee", "coffee-cherry-to-bean", "cupping-basics"],
  tags: ["추출", "수율", "레시피", "기초"],
  history: [{ date: "2026. 07. 20.", note: "농도·수율 기본 개념 정리 초안 작성" }],
} satisfies Article;

export default article;
