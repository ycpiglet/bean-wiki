// Bean Wiki 정규 커피 어휘 — 규칙은 docs/VOCABULARY-IDS.md.
//
// 이 파일의 배열 리터럴은 순수 JSON입니다(키·문자열 모두 큰따옴표, 트레일링 콤마
// 없음, 배열 안에 주석 없음). scripts/check-vocabulary.mjs가 TS 툴체인 없이
// export 접두사를 잘라내고 JSON.parse 하기 때문입니다. 설명은 export 위에만 적습니다.
//
// 종·계통·품종. 종 수준(아라비카·카네포라·리베리카·엑셀사)과 그 아래의 계통을
// 같은 타입으로 두고 `parent`로 계층을 표현합니다.
//
// '로부스타'는 별도 엔티티가 아니라 variety:canephora의 alias입니다.
// coffee-plant-taxonomy가 두 표기의 혼용을 명시하고 있기 때문입니다.

import type { VocabularyEntity } from "./types";

export const varieties: VocabularyEntity[] = [
  {
    "id": "variety:arabica",
    "type": "variety",
    "labels": {
      "ko": "아라비카",
      "en": "Arabica"
    },
    "aliases": [
      "아라비카",
      "아라비까",
      "arabica",
      "coffea arabica",
      "c arabica",
      "arabika"
    ],
    "articleSlug": "arabica-and-robusta",
    "note": "상업 재배의 두 축 중 하나로, 향미 분화가 도드라지는 경향이 있다고 서술됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-plant-taxonomy"
    }
  },
  {
    "id": "variety:canephora",
    "type": "variety",
    "labels": {
      "ko": "카네포라",
      "en": "Canephora"
    },
    "aliases": [
      "카네포라",
      "카네포라종",
      "canephora",
      "coffea canephora",
      "c canephora",
      "로부스타",
      "로부스타종",
      "robusta"
    ],
    "articleSlug": "arabica-and-robusta",
    "note": "재배량과 강건성에서 유리한 종이며, 로부스타·카네포라 표기가 혼용됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-plant-taxonomy"
    }
  },
  {
    "id": "variety:liberica",
    "type": "variety",
    "labels": {
      "ko": "리베리카",
      "en": "Liberica"
    },
    "aliases": [
      "리베리카",
      "리베리까",
      "liberica",
      "coffea liberica",
      "c liberica"
    ],
    "articleSlug": "coffee-plant-taxonomy",
    "note": "상업 재배 비중은 제한적이지만 지역 브랜드성과 향미 실험에서 쓰인다고 서술됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-plant-taxonomy"
    }
  },
  {
    "id": "variety:excelsa",
    "type": "variety",
    "labels": {
      "ko": "엑셀사",
      "en": "Excelsa"
    },
    "aliases": [
      "엑셀사",
      "엑셀서",
      "excelsa",
      "coffea excelsa"
    ],
    "parent": "variety:liberica",
    "articleSlug": "coffee-plant-taxonomy",
    "note": "일부 분류에서 Liberica군 하위로 보며 명칭 해석이 기관·연도에 따라 달라집니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-plant-taxonomy"
    }
  },
  {
    "id": "variety:typica",
    "type": "variety",
    "labels": {
      "ko": "티피카",
      "en": "Typica"
    },
    "aliases": [
      "티피카",
      "티피까",
      "typica",
      "tipica"
    ],
    "parent": "variety:arabica",
    "articleSlug": "coffee-tipica-bourbon-lineage",
    "note": "동일 계열이 여러 농장으로 전파되며 관리·환경과 결합해 표현이 갈리는 계통입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "티피카"
    }
  },
  {
    "id": "variety:bourbon",
    "type": "variety",
    "labels": {
      "ko": "버번",
      "en": "Bourbon"
    },
    "aliases": [
      "버번",
      "부르봉",
      "버본",
      "bourbon",
      "borbon"
    ],
    "parent": "variety:arabica",
    "articleSlug": "coffee-tipica-bourbon-lineage",
    "note": "확산 과정에서 이름이 표준화되지 않은 구간이 있어 계통 단위 기록이 필요합니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "버번"
    }
  },
  {
    "id": "variety:geisha",
    "type": "variety",
    "labels": {
      "ko": "게이샤",
      "en": "Geisha"
    },
    "aliases": [
      "게이샤",
      "게샤",
      "기샤",
      "geisha",
      "gesha"
    ],
    "parent": "variety:arabica",
    "articleSlug": "coffee-varieties",
    "note": "아라비카 안의 서로 다른 계열을 가리키는 품종명 예시로 문서에 등장합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-varieties"
    }
  },
  {
    "id": "variety:catimor",
    "type": "variety",
    "labels": {
      "ko": "카티모르",
      "en": "Catimor"
    },
    "aliases": [
      "카티모르",
      "까티모르",
      "catimor"
    ],
    "articleSlug": "catimor-sarchimor-blight-resistance",
    "note": "녹병 대응을 중심으로 선발된 계열로, 품질 판단은 가공·건조 조건과 함께 평가합니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "카티모르"
    }
  },
  {
    "id": "variety:sarchimor",
    "type": "variety",
    "labels": {
      "ko": "사르치모르",
      "en": "Sarchimor"
    },
    "aliases": [
      "사르치모르",
      "사치모르",
      "sarchimor"
    ],
    "articleSlug": "catimor-sarchimor-blight-resistance",
    "note": "생산 안정성을 위해 선택되는 내병성 계열로 카티모르와 함께 다뤄집니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "사르치모르"
    }
  },
  {
    "id": "variety:f1-hybrid",
    "type": "variety",
    "labels": {
      "ko": "F1 하이브리드",
      "en": "F1 Hybrid"
    },
    "aliases": [
      "f1",
      "f1 하이브리드",
      "f1하이브리드",
      "f1 hybrid",
      "에프원 하이브리드",
      "1세대 잡종"
    ],
    "articleSlug": "f1-hybrid-coffee-breeding",
    "note": "서로 다른 부모 계통을 교배한 1세대 자손 집단으로, 세대가 바뀌면 형질이 다시 분열합니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "F1"
    }
  },
  {
    "id": "variety:ethiopian-heirloom",
    "type": "variety",
    "labels": {
      "ko": "에티오피아 재래종",
      "en": "Ethiopian Heirloom"
    },
    "aliases": [
      "재래종",
      "에티오피아 재래종",
      "heirloom",
      "ethiopian heirloom",
      "ethiopia heirloom",
      "하이룸",
      "헤어룸"
    ],
    "parent": "variety:arabica",
    "articleSlug": "ethiopian-heirloom-diversity",
    "note": "고정 라벨보다 산지 집단과 수집·전달 경로를 함께 보여주는 장치로 다루는 표기입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "heirloom"
    }
  }
];
