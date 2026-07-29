// Bean Wiki 정규 커피 어휘 — 규칙은 docs/VOCABULARY-IDS.md.
//
// 이 파일의 배열 리터럴은 순수 JSON입니다(키·문자열 모두 큰따옴표, 트레일링 콤마
// 없음, 배열 안에 주석 없음). scripts/check-vocabulary.mjs가 TS 툴체인 없이
// export 접두사를 잘라내고 JSON.parse 하기 때문입니다. 설명은 export 위에만 적습니다.
//
// 향미 어휘. 두 출처를 함께 담습니다.
//   - 커피 테이스터스 향미 휠의 위계(안쪽 큰 범주 → 바깥쪽 구체 표현)
//   - 커핑 폼/CVA의 평가 속성(산미·단맛·바디·애프터테이스트·균형 등)
//
// 휠의 위계는 `parent`로 표현합니다(flavor:blueberry → flavor:berry → flavor:fruity).

import type { VocabularyEntity } from "./types";

export const flavors: VocabularyEntity[] = [
  {
    "id": "flavor:fruity",
    "type": "flavor",
    "labels": {
      "ko": "과일",
      "en": "Fruity"
    },
    "aliases": [
      "과일",
      "과일향",
      "프루티",
      "fruity",
      "fruit"
    ],
    "articleSlug": "coffee-flavor-wheel",
    "note": "향미 휠 안쪽 고리의 큰 범주로, 확신이 생기는 만큼만 바깥 고리로 좁혀 씁니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:floral",
    "type": "flavor",
    "labels": {
      "ko": "플로럴",
      "en": "Floral"
    },
    "aliases": [
      "플로럴",
      "플로랄",
      "꽃향",
      "꽃 향",
      "floral",
      "flowery"
    ],
    "articleSlug": "coffee-flavor-wheel",
    "note": "향미 휠 안쪽 고리의 큰 범주이며 커핑 폼의 프래그런스 표현으로도 쓰입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:sweet",
    "type": "flavor",
    "labels": {
      "ko": "단맛",
      "en": "Sweet"
    },
    "aliases": [
      "단맛",
      "스위트",
      "sweet",
      "sweetness"
    ],
    "articleSlug": "sensory-attributes",
    "note": "당도가 아닌 단맛의 인상과 충만함을 가리키며 CVA에서는 강도로 다룹니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:nutty-cocoa",
    "type": "flavor",
    "labels": {
      "ko": "견과·코코아",
      "en": "Nutty & Cocoa"
    },
    "aliases": [
      "견과",
      "견과류",
      "코코아",
      "견과 코코아",
      "너티",
      "nutty",
      "cocoa",
      "nutty cocoa"
    ],
    "articleSlug": "coffee-flavor-wheel",
    "note": "향미 휠 안쪽 고리의 큰 범주로 과일 계열과 대비해 첫 인상을 나눌 때 씁니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:spices",
    "type": "flavor",
    "labels": {
      "ko": "향신료",
      "en": "Spices"
    },
    "aliases": [
      "향신료",
      "스파이스",
      "스파이시",
      "spices",
      "spicy",
      "spice"
    ],
    "articleSlug": "coffee-flavor-wheel",
    "note": "향미 휠 안쪽 고리의 큰 범주이며 페놀류가 주는 인상으로도 설명됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:roasted",
    "type": "flavor",
    "labels": {
      "ko": "로스티드",
      "en": "Roasted"
    },
    "aliases": [
      "로스티드",
      "로스티",
      "roasted",
      "roasty"
    ],
    "articleSlug": "coffee-flavor-wheel",
    "note": "향미 휠 안쪽 고리의 큰 범주로, 피라진·황 화합물이 주는 인상과 연결됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:sour-fermented",
    "type": "flavor",
    "labels": {
      "ko": "발효·신맛 계열",
      "en": "Sour & Fermented"
    },
    "aliases": [
      "발효 신맛",
      "발효·신맛",
      "발효향",
      "sour fermented",
      "fermented"
    ],
    "articleSlug": "coffee-flavor-wheel",
    "note": "향미 휠 안쪽 고리의 큰 범주로 신맛과 발효 인상을 함께 묶습니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:berry",
    "type": "flavor",
    "labels": {
      "ko": "베리",
      "en": "Berry"
    },
    "aliases": [
      "베리",
      "베리류",
      "berry",
      "berries"
    ],
    "parent": "flavor:fruity",
    "articleSlug": "coffee-flavor-wheel",
    "note": "과일 범주에서 한 단계 좁힌 갈래로 휠 예시에 등장합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:blueberry",
    "type": "flavor",
    "labels": {
      "ko": "블루베리",
      "en": "Blueberry"
    },
    "aliases": [
      "블루베리",
      "블루베리향",
      "blueberry"
    ],
    "parent": "flavor:berry",
    "articleSlug": "coffee-flavor-wheel",
    "note": "베리류에서 더 좁힌 구체 표현으로 휠 예시에 등장합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:citrus",
    "type": "flavor",
    "labels": {
      "ko": "감귤",
      "en": "Citrus"
    },
    "aliases": [
      "감귤",
      "감귤류",
      "시트러스",
      "시트릭",
      "citrus",
      "citric"
    ],
    "parent": "flavor:fruity",
    "articleSlug": "coffee-flavor-wheel",
    "note": "과일 범주의 갈래이며 산미 표현에서도 '시트러스 같다'로 쓰입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:grapefruit",
    "type": "flavor",
    "labels": {
      "ko": "자몽",
      "en": "Grapefruit"
    },
    "aliases": [
      "자몽",
      "그레이프프루트",
      "grapefruit"
    ],
    "parent": "flavor:citrus",
    "articleSlug": "coffee-flavor-wheel",
    "note": "감귤류에서 확신이 있을 때만 쓰는 구체 표현으로 휠 예시에 등장합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-flavor-wheel"
    }
  },
  {
    "id": "flavor:tropical-fruit",
    "type": "flavor",
    "labels": {
      "ko": "열대과일",
      "en": "Tropical Fruit"
    },
    "aliases": [
      "열대과일",
      "트로피컬",
      "트로피컬 프루트",
      "tropical fruit",
      "tropical"
    ],
    "parent": "flavor:fruity",
    "articleSlug": "coffee-aroma-chemistry",
    "note": "황 함유 화합물이 주는 인상 중 하나로 서술되며 역치가 낮고 손실이 빠릅니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-aroma-chemistry"
    }
  },
  {
    "id": "flavor:roasted-nuts",
    "type": "flavor",
    "labels": {
      "ko": "볶은 견과",
      "en": "Roasted Nuts"
    },
    "aliases": [
      "볶은 견과",
      "구운 견과",
      "roasted nuts",
      "roasted nut"
    ],
    "parent": "flavor:nutty-cocoa",
    "articleSlug": "coffee-aroma-chemistry",
    "note": "피라진류에서 연상되는 인상으로, 농도에 따라 흙내로도 지각될 수 있습니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-aroma-chemistry"
    }
  },
  {
    "id": "flavor:caramel",
    "type": "flavor",
    "labels": {
      "ko": "캐러멜",
      "en": "Caramel"
    },
    "aliases": [
      "캐러멜",
      "카라멜",
      "caramel"
    ],
    "articleSlug": "sensory-attributes",
    "note": "퓨란류에서 연상되는 달콤한 인상이며 커핑 폼의 아로마 표현으로도 쓰입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-aroma-chemistry"
    }
  },
  {
    "id": "flavor:chocolate",
    "type": "flavor",
    "labels": {
      "ko": "초콜릿",
      "en": "Chocolate"
    },
    "aliases": [
      "초콜릿",
      "초콜렛",
      "쵸콜릿",
      "chocolate",
      "chocolaty"
    ],
    "articleSlug": "sensory-attributes",
    "note": "향과 맛이 합쳐진 전체 인상을 말할 때의 대표 표현으로 소개됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:honey-note",
    "type": "flavor",
    "labels": {
      "ko": "꿀",
      "en": "Honey Note"
    },
    "aliases": [
      "꿀",
      "꿀향",
      "허니 노트",
      "honey note",
      "honeyed"
    ],
    "articleSlug": "sensory-attributes",
    "note": "단맛 속성을 설명할 때 쓰는 표현으로 '꿀 같다'가 예시로 제시됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:earthy",
    "type": "flavor",
    "labels": {
      "ko": "흙내",
      "en": "Earthy"
    },
    "aliases": [
      "흙내",
      "흙향",
      "어씨",
      "earthy",
      "earth"
    ],
    "articleSlug": "coffee-aroma-chemistry",
    "note": "피라진의 종류와 농도에 따라 견과 대신 흙내로 지각될 수 있다고 서술됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-aroma-chemistry"
    }
  },
  {
    "id": "flavor:smoky",
    "type": "flavor",
    "labels": {
      "ko": "스모키",
      "en": "Smoky"
    },
    "aliases": [
      "스모키",
      "스모크",
      "훈연",
      "smoky",
      "smokey"
    ],
    "articleSlug": "coffee-aroma-chemistry",
    "note": "페놀류에서 연상되는 인상이며 과하면 약품·탄 향으로 인식될 수 있습니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-aroma-chemistry"
    }
  },
  {
    "id": "flavor:fragrance-aroma",
    "type": "flavor",
    "labels": {
      "ko": "프래그런스·아로마",
      "en": "Fragrance & Aroma"
    },
    "aliases": [
      "프래그런스",
      "프래그런스 아로마",
      "아로마",
      "분쇄향",
      "fragrance",
      "aroma",
      "fragrance aroma"
    ],
    "articleSlug": "sensory-attributes",
    "note": "분쇄향과 추출향의 인상을 묻는 커핑 폼 속성입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:flavor",
    "type": "flavor",
    "labels": {
      "ko": "플레이버",
      "en": "Flavor"
    },
    "aliases": [
      "플레이버",
      "향미",
      "flavor",
      "flavour"
    ],
    "articleSlug": "sensory-attributes",
    "glossaryTerm": "향미",
    "note": "입안에서 향과 맛이 합쳐진 전체 인상을 묻는 커핑 폼 속성입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "향미"
    }
  },
  {
    "id": "flavor:acidity",
    "type": "flavor",
    "labels": {
      "ko": "산미",
      "en": "Acidity"
    },
    "aliases": [
      "산미",
      "애시디티",
      "acidity",
      "acid"
    ],
    "articleSlug": "sensory-attributes",
    "glossaryTerm": "산미",
    "note": "밝고 생동감을 주는 신맛의 질을 가리키는 평가 용어입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "산미"
    }
  },
  {
    "id": "flavor:body",
    "type": "flavor",
    "labels": {
      "ko": "바디",
      "en": "Body"
    },
    "aliases": [
      "바디",
      "바디감",
      "마우스필",
      "입안감",
      "body",
      "mouthfeel"
    ],
    "articleSlug": "sensory-attributes",
    "glossaryTerm": "바디",
    "note": "입안에서 느끼는 무게감과 질감이며 CVA 기술 평가에서는 마우스필로 부릅니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "바디"
    }
  },
  {
    "id": "flavor:aftertaste",
    "type": "flavor",
    "labels": {
      "ko": "애프터테이스트",
      "en": "Aftertaste"
    },
    "aliases": [
      "애프터테이스트",
      "후미",
      "여운",
      "aftertaste",
      "finish"
    ],
    "articleSlug": "sensory-attributes",
    "glossaryTerm": "후미",
    "note": "삼킨 뒤 남는 향미의 길이와 질을 함께 보는 속성입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "후미"
    }
  },
  {
    "id": "flavor:balance",
    "type": "flavor",
    "labels": {
      "ko": "균형",
      "en": "Balance"
    },
    "aliases": [
      "균형",
      "밸런스",
      "balance"
    ],
    "articleSlug": "sensory-attributes",
    "note": "개별 속성이 아니라 속성들이 서로를 살리는 관계를 보는 항목입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:uniformity",
    "type": "flavor",
    "labels": {
      "ko": "균일성",
      "en": "Uniformity"
    },
    "aliases": [
      "균일성",
      "유니포미티",
      "uniformity"
    ],
    "articleSlug": "sca-cupping-protocol",
    "note": "SCA 커핑 폼 10개 항목 중 하나로 복수 잔을 두는 이유가 됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sca-cupping-protocol"
    }
  },
  {
    "id": "flavor:clean-cup",
    "type": "flavor",
    "labels": {
      "ko": "클린컵",
      "en": "Clean Cup"
    },
    "aliases": [
      "클린컵",
      "클린 컵",
      "clean cup",
      "cleanliness"
    ],
    "articleSlug": "sca-cupping-protocol",
    "note": "SCA 커핑 폼 10개 항목 중 하나로 샘플당 복수 잔으로 평가합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sca-cupping-protocol"
    }
  },
  {
    "id": "flavor:overall",
    "type": "flavor",
    "labels": {
      "ko": "종합",
      "en": "Overall"
    },
    "aliases": [
      "종합",
      "오버올",
      "overall"
    ],
    "articleSlug": "sca-cupping-protocol",
    "note": "SCA 커핑 폼 10개 항목 중 평가자의 종합 판단을 담는 항목입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sca-cupping-protocol"
    }
  },
  {
    "id": "flavor:sourness",
    "type": "flavor",
    "labels": {
      "ko": "신맛",
      "en": "Sourness"
    },
    "aliases": [
      "신맛",
      "사워",
      "시큼함",
      "sourness",
      "sour"
    ],
    "articleSlug": "sensory-attributes",
    "note": "기본 맛 용어로, 평가 용어인 산미와 구분해 씁니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:bitterness",
    "type": "flavor",
    "labels": {
      "ko": "쓴맛",
      "en": "Bitterness"
    },
    "aliases": [
      "쓴맛",
      "비터",
      "비터니스",
      "bitterness",
      "bitter"
    ],
    "articleSlug": "coffee-aroma-chemistry",
    "note": "카페인만으로 설명되지 않고 클로로젠산 분해산물과 멜라노이딘도 관여합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-aroma-chemistry"
    }
  },
  {
    "id": "flavor:astringency",
    "type": "flavor",
    "labels": {
      "ko": "떫은감",
      "en": "Astringency"
    },
    "aliases": [
      "떫은감",
      "떫음",
      "애스트린전시",
      "astringency",
      "astringent"
    ],
    "articleSlug": "coffee-aroma-chemistry",
    "note": "쓴맛과 함께 비휘발성 성분이 관여하는 촉감성 인상입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-aroma-chemistry"
    }
  },
  {
    "id": "flavor:juicy",
    "type": "flavor",
    "labels": {
      "ko": "즙이 많은",
      "en": "Juicy"
    },
    "aliases": [
      "즙이 많은",
      "쥬시",
      "주시",
      "juicy"
    ],
    "parent": "flavor:acidity",
    "articleSlug": "sensory-attributes",
    "note": "산미의 질을 설명하는 표현으로 '즙이 많다'가 예시로 제시됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:bright",
    "type": "flavor",
    "labels": {
      "ko": "밝은",
      "en": "Bright"
    },
    "aliases": [
      "밝은",
      "밝다",
      "브라이트",
      "bright",
      "brightness"
    ],
    "parent": "flavor:acidity",
    "articleSlug": "sensory-attributes",
    "note": "산미의 밝기·생동감을 가리키는 표현이며 비교로 말하는 연습이 권장됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:syrupy",
    "type": "flavor",
    "labels": {
      "ko": "시럽감",
      "en": "Syrupy"
    },
    "aliases": [
      "시럽감",
      "시럽 같다",
      "시러피",
      "syrupy"
    ],
    "parent": "flavor:body",
    "articleSlug": "sensory-attributes",
    "note": "바디를 설명하는 표현으로 '시럽 같다'가 예시로 제시됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  },
  {
    "id": "flavor:creamy",
    "type": "flavor",
    "labels": {
      "ko": "크리미",
      "en": "Creamy"
    },
    "aliases": [
      "크리미",
      "크리미하다",
      "크리미함",
      "creamy"
    ],
    "parent": "flavor:body",
    "articleSlug": "sensory-attributes",
    "note": "바디를 설명하는 표현으로 '크리미하다'가 예시로 제시됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-attributes"
    }
  }
];
