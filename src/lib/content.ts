export type ArticleSection = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  level: "입문" | "중급" | "전문";
  readingTime: string;
  updatedAt: string;
  accent: string;
  fact: string;
  sections: ArticleSection[];
  related: string[];
};

export const categories = [
  {
    name: "커피 기초",
    description: "커피의 구조와 한 잔이 만들어지는 전체 흐름",
    icon: "seed",
    count: 18,
    accent: "olive",
  },
  {
    name: "산지와 생두",
    description: "품종, 재배 환경, 가공과 생두 품질",
    icon: "mountain",
    count: 27,
    accent: "sage",
  },
  {
    name: "로스팅",
    description: "열 전달부터 프로파일 설계와 품질 관리",
    icon: "flame",
    count: 24,
    accent: "copper",
  },
  {
    name: "추출",
    description: "물, 분쇄도, 비율로 맛을 설계하는 방법",
    icon: "drop",
    count: 31,
    accent: "blue",
  },
  {
    name: "센서리",
    description: "커핑, 향미 언어와 관능평가의 원리",
    icon: "nose",
    count: 22,
    accent: "berry",
  },
  {
    name: "카페와 장비",
    description: "에스프레소 머신, 그라인더와 바 운영",
    icon: "cup",
    count: 16,
    accent: "sand",
  },
] as const;

export const articles: Article[] = [
  {
    slug: "coffee-cherry-to-bean",
    title: "커피 체리에서 한 잔까지",
    summary:
      "커피 열매가 수확, 가공, 로스팅과 추출을 거쳐 우리가 마시는 한 잔이 되는 과정을 살펴봅니다.",
    category: "커피 기초",
    level: "입문",
    readingTime: "6분",
    updatedAt: "2026. 07. 20.",
    accent: "olive",
    fact: "우리가 흔히 커피콩이라고 부르는 것은 커피나무 열매 안에 들어 있는 씨앗입니다.",
    sections: [
      {
        id: "fruit",
        title: "커피는 열매에서 시작됩니다",
        paragraphs: [
          "커피나무는 꼭두서니과 코페아속에 속하는 상록 식물입니다. 꽃이 진 자리에 생긴 열매는 익으면서 대체로 초록색에서 붉은색이나 노란색으로 변합니다. 이 열매를 커피 체리라고 부릅니다.",
          "체리 안에는 보통 두 개의 씨앗이 마주 보고 있습니다. 과육과 점액질, 파치먼트 같은 여러 층을 제거하고 건조한 씨앗이 생두이며, 이를 가열해 향미를 발달시킨 것이 원두입니다.",
        ],
      },
      {
        id: "process",
        title: "가공은 씨앗을 안정적으로 보존하는 과정입니다",
        paragraphs: [
          "수확한 체리는 시간이 지나면 빠르게 변질됩니다. 생산자는 체리에서 씨앗을 분리하고 적정 수분까지 건조해 장거리 이동과 보관이 가능한 생두로 만듭니다.",
        ],
        points: [
          "워시드: 과육을 제거한 뒤 발효와 세척을 거쳐 건조합니다.",
          "내추럴: 체리 상태로 건조한 뒤 마른 과육을 벗깁니다.",
          "허니: 점액질 일부를 남긴 채 건조하며 제거 정도에 따라 이름이 달라집니다.",
        ],
      },
      {
        id: "roast-brew",
        title: "로스팅과 추출이 향미를 완성합니다",
        paragraphs: [
          "생두에 열을 가하면 수분이 빠지고 색이 짙어지며 수많은 향기 성분이 만들어집니다. 로스터는 열의 세기와 시간을 조절해 원재료의 특성을 어떤 방식으로 표현할지 결정합니다.",
          "마지막으로 분쇄한 원두에 물이 닿으면 녹을 수 있는 성분이 물로 이동합니다. 분쇄도, 물의 온도와 조성, 접촉 시간, 커피와 물의 비율이 최종적인 농도와 수율, 맛의 균형을 좌우합니다.",
        ],
      },
    ],
    related: ["coffee-processing", "roast-development", "extraction-basics"],
  },
  {
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
  },
  {
    slug: "roast-development",
    title: "로스팅 발달 시간 이해하기",
    summary:
      "1차 크랙 이후의 시간만으로 로스팅을 판단하지 않고 전체 열 이력을 읽는 관점을 정리합니다.",
    category: "로스팅",
    level: "중급",
    readingTime: "10분",
    updatedAt: "2026. 07. 20.",
    accent: "copper",
    fact: "같은 발달 시간 비율이라도 배치 크기, 열량과 이전 단계의 에너지에 따라 전혀 다른 결과가 나올 수 있습니다.",
    sections: [
      {
        id: "definition",
        title: "발달은 1차 크랙 이후만의 일이 아닙니다",
        paragraphs: [
          "현장에서는 1차 크랙 시작부터 배출까지를 발달 구간으로 부르는 경우가 많습니다. 기록과 소통에는 유용하지만, 향미를 만드는 반응은 로스팅 전 과정에서 연속적으로 일어납니다.",
          "따라서 발달 시간이나 비율 하나를 품질의 목표값처럼 사용하기보다 투입 온도, 에너지 적용, 변화율과 배출 상태를 함께 읽어야 합니다.",
        ],
      },
      {
        id: "signals",
        title: "함께 기록할 신호",
        paragraphs: [
          "기계가 보여주는 온도는 센서 위치와 반응 속도에 영향을 받습니다. 곡선만 보지 말고 색, 향, 소리, 배기 상태와 물리적 변화를 함께 기록하면 배치 간 비교가 더 정확해집니다.",
        ],
        points: [
          "투입량과 생두의 밀도·수분",
          "가스 또는 전력 입력의 변경 시점",
          "배기와 드럼 속도",
          "옐로 포인트, 1차 크랙과 배출 시점",
          "감량률, 색도와 컵 결과",
        ],
      },
      {
        id: "evaluation",
        title: "프로파일의 답은 컵에서 확인합니다",
        paragraphs: [
          "좋은 프로파일은 보기 좋은 곡선이 아니라 의도한 향미를 반복해서 만들어내는 프로파일입니다. 같은 조건으로 커핑하고 로스팅 기록과 결과를 연결해야 의미 있는 기준이 생깁니다.",
        ],
      },
    ],
    related: ["cupping-basics", "coffee-processing", "extraction-basics"],
  },
  {
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
  },
  {
    slug: "coffee-processing",
    title: "커피 가공 방식 한눈에 보기",
    summary:
      "워시드, 내추럴, 허니 프로세스를 씨앗 주변의 층을 언제 제거하는가라는 관점에서 비교합니다.",
    category: "산지와 생두",
    level: "중급",
    readingTime: "11분",
    updatedAt: "2026. 07. 20.",
    accent: "sage",
    fact: "가공 방식은 향미에 영향을 주지만, 방식의 이름만으로 컵의 향미나 품질을 확정할 수는 없습니다.",
    sections: [
      {
        id: "layers",
        title: "체리의 층을 이해하면 가공이 보입니다",
        paragraphs: [
          "커피 씨앗은 파치먼트, 점액질, 과육과 껍질에 둘러싸여 있습니다. 가공 방식은 이 층들을 어느 시점에 어떤 방법으로 제거하고, 씨앗을 어떻게 건조하는지에 따라 구분할 수 있습니다.",
        ],
      },
      {
        id: "methods",
        title: "대표적인 세 가지 접근",
        paragraphs: [
          "명칭과 세부 방식은 국가와 생산자마다 다를 수 있습니다. 같은 이름 아래에서도 발효 시간, 물 사용, 건조 환경과 선별 수준에 따라 결과는 크게 달라집니다.",
        ],
        points: [
          "워시드: 과육 제거 후 점액질을 분해·제거하고 파치먼트 상태로 건조",
          "내추럴: 체리를 통째로 건조한 뒤 마른 외피와 과육을 제거",
          "허니·펄프드 내추럴: 과육을 벗기고 점액질 일부 또는 전부를 남겨 건조",
        ],
      },
      {
        id: "quality",
        title: "품질은 공정 관리에서 갈립니다",
        paragraphs: [
          "균일한 성숙도, 위생적인 발효, 건조 속도, 수분 균일성과 보관 조건이 품질과 안정성에 큰 영향을 줍니다. 새로운 발효 기법도 이름보다 공정 변수와 재현성, 관능 결과를 중심으로 평가해야 합니다.",
        ],
      },
    ],
    related: ["coffee-cherry-to-bean", "cupping-basics", "roast-development"],
  },
  {
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
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

