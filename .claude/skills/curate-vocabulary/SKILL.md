---
name: curate-vocabulary
description: 정규 커피 어휘 엔티티를 추가·폐기·정리. 사용자가 어휘 ID 추가, alias 보강, 엔티티 폐기, 산지·품종·가공 커버리지 확장을 요청하면 사용. 인자로 타입과 대상(선택)을 받는다.
---

# 어휘 큐레이션 하네스

`docs/VOCABULARY-IDS.md`(정본)의 규칙대로 `src/content/vocabulary/*.ts`를
고치는 스킬입니다. 이 어휘는 다른 앱 DB에 저장된 값이므로, 문서 편집이 아니라
**공개 계약 변경**으로 다룹니다.

## 이 브랜치의 커버리지 상태 — 먼저 읽을 것

이 워크트리에는 커밋된 문서가 **98편**이고, 약 **53편이 다른 브랜치에서 작성
중**입니다. 그래서 어휘는 의도적으로 좁습니다(`origin` 9개 = 국가 7 + 지역 2,
전체 117개). `docs/VOCABULARY-IDS.md` §6이 계획만 있고 문서가 없어 보류한 산지를
열거합니다(과테말라·코스타리카·엘살바도르·온두라스·파나마·우간다·인도·시다마·
예가체페·구지·짐마·세라도·모지아나·수마트라·술라웨시 등).

따라서:

- **"근거 문서가 없다"고 결론 내리기 전에 반드시 현재 문서 목록을 다시 확인한다.**
  `src/content/articles/index.ts`의 `"slug"`와 `ls src/content/articles/*.html`을
  직접 본다. 기억이나 이 문서의 목록을 근거로 삼지 않는다.
- 진행 중인 53편이 머지되면 **어휘를 다시 열어야 한다.** 새로 생긴 지역 문서마다
  `origin:<cc>-<region>` 후보가 생기고, 품종·가공 문서도 같다.
- 머지 전에 미리 엔티티를 만들지 않는다. `articleSlug`와 `source`가 존재하지 않아
  `check-vocabulary.mjs`가 실패한다. 순서는 **문서 먼저, 어휘 나중**이다.

## 절차

1. **근거 확인**: 대상 개념을 설명하는 저장소 콘텐츠를 먼저 찾는다. `source`는
   넷 중 하나이고 실제로 존재해야 한다.

   | `source.kind` | `ref` | 검증 대상 |
   | --- | --- | --- |
   | `article` | 문서 슬러그 | `src/content/articles/index.ts`의 `"slug"` |
   | `glossary` | 용어 | `src/content/glossary.ts`의 `term` |
   | `category` | 분류명 | `src/content/categories.ts`의 `name` |
   | `tag` | 태그 | `src/content/articles/*.html`의 `tags:` |

   근거가 없으면 엔티티를 만들지 않는다. `topic-plan.ts`의 계획 항목은 근거가
   아니다. **커피 사실을 새로 만들어 내는 것은 금지**다 — 이 스킬은 저장소가 이미
   문서화한 것에 ID를 붙이는 작업이고, 지식을 생산하는 작업이 아니다.
   근거가 없는데 수요가 있다면 어휘가 아니라 `write-article` 스킬로 넘긴다.

2. **중복 확인**: `normalizeQuery()`(`src/content/vocabulary/types.ts`)를 적용한
   키가 이미 다른 엔티티의 라벨·alias에 있는지 확인한다. 있으면 새 엔티티가 아니라
   **기존 엔티티에 alias를 추가**한다. 표기가 하나 더 생긴 것은 새 개념이 아니다.

3. **작성**: 해당 타입 파일의 배열에 항목을 추가한다. 배열 리터럴은 **순수 JSON**을
   유지한다 — 키·문자열 큰따옴표, 트레일링 콤마 없음, 배열 안 주석 없음. 설명은
   `export` 문 위에만. `check-vocabulary.mjs`가 TS 툴체인 없이 `JSON.parse`한다.

   | 필드 | 규칙 |
   | --- | --- |
   | `id` | `<type>:<kebab-ascii>`. 접두사 = `type`. 발행 후 **불변** |
   | `type` | 7개 고정: origin variety process flavor method equipment defect |
   | `labels.ko`/`labels.en` | 필수. 다른 앱 UI에 그대로 노출됨 |
   | `aliases` | 이미 정규화된 형태(소문자·문장부호 없음). 매칭 키이며 표시용이 아님 |
   | `parent` | 같은 타입 내 상위. origin은 `origin:<cc>` → `origin:<cc>-<region>` |
   | `articleSlug` | 존재하는 슬러그만 |
   | `glossaryTerm` | `glossary.ts`의 `term`과 정확히 일치 |
   | `status` | `canonical` 또는 `deprecated` |
   | `replacedBy` | `deprecated`일 때 필수. `canonical`에는 금지 |
   | `source` | 1단계의 표 |

4. **폐기**: 삭제하지 않는다. 흡수되는 쪽을 `status: "deprecated"` +
   `replacedBy: "<살아 있는 id>"`로 두고, alias를 남는 쪽으로 옮긴다.
   `replacedBy`가 다시 `deprecated`를 가리키면 실패다(체인 금지).
   `resolveEntity()`는 deprecated 히트를 `replacedBy`로 한 번만 따라간다.
   철학은 `src/content/redirects.json`이 문서 슬러그에 쓰는 것과 같다.

5. **모호성 판정**: 하나의 alias는 하나의 canonical만 가리킨다. 어느 엔티티인지
   판정할 수 없는 문자열은 **어디에도 넣지 않는다**. 예: `모카`는 예멘 산지·모카포트·
   초콜릿 향 중 무엇인지 알 수 없다. 미스로 남아 `resolve_misses`에 적히는 편이
   틀린 엔티티로 접히는 것보다 낫다. 라벨끼리의 충돌도 실패이므로, 충돌하면
   라벨을 좁힌다(`Honey` → `Honey Process`).

6. **검증**: `node scripts/check-vocabulary.mjs`와 `npx tsc --noEmit`을 통과시킨다.
   그다음 `vocab-steward` 에이전트로 위생 점검(근접 중복·잘못된 parent·고아 alias·
   문서·용어 미연결·커버리지 공백)을 받는다.

7. **마감**: 추가·폐기 목록, alias 매칭 키 증감, 남은 커버리지 공백을 보고한다.
   `/resolve` 미스로 수요가 확인됐지만 근거 문서가 없어 보류한 항목은
   `demand-analyst`에 넘겨 집필 후보로 올린다. 커밋은 사용자 요청 시에만.

## `check-vocabulary.mjs`가 실패시키는 것

| 검사 | 실패 조건 |
| --- | --- |
| ID 중복 | 같은 `id`가 두 번 |
| ID 형식 | `/^(origin\|variety\|process\|flavor\|method\|equipment\|defect):[a-z0-9-]+$/` 위반 |
| 접두사 | `id` 접두사 ≠ `type` |
| 라벨 | `labels.ko`/`labels.en` 누락 |
| alias 정규화 | `alias !== normalizeQuery(alias)` |
| alias 충돌 | 정규화 후 같은 키가 두 엔티티에 속함(라벨 포함) |
| `parent` | 없는 ID, 자기 자신, 순환 |
| `articleSlug` | `articles/index.ts`에 없는 슬러그 |
| `glossaryTerm` | `glossary.ts`에 없는 용어 |
| 폐기 계약 | `deprecated`인데 `replacedBy` 없음 / `replacedBy`가 없거나 그것도 deprecated / `canonical`인데 `replacedBy` 있음 |
| `source` | 누락, 알 수 없는 `kind`, 저장소에 없는 `ref` |
| JSON 형식 | 배열 리터럴을 `JSON.parse` 할 수 없음 |
| `index.ts` | `vocabulary`·`byId`·`aliasIndex`·`entitiesOfType` 미export, 새 데이터 파일 미import |

## 규칙

- **ID를 절대 바꾸지 않습니다.** 이름이 바뀌면 `labels`를 고칩니다. 외부 앱 DB에
  이미 저장된 값입니다.
- **삭제하지 않습니다.** deprecate만 합니다.
- 근거 없는 엔티티를 만들지 않습니다. 커피 지식을 발명하지 않습니다.
- `normalizeQuery()`는 `src/content/vocabulary/types.ts`와
  `scripts/check-vocabulary.mjs`에 각각 있습니다. 한쪽을 바꾸면 다른 쪽도 바꿉니다.
- 7개 타입에 속하지 않는 개념(디개싱·TDS·수율·DTR·CVA 등)은 억지로 엔티티화하지
  않고 `/knowledge/v1/terms`(용어집)에 둡니다.
- 커밋은 사용자가 요청했을 때만 합니다.
