# 정규 커피 어휘 ID 규칙

Bean Wiki는 회사 앱들 사이에서 커피 도메인 용어 권위(vocabulary authority)입니다.
앱마다 `"에티오피아"`, `"Ethiopia"`, `"ETHIOPIA"`를 각자 문자열로 들고 있으면
상호작용이 성립하지 않으므로, 앱은 자유 문자열 대신 이 문서의 ID를 저장합니다.

- 데이터: `src/content/vocabulary/*.ts`
- 타입 계약: `src/content/vocabulary/types.ts`
- 가드레일: `scripts/check-vocabulary.mjs`
- 관련 문서: [플랫폼 상호운용 기획](./PLATFORM-INTEROP-PLAN.md),
  [커피체리 연동](./COFFEE-CHERRY-INTEGRATION.md)

## 1. ID 문법

```text
<type>:<kebab-ascii>
```

`type`은 7개로 고정입니다. `id`의 접두사는 `type` 필드와 반드시 같아야 합니다.

| type | 파일 | 예시 |
| --- | --- | --- |
| `origin` | `origins.ts` | `origin:et`, `origin:id-java` |
| `variety` | `varieties.ts` | `variety:canephora`, `variety:typica` |
| `process` | `processes.ts` | `process:washed`, `process:honey-red` |
| `flavor` | `flavors.ts` | `flavor:fruity`, `flavor:blueberry` |
| `method` | `methods.ts` | `method:pour-over`, `method:moka-pot` |
| `equipment` | `equipment.ts` | `equipment:grinder`, `equipment:burr-flat` |
| `defect` | `defects.ts` | `defect:channeling`, `defect:tipping` |

접두사 뒤는 `[a-z0-9-]+`만 허용합니다. 한글·대문자·밑줄·공백은 ID에 쓰지 않습니다.
사람이 읽는 이름은 `labels.ko` / `labels.en`이 담습니다.

### 1.1 origin 계층

산지는 두 단계입니다.

| 단계 | 형식 | 규칙 |
| --- | --- | --- |
| 국가 | `origin:<cc>` | `cc`는 ISO-3166 alpha-2 소문자 |
| 지역 | `origin:<cc>-<region>` | `parent`에 국가 ID를 반드시 지정 |

예: `origin:id` → `origin:id-java`, `origin:ye` → `origin:ye-mokha`.

### 1.2 그 밖의 계층

`parent`는 origin 전용이 아닙니다. 같은 타입 안에서 위계를 표현할 때 씁니다.

| 예 | 의미 |
| --- | --- |
| `flavor:blueberry` → `flavor:berry` → `flavor:fruity` | 향미 휠의 안쪽→바깥쪽 위계 |
| `process:honey-black` → `process:honey` | 점액 잔존량에 따른 하위 유형 |
| `method:french-press` → `method:immersion` | 추출 3원리 아래의 개별 방식 |
| `equipment:burr-flat` → `equipment:burr` → `equipment:grinder` | 장비와 부품 |

순환 참조는 빌드 실패입니다.

## 2. 불변성과 폐기

| 상황 | 조치 |
| --- | --- |
| 이름이 바뀌었다 | `labels`를 고칩니다. ID는 그대로 둡니다 |
| 표기가 하나 더 생겼다 | `aliases`에 추가합니다. 새 엔티티를 만들지 않습니다 |
| 개념이 잘못 쪼개져 있었다 | 흡수되는 쪽을 `deprecated` + `replacedBy`로 두고 alias를 남은 쪽으로 옮깁니다 |
| 더 이상 쓰지 않는다 | 삭제하지 않고 `deprecated` + `replacedBy` |

- **ID는 발행 이후 불변입니다.** 외부 앱 DB에 이미 저장된 값이기 때문입니다.
- **삭제하지 않습니다.** `src/content/redirects.json`이 문서 슬러그에 쓰는 것과
  같은 철학입니다.
- `status`는 `canonical` 또는 `deprecated`입니다. `deprecated`는 `replacedBy`가
  필수이고, `replacedBy`가 다시 `deprecated`를 가리키면 실패입니다(체인 금지).
- `resolveEntity()`는 `deprecated` 히트를 `replacedBy`로 한 번 따라가므로,
  호출자는 항상 살아 있는 엔티티를 받습니다.

## 3. alias와 `/knowledge/v1/resolve`

`aliases`는 표시용 이름이 아니라 **매칭 키**입니다. 스캔된 테이스팅 카드, 다른 앱의
`raw_value`, 오탈자를 정규 ID로 접기 위한 후보 목록입니다.

```text
GET /api/knowledge/v1/resolve?q=ETHIOPIA
  → normalizeQuery("ETHIOPIA") = "ethiopia"
  → aliasIndex.get("ethiopia") = origin:et
```

정규화 함수는 `src/content/vocabulary/types.ts`의 `normalizeQuery()` 하나입니다.
alias를 만들 때와 질의를 받을 때 같은 함수를 씁니다.

| 단계 | 처리 |
| --- | --- |
| `trim()` | 앞뒤 공백 제거 |
| `toLowerCase()` | 대문자 OCR 결과 흡수 |
| `normalize("NFKC")` | 전각·호환 문자 통일 |
| `[\s_]+` → 공백 하나 | 공백·밑줄 편차 흡수 |
| `.,;:!?'"()[]{}` 제거 | 문장부호 제거 |

규칙:

- alias는 이미 정규화된 형태로 적습니다. `alias !== normalizeQuery(alias)`면 실패입니다.
  즉 소문자여야 하고, 연속 공백·문장부호를 넣지 않습니다.
- 하이픈(`-`), 가운뎃점(`·`), 슬래시(`/`)는 정규화가 지우지 않으므로 alias에 그대로 남습니다.
- **하나의 alias는 하나의 canonical만 가리킵니다.** `labels.ko`, `labels.en`,
  `aliases`를 모두 정규화해 한 공간에 넣고 충돌을 검사합니다. 라벨끼리의 충돌도
  실패입니다(예: `process:honey`의 영문 라벨을 `Honey`로 두면 `flavor:honey-note`와
  충돌하므로 `Honey Process`로 둡니다).
- 한국어·영어 표기와 함께 흔한 오탈자·구표기를 넣습니다(`콜롬비아`/`columbia`,
  `에스프레소`/`expresso`, `게이샤`/`gesha`).
- **모호한 문자열은 넣지 않습니다.** 예: `모카`는 예멘 산지·모카포트·초콜릿 향
  중 무엇인지 판정할 수 없으므로 어느 엔티티에도 넣지 않았습니다. 미스로 남아
  `resolve_misses`에 적히는 편이, 틀린 엔티티로 접히는 것보다 낫습니다.

## 4. 엔티티 추가 절차

1. **근거를 먼저 찾습니다.** 추측으로 채우지 않습니다. `source`는 넷 중 하나여야
   하고, 실제로 존재해야 합니다.

   | `source.kind` | `ref` | 검증 대상 |
   | --- | --- | --- |
   | `article` | 문서 슬러그 | `src/content/articles/index.ts`의 `"slug"` |
   | `glossary` | 용어 | `src/content/glossary.ts`의 `term` |
   | `category` | 분류명 | `src/content/categories.ts`의 `name` |
   | `tag` | 태그 | `src/content/articles/*.html`의 `tags:` |

   근거를 댈 수 없으면 엔티티를 만들지 않습니다. `src/content/topic-plan.ts`에
   계획으로만 적힌 항목은 근거가 아닙니다. 문서가 실제로 생긴 뒤에 추가합니다.

2. 해당 타입의 파일을 열고 배열에 항목을 추가합니다. **배열 리터럴은 순수 JSON을
   유지합니다** — 키와 문자열은 큰따옴표, 트레일링 콤마 없음, 배열 안에 주석 없음.
   설명이 필요하면 `export` 문 위에만 적습니다. `check-vocabulary.mjs`가 TS 툴체인
   없이 이 배열을 `JSON.parse` 하기 때문입니다.

3. 필드를 채웁니다.

   | 필드 | 필수 | 비고 |
   | --- | --- | --- |
   | `id` | O | 1절 문법, 불변 |
   | `type` | O | `id` 접두사와 일치 |
   | `labels.ko` / `labels.en` | O | 다른 앱 UI에 그대로 노출됨 |
   | `aliases` | O | 3절 규칙. 빈 배열도 문법적으로는 허용 |
   | `status` | O | 기본은 `canonical` |
   | `source` | O | 4-1의 표 |
   | `parent` | | 상위 엔티티 ID |
   | `articleSlug` | | 존재하는 슬러그만. 위키 딥링크에 씁니다 |
   | `glossaryTerm` | | `glossary.ts`의 `term`과 정확히 일치 |
   | `note` | | 한 줄. 다른 앱 UI에 보여도 안전한 문장 |
   | `replacedBy` | | `status`가 `deprecated`일 때 필수 |

4. `index.ts`는 파일 단위로 import하므로, **새 파일을 만들 때만** import를 추가합니다.

5. `node scripts/check-vocabulary.mjs`와 `npx tsc --noEmit`을 통과시킵니다.

## 5. check-vocabulary.mjs가 보장하는 것

의존성 없는 순수 Node ESM입니다. 실패 시 비정상 종료하고 항목별 메시지를 출력합니다.

| 검사 | 실패 조건 |
| --- | --- |
| ID 중복 | 같은 `id`가 두 번 등장 |
| ID 형식 | `/^(origin\|variety\|process\|flavor\|method\|equipment\|defect):[a-z0-9-]+$/` 위반 |
| 접두사 일치 | `id` 접두사 ≠ `type` |
| 라벨 | `labels.ko` 또는 `labels.en` 누락 |
| alias 정규화 | `alias !== normalizeQuery(alias)` |
| alias 충돌 | 정규화 후 같은 키가 두 엔티티에 속함(라벨 포함) |
| `parent` | 없는 ID를 가리킴, 자기 자신, 순환 |
| `articleSlug` | `articles/index.ts`에 없는 슬러그 |
| `glossaryTerm` | `glossary.ts`에 없는 용어 |
| `status` | `canonical`/`deprecated` 외의 값, `canonical`인데 `replacedBy`가 있음 |
| 폐기 계약 | `deprecated`인데 `replacedBy` 없음, `replacedBy`가 없거나 그것도 `deprecated` |
| `source` | 누락, 알 수 없는 `kind`, 저장소에 없는 `ref` |
| JSON 형식 | 배열 리터럴을 `JSON.parse` 할 수 없음 |
| `index.ts` | `vocabulary`·`byId`·`aliasIndex`·`entitiesOfType` 미export, 데이터 파일 미import |

성공 시 한 줄로 요약합니다.

```text
✓ check-vocabulary: 117 entities (9 origin, 11 variety, 10 process, 34 flavor, 15 method, 20 equipment, 18 defect), 653 match keys, 0 alias collisions
```

`normalizeQuery()`는 `types.ts`와 이 스크립트에 각각 있습니다(스크립트가 TS를 읽지
못하므로). 한쪽을 바꾸면 다른 쪽도 함께 바꿉니다.

## 6. 현재 커버리지와 공백

어휘는 이 저장소가 **실제로 문서화한 범위**만 담습니다. 지금 가장 얇은 축은 산지입니다.

| type | 수 | 비고 |
| --- | --- | --- |
| `origin` | 9 | 국가 7 + 지역 2. 문서가 이름을 명시한 산지만 |
| `variety` | 11 | 종 4 + 계통 7. `로부스타`는 `variety:canephora`의 alias |
| `process` | 10 | 허니 하위 3종 포함 |
| `flavor` | 34 | 향미 휠 위계 + 커핑 폼/CVA 속성 |
| `method` | 15 | 추출 3원리 + 개별 방식 12 |
| `equipment` | 20 | 추출 도구·에스프레소 부품·로스터기 유형 |
| `defect` | 18 | 물성·감각·로스팅·추출 결함 |

`topic-plan.ts`가 계획으로 잡아 둔 산지(과테말라, 코스타리카, 엘살바도르, 온두라스,
파나마, 우간다, 인도, 시다마, 예가체페, 구지, 짐마, 세라도, 술 데 미나스, 모지아나,
수마트라, 술라웨시)는 해당 문서가 게시되면 그때 추가합니다. 이 공백은 숨기지 않고,
`/resolve` 미스 로그로 수요를 확인하는 것이 Phase 3 요청 큐의 입력입니다.

용어집 항목 중 7개 타입에 속하지 않는 것(디개싱, 블룸, TDS, 수율, 브루 비율, 도징,
탬핑, 크레마, 프리인퓨전, 감량률, 배전도, 1차 크랙, 마이야르 반응, DTR, CVA,
Q 그레이더, 트라이앵귤레이션, 캘리브레이션, 디스크립터 등)은 어휘가 아니라
`/knowledge/v1/terms`가 제공합니다. 억지로 엔티티화하지 않습니다.
