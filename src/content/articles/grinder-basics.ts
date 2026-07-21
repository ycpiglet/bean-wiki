import type { Article } from "@/content/types";

const article = {
  slug: "grinder-basics",
  title: "그라인더가 맛을 좌우하는 이유",
  summary:
    "분쇄의 균일성과 입자 분포가 추출과 향미에 어떤 영향을 주는지, 그라인더를 고르고 관리하는 기준을 정리합니다.",
  category: "카페와 장비",
  level: "중급",
  readingTime: "8분",
  updatedAt: "2026. 07. 20.",
  accent: "sand",
  fact: "같은 원두와 레시피라도 분쇄 입자의 분포가 달라지면 추출 결과가 크게 달라집니다.",
  sections: [
    {
      id: "why",
      title: "분쇄는 추출의 출발점입니다",
      paragraphs: [
        "물이 커피 성분을 녹여 내는 속도는 입자의 표면적에 크게 좌우됩니다. 분쇄가 고를수록 각 입자가 비슷한 속도로 추출되어, 과소·과다 추출이 한 잔 안에 섞이는 정도를 줄일 수 있습니다.",
        "반대로 미분과 굵은 입자가 함께 많으면 같은 시간 동안 미분은 과다, 굵은 입자는 과소 추출되어 맛의 초점이 흐려집니다.",
      ],
    },
    {
      id: "burr",
      title: "버(Burr)의 방식과 상태",
      paragraphs: [
        "버 그라인더는 두 개의 날 사이 간격으로 입자 크기를 조절해 블레이드 방식보다 균일한 분쇄를 얻습니다. 코니컬과 플랫 등 형상에 따라 입자 분포의 경향이 달라질 수 있습니다.",
      ],
      points: [
        "코니컬 버: 내구성과 저발열에 유리한 경향",
        "플랫 버: 좁은 입자 분포를 노리기 쉬운 경향",
        "마모된 버는 미분을 늘려 균일성을 떨어뜨립니다.",
      ],
    },
    {
      id: "care",
      title: "설정보다 관리가 먼저입니다",
      paragraphs: [
        "숫자 눈금은 기기마다 절대적인 기준이 아니므로, 목표 추출 시간과 맛을 기준으로 상대적으로 조정하는 편이 재현하기 쉽습니다. 정기적인 청소로 오래된 커피 기름과 미분 잔류를 줄이면 향미의 일관성이 좋아집니다.",
      ],
    },
  ],
  related: ["extraction-basics", "espresso-basics", "roast-development"],
  tags: ["분쇄", "장비", "추출"],
  history: [{ date: "2026. 07. 20.", note: "그라인더 문서 최초 작성" }],
} satisfies Article;

export default article;
