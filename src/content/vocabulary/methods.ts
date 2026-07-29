// Bean Wiki 정규 커피 어휘 — 규칙은 docs/VOCABULARY-IDS.md.
//
// 이 파일의 배열 리터럴은 순수 JSON입니다(키·문자열 모두 큰따옴표, 트레일링 콤마
// 없음, 배열 안에 주석 없음). scripts/check-vocabulary.mjs가 TS 툴체인 없이
// export 접두사를 잘라내고 JSON.parse 하기 때문입니다. 설명은 export 위에만 적습니다.
//
// 추출 방식. brew-methods의 3원리(침지·투과·가압)를 상위에 두고 개별 방식을
// `parent`로 연결합니다. 에어로프레스는 침지+가압 하이브리드이므로 `parent`가 없습니다.

import type { VocabularyEntity } from "./types";

export const methods: VocabularyEntity[] = [
  {
    "id": "method:immersion",
    "type": "method",
    "labels": {
      "ko": "침지",
      "en": "Immersion"
    },
    "aliases": [
      "침지",
      "침지식",
      "이머전",
      "immersion",
      "steeping"
    ],
    "articleSlug": "brew-methods",
    "note": "커피와 물을 한 용기에 담가 두는 원리로 시간·비율·온도가 결과를 좌우합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brew-methods"
    }
  },
  {
    "id": "method:percolation",
    "type": "method",
    "labels": {
      "ko": "투과",
      "en": "Percolation"
    },
    "aliases": [
      "투과",
      "투과식",
      "퍼콜레이션",
      "percolation",
      "percolate"
    ],
    "articleSlug": "brew-methods",
    "note": "커피층 위로 물을 통과시키는 원리로 물길의 균일성이 맛에 직접 개입합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brew-methods"
    }
  },
  {
    "id": "method:pressure",
    "type": "method",
    "labels": {
      "ko": "가압",
      "en": "Pressure"
    },
    "aliases": [
      "가압",
      "가압식",
      "압력추출",
      "pressure",
      "pressurised"
    ],
    "articleSlug": "brew-methods",
    "note": "압력으로 물을 밀어내는 원리로 짧고 진한 농축 질감을 만듭니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brew-methods"
    }
  },
  {
    "id": "method:french-press",
    "type": "method",
    "labels": {
      "ko": "프렌치 프레스",
      "en": "French Press"
    },
    "aliases": [
      "프렌치 프레스",
      "프렌치프레스",
      "프렌치 프레소",
      "french press",
      "frenchpress",
      "cafetiere",
      "plunger"
    ],
    "parent": "method:immersion",
    "articleSlug": "french-press-immersion-guide",
    "note": "금속 메시로 눌러 거르는 대표적 침지식으로 오일과 미분이 남아 바디가 무거운 편입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "프렌치프레스"
    }
  },
  {
    "id": "method:cold-brew",
    "type": "method",
    "labels": {
      "ko": "콜드브루",
      "en": "Cold Brew"
    },
    "aliases": [
      "콜드브루",
      "콜드 브루",
      "찬물추출",
      "cold brew",
      "coldbrew"
    ],
    "parent": "method:immersion",
    "articleSlug": "cold-brew",
    "note": "낮은 온도를 긴 시간으로 보완하는 침지이며 희석·질소 주입에 따라 질감이 달라집니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "콜드브루"
    }
  },
  {
    "id": "method:cupping",
    "type": "method",
    "labels": {
      "ko": "커핑",
      "en": "Cupping"
    },
    "aliases": [
      "커핑",
      "컵핑",
      "cupping",
      "cup test"
    ],
    "parent": "method:immersion",
    "articleSlug": "cupping-basics",
    "glossaryTerm": "커핑",
    "note": "표준화된 조건에서 여러 커피를 나란히 비교 평가하는 침지식 관능평가입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "커핑"
    }
  },
  {
    "id": "method:valve-immersion",
    "type": "method",
    "labels": {
      "ko": "밸브 침지 드리퍼",
      "en": "Valve Immersion Dripper"
    },
    "aliases": [
      "클레버",
      "클레버 드리퍼",
      "clever",
      "clever dripper",
      "스위치",
      "하리오 스위치",
      "switch",
      "hario switch"
    ],
    "parent": "method:immersion",
    "articleSlug": "brew-methods",
    "note": "밸브로 침지한 뒤 종이 필터로 내려보내는 하이브리드로 재현이 쉬운 편입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brew-methods"
    }
  },
  {
    "id": "method:pour-over",
    "type": "method",
    "labels": {
      "ko": "푸어오버",
      "en": "Pour Over"
    },
    "aliases": [
      "푸어오버",
      "푸어 오버",
      "핸드드립",
      "핸드 드립",
      "드립",
      "pour over",
      "pourover",
      "pour-over",
      "hand drip",
      "handdrip"
    ],
    "parent": "method:percolation",
    "articleSlug": "pour-over-rhythm-control",
    "note": "커피층 위로 새 물이 계속 지나가며 붓는 속도·높이·회전이 맛에 개입합니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "푸어오버"
    }
  },
  {
    "id": "method:batch-brew",
    "type": "method",
    "labels": {
      "ko": "배치 브루",
      "en": "Batch Brew"
    },
    "aliases": [
      "배치 브루",
      "배치브루",
      "배치 브루어",
      "batch brew",
      "batch brewer",
      "drip brewer"
    ],
    "parent": "method:percolation",
    "articleSlug": "coffee-drink-taxonomy",
    "note": "한 번에 만드는 양과 사람의 개입, 보온 시간이 푸어오버와 다른 필터 커피입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brew-methods"
    }
  },
  {
    "id": "method:espresso",
    "type": "method",
    "labels": {
      "ko": "에스프레소",
      "en": "Espresso"
    },
    "aliases": [
      "에스프레소",
      "에스프레쏘",
      "espresso",
      "expresso",
      "shot"
    ],
    "parent": "method:pressure",
    "articleSlug": "espresso-basics",
    "note": "가압한 물로 짧은 시간에 만든 농축 음료이며 도징·분쇄·압력이 핵심 변수입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "에스프레소"
    }
  },
  {
    "id": "method:moka-pot",
    "type": "method",
    "labels": {
      "ko": "모카포트",
      "en": "Moka Pot"
    },
    "aliases": [
      "모카포트",
      "모카 포트",
      "모카 익스프레스",
      "moka pot",
      "mokapot",
      "moka express",
      "비알레티",
      "bialetti",
      "마키네타",
      "macchinetta"
    ],
    "parent": "method:pressure",
    "articleSlug": "moka-pot-pressure-control",
    "note": "증기압으로 물을 밀어 올리는 가압식 도구로 1933년 알폰소 비알레티가 발명했습니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "모카포트"
    }
  },
  {
    "id": "method:aeropress",
    "type": "method",
    "labels": {
      "ko": "에어로프레스",
      "en": "AeroPress"
    },
    "aliases": [
      "에어로프레스",
      "에어로 프레스",
      "aeropress",
      "aero press"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "침지와 가압을 함께 쓰는 하이브리드로 2005년 앨런 애들러가 발명했습니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "method:siphon",
    "type": "method",
    "labels": {
      "ko": "사이폰",
      "en": "Siphon"
    },
    "aliases": [
      "사이폰",
      "싸이폰",
      "사이푼",
      "siphon",
      "syphon",
      "vacuum pot"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "증기압 상승과 감압 하강을 이용하는 방식으로 시각적 연출과 향 표현이 특징입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "method:turkish",
    "type": "method",
    "labels": {
      "ko": "터키식 커피",
      "en": "Turkish Coffee"
    },
    "aliases": [
      "터키식",
      "터키식 커피",
      "터키 커피",
      "제즈베",
      "체즈베",
      "이브릭",
      "turkish coffee",
      "turkish",
      "cezve",
      "ibrik"
    ],
    "articleSlug": "coffee-drink-taxonomy",
    "note": "매우 곱게 간 커피를 제즈베에서 물과 함께 가열하고 가루를 가라앉혀 마십니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-drink-taxonomy"
    }
  },
  {
    "id": "method:phin",
    "type": "method",
    "labels": {
      "ko": "베트남 핀 필터",
      "en": "Vietnamese Phin"
    },
    "aliases": [
      "핀 필터",
      "핀필터",
      "베트남 핀",
      "phin",
      "phin filter",
      "카페 쓰어다",
      "ca phe sua da"
    ],
    "parent": "method:percolation",
    "articleSlug": "coffee-drink-taxonomy",
    "note": "진한 커피와 연유·얼음을 조합하는 베트남식 카페 쓰어다에 쓰이는 소형 필터입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-drink-taxonomy"
    }
  }
];
