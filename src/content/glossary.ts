import type { GlossaryTerm } from "@/content/types";

// category values MUST exactly match a categories[].name string so grouping works.
export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "디개싱",
    reading: "Degassing",
    definition:
      "로스팅 직후 원두에서 이산화탄소가 빠져나가는 현상으로, 추출 안정성에 영향을 줍니다.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean"],
  },
  {
    term: "블룸",
    reading: "Bloom",
    definition:
      "추출 초반 물을 부었을 때 갇혀 있던 가스가 방출되며 커피층이 부풀어 오르는 과정입니다.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean"],
  },
  {
    term: "TDS",
    reading: "총용존고형물",
    definition:
      "음료에 녹아 있는 커피 고형분의 비율로, 커피의 농도를 나타내는 지표입니다.",
    category: "추출",
    related: ["water-for-coffee", "extraction-basics"],
  },
  {
    term: "수율",
    reading: "Extraction Yield",
    definition:
      "투입한 원두 질량 중 물에 녹아 음료로 이동한 성분의 비율입니다.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "채널링",
    reading: "Channeling",
    definition:
      "커피층의 밀도 차이로 물이 특정 경로로 몰려 흘러 균일한 추출을 방해하는 현상입니다.",
    category: "추출",
    related: ["extraction-basics", "espresso-basics"],
  },
  {
    term: "프리인퓨전",
    reading: "Pre-infusion",
    definition:
      "본추출 전 낮은 압력으로 커피를 미리 적셔 커피층을 고르게 준비하는 단계입니다.",
    category: "추출",
    related: ["espresso-basics"],
  },
  {
    term: "도징",
    reading: "Dosing",
    definition:
      "추출을 위해 바스켓이나 브루어에 담는 원두의 양을 계량하는 것입니다.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "크레마",
    reading: "Crema",
    definition:
      "에스프레소 위에 형성되는 미세한 거품층으로, 가스와 오일, 미세 입자가 유화된 결과입니다.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "워시드",
    reading: "Washed",
    definition:
      "과육과 점액질을 물로 씻어 제거한 뒤 파치먼트 상태로 건조하는 가공 방식입니다.",
    category: "산지와 생두",
    related: ["coffee-processing"],
  },
  {
    term: "디펙트",
    reading: "Defect",
    definition:
      "생두의 결점두로, 발효두나 벌레 먹은 콩 등 향미와 등급에 영향을 주는 결함입니다.",
    category: "산지와 생두",
    related: ["coffee-processing"],
  },
  {
    term: "커핑",
    reading: "Cupping",
    definition:
      "표준화된 조건에서 여러 커피를 나란히 비교 평가하는 관능평가 방식입니다.",
    category: "센서리",
    related: ["cupping-basics"],
  },
  {
    term: "후미",
    reading: "Aftertaste",
    definition:
      "커피를 삼킨 뒤 입안에 남는 향미의 여운과 그 지속성을 가리킵니다.",
    category: "센서리",
    related: ["cupping-basics"],
  },
  {
    term: "감량률",
    reading: "Weight Loss",
    definition:
      "로스팅 전후 생두 대비 원두의 질량 감소 비율로, 로스팅 정도를 가늠하는 지표 중 하나입니다.",
    category: "로스팅",
    related: ["roast-development"],
  },
  {
    term: "원두",
    reading: "Roasted Bean",
    definition: "로스팅을 마쳐 향미가 발달한 커피 씨앗입니다.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean", "bean-structure-compounds"],
  },
  {
    term: "생두",
    reading: "Green Bean",
    definition: "로스팅 전, 가공과 건조를 마친 상태의 커피 씨앗입니다.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean", "coffee-processing"],
  },
  {
    term: "향미",
    reading: "Flavor",
    definition:
      "맛(미각)과 향(후각)을 아우르는 커피의 감각적 인상 전체를 가리킵니다.",
    category: "커피 기초",
    related: ["bean-structure-compounds", "cupping-basics"],
  },
  {
    term: "배전도",
    reading: "Roast Level",
    definition:
      "로스팅으로 원두에 가한 열의 정도를 색과 시간으로 요약한 표현입니다(라이트~다크).",
    category: "로스팅",
    related: ["roasting-basics"],
  },
  {
    term: "1차 크랙",
    reading: "First Crack",
    definition:
      "로스팅 중 내부 압력으로 원두가 팽창·파열하며 나는 소리로, 발현 단계의 시작 신호입니다.",
    category: "로스팅",
    related: ["roasting-basics", "roast-development"],
  },
  {
    term: "마이야르 반응",
    reading: "Maillard Reaction",
    definition:
      "당과 아미노산이 열에서 반응해 갈변과 다양한 향 물질을 만드는 과정입니다.",
    category: "로스팅",
    related: ["roasting-basics", "bean-structure-compounds"],
  },
  {
    term: "오버추출",
    reading: "Over-extraction",
    definition:
      "성분이 지나치게 많이 녹아 쓴맛과 잡미가 두드러지는 상태입니다.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "언더추출",
    reading: "Under-extraction",
    definition:
      "성분이 충분히 녹지 않아 날카로운 신맛이나 밋밋함이 남는 상태입니다.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "브루 비율",
    reading: "Brew Ratio",
    definition:
      "커피 원두 대비 물의 비율로, 음료 농도의 기준이 되는 값입니다.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "탬핑",
    reading: "Tamping",
    definition:
      "에스프레소 추출 전 포터필터의 커피를 고르고 평평하게 다지는 동작입니다.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "포터필터",
    reading: "Portafilter",
    definition:
      "에스프레소 머신에 장착해 커피를 담는, 손잡이 달린 바스켓 홀더입니다.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "미분",
    reading: "Fines",
    definition:
      "분쇄 시 생기는 아주 미세한 입자로, 과다 추출과 흐름 저하의 원인이 될 수 있습니다.",
    category: "카페와 장비",
    related: ["grinder-basics"],
  },
  {
    term: "바디",
    reading: "Body",
    definition: "입안에서 느끼는 커피의 질감과 무게감을 가리킵니다.",
    category: "센서리",
    related: ["cupping-basics"],
  },
  {
    term: "산미",
    reading: "Acidity",
    definition: "밝고 상큼하게 느껴지는 긍정적인 신맛의 인상입니다.",
    category: "센서리",
    related: ["cupping-basics", "water-for-coffee"],
  },
  {
    term: "품종",
    reading: "Varietal",
    definition:
      "하나의 종(예: 아라비카) 안에서 향미와 재배 특성이 다른 재배 계통입니다.",
    category: "산지와 생두",
    related: ["coffee-varieties", "arabica-and-robusta"],
  },
];
