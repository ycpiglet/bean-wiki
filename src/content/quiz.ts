import type { Accent } from "@/content/types";

// 커피 지식 퀴즈. 각 문항은 위키 문서에서 근거를 확인할 수 있어야 하며
// (source = slug), 해설은 정답 이유와 흔한 오해를 함께 짚습니다.
// 문체·근거 기준은 docs/EDITORIAL.md를 따릅니다.
export type QuizQuestion = {
  id: string;
  level: "입문" | "중급" | "전문";
  category: string;
  accent: Accent;
  question: string;
  choices: string[];
  answer: number; // index into choices
  explanation: string;
  source: string; // article slug
  sourceLabel: string;
};

export const quiz: QuizQuestion[] = [
  {
    id: "q-tds-yield",
    level: "입문",
    category: "추출",
    accent: "blue",
    question: "농도(TDS)와 추출 수율의 관계로 옳은 것은?",
    choices: [
      "둘은 같은 값을 다르게 부르는 이름이다",
      "농도는 잔의 진하기, 수율은 원두에서 빠져나온 성분의 비율이다",
      "수율이 높으면 항상 농도도 높다",
      "농도가 높으면 항상 과다 추출이다",
    ],
    answer: 1,
    explanation:
      "농도는 음료에 녹아 있는 고형분의 비율이고, 수율은 투입한 원두 중 얼마가 음료로 이동했는지를 나타냅니다. 물을 적게 쓰면 수율이 낮아도 진할 수 있어 두 값을 함께 봐야 합니다.",
    source: "extraction-basics",
    sourceLabel: "추출의 기본",
  },
  {
    id: "q-acidity",
    level: "입문",
    category: "센서리",
    accent: "berry",
    question: "커피 평가에서 '산미(acidity)'는 보통 어떤 의미로 쓰입니까?",
    choices: [
      "불쾌하게 시큼한 맛",
      "밝고 생동감을 주는 긍정적인 신맛의 인상",
      "pH가 낮다는 화학적 사실만을 가리킨다",
      "로스팅이 덜 되었다는 신호",
    ],
    answer: 1,
    explanation:
      "산미는 평가 용어로, 과일의 즙 같은 밝은 인상을 가리킵니다. 날카롭고 불쾌한 신맛(sourness)과는 구분해서 씁니다.",
    source: "sensory-attributes",
    sourceLabel: "커피 평가의 언어",
  },
  {
    id: "q-body",
    level: "입문",
    category: "센서리",
    accent: "berry",
    question: "'바디'가 가리키는 것은?",
    choices: [
      "커피의 카페인 함량",
      "입안에서 느끼는 무게감과 질감",
      "향의 강도",
      "로스팅 정도",
    ],
    answer: 1,
    explanation:
      "바디는 맛이 아니라 촉감입니다. 오일과 미분이 많이 통과하는 추출 방식에서 무거워지는 경향이 있습니다.",
    source: "sensory-attributes",
    sourceLabel: "커피 평가의 언어",
  },
  {
    id: "q-cupping-ratio",
    level: "중급",
    category: "센서리",
    accent: "berry",
    question: "널리 통용되어 온 SCA 커핑의 기준 비율에 가장 가까운 것은?",
    choices: [
      "물 150ml당 커피 약 8.25g",
      "물 150ml당 커피 약 20g",
      "물 100ml당 커피 약 15g",
      "정해진 비율이 없다",
    ],
    answer: 0,
    explanation:
      "약 1:18.2에 해당하는 비율로, 용기 용량에 비례해 조정합니다. 다만 세부 수치는 해당 시점의 SCA 공식 문서를 확인해야 합니다.",
    source: "sca-cupping-protocol",
    sourceLabel: "SCA 커핑 프로토콜",
  },
  {
    id: "q-cva",
    level: "중급",
    category: "센서리",
    accent: "berry",
    question: "CVA(Coffee Value Assessment)의 가장 큰 변화는?",
    choices: [
      "점수를 200점 만점으로 바꿨다",
      "기술적(무엇이 느껴지는가) 평가와 선호(얼마나 좋은가) 평가를 분리했다",
      "커핑을 없애고 기계 분석으로 대체했다",
      "산미 항목을 삭제했다",
    ],
    answer: 1,
    explanation:
      "두 질문은 평가자와 목적이 다르기 때문에 분리하는 것이 핵심입니다. 점수 산식도 전통 폼과 달라 두 체계의 점수는 직접 비교할 수 없습니다.",
    source: "sca-cupping-protocol",
    sourceLabel: "SCA 커핑 프로토콜",
  },
  {
    id: "q-triangle",
    level: "전문",
    category: "센서리",
    accent: "berry",
    question: "삼각 테스트(트라이앵귤레이션)에서 아무렇게나 골라도 맞을 확률은?",
    choices: ["1/2", "1/3", "1/6", "0에 가깝다"],
    answer: 1,
    explanation:
      "세 잔 중 하나를 고르므로 우연 확률은 1/3입니다. 그래서 한두 번의 성공은 증거가 되지 못하고, 반복 시행에서 기준표(ISO 4120 등)의 임계값을 넘는지로 판단합니다.",
    source: "sensory-data-analysis",
    sourceLabel: "관능 데이터",
  },
  {
    id: "q-calibration",
    level: "전문",
    category: "센서리",
    accent: "berry",
    question: "Q 그레이더 자격이 주기적 재교정을 요구하는 이유로 가장 적절한 것은?",
    choices: [
      "자격증 발급 수수료를 받기 위해",
      "감각과 채점 습관이 시간이 지나며 표류하기 때문",
      "커피 품종이 매년 바뀌기 때문",
      "장비 사양이 매년 바뀌기 때문",
    ],
    answer: 1,
    explanation:
      "자격의 핵심은 뛰어난 미각이 아니라 교정된 미각입니다. 기준에 다시 맞추는 절차가 평가의 신뢰를 지탱합니다.",
    source: "q-grader-certification",
    sourceLabel: "Q 그레이더",
  },
  {
    id: "q-flavor-wheel",
    level: "입문",
    category: "센서리",
    accent: "berry",
    question: "향미 휠을 사용하는 올바른 방향은?",
    choices: [
      "바깥쪽 구체 표현부터 골라 안쪽으로 좁힌다",
      "안쪽 큰 범주에서 시작해 확신이 생기는 만큼 바깥쪽으로 간다",
      "휠에 적힌 향미가 모두 느껴져야 한다",
      "점수를 매기는 도구로 쓴다",
    ],
    answer: 1,
    explanation:
      "휠은 정답지가 아니라 어휘 지도입니다. 애매하면 안쪽 범주에서 멈추는 것이 과장된 표현보다 낫습니다.",
    source: "coffee-flavor-wheel",
    sourceLabel: "커피 향미 휠",
  },
  {
    id: "q-dtr",
    level: "전문",
    category: "로스팅",
    accent: "copper",
    question: "DTR(발달 시간 비율)에 대한 설명으로 옳은 것은?",
    choices: [
      "값이 높을수록 항상 품질이 좋다",
      "전체 로스팅 시간 중 1차 크랙 이후가 차지하는 비율이며 스타일에 따른 참고 지표다",
      "생두의 수분 함량을 뜻한다",
      "에스프레소 추출 시간의 비율이다",
    ],
    answer: 1,
    explanation:
      "필터 로스팅에서 15~25% 부근을 참고하는 경우가 흔하지만 품질 보증은 아닙니다. 배출 색도·감량률과 함께 묶어 봐야 합니다.",
    source: "roast-profile-design",
    sourceLabel: "로스트 프로파일 설계",
  },
  {
    id: "q-first-crack",
    level: "입문",
    category: "로스팅",
    accent: "copper",
    question: "로스팅에서 '1차 크랙'은 무엇입니까?",
    choices: [
      "생두에 금이 가는 결점",
      "내부 압력으로 원두가 팽창·파열하며 나는 소리",
      "로스터 기계의 경고음",
      "포장 시 발생하는 가스 배출",
    ],
    answer: 1,
    explanation:
      "발현(발달) 단계의 시작을 알리는 신호로 널리 쓰입니다. 온도계 값보다 기계 간 비교가 쉬운 편입니다.",
    source: "roasting-basics",
    sourceLabel: "로스팅 입문",
  },
  {
    id: "q-processing",
    level: "중급",
    category: "산지와 생두",
    accent: "sage",
    question: "워시드 가공의 특징으로 가장 적절한 것은?",
    choices: [
      "체리를 통째로 건조한다",
      "과육을 제거한 뒤 발효·세척을 거쳐 건조한다",
      "점액질을 전부 남긴 채 건조한다",
      "생두를 물에 삶는다",
    ],
    answer: 1,
    explanation:
      "내추럴은 체리째 건조, 허니는 점액질을 일부 남겨 건조합니다. 가공 방식은 향미 경향에 큰 영향을 줍니다.",
    source: "coffee-processing",
    sourceLabel: "가공 방식",
  },
  {
    id: "q-storage",
    level: "입문",
    category: "커피 기초",
    accent: "olive",
    question: "원두 보관에서 가장 큰 향미 손실이 일어나는 시점은?",
    choices: [
      "포장을 개봉하는 순간",
      "분쇄한 직후",
      "물을 붓는 순간",
      "냉장고에 넣는 순간",
    ],
    answer: 1,
    explanation:
      "표면적이 급격히 늘어나 향 성분이 빠르게 날아갑니다. 가능하면 마시기 직전에 갈아 신선도를 지키세요.",
    source: "coffee-storage",
    sourceLabel: "원두 보관",
  },
];
