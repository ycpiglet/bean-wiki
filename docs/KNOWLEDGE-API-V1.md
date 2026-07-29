# Knowledge API v1

- 문서 ID: `knowledge-api-v1`
- 계약 버전: `1`
- 상태: 구현 기준
- 갱신일: 2026-07-28
- 대상: 사내 앱·에이전트 개발자, Bean Wiki 개발자

Bean Wiki가 **제공하는** 방향의 계약입니다. envelope, problem+json, cursor,
credential 형식, rate 헤더, 버전 호환은 정의하지 않고
[PLATFORM-CONTRACT-V1](./PLATFORM-CONTRACT-V1.md)을 그대로 따릅니다. 이 문서는
리소스와 파라미터만 정의합니다.

받는 방향은 [CONTENT-REQUEST-API-V1](./CONTENT-REQUEST-API-V1.md)입니다.

이 API가 다루는 콘텐츠는 공개 CC-BY-4.0 백과 문서이므로 T0~T3 등급 기계를
적용하지 않습니다(계약 §8.2).

## 1. 엔드포인트

| 메서드 | 경로 | scope | `schema_version` | 목록 |
| --- | --- | --- | --- | --- |
| GET | `/api/knowledge/v1/entities` | 선택 `knowledge:read` | `coffee_entity.v1` | 예 |
| GET | `/api/knowledge/v1/entities/{type}/{id}` | 선택 `knowledge:read` | `coffee_entity.v1` | 아니오 |
| GET | `/api/knowledge/v1/resolve` | 선택 `knowledge:read` | `resolve_result.v1` | 아니오 |
| GET | `/api/knowledge/v1/terms` | 선택 `knowledge:read` | `glossary_term.v1` | 예(단일 페이지) |
| GET | `/api/knowledge/v1/articles` | 선택 `knowledge:read` | `article_summary.v1` | 예 |
| GET | `/api/knowledge/v1/articles/{slug}` | 선택 `knowledge:read` | `article.v1` | 아니오 |
| GET | `/api/knowledge/v1/search` | 선택 `knowledge:read` | `search_result.v1` | 예(cursor 없음) |

모든 경로에 `OPTIONS`가 있고 204를 반환합니다. 쓰기 메서드는 없습니다.

## 2. 인증은 선택입니다

구현: `src/lib/knowledge/access.ts`의 `optionalClient()`.

| 요청 | 처리 |
| --- | --- |
| `Authorization` 헤더 없음 | 익명으로 정상 응답. `client = null` |
| 유효한 `bwk_…` credential | `knowledge:read` 검사 통과 후 client 식별 |
| 헤더가 있으나 무효 | **익명으로 격하하지 않고 그대로 거절**(401/403/429/503) |

마지막 줄이 규칙입니다. 잘못된 credential을 익명으로 처리하면 통합이
동작하는 것처럼 보이다가 한도에 걸릴 때 처음 문제가 드러납니다. 자기가
인증되었다고 믿는 호출자는 credential이 깨졌다는 사실을 즉시 받아야 합니다.

credential이 사주는 것:

| 항목 | 익명 | credential |
| --- | --- | --- |
| 분당 한도 | edge/CDN 위임(라우트에서 계량하지 않음) | client별 `rate_limit_per_min` |
| 사용량 귀속 | 없음 | `api_client_events` 감사 |
| `/resolve` 미스 추적 | `client_id = null`로만 집계 | 어느 앱이 무엇을 못 찾았는지 식별 |
| 캐시 | 공용 캐시 | `private` 캐시 |

credential 발급: `node scripts/mint-api-client.mjs --name … --org … --scopes knowledge:read --type human_app`.

## 3. 캐시

구현: `knowledgeCacheControl(client)`.

| 호출자 | `Cache-Control` |
| --- | --- |
| 익명 | `public, max-age=300, stale-while-revalidate=86400` |
| credential 제시 | `private, max-age=60` |

예외 두 곳:

| 응답 | `Cache-Control` |
| --- | --- |
| `/resolve` 적중 | `public, max-age=300, stale-while-revalidate=86400`(인증 여부와 무관하게 고정) |
| `/resolve` 미스 | `no-store` |

어휘와 문서 본문은 배포 시점에만 바뀌므로 공용 캐시가 안전합니다.

## 4. CORS

구현: `src/lib/api/cors.ts`.

| 조건 | 결과 |
| --- | --- |
| `Origin` 헤더 없음 | CORS 헤더 없음. 정상 응답(대부분의 서버 간 호출) |
| `Origin`이 허용 목록에 있음 | 그 origin을 그대로 echo |
| `Origin`이 목록에 없음 | CORS 헤더 없이 응답(브라우저가 차단) |

허용 목록 = `https://bean-wiki.vercel.app` + 환경변수
`KNOWLEDGE_API_CORS_ORIGINS`(쉼표 구분). `*`는 쓰지 않습니다.

허용된 origin에 붙는 헤더:

```text
access-control-allow-origin: <echo>
access-control-allow-methods: GET, OPTIONS
access-control-allow-headers: authorization, content-type
access-control-max-age: 600
vary: origin
```

`/api/requests/v1/**`에는 CORS도 `OPTIONS`도 없습니다. 요청·기여 제출은
서버 간 호출 전용입니다.

## 5. 초안 제외

`draft: true` 문서는 사이트의 목록·검색·sitemap·feed에서 빠지는 것과 동일한
규칙으로 API에서도 빠집니다.

| 표면 | 게이트 |
| --- | --- |
| `/articles` | `getPublishedArticles()` |
| `/search` (`kind=article`) | `getSearchIndex()` → 같은 함수 |
| `/articles/{slug}` | `article.draft`면 `404 not-found` |
| `/entities/{type}/{id}`의 `article_detail` | **검사 없음**(13절) |

## 6. `/resolve` — 이 API의 핵심 루프

```text
GET /api/knowledge/v1/resolve?q=<문자열>&type=<entity type>
```

다른 앱이 들고 있는 **아무 문자열**(테이스팅 카드 OCR 결과, 사용자 오타,
구식 표기)을 정본 어휘 id와 그것을 설명하는 문서로 바꿉니다. 문자열을 그대로
저장하면 `에티오피아` / `Ethiopia` / `ETHIOPIA`는 영원히 서로 다른 세 값이고
앱 사이 연결은 성립하지 않습니다.

### 6.1 파라미터

| query | 타입 | 필수 | 규칙 |
| --- | --- | --- | --- |
| `q` | string | 예 | 공백만이면 `400 invalid-request`. 200자 초과면 `400` |
| `type` | enum | 아니오 | `origin`, `variety`, `process`, `flavor`, `method`, `equipment`, `defect`. 그 외는 `400` |

### 6.2 매칭 순서

1. `q.trim()`을 어휘 id로 직접 조회 → 적중 시 `match_kind: "id"`
2. `normalizeQuery(q)`로 alias 색인 조회 → 적중 시 `match_kind: "alias"`
3. `type`을 줬는데 찾은 항목의 `type`이 다르면 **미스로 처리**합니다. 종류가
   다른 것을 조용히 돌려주지 않습니다.

alias 색인은 `aliases` 배열만이 아니라 `labels.ko`, `labels.en`,
`aliases` 전부를 정규화해 만든 것입니다. 그래서 `에티오피아`처럼 라벨과
같은 문자열도 `match_kind: "alias"`로 적중합니다. 한 키는 정확히 하나의
엔터티를 가리키며 충돌은 `scripts/check-vocabulary.mjs`가 빌드에서 막습니다.

정규화 규칙(`src/content/vocabulary/types.ts`의 `normalizeQuery`):
`trim` → 소문자 → NFKC → 공백·`_` 연속을 공백 하나로 → `.,;:!?'"()[]{}` 제거.
그래서 `" ETHIOPIA, "`, `"ethiopia"`, `"Ｅｔｈｉｏｐｉａ"`는 같은 키가 됩니다.

### 6.3 적중 응답

```json
{
  "contract_version": 1,
  "schema_version": "resolve_result.v1",
  "request_id": "req_0f3a9c21b47e5d6081af2c34",
  "snapshot_at": "2026-07-28T09:12:00Z",
  "data": {
    "query": "MOKHA PORT",
    "normalized_query": "mokha port",
    "matched": true,
    "match_kind": "alias",
    "entity": {
      "id": "origin:ye-mokha",
      "type": "origin",
      "labels": { "ko": "예멘 모카", "en": "Mokha (Yemen)" },
      "aliases": ["모카항", "모카 항", "mokha", "al mokha", "mokha port"],
      "parent": "origin:ye",
      "status": "canonical",
      "replaced_by": null,
      "note": "커피 수출의 핵심 항구였고 항구 이름이 유럽에서 산지·음료를 가리키는 말로 확장되었습니다.",
      "article": {
        "slug": "global-coffee-history",
        "url": "https://bean-wiki.vercel.app/wiki/global-coffee-history"
      },
      "glossary_term": null
    },
    "replacement": null
  }
}
```

### 6.4 폐기된 id도 계속 적중합니다

어휘는 삭제하지 않습니다. `status: "deprecated"`이고 `replaced_by`가 있으면
`replacement`에 후속 엔터티 전체를 함께 실어 보냅니다. 호출자는 저장된
참조를 옮길 수 있고, 그 사이에도 조회는 계속 성공합니다.

응답 형태(현재 어휘에 `deprecated` 항목이 없어 id는 가상입니다):

```json
{
  "matched": true,
  "match_kind": "id",
  "entity": {
    "id": "process:semi-washed",
    "status": "deprecated",
    "replaced_by": "process:honey"
  },
  "replacement": {
    "id": "process:honey",
    "status": "canonical",
    "replaced_by": null
  }
}
```

- `entity`는 **폐기된 그대로** 나갑니다. 라우트가 후속 엔터티로 바꿔치기하지
  않습니다.
- `status`가 `deprecated`인데 `replaced_by`가 비어 있으면 `replacement`는
  `null`입니다.
- `src/content/vocabulary/index.ts`의 `resolveEntity()`는 반대로 `replacedBy`를
  따라가 **후속 엔터티만** 돌려줍니다. 이 API는 그 함수를 쓰지 않습니다.
  같은 저장소에 두 가지 해석 규칙이 있으니 사내 코드에서 헷갈리지 마세요.

### 6.5 미스는 실패가 아니라 신호입니다

미스도 `200`이고 envelope도 정상입니다. `matched: false`와 다음에 할 일이
함께 옵니다.

```json
{
  "contract_version": 1,
  "schema_version": "resolve_result.v1",
  "request_id": "req_74bc0e19aa3f5d2c881b6042",
  "snapshot_at": "2026-07-28T09:12:04Z",
  "data": {
    "query": "BERGAMOT",
    "normalized_query": "bergamot",
    "matched": false,
    "entity": null,
    "suggestion": {
      "action": "file_content_request",
      "endpoint": "/api/requests/v1/content-requests",
      "hint": "Send `demand_evidence.unresolved_terms` with this query so the gap is prioritised by real demand."
    }
  }
}
```

미스 응답에는 `match_kind`, `replacement` 필드가 없습니다.

서버는 미스를 `resolve_misses`에 `(entity_type, normalized_query)` 단위로
누적합니다(`hit_count`, `last_seen_at`). 이 집계가 편집 대기열이 되고, 봇의
`content.gaps` 명령으로 노출됩니다. 기록은 best-effort입니다. 저장소가
없거나 쓰기가 경합해도 조회 응답은 그대로 200입니다.

`type`을 주지 않고 호출한 미스는 `entity_type`이 빈 문자열로 집계됩니다.

### 6.6 워크드 예시 — 테이스팅 카드 스캐너

카페 테이스팅 카드를 찍어 원산지·가공·향미를 자동 태깅하는 앱입니다.
OCR이 `"ETHIOPIA"`, `"건식"`, `"베르가못"` 세 문자열을 뽑았습니다.

1단계 — 각 문자열을 정규화 없이 그대로 보냅니다. 정규화는 서버가 합니다.

```bash
curl -s -H "Authorization: Bearer bwk_a1b2c3d4e5f6_<secret>" \
  "https://bean-wiki.vercel.app/api/knowledge/v1/resolve?q=ETHIOPIA&type=origin"
```

2단계 — 결과를 분기합니다.

| OCR 문자열 | 결과 | 앱이 저장할 값 |
| --- | --- | --- |
| `ETHIOPIA` | `matched: true`, `match_kind: "alias"` | `origin:et` |
| `건식` | `matched: true`, `match_kind: "alias"` | `process:natural` |
| `베르가못` | `matched: false` | 원문 문자열 + 미해결 표시 |

`건식`은 `process:natural`의 alias입니다. OCR이 한국어 관용 표기를 읽어도
같은 id로 수렴합니다. 이것이 문자열 대신 id를 저장하는 이유입니다.

3단계 — 적중한 값은 id로 저장하고, 사용자에게 보여줄 라벨은
`labels.ko`/`labels.en`에서 가져옵니다. OCR 원문은 계약 §5의
`raw_value`로 남기고 id는 `normalized_value` 축에 둡니다.

4단계 — 미스는 버리지 않고 모읍니다. 같은 미스가 한 달에 여러 번 쌓이면
콘텐츠 요청 하나로 묶어 제출합니다.

```json
{
  "external_id": "scan-gap-2026-07-flavor-bergamot",
  "kind": "new_vocabulary_entity",
  "title": "향미 어휘에 베르가못 추가 요청",
  "body": "테이스팅 카드 OCR에서 반복 관측되지만 resolve가 매칭하지 못합니다.",
  "locale": "ko",
  "priority_hint": "normal",
  "demand_evidence": {
    "observation_count": 37,
    "window": "P30D",
    "context": "tasting-card scanner, flavor field",
    "unresolved_terms": ["베르가못", "bergamot", "bergamotte"]
  }
}
```

5단계 — 요청 id를 폴링합니다. 상태가 `published`가 되면
`resolution_article_slug`를 받아 스캐너의 어휘 동기화를 다시 돌립니다.
이후 같은 OCR 문자열은 `matched: true`가 됩니다.

이 5단계가 통합의 전체 루프입니다. 상세는
[CONTENT-REQUEST-API-V1 §10](./CONTENT-REQUEST-API-V1.md)에 있습니다.

## 7. `/entities` — 어휘 카탈로그

앱이 한 번 동기화하고 그 뒤로는 문자열 대신 id로 말하게 만드는 목록입니다.

| query | 타입 | 기본값 | 규칙 |
| --- | --- | --- | --- |
| `type` | enum | 없음 | 7종 중 하나. 그 외는 `400 invalid-request` |
| `parent` | string | 없음 | `entity.parent`와 **완전 일치**. 값은 `origin:et`처럼 전체 id |
| `q` | string | 없음 | `labels.ko`·`labels.en`·`aliases`에 대한 정규화 후 부분 일치 |
| `include_deprecated` | `"true"` | `false` | 문자열 `"true"`일 때만 폐기 항목 포함 |
| `limit` | int | `100` | `1..500`으로 clamp. 정수로 파싱되지 않으면 기본값 |
| `cursor` | string | 없음 | 서버 발급 불투명 문자열 |

정렬은 `id ASC` 하나입니다. id는 불변·유일하므로 그 자체가 정렬 키입니다.

응답 헤더에 `x-total-count`(필터 적용 후 전체 건수)가 붙습니다. 이 헤더는
플랫폼 계약에 없는 추가 항목입니다.

```json
{
  "contract_version": 1,
  "schema_version": "coffee_entity.v1",
  "request_id": "req_2c81ff40b9a35d7e6c0a1b93",
  "snapshot_at": "2026-07-28T09:12:00Z",
  "page": { "limit": 100, "has_more": false, "next_cursor": null },
  "data": [
    {
      "id": "origin:et",
      "type": "origin",
      "labels": { "ko": "에티오피아", "en": "Ethiopia" },
      "aliases": ["에티오피아", "이디오피아", "에디오피아", "ethiopia", "ethiopian", "ethiopie", "et", "eth"],
      "parent": null,
      "status": "canonical",
      "replaced_by": null,
      "note": "아라비카의 생물학적 기원과 유전적 다양성의 중심으로 서술되는 산지입니다.",
      "article": {
        "slug": "ethiopian-heirloom-diversity",
        "url": "https://bean-wiki.vercel.app/wiki/ethiopian-heirloom-diversity"
      },
      "glossary_term": null
    }
  ]
}
```

cursor 규칙은 계약 §6과 같습니다. 만료(`snapshot_at` 기준 24시간)는
`410 cursor-expired`, 서명 불일치·형식 오류는 `400 invalid-request`입니다.
어휘는 빌드 산출물이므로 페이지네이션 중간에 배포가 나면 `snapshot_at`은
그대로인 채 목록이 바뀔 수 있습니다. 긴 동기화는 한 번에 끝내세요.

## 8. `/entities/{type}/{id}` — 단일 엔터티

`{id}`는 **접두어 없는 순수 키**입니다. `origin:et-yirgacheffe`는
`/entities/origin/et-yirgacheffe`로 조회합니다. 경로 파라미터는
`decodeURIComponent`로 먼저 디코드합니다(이 스택에서 한글 경로는
percent-encoded 상태로 도착합니다).

query 파라미터는 없습니다. `locale` 파라미터도 없고 내부적으로 `ko`로
고정합니다.

| 상황 | 응답 |
| --- | --- |
| `{type}`이 7종 밖 | `404 not-found` (목록 라우트는 같은 값에 `400`) |
| id 없음 | `404 not-found`, `detail`에 `/resolve` 안내 |

응답은 `WireEntity`에 세 필드가 더 붙습니다.

| 필드 | 내용 |
| --- | --- |
| `ancestors` | 루트부터 직속 부모까지 순서대로. 최대 8단계까지만 순회(순환 방어) |
| `children` | `parent`가 이 엔터티인 항목 전체. 페이지네이션 없음 |
| `article_detail` | `articleSlug`가 가리키는 문서의 `article_summary.v1` 요약 또는 `null` |

## 9. `/articles` — 문서 목록

| query | 타입 | 기본값 | 규칙 |
| --- | --- | --- | --- |
| `locale` | `ko`\|`en` | `ko` | `"en"`이 아니면 모두 `ko`로 해석 |
| `category` | string | 없음 | 한국어 카테고리 이름과 완전 일치(예: `커피 기초`) |
| `tag` | string | 없음 | `tags` 배열 포함 여부 |
| `level` | enum | 없음 | `입문`, `중급`, `전문`. 그 외는 `400` |
| `updated_after` | string | 없음 | `Date.parse` 가능해야 함. 아니면 `400` |
| `limit` | int | `100` | `1..500` |
| `cursor` | string | 없음 | keyset 위치 |

정렬은 `(updated_at ASC, slug ASC)`이고 cursor는 이 두 값을 담습니다.

```json
{
  "contract_version": 1,
  "schema_version": "article_summary.v1",
  "request_id": "req_5ea3d7c0128b4f69a3d55c1e",
  "snapshot_at": "2026-07-28T09:12:00Z",
  "page": { "limit": 100, "has_more": true, "next_cursor": "s.eyJrIjoi….9f13c0a2b7e845d6" },
  "data": [
    {
      "slug": "coffee-cherry-anatomy",
      "title": "커피 체리 해부학: 과육에서 생두까지",
      "summary": "커피 체리의 층이 가공 방식의 기준점이 되는 이유와, 층별 특성이 품질 편차를 어떻게 만드나를 정리합니다.",
      "category": "커피 기초",
      "level": "입문",
      "tags": ["커피 체리", "해부학", "가공", "보관", "품질"],
      "reading_time": "11분",
      "updated_at": "2026. 07. 27.",
      "url": "https://bean-wiki.vercel.app/wiki/coffee-cherry-anatomy"
    }
  ]
}
```

`updated_at`은 문서 원본의 표기를 그대로 내보내므로 RFC 3339가 아닙니다.
13절을 먼저 읽으세요.

## 10. `/articles/{slug}` — 문서 본문

query: `locale`(`ko`\|`en`, 기본 `ko`) 하나입니다.

`schema_version: article.v1` 응답은 `article_summary.v1`의 모든 필드에 다음을
더합니다.

| 필드 | 내용 |
| --- | --- |
| `body_html` | 게시용 HTML 본문. `<h2>` 단위로 번호가 붙은 `<section id>`로 감싸져 있습니다 |
| `fact` | 한 줄 핵심 사실 |
| `related` | 연관 문서 slug 배열 |
| `outline` | `[{ id, title }]` 목차. 본문 섹션에서 파생 |
| `license` | 항상 `"CC-BY-4.0"`. 발췌 재게시 조건을 저장소를 읽지 않고 알 수 있게 함 |
| `entities` | 이 slug를 `articleSlug`로 지목한 어휘 엔터티 배열(`WireEntity`) |

### 10.1 이름이 바뀐 문서 — `moved` 응답

`src/content/redirects.json`에 옛 slug가 있으면 새 문서를 옛 slug로 조용히
내보내지 않고, **정본 slug를 알려주는 다른 모양의 200**을 돌려줍니다.
호출자가 저장해 둔 참조를 갱신할 수 있어야 하기 때문입니다.

```json
{
  "contract_version": 1,
  "schema_version": "article.v1",
  "request_id": "req_9d20a4e15c8b3f7016ce22b4",
  "snapshot_at": "2026-07-28T09:12:00Z",
  "data": {
    "moved": true,
    "from_slug": "coffee-cherry",
    "to_slug": "coffee-cherry-anatomy",
    "url": "https://bean-wiki.vercel.app/wiki/coffee-cherry-anatomy"
  }
}
```

- HTTP 상태는 `200`이고 리다이렉트가 아닙니다. `3xx`를 따라가는 클라이언트도
  본문을 읽어야 합니다.
- 응답 헤더에 `x-canonical-slug: <to_slug>`가 붙습니다.
- `schema_version`은 여전히 `article.v1`입니다. 즉 `article.v1` 소비자는
  **`moved` 필드 존재를 먼저 확인**해야 합니다. 본문 필드는 없습니다.
- 옛 slug로 온 요청이므로 대상 문서가 초안인지는 검사하지 않습니다.

### 10.2 없는 문서

| 상황 | 응답 |
| --- | --- |
| slug 없음 | `404 not-found` |
| `draft: true` | `404 not-found` (`detail: "No published article with that slug."`) |

## 11. `/terms` — 용어집

| query | 타입 | 기본값 | 규칙 |
| --- | --- | --- | --- |
| `locale` | `ko`\|`en` | `ko` | |
| `category` | string | 없음 | 카테고리 이름 완전 일치 |

용어집은 문서 코퍼스보다 작고 평평해서 페이지를 나누지 않고 전체를
돌려줍니다. `limit`·`cursor` 파라미터는 없고, `page.limit`에는 반환 건수가
들어가며 `has_more`는 항상 `false`입니다.

```json
{
  "contract_version": 1,
  "schema_version": "glossary_term.v1",
  "request_id": "req_c40f8b21e97a5d360b1c8fae",
  "snapshot_at": "2026-07-28T09:12:00Z",
  "page": { "limit": 84, "has_more": false, "next_cursor": null },
  "data": [
    {
      "term": "디개싱",
      "reading": "Degassing",
      "definition": "로스팅 직후 원두에서 이산화탄소가 빠져나가는 현상으로, 추출 안정성에 영향을 줍니다.",
      "category": "커피 기초",
      "related": ["coffee-cherry-to-bean"],
      "url": "https://bean-wiki.vercel.app/glossary",
      "entity_id": null
    }
  ]
}
```

`entity_id`는 `glossaryTerm`이 이 용어를 지목한 어휘 엔터티의 id이고, 없으면
`null`입니다. 사람이 읽는 용어에서 기계 id로 한 번에 건너갈 수 있게 하는
연결선입니다. `url`은 개별 용어 앵커가 아니라 용어집 페이지입니다.

## 12. `/search` — 통합 검색

사이트 검색과 같은 사전 구축 색인을 씁니다. API 결과와 사이트 결과가
어긋날 수 없습니다.

| query | 타입 | 기본값 | 규칙 |
| --- | --- | --- | --- |
| `q` | string | 없음 | 필수. `trim` 후 2자 미만이면 `400` |
| `kind` | enum | 없음(전부) | `article`, `term`, `entity`. 그 외는 `400` |
| `locale` | `ko`\|`en` | `ko` | |
| `limit` | int | `20` | `1..100` |

| `kind` | 대상 | 매칭 대상 문자열 | `id` | `url` |
| --- | --- | --- | --- | --- |
| `article` | 게시된 문서 | 제목+요약+카테고리+태그 색인 | slug | 문서 URL |
| `term` | 용어집 | `term` + `reading` + `definition` | `term` | 용어집 페이지 |
| `entity` | 어휘(폐기 제외) | `labels.ko` + `labels.en` + `aliases` | 전체 id | 이 API의 엔터티 상세 경로 |

점수:

| 값 | 조건 |
| --- | --- |
| `3` | 문서 제목이 질의와 완전 일치, 또는 용어명이 완전 일치 |
| `2` | 문서 제목 부분 일치, 용어 그 외, 엔터티 전부 |
| `1` | 문서 본문 색인만 일치 |

정렬은 `score DESC`, 동점은 `title ASC`입니다.

```json
{
  "contract_version": 1,
  "schema_version": "search_result.v1",
  "request_id": "req_1b7fa0c93e58d4620ac13f7e",
  "snapshot_at": "2026-07-28T09:12:00Z",
  "page": { "limit": 20, "has_more": false, "next_cursor": null },
  "data": [
    {
      "kind": "article",
      "id": "coffee-cherry-anatomy",
      "title": "커피 체리 해부학: 과육에서 생두까지",
      "snippet": "커피 체리의 층이 가공 방식의 기준점이 되는 이유와, 층별 특성이 품질 편차를 어떻게 만드나를 정리합니다.",
      "url": "https://bean-wiki.vercel.app/wiki/coffee-cherry-anatomy",
      "score": 2
    }
  ]
}
```

`snippet`은 요약·정의를 200자로 자른 값입니다. `next_cursor`는 항상 `null`이고
`has_more`가 `true`여도 다음 페이지를 받을 방법이 없습니다. `limit`을 올려서
받으세요.

## 13. 오류

problem 코드·상태·재시도 규칙은 계약 §4가 정본입니다. 이 API에서 실제로
나올 수 있는 것만 적습니다.

| 코드 | 상태 | 이 API에서 발생하는 경우 |
| --- | --- | --- |
| `invalid-request` | 400 | `type`·`level`·`kind` enum 위반, `q` 누락·초과, `updated_after` 파싱 실패, cursor 형식·서명 오류 |
| `unauthorized` | 401 | `Authorization` 헤더가 있는데 형식이 틀리거나 credential 불일치 |
| `forbidden-scope` | 403 | client 비활성·만료, IP 미허용, `knowledge:read` 미부여 |
| `not-found` | 404 | 없는 slug, 초안 slug, 없는 엔터티, 알 수 없는 엔터티 type |
| `cursor-expired` | 410 | cursor의 `snapshot_at`이 24시간 초과 |
| `rate-limited` | 429 | credential 제시 호출이 분당 한도 초과. `Retry-After` 포함 |
| `quota-exhausted` | 429 | client 기간 quota 소진 |
| `internal` | 500 | 라우트가 선언한 scope 상수가 목록에 없을 때 |
| `storage-unavailable` | 503 | credential을 제시했는데 client 레지스트리(D1)가 바인딩되지 않음 |

지식 라우트 자체는 저장소를 읽지 않습니다. `503`은 인증 경로에서만 나옵니다.
익명 호출은 저장소와 무관하게 항상 응답합니다.

## 14. 미해결

구현이 이렇게 되어 있으나 계약상 어색하거나 아직 연결되지 않은 지점입니다.
문서는 실제 동작을 적었고, 아래는 고쳐야 할 목록입니다.

1. **`updated_at`이 RFC 3339가 아닙니다.** 와이어 값은 문서 원본 표기인
   `"2026. 07. 27."`입니다. 계약 §3 위반입니다. `updated_after` 필터는 이 값을
   `Date.parse`로 비교하므로 서버 로컬 시간대로 해석됩니다(KST 환경에서
   `2026. 07. 27.` → `2026-07-26T15:00:00Z`). 날짜 경계 증분 동기화는
   하루치가 어긋날 수 있습니다.
2. `/resolve` 적중 응답의 `Cache-Control`이 `knowledgeCacheControl`을 쓰지
   않고 `public, …`으로 고정입니다. 인증 호출의 응답도 공용 캐시에 들어갈 수
   있습니다.
3. `/entities/{type}/{id}`의 `article_detail`은 `draft` 검사를 하지 않습니다.
   초안 문서를 지목한 엔터티가 있으면 제목·요약·URL이 노출됩니다. 목록과
   문서 상세는 제외하므로 규칙이 한 곳에서만 새고 있습니다.
4. 같은 잘못된 엔터티 type이 목록에서는 `400`, 상세에서는 `404`입니다.
5. `/search`는 `has_more: true`를 낼 수 있는데 `next_cursor`가 항상 `null`이라
   페이지를 넘길 수 없습니다.
6. `/terms`는 `page.limit`에 반환 건수를 넣습니다. 결과가 0건이면 `limit: 0`이
   되어 계약 §6의 `1..500` 범위를 벗어납니다.
7. 성공 응답에 `X-RateLimit-*` 헤더가 없습니다. `requireClient()`는 429일 때만
   rate 헤더를 붙입니다. 계약 §9는 응답 헤더로 규정합니다.
8. `x-total-count`는 플랫폼 계약에 없는 헤더입니다. 계약에 올리거나
   `page`로 옮겨야 합니다.
9. `src/content/redirects.json`이 현재 `{}`입니다. 10.1절의 `moved` 분기는
   구현되어 있지만 아직 도달 불가입니다.
10. `src/lib/knowledge/gaps.ts`의 `topMisses()`·`linkMissToRequest()`는
    호출자가 없습니다. 봇의 `content.gaps`는 `src/lib/metrics/catalog.ts`의
    `resolve.top_misses` SQL을 따로 씁니다. 같은 질의가 두 곳에 있습니다.
11. 폐기 경로가 실제로 검증되지 않았습니다. 현재 어휘 117개
    (`origin` 9, `variety` 11, `process` 10, `flavor` 34, `method` 15,
    `equipment` 20, `defect` 18) 전부 `status: "canonical"`이라
    `include_deprecated`, `replacement`, 6.4절 응답은 살아 있는 데이터로
    확인된 적이 없습니다. 어휘는 계속 작성 중이므로 이 문서의 id 예시는
    작성 시점 기준입니다.
12. `resolve` 라우트는 폐기 엔터티를 그대로 주고 `replacement`를 덧붙이지만
    같은 저장소의 `resolveEntity()`는 후속 엔터티로 치환해서 돌려줍니다.
    해석 규칙이 두 개입니다. 어느 쪽이 정본인지 정해야 합니다.
