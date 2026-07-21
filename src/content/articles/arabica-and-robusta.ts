import type { Article } from "@/content/types";

const article = {
  slug: "arabica-and-robusta",
  title: "아라비카와 로부스타",
  summary:
    "가장 널리 재배되는 두 종의 차이를 재배 환경과 향미, 성분의 관점에서 편견 없이 비교합니다.",
  category: "산지와 생두",
  level: "입문",
  readingTime: "6분",
  updatedAt: "2026. 07. 20.",
  accent: "sage",
  fact: "아라비카와 로부스타(카네포라)는 서로 다른 종으로, 재배 조건과 향미 경향이 다릅니다.",
  sections: [
    {
      id: "species",
      title: "서로 다른 두 종",
      paragraphs: [
        "상업적으로 가장 많이 재배되는 커피는 아라비카와 카네포라(흔히 로부스타로 부름)입니다. 두 종은 유전적으로 다르며, 자라는 환경과 병해에 대한 강인함, 성분 구성에서 차이를 보입니다.",
      ],
    },
    {
      id: "growing",
      title: "재배 환경의 차이",
      paragraphs: [
        "아라비카는 대체로 서늘한 고지대에서 잘 자라지만 병해에 상대적으로 민감합니다. 로부스타는 더 낮은 고도와 더운 기후에서도 잘 견디고 수확량이 많은 편입니다.",
      ],
      points: [
        "아라비카: 고지대 선호, 섬세한 향미 경향",
        "로부스타: 저지대·고온에 강함, 카페인 함량이 높은 경향",
        "재배 고도만으로 품질을 단정할 수는 없습니다.",
      ],
    },
    {
      id: "flavor",
      title: "향미는 종만으로 결정되지 않습니다",
      paragraphs: [
        "종의 특성은 향미의 큰 방향을 만들지만, 최종 컵은 품종, 재배 관리, 가공과 로스팅, 추출까지의 모든 단계가 함께 결정합니다. 종의 이름만으로 좋고 나쁨을 나누기보다 전체 과정을 함께 봐야 합니다.",
      ],
    },
  ],
  related: ["coffee-processing", "coffee-cherry-to-bean", "cupping-basics"],
  tags: ["품종", "생두", "기초"],
  history: [{ date: "2026. 07. 20.", note: "품종 비교 문서 최초 작성" }],
} satisfies Article;

export default article;
