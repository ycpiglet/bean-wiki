import type { Accent } from "@/content/types";

// "알고 계셨나요?" — 문서 본문에 담기엔 곁가지지만 기억에 남는 이야기들.
// 각 항목은 관련 문서(related)로 이어져 읽기 흐름을 만듭니다. 서술 기준은
// docs/EDITORIAL.md와 같습니다: 단정 대신 경향, 논쟁적 기원설은 "전해집니다".
export type TriviaItem = {
  id: string;
  label: string;
  title: string;
  body: string;
  accent: Accent;
  related?: string;
  relatedLabel?: string;
};

export const trivia: TriviaItem[] = [
  {
    id: "goat-legend",
    label: "역사",
    title: "춤추는 염소가 커피를 발견했다는 이야기",
    body: "에티오피아의 목동 칼디가 열매를 먹고 활발해진 염소를 보고 커피를 알게 되었다는 이야기가 널리 전해집니다. 다만 이 설화는 후대에 기록된 것으로, 역사적 사실보다 기원 신화로 보는 편이 정확합니다.",
    accent: "sage",
    related: "coffee-cherry-to-bean",
    relatedLabel: "체리에서 원두까지",
  },
  {
    id: "cupping-origin",
    label: "사례",
    title: "커핑은 품질 관리에서 태어났습니다",
    body: "잔을 나란히 두고 후루룩 소리를 내며 맛보는 방식은 미학이 아니라 거래를 위한 검사에서 자리 잡았습니다. 같은 조건에서 여러 잔을 비교해야 생두의 값을 매길 수 있었기 때문입니다.",
    accent: "berry",
    related: "sca-cupping-protocol",
    relatedLabel: "SCA 커핑 프로토콜",
  },
  {
    id: "coffee-is-fruit",
    label: "기초",
    title: "우리가 마시는 것은 과일의 씨앗입니다",
    body: "커피나무의 열매를 커피 체리라고 부르고, 그 안의 씨앗이 생두입니다. 과육을 벗기고 말린 씨앗을 볶아 갈아 물로 우려낸 것이 커피라는 점을 떠올리면, 가공 방식이 맛에 왜 그렇게 큰 영향을 주는지 이해하기 쉬워집니다.",
    accent: "olive",
    related: "coffee-processing",
    relatedLabel: "가공 방식",
  },
  {
    id: "flavor-wheel-lexicon",
    label: "센서리",
    title: "향미 휠에는 사전이 딸려 있습니다",
    body: "2016년 개정 향미 휠은 WCR 센서리 렉시콘을 바탕으로 만들어졌습니다. 렉시콘은 각 향미 용어에 기준 물질까지 연결해 두었기 때문에, 휠의 단어는 감상이 아니라 훈련 가능한 기준에 가깝습니다.",
    accent: "berry",
    related: "coffee-flavor-wheel",
    relatedLabel: "커피 향미 휠",
  },
  {
    id: "espresso-not-bean",
    label: "장비",
    title: "에스프레소는 원두 종류가 아닙니다",
    body: "에스프레소는 곱게 간 커피에 압력을 걸어 짧은 시간에 추출하는 방식의 이름입니다. 특정 품종이나 로스팅 정도를 뜻하지 않기 때문에, 어떤 원두로도 에스프레소를 뽑을 수 있습니다.",
    accent: "sand",
    related: "espresso-basics",
    relatedLabel: "에스프레소 기초",
  },
  {
    id: "first-crack-sound",
    label: "로스팅",
    title: "로스터는 소리로 시간을 읽습니다",
    body: "로스팅 중 원두가 팽창하며 터지는 소리를 1차 크랙이라 부르고, 많은 로스터가 이 신호를 기준점으로 삼습니다. 온도계 숫자는 기계마다 다르게 읽히지만, 소리는 콩 자체가 내는 신호이기 때문입니다.",
    accent: "copper",
    related: "roasting-basics",
    relatedLabel: "로스팅 입문",
  },
  {
    id: "water-is-most",
    label: "추출",
    title: "한 잔의 98% 이상은 물입니다",
    body: "필터 커피의 농도(TDS)는 흔히 1.15~1.45% 범위로 이야기됩니다. 나머지는 물이므로, 물의 미네랄 조성이 맛에 큰 영향을 준다는 점이 자연스럽게 따라옵니다.",
    accent: "blue",
    related: "water-for-coffee",
    relatedLabel: "커피와 물",
  },
  {
    id: "decaf-not-zero",
    label: "기초",
    title: "디카페인에도 카페인이 조금 남습니다",
    body: "디카페인은 카페인을 완전히 제거한 것이 아니라 대부분 제거한 커피입니다. 규정상 허용되는 잔류량이 있으며, 그래서 '카페인 없음'이 아니라 '카페인 제거'로 표기하는 것이 정확합니다.",
    accent: "olive",
    related: "bean-structure-compounds",
    relatedLabel: "원두 속 성분",
  },
];
