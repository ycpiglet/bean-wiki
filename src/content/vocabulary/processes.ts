// Bean Wiki 정규 커피 어휘 — 규칙은 docs/VOCABULARY-IDS.md.
//
// 이 파일의 배열 리터럴은 순수 JSON입니다(키·문자열 모두 큰따옴표, 트레일링 콤마
// 없음, 배열 안에 주석 없음). scripts/check-vocabulary.mjs가 TS 툴체인 없이
// export 접두사를 잘라내고 JSON.parse 하기 때문입니다. 설명은 export 위에만 적습니다.
//
// 수확 후 가공 방식. 허니 계열은 점액 잔존량에 따른 하위 유형을 `parent`로 묶습니다.

import type { VocabularyEntity } from "./types";

export const processes: VocabularyEntity[] = [
  {
    "id": "process:washed",
    "type": "process",
    "labels": {
      "ko": "워시드",
      "en": "Washed"
    },
    "aliases": [
      "워시드",
      "워시트",
      "수세식",
      "습식",
      "washed",
      "wet process",
      "fully washed"
    ],
    "articleSlug": "coffee-processing",
    "glossaryTerm": "워시드",
    "note": "과육과 점액질을 물로 씻어 제거한 뒤 파치먼트 상태로 건조하는 가공 방식입니다.",
    "status": "canonical",
    "source": {
      "kind": "glossary",
      "ref": "워시드"
    }
  },
  {
    "id": "process:natural",
    "type": "process",
    "labels": {
      "ko": "내추럴",
      "en": "Natural"
    },
    "aliases": [
      "내추럴",
      "네추럴",
      "건식",
      "natural",
      "dry process",
      "natural process"
    ],
    "articleSlug": "coffee-processing",
    "note": "과육이 붙은 상태에서 건조를 진행하는 방식으로 수분 변화 관리가 특히 중요합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-processing"
    }
  },
  {
    "id": "process:honey",
    "type": "process",
    "labels": {
      "ko": "허니 가공",
      "en": "Honey Process"
    },
    "aliases": [
      "허니",
      "허니 가공",
      "허니프로세스",
      "허니 프로세스",
      "honey process",
      "honey processed"
    ],
    "articleSlug": "honey-pulped-natural-processing",
    "note": "점액질을 일부 남긴 채 건조하는 계열로, 점액량과 건조 관리가 일관성을 가릅니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "허니"
    }
  },
  {
    "id": "process:honey-yellow",
    "type": "process",
    "labels": {
      "ko": "옐로우 허니",
      "en": "Yellow Honey"
    },
    "aliases": [
      "옐로우 허니",
      "옐로허니",
      "yellow honey"
    ],
    "parent": "process:honey",
    "articleSlug": "honey-pulped-natural-processing",
    "note": "점액 잔존이 낮은 유형으로 짧은 건조 구간과 환기 균형이 관리 포인트입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "honey-pulped-natural-processing"
    }
  },
  {
    "id": "process:honey-red",
    "type": "process",
    "labels": {
      "ko": "레드 허니",
      "en": "Red Honey"
    },
    "aliases": [
      "레드 허니",
      "레드허니",
      "red honey"
    ],
    "parent": "process:honey",
    "articleSlug": "honey-pulped-natural-processing",
    "note": "점액 잔존이 중간인 유형으로 표면 당분 이동 모니터링이 필요합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "honey-pulped-natural-processing"
    }
  },
  {
    "id": "process:honey-black",
    "type": "process",
    "labels": {
      "ko": "블랙 허니",
      "en": "Black Honey"
    },
    "aliases": [
      "블랙 허니",
      "블랙허니",
      "black honey"
    ],
    "parent": "process:honey",
    "articleSlug": "honey-pulped-natural-processing",
    "note": "점액 잔존이 높은 유형으로 표면 과발효와 균일 건조 난이도가 올라갑니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "honey-pulped-natural-processing"
    }
  },
  {
    "id": "process:pulped-natural",
    "type": "process",
    "labels": {
      "ko": "펄프드 내추럴",
      "en": "Pulped Natural"
    },
    "aliases": [
      "펄프드 내추럴",
      "펄프드내추럴",
      "펄프드 네추럴",
      "pulped natural"
    ],
    "articleSlug": "honey-pulped-natural-processing",
    "note": "점액 잔존이 매우 높아 교반·건조 프로파일을 분리해 관리해야 하는 유형입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "펄프드 내추럴"
    }
  },
  {
    "id": "process:anaerobic",
    "type": "process",
    "labels": {
      "ko": "무산소 발효 가공",
      "en": "Anaerobic Fermentation"
    },
    "aliases": [
      "무산소",
      "무산소 가공",
      "무산소 발효",
      "혐기 발효",
      "anaerobic",
      "anaerobic fermentation",
      "anaerobic process"
    ],
    "articleSlug": "anaerobic-coffee-processing",
    "note": "산소 노출을 줄여 특정 반응 경로를 선호시키는 방식이며 무균 가공이 아닙니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "무산소 가공"
    }
  },
  {
    "id": "process:wet-hulling",
    "type": "process",
    "labels": {
      "ko": "웻 헐링",
      "en": "Wet Hulling"
    },
    "aliases": [
      "웻 헐링",
      "웻헐링",
      "웨트 헐링",
      "wet hulling",
      "wet hulled",
      "giling basah"
    ],
    "articleSlug": "wet-hulling",
    "note": "파치먼트 제거 시점과 탈수 상태가 생두 물성·감각 편차를 크게 바꾸는 공정입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "웻 헐링"
    }
  },
  {
    "id": "process:decaffeination",
    "type": "process",
    "labels": {
      "ko": "디카페인 가공",
      "en": "Decaffeination"
    },
    "aliases": [
      "디카페인",
      "디카프",
      "카페인 제거",
      "decaf",
      "decaffeinated",
      "decaffeination"
    ],
    "articleSlug": "caffeine-and-health",
    "note": "생두에서 카페인의 대부분을 제거하지만 소량이 남을 수 있는 공정입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "디카페인"
    }
  }
];
