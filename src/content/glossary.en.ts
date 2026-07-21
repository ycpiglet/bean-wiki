import type { GlossaryTerm } from "@/content/types";

// English glossary — same order, category (Korean canonical key), and related
// slugs as glossary.ts. The Korean term is kept in `reading` as provenance.
export const glossaryTermsEn: GlossaryTerm[] = [
  {
    term: "Degassing",
    reading: "디개싱",
    definition:
      "CO₂ escaping from beans right after roasting; it affects extraction stability.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean"],
  },
  {
    term: "Bloom",
    reading: "블룸",
    definition:
      "The swelling of the coffee bed as trapped gas is released when water first hits it during brewing.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean"],
  },
  {
    term: "TDS",
    reading: "Total Dissolved Solids",
    definition:
      "The proportion of dissolved coffee solids in the beverage — an index of strength.",
    category: "추출",
    related: ["water-for-coffee", "extraction-basics"],
  },
  {
    term: "Extraction Yield",
    reading: "수율",
    definition:
      "The share of the bean mass that dissolves and transfers into the beverage.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "Channeling",
    reading: "채널링",
    definition:
      "When water rushes through low-density paths in the bed, undermining even extraction.",
    category: "추출",
    related: ["extraction-basics", "espresso-basics"],
  },
  {
    term: "Pre-infusion",
    reading: "프리인퓨전",
    definition:
      "Wetting the coffee at low pressure before full extraction to prepare the bed evenly.",
    category: "추출",
    related: ["espresso-basics"],
  },
  {
    term: "Dosing",
    reading: "도징",
    definition:
      "Measuring the amount of coffee placed in the basket or brewer.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "Crema",
    reading: "크레마",
    definition:
      "The fine foam layer atop espresso — an emulsion of gas, oils, and fine particles.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "Washed",
    reading: "워시드",
    definition:
      "A process that washes off flesh and mucilage, then dries the beans in parchment.",
    category: "산지와 생두",
    related: ["coffee-processing"],
  },
  {
    term: "Defect",
    reading: "디펙트",
    definition:
      "A flawed green bean (e.g., fermented or insect-damaged) that affects flavor and grade.",
    category: "산지와 생두",
    related: ["coffee-processing"],
  },
  {
    term: "Cupping",
    reading: "커핑",
    definition:
      "A sensory method for comparing several coffees side by side under standardized conditions.",
    category: "센서리",
    related: ["cupping-basics"],
  },
  {
    term: "Aftertaste",
    reading: "후미",
    definition:
      "The lingering flavor and its persistence after swallowing.",
    category: "센서리",
    related: ["cupping-basics"],
  },
  {
    term: "Weight Loss",
    reading: "감량률",
    definition:
      "The mass loss from green to roasted bean — one gauge of roast degree.",
    category: "로스팅",
    related: ["roast-development"],
  },
  {
    term: "Roasted Bean",
    reading: "원두",
    definition: "A coffee seed roasted until its flavor has developed.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean", "bean-structure-compounds"],
  },
  {
    term: "Green Bean",
    reading: "생두",
    definition: "A coffee seed after processing and drying, before roasting.",
    category: "커피 기초",
    related: ["coffee-cherry-to-bean", "coffee-processing"],
  },
  {
    term: "Flavor",
    reading: "향미",
    definition:
      "The whole sensory impression of coffee, combining taste and aroma.",
    category: "커피 기초",
    related: ["bean-structure-compounds", "cupping-basics"],
  },
  {
    term: "Roast Level",
    reading: "배전도",
    definition:
      "A summary of the heat applied during roasting, expressed by color and time (light–dark).",
    category: "로스팅",
    related: ["roasting-basics"],
  },
  {
    term: "First Crack",
    reading: "1차 크랙",
    definition:
      "The sound of beans expanding and rupturing under internal pressure — the start of development.",
    category: "로스팅",
    related: ["roasting-basics", "roast-development"],
  },
  {
    term: "Maillard Reaction",
    reading: "마이야르 반응",
    definition:
      "The heat reaction between sugars and amino acids that produces browning and aroma compounds.",
    category: "로스팅",
    related: ["roasting-basics", "bean-structure-compounds"],
  },
  {
    term: "Over-extraction",
    reading: "오버추출",
    definition:
      "A state where too much has dissolved, bringing out bitterness and off-flavors.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "Under-extraction",
    reading: "언더추출",
    definition:
      "A state where too little has dissolved, leaving sharp sourness or thinness.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "Brew Ratio",
    reading: "브루 비율",
    definition:
      "The ratio of coffee to water — the basis for beverage strength.",
    category: "추출",
    related: ["extraction-basics"],
  },
  {
    term: "Tamping",
    reading: "탬핑",
    definition:
      "Leveling and compressing the coffee in the portafilter before espresso extraction.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "Portafilter",
    reading: "포터필터",
    definition:
      "The handled basket holder that attaches to an espresso machine and holds the coffee.",
    category: "카페와 장비",
    related: ["espresso-basics"],
  },
  {
    term: "Fines",
    reading: "미분",
    definition:
      "Very small particles produced when grinding; they can cause over-extraction and slow flow.",
    category: "카페와 장비",
    related: ["grinder-basics"],
  },
  {
    term: "Body",
    reading: "바디",
    definition: "The texture and weight of the coffee felt in the mouth.",
    category: "센서리",
    related: ["cupping-basics"],
  },
  {
    term: "Acidity",
    reading: "산미",
    definition: "The impression of a bright, pleasant sourness.",
    category: "센서리",
    related: ["cupping-basics", "water-for-coffee"],
  },
  {
    term: "Varietal",
    reading: "품종",
    definition:
      "A cultivated line within a species (e.g., Arabica) with distinct flavor and growing traits.",
    category: "산지와 생두",
    related: ["coffee-varieties", "arabica-and-robusta"],
  },
];
