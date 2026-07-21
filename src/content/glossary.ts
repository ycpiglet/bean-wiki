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
];
