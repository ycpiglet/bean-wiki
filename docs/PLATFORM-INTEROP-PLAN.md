# Bean Wiki 플랫폼 상호운용 기획

- 상태: 기획 초안
- 작성일: 2026-07-28
- 범위: 회사 내 여러 앱·AI 에이전트와 Bean Wiki를 잇는 API·프로토콜·하네스·봇
- 관련 문서: [Beanote 연동 결정](./BEANOTE-INTEGRATION.md),
  [Beanote Data API v1](./BEANOTE-DATA-API-V1.md),
  [커피체리 연동](./COFFEE-CHERRY-INTEGRATION.md),
  [에이전트 편집 운영](./AGENT-EDITORIAL-OPS.md)

이 문서는 **무엇을 어떤 순서로 만들 것인지**만 정합니다. 각 단계의 상세 계약은
단계별 문서로 분리합니다.

## 1. 전제와 방향

### 1.1 Bean Wiki의 역할

Bean Wiki는 회사 앱들 사이에서 "위키 사이트"가 아니라 **커피 도메인 용어
권위(vocabulary authority)** 입니다. 앱마다 `"에티오피아"`, `"Ethiopia"`,
`"ETHIOPIA"`를 각자 문자열로 들고 있으면 상호작용이 성립하지 않습니다.

Beanote 계약이 이미 이 문제를 드러냅니다.
[BEANOTE-INTEGRATION.md](./BEANOTE-INTEGRATION.md) 5절의
`raw_value: "ETHIOPIA"` → `normalized_value: "Ethiopia"` 정규화는 Bean Wiki가
제공해야 하는 기능입니다.

따라서 **공용 어휘 ID가 1순위이고, 게시글 요청 큐는 그다음**입니다. 어휘가
없으면 요청 큐는 자유 서술 게시판이 되고, 어휘가 있으면 요청이 자동으로
생성됩니다.

### 1.2 중앙 허브를 만들지 않는 이유

앱이 2개인 상태에서 게이트웨이·이벤트 버스를 세우면 비용만 늘어납니다.
대신 **공용 계약 + 공용 어휘 패키지**를 공유하고 통신은 point-to-point HTTP로
둡니다.

허브 도입 조건: 앱 4개 이상, 또는 하나의 사건을 3곳 이상에 fan-out해야 할 때.
그 시점에 Vercel Queues 기반 이벤트 면을 추가합니다.

### 1.3 두 방향의 비대칭

같은 기계를 쓰지 않습니다.

| 방향 | 데이터 성격 | 통제 수준 |
| --- | --- | --- |
| Bean Wiki → 외부 (지식) | 공개 콘텐츠, git 기반 정적 | 캐시 적극 활용, 동의 부담 없음, tier 불필요 |
| 외부 → Bean Wiki (기록) | Beanote T1 가명정보 | 승인·감사·철회·tier 필요 |
| 외부 → Bean Wiki (요청) | 운영 메타데이터 | client 인증 + 멱등성 + 상태 전이 |

Knowledge API에 privacy tier 기계를 얹지 않습니다.

## 2. 현재 상태

### 2.1 이미 있는 것

| 개념 | 구현 | 한계 |
| --- | --- | --- |
| Issue (글 요청) | `POST /api/suggestions` | 세션 전용, 멱등성·콜백·해결 링크 없음, enum이 한국어 문자열 |
| PR (초안 제출) | `POST /api/articles/[slug]` — 커밋 또는 PR 제안, `baseSha` 충돌 감지 | 세션 쿠키 전용 |
| 외부 데이터 수신 | `POST /api/integrations/coffee-cherry` — Bearer + `(sourceName, externalId)` upsert | 공유 env 토큰 1개, 스코프·rate limit 없음 |
| 지식 자산 | 문서 146편, 용어 35항목, 카테고리·태그·퀴즈·트리비아 | API로 노출되지 않음 |
| 계약 규약 | Beanote Data API v1의 envelope·problem+json·커서·스코프 | Beanote 전용 문서에 갇혀 있음 |
| 에이전트 하네스 | `.claude/skills/*`, `.claude/agents/persona-*`, `check-editorial.mjs` | 편집 도메인만 커버 |

### 2.2 없는 것

- API client 레지스트리 테이블 (`db/schema.ts`에 없음)
- 스코프, rate limit, 멱등성 키, CORS 정책
- 웹훅·콜백, 상태 전이 기계
- 조회 통계 read model
- 공용 어휘 ID 체계

### 2.3 선행 결함 — 헤더 신뢰

`src/lib/platform-auth.ts`의 `getPlatformUser()`는 세션이 없으면
`oai-authenticated-user-email` 요청 헤더를 그대로 신뢰합니다.
`/api/suggestions`, `/api/community`, `/api/progress`,
`/api/articles/*/feedback`의 POST가 모두 이 함수를 사용합니다.

배포처가 직접 접근 가능하므로 임의 호출자가 타인 계정으로 글과 XP를 쓸 수
있습니다. **Phase 0의 첫 항목입니다.**

## 3. 네 개의 면

| 면 | 방향 | 엔드포인트 | 인증 |
| --- | --- | --- | --- |
| A. Knowledge Read | 나감 | `/api/knowledge/v1/*` | 공개 읽기, client key는 rate limit·집계용 |
| B. Content Request | 들어옴 | `/api/requests/v1/content-requests` | client Bearer + 스코프 |
| C. Contribution | 들어옴 | `/api/requests/v1/contributions` | client Bearer + actor 출처 |
| D. Identity | — | 신규 없음 | 서비스 자격증명만. 사용자 신원은 앱 경계를 넘지 않음 |

D에 대한 결정: **회사 SSO를 지금 만들지 않습니다.** 사용자 단위 연결이
필요해지면 Beanote 계약의 client별 가명 `subject_key`를 사용합니다.
동의·보존·철회 문제를 앱 경계 밖으로 확산시키지 않습니다.

## 4. 단계별 계획

### Phase 0 — 신뢰 경계

목표: 기계 호출자를 식별할 수 있는 상태를 만든다. 이후 모든 단계의 전제.

| 항목 | 산출물 |
| --- | --- |
| 헤더 신뢰 차단 | `platform-auth.ts`에 게이트웨이 검증 추가. 기본 비활성 env 플래그 |
| client 레지스트리 | `api_clients` 테이블 + drizzle migration |
| 감사 로그 | `api_client_events` 테이블 |
| 공용 인증 | `src/lib/api-auth.ts` — `requireClient(req, scope)` |
| 공용 응답 | `src/lib/api-envelope.ts` — `ok()`, `problem()` (RFC 9457) |
| rate limit | client별 카운터 + `X-RateLimit-*`, `Retry-After` |
| 기존 이관 | coffee-cherry를 `requireClient`로 이관, env 토큰은 1릴리스 폴백 |
| 가드레일 | `scripts/check-api-contract.mjs` |

`api_clients` 컬럼 (나중의 크레딧 에이전트를 위해 quota 필드를 처음부터 둡니다):

```text
id, name, org, client_type(human_app|agent|internal),
secret_hash, secret_prefix, scopes(JSON), max_tier,
status(active|suspended|revoked), rate_limit_per_min,
quota_period, quota_limit, quota_used, quota_reset_at,
ip_allowlist(JSON), expires_at, created_at, last_used_at
```

스코프 문법은 Beanote 계약과 동일하게 `resource:action:tier`를 씁니다.
예: `knowledge:read`, `content-requests:write`, `contributions:write`,
`metrics:read`.

### Phase 1 — 공용 규약과 어휘

목표: 앱 중립 규약을 문서화하고, 상호운용의 실체인 어휘 ID를 만든다.

| 항목 | 산출물 |
| --- | --- |
| 공용 규약 | `docs/PLATFORM-CONTRACT-V1.md` |
| 어휘 데이터 | `src/content/vocabulary/*.ts` |
| 어휘 규칙 | `docs/VOCABULARY-IDS.md` |
| 가드레일 | `scripts/check-vocabulary.mjs` |

`PLATFORM-CONTRACT-V1.md`는 Beanote Data API v1의 2~4, 7~9, 12절(envelope,
`value_state`/`verification_state` 2축, 커서, Bearer·스코프, problem+json,
버전 호환)을 **앱 중립으로 승격**한 문서입니다. Beanote 문서는 "이 규약 위의
Beanote 리소스 계약"으로 축소하고, 내용을 복제하지 않고 참조합니다.

어휘 엔티티 타입: `origin`, `variety`, `process`, `flavor`, `method`,
`equipment`, `defect`.

```text
id           # <type>:<kebab-ascii>  예: origin:et-yirgacheffe
type
labels       # { ko, en }
aliases      # 정규화 입력 후보. OCR 대문자·오탈자·구표기 포함
parent       # origin:et → origin:et-yirgacheffe 계층
articleSlug  # 있으면 위키 문서로 딥링크
glossaryTerm
status       # canonical | alias | deprecated
replacedBy   # deprecated일 때 필수
```

규칙:

- ID는 불변입니다. 이름이 바뀌면 label을 고치고 ID는 유지합니다.
- 삭제하지 않고 `deprecated` + `replacedBy`로 표시합니다. `redirects.json`과
  같은 철학입니다.
- 초기 어휘는 문서 146편·용어 35항목·카테고리·태그에서 추출합니다. 추측으로
  채우지 않습니다.
- alias 충돌(같은 alias가 두 canonical을 가리킴)은 빌드 실패로 처리합니다.

### Phase 2 — Knowledge Read API v1

목표: 다른 앱과 에이전트가 커피 지식을 조회하고 문자열을 정규화할 수 있게 한다.

| Method | Path | 용도 |
| --- | --- | --- |
| GET | `/api/knowledge/v1/entities` | 어휘 목록, 타입·부모 필터 |
| GET | `/api/knowledge/v1/entities/{type}/{id}` | 엔티티 상세 + 연결 문서 |
| GET | `/api/knowledge/v1/resolve` | **문자열 → 정규 엔티티.** 미스는 기록 |
| GET | `/api/knowledge/v1/terms` | 용어집 |
| GET | `/api/knowledge/v1/articles` | 문서 목록 (초안 제외) |
| GET | `/api/knowledge/v1/articles/{slug}` | 문서 본문·출처·개정 이력 |
| GET | `/api/knowledge/v1/search` | 통합 검색 |

- 공개 읽기. Bearer는 선택이며 rate limit과 사용량 집계에만 씁니다.
- 콘텐츠가 git 기반 정적이므로 캐시 헤더를 적극적으로 씁니다.
  `/api/search-index`가 이미 정적 JSON을 서빙하는 패턴을 따릅니다.
- CORS는 allowlist 방식. 와일드카드를 쓰지 않습니다.
- **`/resolve` 미스를 `resolve_misses`에 적재합니다.** 이것이 Phase 3 요청 큐와
  Phase 6 봇의 콘텐츠 공백 목록의 원천입니다.

문서: `docs/KNOWLEDGE-API-V1.md`.

### Phase 3 — Content Request API v1

목표: 다른 앱·에이전트가 "이런 글이 필요하다"를 기계적으로 제출하고 결과를
돌려받는다. GitHub Issue의 아날로그.

핵심 판단: 제목·본문이 아니라 **`entity_refs` + `demand_evidence`** 가 본체입니다.
"지난 30일 스캔 214건이 이 산지, 해당 문서 없음"이 사람이 쓴 요청문보다
우선순위 판단에 유용합니다.

```text
content_requests
  id, client_id, external_id, kind, title, body,
  entity_refs(JSON), demand_evidence(JSON), priority_hint, locale,
  status, resolution_article_slug, resolution_url,
  declined_reason, duplicate_of,
  callback_url, revision, created_at, updated_at
  UNIQUE (client_id, external_id)
```

상태 전이:

```text
received → triaged → accepted → drafting → in_review → published
                   → declined
                   → duplicate
```

- 멱등성은 `(client_id, external_id)`. coffee-cherry가 이미 쓰는 패턴입니다.
- **기존 `suggestions`와 큐를 분리하지 않습니다.** 사람 접수(웹 폼)와 기계
  접수(API)는 입구가 둘, 트리아지 화면은 하나여야 합니다. `suggestions`에
  `request_id` 연결을 두거나 통합 뷰를 만듭니다. 이 결정은 Phase 3 설계 시
  확정합니다.
- 알림은 두 가지를 모두 제공합니다. 웹훅만 두면 반드시 놓칩니다.
  - `GET /content-requests?updated_after=` 폴링
  - HMAC-SHA256 서명 웹훅: `X-BeanWiki-Signature`, timestamp, replay 창

문서: `docs/CONTENT-REQUEST-API-V1.md`.

### Phase 4 — Contribution API와 에이전트 출처

목표: 외부 AI 에이전트가 초안을 제출하면 기존 편집 검증을 그대로 통과시킨다.

- `POST /api/requests/v1/contributions` — 초안 제출
- 파이프라인: 새니타이즈 → `check-content` → `check:editorial` → 페르소나 패널 →
  PR 제안. 새 게시 경로를 만들지 않고 **기존 PR 제안 폴백을 재사용**합니다.
- 모든 쓰기에 actor 출처를 남깁니다.

```json
{
  "actor": {
    "type": "agent",
    "client_id": "cl_...",
    "model": "...",
    "operator": "team-or-person",
    "harness_version": "editorial.3"
  }
}
```

- 게시된 문서의 개정 이력에 "에이전트 초안 / 사람 검수"가 표시되어야 합니다.
  출처 없는 자동 게시는 허용하지 않습니다.

### Phase 5 — 텔레메트리 read model (봇의 전제조건)

목표: "가장 많이 읽힌 글", "지금 핫한 것"에 답할 수 있는 데이터를 만든다.

**차단 사유:** `activity_events`는 `uniqueIndex(email, kind, entityKey)` 때문에
XP 원장이며 조회수 로그가 아닙니다. 같은 유저의 재방문이 기록되지 않고,
`POST /api/progress`가 인증을 요구하므로 비로그인 트래픽은 아예 없습니다.
따라서 원장과 트래픽 로그를 분리합니다.

```text
page_views            # append-only. 개인정보 없음
  id, path, entity_type, entity_key, locale, day,
  session_hash,       # 일일 회전 salt 해시. 원문 IP·UA 저장 안 함
  referrer_class,     # internal | search | social | direct | app:<client>
  created_at

daily_metrics         # cron 롤업
  day, metric, dimension_key, value
  UNIQUE (day, metric, dimension_key)

resolve_misses        # Phase 2에서 적재
  id, type, query, normalized_query, client_id, hit_count, last_seen_at
```

- "핫한 것"은 누적 합계가 아니라 **오늘 vs 최근 7일 기준선 비율**로 정의합니다.
  정의를 코드 여러 곳에 흩지 않고 지표 카탈로그 한 곳에 둡니다.
- 개인정보: IP·User-Agent 원문 미저장, `session_hash`는 일일 회전 salt,
  raw 90일 / 롤업 무기한 보존.
- **최소 건수 임계값**(예: 5건 미만 차원은 억제)을 read model 단계에서
  적용합니다. Beanote 계약의 T0 규칙과 같은 원칙입니다.
- 지표 카탈로그: `src/lib/metrics/catalog.ts` — 봇·API·관리 화면이 같은 정의를
  공유합니다.

문서: `docs/TELEMETRY-AND-PRIVACY.md`.

### Phase 6 — 운영 봇

목표: 승인된 사람이 자연어로 운영 질문을 하고 즉시 답을 받는다.

설계 원칙:

1. **봇은 SQL을 생성하지 않습니다.** 사전 검수된 **명령 카탈로그(allowlist)** 만
   실행합니다.
2. **라우팅 순서**: 정규식·키워드 매칭(결정적·감사 가능·비용 0) → 미매칭 시
   LLM은 **카탈로그 ID 분류만** 수행 → 그래도 미매칭이면 카탈로그를 보여줍니다.
3. **봇은 표면이 아니라 코어입니다.** 카탈로그 하나에 표면 셋: 웹 관리 콘솔,
   Slack 등 채팅 어댑터, MCP 도구.
4. **읽기는 자동 실행, 쓰기는 확인 필수.** 승인·게시·키 폐기 같은 동작은 확인
   토큰 + 재인증 + 감사 이벤트를 요구합니다.

명령 정의:

```text
id                  # stats.today
patterns            # ko/en 트리거 정규식
params              # 스키마 (기간, 지표, 로케일)
required_role       # owner | admin | editor
required_scope      # metrics:read 등
mode                # read | write
handler             # 파라미터화된 고정 쿼리
formatter           # 표·요약 렌더러
```

초기 카탈로그:

| 명령 | 예시 발화 | 근거 데이터 |
| --- | --- | --- |
| `stats.today` | "오늘의 유저 통계를 내줘" | `daily_metrics` |
| `articles.top_read` | "어떤 게시글이 가장 많이 읽혔지?" | `page_views` 롤업 |
| `trending.now` | "뭐가 가장 핫하지?" | 오늘 vs 7일 기준선 |
| `content.gaps` | "지금 뭘 써야 해?" | `resolve_misses` + 요청 큐 |
| `requests.queue` | "대기 중인 글 요청 보여줘" | `content_requests` |
| `clients.usage` | "어느 앱이 API를 얼마나 썼어?" | `api_client_events` |

가드레일:

- 응답에 이메일·표시명·개별 사용자 식별 정보를 넣지 않습니다. 집계만 반환하고
  최소 건수 임계값을 적용합니다.
- 모든 명령 실행을 감사 로그에 남깁니다: actor, 매칭된 명령 ID, 파라미터,
  반환 행 수, `request_id`. 원문 쿼리 결과는 남기지 않습니다.
- actor별 rate limit.
- `content.gaps`가 Phase 2·3과 루프를 닫습니다. Beanote 스캔이 못 찾은 산지가
  곧 다음에 쓸 글이 됩니다.

문서: `docs/BOT-COMMAND-CATALOG.md`.

크레딧 기반 에이전트로의 확장은 Phase 0의 `api_clients` quota 필드를 그대로
사용합니다. 봇 카탈로그의 명령별 비용을 매기는 것으로 시작합니다.

## 5. 하네스 — 스킬·에이전트·가드레일

기존 편집 하네스의 배치 관례를 따릅니다: 스킬은 `.claude/skills/<name>/SKILL.md`,
에이전트는 `.claude/agents/<name>.md`, 검증은 `scripts/check-*.mjs`이며
`npm run verify`에 연결합니다.

### 5.1 스킬

| 스킬 | 언제 | 하는 일 |
| --- | --- | --- |
| `add-api-endpoint` | 새 v1 엔드포인트 추가 | envelope·스코프·problem+json·캐시·계약 테스트·문서 갱신 체크리스트 강제 |
| `curate-vocabulary` | 어휘 ID 추가·폐기 | ID 규칙 검사, alias 충돌 확인, `replacedBy` 요구, 문서 연결 확인 |
| `triage-content-request` | 요청 큐 처리 | 중복·범위·근거 판정 → accept 시 `write-article`로 인계, decline 시 사유 필수 |
| `add-bot-command` | 봇 명령 추가 | 역할·스코프·mode 지정, 최소 건수 임계값 확인, 고정 쿼리 검토, 테스트 |

### 5.2 에이전트

| 에이전트 | 역할 |
| --- | --- |
| `api-contract-reviewer` | API diff를 `PLATFORM-CONTRACT-V1`에 대조. envelope·에러·커서·스코프 이탈 지적 |
| `privacy-guardian` | 새 필드·엔드포인트·봇 명령의 개인정보 노출, tier, 동의 근거, 최소 건수를 검토. Beanote 계약이 요구하는 통제를 코드 리뷰 단계로 끌어옴 |
| `vocab-steward` | 어휘 ID 위생. 중복·계층 오류·고아 alias·미연결 문서 점검 |
| `demand-analyst` | 텔레메트리와 `resolve_misses`를 우선순위 있는 요청 큐로 변환 |

`privacy-guardian`은 Beanote 문서들이 반복해서 요구하는 통제(로그에 secret·OCR
원문·자유 메모 금지, tier 승인, 최소 건수)를 사람 검토에만 의존하지 않게 하는
장치입니다. 우선순위가 높습니다.

### 5.3 가드레일 스크립트

| 스크립트 | 실패 조건 |
| --- | --- |
| `check-api-contract.mjs` | `src/app/api/*/v1/**` 라우트가 공용 envelope·스코프 선언을 쓰지 않음, 문서화되지 않은 엔드포인트 존재 |
| `check-vocabulary.mjs` | ID 중복·형식 위반, alias 충돌, 없는 `articleSlug` 참조, `replacedBy` 없는 deprecated |
| `check-bot-catalog.mjs` | 역할·스코프·mode 미지정, 카탈로그 외 쿼리, 임계값 없는 집계, 문서 누락 |

세 스크립트를 `npm run verify`에 추가합니다.

### 5.4 문서

| 문서 | 내용 |
| --- | --- |
| `PLATFORM-CONTRACT-V1.md` | 앱 중립 공용 규약 |
| `KNOWLEDGE-API-V1.md` | Phase 2 계약 |
| `CONTENT-REQUEST-API-V1.md` | Phase 3 계약 |
| `TELEMETRY-AND-PRIVACY.md` | Phase 5 지표·보존·개인정보 |
| `BOT-COMMAND-CATALOG.md` | Phase 6 명령 카탈로그 |
| `AGENT-PLATFORM-OPS.md` | 플랫폼 하네스 운영 (편집 운영 문서와 분리) |
| `VOCABULARY-IDS.md` | 어휘 ID 규칙 |

## 6. 공유 패키지

`@company/coffee-protocol` — 앱 사이에 복제하지 않고 공유할 것:

- envelope·problem+json 타입
- 리소스 JSON Schema
- 공용 어휘 ID 상수와 타입
- 얇은 HTTP 클라이언트

각 앱은 계속 독립 배포합니다. 패키지는 계약을 공유하는 수단이고 런타임
결합점이 아닙니다.

## 7. 확정해야 할 항목

1. `suggestions`와 `content_requests`를 한 테이블로 합칠지, 연결만 할지.
2. 봇의 1차 표면은 웹 관리 콘솔인지 채팅 어댑터인지.
3. 관리자 역할을 무엇으로 판별할지. 현재는 `GITHUB_ALLOWED_LOGINS`·
   `GOOGLE_ALLOWED_EMAILS` env allowlist만 있고 역할 개념이 없음.
4. 어휘 초기 범위. 7개 타입을 한 번에 열지, `origin`·`process`·`flavor`부터
   열지.
5. 텔레메트리 raw 보존기간 90일이 적절한지, 지표 정의 변경 시 과거 롤업을
   재계산할지.
6. `@company/coffee-protocol`의 배포 위치(사내 레지스트리 / GitHub Packages).
7. Knowledge API를 완전 공개로 둘지, client key를 필수로 할지.

## 7.1 저장소·역할 경계 결정

**상태: 해결됨 (2026-07-30 합집합 통합).**

이 브랜치가 진행되는 동안 다른 브랜치에서 `808309a`가 계정·권한 기능을
독립적으로 구현했습니다. 두 구현이 같은 문제를 서로 다른 저장소에서
해결했습니다.

| 항목 | D1 커뮤니티·플랫폼 영역 | Supabase 전문성 영역 |
| --- | --- | --- |
| 저장소 | Cloudflare D1 (`getD1()`) | Supabase PostgREST (`SUPABASE_URL`) |
| 테이블 키 | `profiles.email` | `profiles.account_key` |
| 역할 컬럼 | `profiles.role` = 운영 권한 | `profiles.role` = 커피 직군, `profiles.is_admin` = 자격 심사 권한 |
| 부트스트랩 env | `PLATFORM_OWNER_EMAILS` | `ADMIN_EMAILS` |
| 구현 | `src/lib/roles.ts` | `src/lib/admin.ts`, `src/lib/profile-store.ts` |

두 테이블은 이름만 같고 서로 다른 bounded context입니다. D1 프로필은 로그인,
커뮤니티, XP와 플랫폼 운영 권한의 정본이며 사이트 핵심 런타임에 속합니다.
Supabase 프로필은 닉네임, 커피 직군, 실력 측정, 자격 증빙을 위한 선택적
전문성 확장입니다. 따라서 Supabase가 중지되어도 `resolveRole()`과 봇 권한
판정은 D1만 사용하며 영향을 받지 않습니다.

환경변수도 하나로 합치지 않습니다. `PLATFORM_OWNER_EMAILS`는 플랫폼 전체의
owner 권한을, `ADMIN_EMAILS`는 전문 자격 증빙 심사 권한만 부여합니다. 한쪽의
관리자가 자동으로 다른 쪽 권한까지 얻지 않게 하는 최소 권한 분리입니다.
Supabase `profiles.role`은 `CoffeeRole`로 타입이 고정되어 있어 운영 권한으로
사용할 수 없습니다.

## 8. 작업 격리 규칙

이 기획은 다른 세션과 병행 진행됩니다.

- Beanote 계약 문서군(`BEANOTE-*`, `beanote-*.json`)과 `src/content/articles/*`는
  이 작업에서 수정하지 않습니다.
- `PLATFORM-CONTRACT-V1.md`는 Beanote 문서 내용을 복제하지 않고 승격·참조합니다.
- 공유 파일(`db/schema.ts`, `package.json`, `src/content/index`)을 수정할 때는
  변경 범위를 먼저 확인하고 해당 경로만 명시적으로 stage합니다.
