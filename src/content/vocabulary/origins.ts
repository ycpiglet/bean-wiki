// Bean Wiki 정규 커피 어휘 — 규칙은 docs/VOCABULARY-IDS.md.
//
// 이 파일의 배열 리터럴은 순수 JSON입니다(키·문자열 모두 큰따옴표, 트레일링 콤마
// 없음, 배열 안에 주석 없음). scripts/check-vocabulary.mjs가 TS 툴체인 없이
// export 접두사를 잘라내고 JSON.parse 하기 때문입니다. 설명은 export 위에만 적습니다.
//
// 커피 산지. 국가 수준은 ISO-3166 alpha-2 소문자를 키로 쓰고, 하위 지역은
// `origin:<cc>-<region>` 형태로 `parent`에 국가를 지정합니다.
//
// 이 목록은 이 저장소가 실제로 문서화한 산지만 담습니다. topic-plan.ts에 계획으로만
// 적힌 산지(과테말라·코스타리카·시다마·예가체페 등)는 문서가 생기면 추가합니다.

import type { VocabularyEntity } from "./types";

export const origins: VocabularyEntity[] = [
  {
    "id": "origin:et",
    "type": "origin",
    "labels": {
      "ko": "에티오피아",
      "en": "Ethiopia"
    },
    "aliases": [
      "에티오피아",
      "이디오피아",
      "에디오피아",
      "ethiopia",
      "ethiopian",
      "ethiopie",
      "et",
      "eth"
    ],
    "articleSlug": "ethiopian-heirloom-diversity",
    "note": "아라비카의 생물학적 기원과 유전적 다양성의 중심으로 서술되는 산지입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "에티오피아"
    }
  },
  {
    "id": "origin:ke",
    "type": "origin",
    "labels": {
      "ko": "케냐",
      "en": "Kenya"
    },
    "aliases": [
      "케냐",
      "케니아",
      "kenya",
      "kenyan",
      "ke",
      "ken"
    ],
    "articleSlug": "kenya-coffee-system",
    "note": "재배·협동조합·경매·가공이 하나의 시스템으로 묶여 가격과 품질 신호를 만드는 산지입니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "케냐"
    }
  },
  {
    "id": "origin:co",
    "type": "origin",
    "labels": {
      "ko": "콜롬비아",
      "en": "Colombia"
    },
    "aliases": [
      "콜롬비아",
      "콜럼비아",
      "코롬비아",
      "colombia",
      "colombian",
      "columbia",
      "co",
      "col"
    ],
    "articleSlug": "columbia-harvest-cycle",
    "note": "주수확(main crop)과 부수확(mitaca)이 한 해에 이어지는 다중 수확 구조를 가집니다.",
    "status": "canonical",
    "source": {
      "kind": "tag",
      "ref": "콜롬비아"
    }
  },
  {
    "id": "origin:br",
    "type": "origin",
    "labels": {
      "ko": "브라질",
      "en": "Brazil"
    },
    "aliases": [
      "브라질",
      "브라실",
      "brazil",
      "brasil",
      "brazilian",
      "br",
      "bra"
    ],
    "articleSlug": "global-coffee-history",
    "note": "19세기에 세계 생산의 중심으로 성장한 산지로 커피 세계사에서 서술됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "global-coffee-history"
    }
  },
  {
    "id": "origin:ye",
    "type": "origin",
    "labels": {
      "ko": "예멘",
      "en": "Yemen"
    },
    "aliases": [
      "예멘",
      "yemen",
      "yemeni",
      "ye",
      "yem"
    ],
    "articleSlug": "global-coffee-history",
    "note": "15세기 무렵 음료 문화 기록과 홍해 교역망의 출발점으로 서술되는 산지입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "global-coffee-history"
    }
  },
  {
    "id": "origin:id",
    "type": "origin",
    "labels": {
      "ko": "인도네시아",
      "en": "Indonesia"
    },
    "aliases": [
      "인도네시아",
      "인도네시야",
      "indonesia",
      "indonesian",
      "id",
      "idn"
    ],
    "articleSlug": "wet-hulling",
    "note": "웻 헐링 공정이 널리 쓰이는 산지권으로 서술됩니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "wet-hulling"
    }
  },
  {
    "id": "origin:vn",
    "type": "origin",
    "labels": {
      "ko": "베트남",
      "en": "Vietnam"
    },
    "aliases": [
      "베트남",
      "월남",
      "vietnam",
      "viet nam",
      "vietnamese",
      "vn",
      "vnm"
    ],
    "articleSlug": "coffee-drink-taxonomy",
    "note": "핀 필터와 연유를 쓰는 카페 쓰어다의 음료 문맥으로 문서에 등장합니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "coffee-drink-taxonomy"
    }
  },
  {
    "id": "origin:id-java",
    "type": "origin",
    "labels": {
      "ko": "자바",
      "en": "Java"
    },
    "aliases": [
      "자바",
      "자바섬",
      "java",
      "jawa"
    ],
    "parent": "origin:id",
    "articleSlug": "global-coffee-history",
    "note": "유럽 열강이 예멘의 공급 독점을 벗어나기 위해 생산을 확대한 초기 이식지입니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "global-coffee-history"
    }
  },
  {
    "id": "origin:ye-mokha",
    "type": "origin",
    "labels": {
      "ko": "예멘 모카",
      "en": "Mokha (Yemen)"
    },
    "aliases": [
      "모카항",
      "모카 항",
      "mokha",
      "al mokha",
      "mokha port"
    ],
    "parent": "origin:ye",
    "articleSlug": "global-coffee-history",
    "note": "커피 수출의 핵심 항구였고 항구 이름이 유럽에서 산지·음료를 가리키는 말로 확장되었습니다.",
    "status": "canonical",
    "source": {
      "kind": "article",
      "ref": "global-coffee-history"
    }
  }
];
