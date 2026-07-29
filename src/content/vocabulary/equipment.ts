// Bean Wiki 정규 커피 어휘 — 규칙은 docs/VOCABULARY-IDS.md.
//
// 이 파일의 배열 리터럴은 순수 JSON입니다(키·문자열 모두 큰따옴표, 트레일링 콤마
// 없음, 배열 안에 주석 없음). scripts/check-vocabulary.mjs가 TS 툴체인 없이
// export 접두사를 잘라내고 JSON.parse 하기 때문입니다. 설명은 export 위에만 적습니다.
//
// 장비·도구. 부품은 상위 장비를 `parent`로 가집니다(버 → 그라인더, 바스켓 → 포터필터).

import type { VocabularyEntity } from "./types";

export const equipment: VocabularyEntity[] = [
  {
    "id": "equipment:grinder",
    "type": "equipment",
    "labels": {
      "ko": "그라인더",
      "en": "Grinder"
    },
    "aliases": [
      "그라인더",
      "분쇄기",
      "그라인더기",
      "grinder",
      "coffee grinder"
    ],
    "articleSlug": "grinder-basics",
    "note": "분쇄 단계 숫자보다 입자 분포의 균일성이 결과를 더 많이 바꾸는 장비입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "그라인더"
    }
  },
  {
    "id": "equipment:burr",
    "type": "equipment",
    "labels": {
      "ko": "버",
      "en": "Burr"
    },
    "aliases": [
      "버",
      "그라인딩 버",
      "분쇄날",
      "burr",
      "burrs",
      "grind burr"
    ],
    "parent": "equipment:grinder",
    "articleSlug": "grinder-burr-profile",
    "note": "버 타입은 분쇄 곡선과 유지관리 방식에 영향을 주며 정답 타입은 없습니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "grinder-basics"
    }
  },
  {
    "id": "equipment:burr-flat",
    "type": "equipment",
    "labels": {
      "ko": "플랫 버",
      "en": "Flat Burr"
    },
    "aliases": [
      "플랫 버",
      "플랫버",
      "평면날",
      "flat burr",
      "flat burrs"
    ],
    "parent": "equipment:burr",
    "articleSlug": "grinder-burr-profile",
    "note": "코니컬과 분쇄 패턴·유지관리 방식이 다른 버 형태입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "grinder-burr-profile"
    }
  },
  {
    "id": "equipment:burr-conical",
    "type": "equipment",
    "labels": {
      "ko": "코니컬 버",
      "en": "Conical Burr"
    },
    "aliases": [
      "코니컬 버",
      "코니컬버",
      "코니컬",
      "원뿔날",
      "conical burr",
      "conical burrs"
    ],
    "parent": "equipment:burr",
    "articleSlug": "grinder-basics",
    "note": "플랫과 분쇄 패턴·유지관리 방식이 다른 버 형태입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "grinder-basics"
    }
  },
  {
    "id": "equipment:espresso-machine",
    "type": "equipment",
    "labels": {
      "ko": "에스프레소 머신",
      "en": "Espresso Machine"
    },
    "aliases": [
      "에스프레소 머신",
      "에스프레소머신",
      "커피머신",
      "espresso machine",
      "espresso maker"
    ],
    "articleSlug": "espresso-machines-grinders",
    "note": "등급을 나누는 것은 브랜드가 아니라 보일러와 그룹헤드의 온도·압력 유지 구조입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "espresso-machines-grinders"
    }
  },
  {
    "id": "equipment:portafilter",
    "type": "equipment",
    "labels": {
      "ko": "포터필터",
      "en": "Portafilter"
    },
    "aliases": [
      "포터필터",
      "포타필터",
      "포터 필터",
      "portafilter",
      "porta filter",
      "group handle"
    ],
    "articleSlug": "espresso-basics",
    "glossaryTerm": "포터필터",
    "note": "에스프레소 머신에 장착해 커피를 담는, 손잡이 달린 바스켓 홀더입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "포터필터"
    }
  },
  {
    "id": "equipment:basket",
    "type": "equipment",
    "labels": {
      "ko": "바스켓",
      "en": "Basket"
    },
    "aliases": [
      "바스켓",
      "필터바스켓",
      "필터 바스켓",
      "basket",
      "filter basket"
    ],
    "parent": "equipment:portafilter",
    "articleSlug": "espresso-puck-preparation",
    "note": "커피가 담기는 구멍 뚫린 컵으로, 커피 오일이 쌓이면 산패한 향이 생길 수 있습니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "espresso-puck-preparation"
    }
  },
  {
    "id": "equipment:steam-wand",
    "type": "equipment",
    "labels": {
      "ko": "스팀 완드",
      "en": "Steam Wand"
    },
    "aliases": [
      "스팀 완드",
      "스팀완드",
      "스팀 노즐",
      "steam wand",
      "steam arm"
    ],
    "parent": "equipment:espresso-machine",
    "articleSlug": "cafe-quality-system",
    "note": "우유 잔류물이 남으면 미생물 위험이 커지므로 사용 후 세척 대상입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "cafe-quality-system"
    }
  },
  {
    "id": "equipment:milk-pitcher",
    "type": "equipment",
    "labels": {
      "ko": "스팀 피처",
      "en": "Milk Pitcher"
    },
    "aliases": [
      "스팀 피처",
      "스팀피처",
      "피처",
      "밀크 피처",
      "milk pitcher",
      "steam pitcher",
      "milk jug"
    ],
    "articleSlug": "milk-steaming",
    "note": "우유를 데우고 거품을 만드는 주입 용기로 세척 관리 대상에 포함됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "milk-steaming"
    }
  },
  {
    "id": "equipment:dripper",
    "type": "equipment",
    "labels": {
      "ko": "드리퍼",
      "en": "Dripper"
    },
    "aliases": [
      "드리퍼",
      "드립퍼",
      "dripper",
      "brew cone"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "형태와 배수 구조가 흐름 속도를 정하고 그것이 레시피의 성격을 정합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:dripper-cone",
    "type": "equipment",
    "labels": {
      "ko": "원뿔 드리퍼",
      "en": "Cone Dripper"
    },
    "aliases": [
      "원뿔 드리퍼",
      "원뿔드리퍼",
      "콘 드리퍼",
      "cone dripper",
      "v60",
      "하리오 v60",
      "hario v60",
      "고노",
      "kono"
    ],
    "parent": "equipment:dripper",
    "articleSlug": "brewing-gear-guide",
    "note": "큰 구멍 하나로 배수되어 붓는 속도가 맛에 크게 개입하는 자유도 높은 형태입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:dripper-flat-bottom",
    "type": "equipment",
    "labels": {
      "ko": "평바닥 드리퍼",
      "en": "Flat-bottom Dripper"
    },
    "aliases": [
      "평바닥 드리퍼",
      "평바닥드리퍼",
      "플랫바텀",
      "웨이브 드리퍼",
      "flat bottom dripper",
      "칼리타 웨이브",
      "kalita wave"
    ],
    "parent": "equipment:dripper",
    "articleSlug": "brewing-gear-guide",
    "note": "작은 구멍 여러 개로 물빠짐이 완만해 균일성을 확보하기 쉬운 형태입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:gooseneck-kettle",
    "type": "equipment",
    "labels": {
      "ko": "구즈넥 케틀",
      "en": "Gooseneck Kettle"
    },
    "aliases": [
      "구즈넥 케틀",
      "구즈넥",
      "백조목 케틀",
      "드립 포트",
      "gooseneck kettle",
      "gooseneck",
      "drip kettle"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "푸어오버에서 물줄기를 통제하는 사실상의 표준 도구입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:scale",
    "type": "equipment",
    "labels": {
      "ko": "저울",
      "en": "Scale"
    },
    "aliases": [
      "저울",
      "드립 스케일",
      "스케일",
      "scale",
      "coffee scale",
      "drip scale"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "0.1g 단위와 타이머 내장 여부가 실용 포인트로 꼽힙니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:paper-filter",
    "type": "equipment",
    "labels": {
      "ko": "종이 필터",
      "en": "Paper Filter"
    },
    "aliases": [
      "종이 필터",
      "종이필터",
      "페이퍼 필터",
      "paper filter"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "오일과 미분을 붙잡아 깔끔한 질감을 만들며 표백·두께에 따라 흐름이 달라집니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:metal-filter",
    "type": "equipment",
    "labels": {
      "ko": "금속 필터",
      "en": "Metal Filter"
    },
    "aliases": [
      "금속 필터",
      "금속필터",
      "메탈 필터",
      "metal filter",
      "mesh filter"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "오일을 통과시켜 바디를 무겁게 만드는 필터 유형입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:tds-meter",
    "type": "equipment",
    "labels": {
      "ko": "TDS 미터",
      "en": "TDS Meter"
    },
    "aliases": [
      "tds 미터",
      "tds미터",
      "굴절계",
      "리프랙토미터",
      "tds meter",
      "refractometer"
    ],
    "articleSlug": "brewing-gear-guide",
    "note": "용존 고형분을 빠르게 추정해 레시피를 숫자로 기록할 때 쓰는 보조 도구입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "brewing-gear-guide"
    }
  },
  {
    "id": "equipment:drum-roaster",
    "type": "equipment",
    "labels": {
      "ko": "드럼 로스터",
      "en": "Drum Roaster"
    },
    "aliases": [
      "드럼 로스터",
      "드럼로스터",
      "드럼형",
      "drum roaster"
    ],
    "articleSlug": "roaster-machine-types-comparison",
    "note": "열축적과 회전으로 곡선 제어가 유연하지만 관성 때문에 급격한 조절에 오차가 남습니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "드럼 로스터"
    }
  },
  {
    "id": "equipment:fluid-bed-roaster",
    "type": "equipment",
    "labels": {
      "ko": "플루이드베드 로스터",
      "en": "Fluid-bed Roaster"
    },
    "aliases": [
      "플루이드베드",
      "플루이드 베드",
      "유동층 로스터",
      "열풍식 로스터",
      "fluid bed roaster",
      "fluidbed",
      "air roaster"
    ],
    "articleSlug": "roaster-machine-types-comparison",
    "note": "입자와 공기 충돌이 강해 반응이 빠르지만 공기량 로그 관리가 선행되어야 합니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "플루이드베드"
    }
  },
  {
    "id": "equipment:direct-fire-roaster",
    "type": "equipment",
    "labels": {
      "ko": "직화 로스터",
      "en": "Direct-fire Roaster"
    },
    "aliases": [
      "직화 로스터",
      "직화로스터",
      "직화형",
      "직화",
      "direct fire roaster",
      "direct flame roaster"
    ],
    "articleSlug": "roaster-machine-types-comparison",
    "note": "반응을 체감하기 쉽지만 화염과 열원 분포 편차로 과열 구간이 생기기 쉽습니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "직화 로스터"
    }
  }
];
