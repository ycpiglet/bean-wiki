export type RecommendationKind = "store" | "menu" | "bean" | "recipe";

export type RecommendationItem = {
  id: string;
  kind: RecommendationKind;
  externalId?: string;
  storeName: string | null;
  name: string;
  area: string | null;
  summary: string;
  tags: string[];
  rating: number | null;
  reviewCount: number;
  sourceName: string;
  sourceUrl: string | null;
};

export const editorialRecommendations: RecommendationItem[] = [
  {
    id: "editorial-filter-first",
    kind: "menu",
    storeName: null,
    name: "처음 맛보는 싱글 오리진 필터 커피",
    area: null,
    summary:
      "매장에 원산지와 가공 방식이 적힌 필터 메뉴가 있다면 바리스타에게 산미와 단맛의 강도를 물어보고 한 잔을 골라보세요.",
    tags: ["초보자", "필터", "향미 탐색"],
    rating: null,
    reviewCount: 0,
    sourceName: "Bean Wiki 편집부",
    sourceUrl: "/wiki/cupping-basics",
  },
  {
    id: "editorial-milk-menu",
    kind: "menu",
    storeName: null,
    name: "우유 음료로 원두 차이 비교하기",
    area: null,
    summary:
      "고소하고 단맛이 강한 원두는 플랫화이트나 라테에서 비교하기 쉽습니다. 같은 매장에서 에스프레소와 우유 음료를 나란히 마셔보세요.",
    tags: ["초보자", "라테", "에스프레소"],
    rating: null,
    reviewCount: 0,
    sourceName: "Bean Wiki 편집부",
    sourceUrl: "/wiki/espresso-basics",
  },
  {
    id: "editorial-bean-balanced",
    kind: "bean",
    storeName: null,
    name: "첫 홈브루잉 원두: 중간 로스팅 워시드",
    area: null,
    summary:
      "산미·단맛·고소함을 함께 관찰하기 쉬운 중간 로스팅 워시드 원두부터 시작하면 분쇄도와 물 온도 변화가 비교적 선명하게 드러납니다.",
    tags: ["초보자", "워시드", "중간 로스팅"],
    rating: null,
    reviewCount: 0,
    sourceName: "Bean Wiki 편집부",
    sourceUrl: "/wiki/coffee-processing",
  },
  {
    id: "editorial-v60",
    kind: "recipe",
    storeName: null,
    name: "기준점이 되는 1:16 필터 레시피",
    area: null,
    summary:
      "원두 15g, 물 240g에서 시작해 30~45g으로 뜸을 들인 뒤 2~3회로 나누어 붓습니다. 맛을 기록하고 한 번에 한 변수만 바꿉니다.",
    tags: ["홈브루잉", "1:16", "기준 레시피"],
    rating: null,
    reviewCount: 0,
    sourceName: "Bean Wiki 편집부",
    sourceUrl: "/wiki/extraction-basics",
  },
  {
    id: "editorial-coldbrew",
    kind: "recipe",
    storeName: null,
    name: "실패를 줄이는 콜드브루 시작점",
    area: null,
    summary:
      "굵게 분쇄한 원두와 물을 약 1:10으로 섞어 냉장 침출한 뒤 여과하고, 완성된 농축액은 물이나 우유로 희석해 농도를 맞춥니다.",
    tags: ["콜드브루", "침출", "여름"],
    rating: null,
    reviewCount: 0,
    sourceName: "Bean Wiki 편집부",
    sourceUrl: "/wiki/cold-brew-science",
  },
];
