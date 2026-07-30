// Bean Wiki 정규 커피 어휘 — 규칙은 docs/VOCABULARY-IDS.md.
//
// 이 파일의 배열 리터럴은 순수 JSON입니다(키·문자열 모두 큰따옴표, 트레일링 콤마
// 없음, 배열 안에 주석 없음). scripts/check-vocabulary.mjs가 TS 툴체인 없이
// export 접두사를 잘라내고 JSON.parse 하기 때문입니다. 설명은 export 위에만 적습니다.
//
// 결점과 결함. 생두 물성 결함, 컵에서 드러나는 감각 결함, 로스팅 결함,
// 추출 결함을 하나의 타입으로 모읍니다. 물성/감각 두 상위 분류는
// green-bean-grading-defects의 구분을 따릅니다.

import type { VocabularyEntity } from "./types";

export const defects: VocabularyEntity[] = [
  {
    "id": "defect:physical",
    "type": "defect",
    "labels": {
      "ko": "물성 결함",
      "en": "Physical Defect"
    },
    "aliases": [
      "물성 결함",
      "물리 결점",
      "디펙트",
      "결점두",
      "physical defect",
      "defect"
    ],
    "articleSlug": "green-bean-grading-defects",
    "glossaryTerm": "디펙트",
    "note": "눈으로 구분되는 결점으로 선별과 공정 단계에서 더 빨리 관리할 수 있습니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "디펙트"
    }
  },
  {
    "id": "defect:sensory",
    "type": "defect",
    "labels": {
      "ko": "감각 결함",
      "en": "Sensory Defect"
    },
    "aliases": [
      "감각 결함",
      "감각 결점",
      "컵 결점",
      "sensory defect",
      "cup defect"
    ],
    "articleSlug": "sensory-defect-diagnosis",
    "note": "로스팅·추출 후 컵에서 드러나며 노출 강도가 로스팅 곡선과 추출 방식에 따라 달라집니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "green-bean-grading-defects"
    }
  },
  {
    "id": "defect:broken-bean",
    "type": "defect",
    "labels": {
      "ko": "파손두",
      "en": "Broken Bean"
    },
    "aliases": [
      "파손두",
      "파손",
      "깨진 콩",
      "broken bean",
      "broken beans"
    ],
    "parent": "defect:physical",
    "articleSlug": "green-bean-grading-defects",
    "note": "물성 결함 항목으로, 결점 빈도가 허용치를 반복 초과하면 로트 분할을 판단합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "green-bean-grading-defects"
    }
  },
  {
    "id": "defect:mold-spot",
    "type": "defect",
    "labels": {
      "ko": "곰팡이 반점",
      "en": "Mold Spot"
    },
    "aliases": [
      "곰팡이 반점",
      "곰팡이반점",
      "곰팡이",
      "mold spot",
      "mould spot",
      "mold"
    ],
    "parent": "defect:physical",
    "articleSlug": "green-bean-grading-defects",
    "note": "물성 결함 항목이며 과습 보관에서 위험이 커집니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "green-bean-grading-defects"
    }
  },
  {
    "id": "defect:under-dried",
    "type": "defect",
    "labels": {
      "ko": "과소건조",
      "en": "Under-dried"
    },
    "aliases": [
      "과소건조",
      "건조 부족",
      "under dried",
      "underdried",
      "insufficient drying"
    ],
    "parent": "defect:physical",
    "articleSlug": "green-bean-grading-defects",
    "note": "물성 결함 항목으로 건조 편차가 저장 안정성까지 끌고 내려갑니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "green-bean-grading-defects"
    }
  },
  {
    "id": "defect:contamination",
    "type": "defect",
    "labels": {
      "ko": "오염·이물질",
      "en": "Contamination"
    },
    "aliases": [
      "오염",
      "이물질",
      "협잡물",
      "contamination",
      "foreign matter"
    ],
    "parent": "defect:physical",
    "articleSlug": "green-bean-grading-defects",
    "note": "입고 단계에서 성숙도와 함께 빠르게 구분해야 하는 물성 결함 항목입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "green-bean-grading-defects"
    }
  },
  {
    "id": "defect:unripe-cherry",
    "type": "defect",
    "labels": {
      "ko": "덜 익은 체리",
      "en": "Unripe Cherry"
    },
    "aliases": [
      "덜 익은 체리",
      "미성숙 체리",
      "미숙두",
      "언라이프",
      "unripe cherry",
      "immature cherry"
    ],
    "articleSlug": "post-harvest-processing-map",
    "note": "병든 체리·과숙 체리와 함께 동일 라인으로 처리하지 않는 입고 선별 대상입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "post-harvest-processing-map"
    }
  },
  {
    "id": "defect:ferment-taint",
    "type": "defect",
    "labels": {
      "ko": "발효취",
      "en": "Ferment Taint"
    },
    "aliases": [
      "발효취",
      "과발효취",
      "발효 냄새",
      "ferment taint",
      "fermented taint",
      "over fermented"
    ],
    "parent": "defect:sensory",
    "articleSlug": "green-bean-grading-defects",
    "note": "건조 과정이 고르지 않으면 생길 수 있는 불쾌한 발효 향입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-cherry-to-bean"
    }
  },
  {
    "id": "defect:burnt-taint",
    "type": "defect",
    "labels": {
      "ko": "과산화·타는 향",
      "en": "Burnt Taint"
    },
    "aliases": [
      "과산화",
      "타는 향",
      "타는향",
      "탄맛",
      "탄 향",
      "burnt taint",
      "burnt"
    ],
    "parent": "defect:sensory",
    "articleSlug": "sensory-defect-diagnosis",
    "note": "구운 냄새와 탄맛이 지속되는 신호로, 추출 시간 과다나 높은 열·시간 조합이 후보입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-defect-diagnosis"
    }
  },
  {
    "id": "defect:metallic-taint",
    "type": "defect",
    "labels": {
      "ko": "메탈릭·화학향",
      "en": "Metallic Taint"
    },
    "aliases": [
      "메탈릭",
      "금속성 향",
      "화학향",
      "metallic taint",
      "metallic",
      "chemical taint"
    ],
    "parent": "defect:sensory",
    "articleSlug": "sensory-defect-diagnosis",
    "note": "금속성·기름성 찔림 신호로 세척, 금속 마모, 물질 이동이 원인 후보입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-defect-diagnosis"
    }
  },
  {
    "id": "defect:flat-aroma",
    "type": "defect",
    "labels": {
      "ko": "무딘 향",
      "en": "Flat Aroma"
    },
    "aliases": [
      "무딘 향",
      "무딘향",
      "플랫 아로마",
      "flat aroma",
      "flat",
      "dull aroma"
    ],
    "parent": "defect:sensory",
    "articleSlug": "sensory-defect-diagnosis",
    "note": "원래 향미가 상쇄되고 단조로워지는 신호로 추출 저강도가 원인 후보입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "sensory-defect-diagnosis"
    }
  },
  {
    "id": "defect:staling",
    "type": "defect",
    "labels": {
      "ko": "산패",
      "en": "Staling"
    },
    "aliases": [
      "산패",
      "산화 열화",
      "스테일",
      "staling",
      "stale",
      "rancidity"
    ],
    "articleSlug": "coffee-storage",
    "note": "산소와 반응해 향이 무디어지는 변화로 산소·습기·빛·열을 줄여 늦춥니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-storage"
    }
  },
  {
    "id": "defect:channeling",
    "type": "defect",
    "labels": {
      "ko": "채널링",
      "en": "Channeling"
    },
    "aliases": [
      "채널링",
      "채널",
      "channeling",
      "channelling"
    ],
    "articleSlug": "permeability-channeling-control",
    "glossaryTerm": "채널링",
    "note": "커피층의 밀도 차이로 물이 특정 경로로 몰려 균일한 추출을 방해하는 현상입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "채널링"
    }
  },
  {
    "id": "defect:over-extraction",
    "type": "defect",
    "labels": {
      "ko": "오버추출",
      "en": "Over-extraction"
    },
    "aliases": [
      "오버추출",
      "과다추출",
      "과추출",
      "over extraction",
      "overextraction",
      "over extracted"
    ],
    "articleSlug": "extraction-basics",
    "glossaryTerm": "오버추출",
    "note": "성분이 지나치게 많이 녹아 쓴맛과 잡미가 두드러지는 상태입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "오버추출"
    }
  },
  {
    "id": "defect:under-extraction",
    "type": "defect",
    "labels": {
      "ko": "언더추출",
      "en": "Under-extraction"
    },
    "aliases": [
      "언더추출",
      "과소추출",
      "미추출",
      "under extraction",
      "underextraction",
      "under extracted"
    ],
    "articleSlug": "extraction-basics",
    "glossaryTerm": "언더추출",
    "note": "성분이 충분히 녹지 않아 날카로운 신맛이나 밋밋함이 남는 상태입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "언더추출"
    }
  },
  {
    "id": "defect:scorching",
    "type": "defect",
    "labels": {
      "ko": "스코칭",
      "en": "Scorching"
    },
    "aliases": [
      "스코칭",
      "스코치",
      "scorching",
      "scorched"
    ],
    "articleSlug": "roast-profile-design",
    "note": "드럼 표면 온도가 함께 올라 콩 표면을 태우는 로스팅 결함입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "roast-profile-design"
    }
  },
  {
    "id": "defect:tipping",
    "type": "defect",
    "labels": {
      "ko": "티핑",
      "en": "Tipping"
    },
    "aliases": [
      "티핑",
      "팁핑",
      "tipping",
      "tipped"
    ],
    "articleSlug": "roast-profile-design",
    "note": "초기 화력을 급히 올릴 때 콩 끝이 타는 로스팅 결함입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "roast-profile-design"
    }
  },
  {
    "id": "defect:baked",
    "type": "defect",
    "labels": {
      "ko": "베이크드",
      "en": "Baked"
    },
    "aliases": [
      "베이크드",
      "베이키드",
      "baked",
      "bake"
    ],
    "articleSlug": "roast-profile-design",
    "note": "ROR 급락이나 1차 크랙 후 반등 같은 급격한 변동과 연관 지어 관리하는 향미 결함입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "roast-profile-design"
    }
  }
];
