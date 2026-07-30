# Bean Wiki 에이전트 플랫폼 운영

> 목적: API·어휘·요청 큐·봇 변경을 여러 에이전트가 반복 가능하게 만들고, 계약과
> 개인정보 통제를 사람 검토에만 의존하지 않게 합니다. 규약은
> `docs/PLATFORM-CONTRACT-V1.md`가 SSOT입니다. 원고 운영은
> `docs/AGENT-EDITORIAL-OPS.md`가 담당하고 이 문서는 플랫폼·API 쪽만 다룹니다.

## 현재 반영 흐름

- 에이전트가 파일을 수정하는 것만으로는 API가 동작하지 않습니다. 라우트는
  `src/app/api/<domain>/v1/**`, 공용 계층은 `src/lib/api/*`, 스키마는
  `db/schema.ts` + `drizzle/`입니다.
- 콘텐츠 퍼블리시(`npm run publish:content*`)는 **콘텐츠 경로만** 스테이징합니다.
  API 변경은 그 경로에 없으므로 별도 커밋이 필요합니다.
- 스키마 변경은 `npm run db:generate`로 마이그레이션을 만들고 D1에 적용해야
  실제로 존재합니다. 라우트만 머지하면 런타임에 `storage_unavailable`이 됩니다.
- `db/schema.ts`, `package.json`, `src/content/index`는 다른 세션과 공유하는
  파일입니다. 수정 시 변경 범위를 먼저 확인하고 해당 경로만 명시적으로 stage합니다.

## 어떤 변경에 어떤 스킬인가

| 변경 | 스킬 | 산출물 |
| --- | --- | --- |
| 새 `/api/<domain>/v1` 엔드포인트, 기존 v1 라우트 수정 | `add-api-endpoint` | 라우트 + 계약 문서 표 + `check-api-contract` 통과 |
| 어휘 엔티티 추가·폐기, alias 보강 | `curate-vocabulary` | `src/content/vocabulary/*.ts` + `check-vocabulary` 통과 |
| 요청 큐 처리, accept·decline·duplicate 판정 | `triage-content-request` | 상태 전이 + 종결 설명 필드 + 미스 행 연결 |
| 봇 명령 추가·수정 | `add-bot-command` | `src/lib/bot/catalog.ts` + `docs/BOT-COMMAND-CATALOG.md` + `check-bot-catalog` 통과 |
| accept된 요청의 실제 집필 | `write-article` (편집 하네스) | `draft: true` 원고 + 패널 게이트 |
| 지표 정의 추가 | `add-bot-command` 1단계 | `src/lib/metrics/catalog.ts` + `docs/TELEMETRY-AND-PRIVACY.md` §8 표 |

스킬 밖에서 손으로 하지 않는 것: 라우트 응답을 직접 `Response.json`으로 만드는 것,
어휘 ID를 바꾸는 것, 상태 컬럼을 직접 UPDATE하는 것, 봇 handler에 새 SQL을
문자열로 조립하는 것.

## 에이전트 라인업

| 에이전트 | 역할 | 도구 |
| --- | --- | --- |
| `api-contract-reviewer` | API diff를 `PLATFORM-CONTRACT-V1.md`에 대조. envelope·오류 코드·커서·스코프·감사 이탈을 `file:line`으로 지적 | Read, Grep, Glob |
| `privacy-guardian` | 새 필드·엔드포인트·텔레메트리 컬럼·봇 명령·로그 줄의 개인정보 노출, 최소 인원 기준, tier, 동의, 보존, 두 방향 비대칭 검토 | Read, Grep, Glob |
| `vocab-steward` | 어휘 위생. 중복·근접 중복, 잘못된 parent, 고아·모호 alias, 미연결 엔티티, 폐기 상태, 문서 대비 커버리지 공백 | Read, Grep, Glob |
| `demand-analyst` | `resolve_misses`·`daily_metrics`·요청 큐를 "다음에 쓸 글" 순위 목록으로 변환 | Read, Grep, Glob, Bash |

## 머지 전에 무엇을 돌리는가

| 변경 성격 | 필수 에이전트 | 비고 |
| --- | --- | --- |
| **데이터 흐름을 건드리는 모든 변경** | `api-contract-reviewer` + `privacy-guardian` **둘 다** | 새 엔드포인트, 새 응답 필드, 새 컬럼, 새 로그·감사 줄, 새 봇 명령, 새 지표. 한쪽만 돌린 변경은 머지하지 않습니다 |
| 라우트 리팩터링(응답 표면 불변) | `api-contract-reviewer` | 표면이 정말 불변인지 판단이 어려우면 `privacy-guardian`도 돌립니다 |
| 어휘 변경 | `vocab-steward` | 새 문서가 머지된 직후에도 돌립니다 |
| 요청 큐 트리아지 | `demand-analyst` (우선순위 판단이 필요할 때) | 판정 자체는 스킬이 합니다 |
| 콘텐츠 기획 | `demand-analyst` | 산출물을 `write-article`에 넘깁니다 |

`privacy-guardian`이 우선순위가 높은 이유: Beanote 계약 문서들이 반복해서 요구하는
통제(로그에 secret·OCR 원문·자유 메모 금지, tier 승인, 최소 건수)를 사람 검토에만
맡기지 않으려는 장치입니다. `VERDICT: BLOCK`이면 머지하지 않습니다.

## 검토 순서

한 파일에 여러 검토가 붙을 때는 이 순서입니다. 앞 단계의 실패를 고치지 않고 다음
단계로 넘어가지 않습니다.

1. `npx tsc --noEmit` — 타입이 맞지 않는 코드는 검토 대상이 아닙니다.
2. `npm run check:platform` — 정규식으로 잡히는 것을 사람·에이전트가 다시 찾게
   하지 않습니다. 경고까지 0으로 만듭니다.
3. `api-contract-reviewer` + `privacy-guardian` **병렬**(한 메시지에서 동시 실행).
4. BLOCKER 수정 → 3번 재실행. 지적을 기각했으면 기각 사유를 보고에 남깁니다.
5. 어휘가 바뀌었으면 `vocab-steward`.
6. 스키마가 바뀌었으면 `npm run db:generate` + 마이그레이션 적용 확인.
7. 커밋. 사용자가 요청했을 때만.

같은 파일을 두 에이전트가 동시에 수정하지 않습니다. 검토 에이전트는 모두
읽기 전용(`Read, Grep, Glob`)이므로 병렬 실행이 안전합니다.

## 가드레일 스크립트

| 스크립트 | 보장하는 것 | 보장하지 않는 것 |
| --- | --- | --- |
| `node scripts/check-api-contract.mjs` | `src/app/api/**/v1/**`의 모든 라우트가 ① HTTP 핸들러를 export ② `Response.json`·맨 `new Response` 미사용(`preflight()` 예외) ③ `ok()`/`problem()` 호출 ④ 오류 코드가 `PROBLEMS` 카탈로그에 존재 ⑤ 스코프를 `SCOPES` 상수로 선언 또는 `optionalClient()` 또는 `CONTRACT_AUTH = "public"` + `// contract-exempt:` 사유 ⑥ 쓰기 메서드가 `requireClient()` 사용 ⑦ `D1UnavailableError` 검사 시 나머지 예외 rethrow ⑧ `offset`·`page` 페이징 미사용 ⑨ credential을 query string에서 읽지 않음 | 정렬이 실제로 결정적인지, `detail`이 실제로 안전한지, 전이가 실제로 표를 통과하는지. 문서 미기재와 `runtime` 미고정, `console.*`은 **경고**이며 실패가 아닙니다 |
| `node scripts/check-vocabulary.mjs` | ID 중복·형식·접두사, 라벨 존재, alias 정규화·충돌(라벨 포함), `parent` 존재·자기참조·순환, `articleSlug`·`glossaryTerm` 실존, 폐기 계약(`replacedBy` 필수·비체인), `source` 실존, 배열 리터럴이 순수 JSON, `index.ts` export·import | 개념 중복, 위계의 타당성, alias의 모호성 — `vocab-steward`의 몫입니다 |
| `node scripts/check-bot-catalog.mjs` | 명령마다 `id`·`requiredRole`(ROLES 내)·`requiredScope`(`SCOPES.<key>` 형식)·`mode`·`handler`·`metricId`·패턴·예시가 있음, `handler`가 `execute.ts`에 실제로 구현됨, **SQL 템플릿에 `${…}` 보간 없음**(`${placeholders}` 예외), `execute.ts`가 억제 헬퍼를 호출함, `SELECT`에 `email`·`display_name`·`session_hash`·`secret_hash`·`body_html` 없음, write 명령이 있으면 확인 절차 + `consumed_at IS NULL` 단발성이 구현됨, `router.ts`가 모호·분류기 매칭을 read로 제한함 | 패턴이 실제로 의도한 발화를 잡는지, **개별 handler가 억제를 건너뛰었는지**(파일 단위로 호출 존재만 봅니다). 한국어·영어 패턴 누락과 문서 미기재는 **경고**입니다 |
| `node scripts/check-content.mjs` / `check-editorial.mjs` | 콘텐츠 게이트(편집 하네스) | API·어휘는 대상이 아닙니다 |

세 플랫폼 스크립트는 `npm run check:platform`으로 묶여 `npm run verify`에
연결되어 있습니다.

```bash
npm run check:vocabulary    # scripts/check-vocabulary.mjs
npm run check:api-contract  # scripts/check-api-contract.mjs
npm run check:bot-catalog   # scripts/check-bot-catalog.mjs
npm run check:platform      # 위 셋
npm run verify              # lint → check-content → check:editorial → check:platform → build
```

`npm run verify`는 마지막에 `next build`를 돌립니다. 검토 루프에서는
`npm run check:platform`만 돌리는 편이 빠릅니다.

## 자격증명 수명 주기

발급:

```bash
node scripts/mint-api-client.mjs --name "Beanote" --org "Beanote" \
  --scopes knowledge:read,content-requests:write --type human_app --tier T1 --rate 60
```

- 평문 자격증명은 `bwk_<prefix12>_<secret43>`이며 **이 출력에서 한 번만** 보입니다.
  DB에는 `secret_prefix`(평문 조회 키)와 `secret_hash`(SHA-256)만 들어갑니다.
  복구 기능은 없습니다.
- 스크립트는 INSERT 문을 출력합니다. 적용은 별도입니다.
  `npx wrangler d1 execute bean-wiki --remote --command "<sql>"`
- `--type`: `human_app` | `agent` | `internal`. `internal`만
  `POST /api/telemetry/v1/rollup`을 트리거할 수 있습니다.
- Supabase 원본 조회 데이터 정리는 별도 Vercel Cron
  (`GET /api/telemetry/retention`)이 담당합니다. 운영 환경의
  `CRON_SECRET`이 없으면 요청은 닫힌 상태로 401을 반환합니다.
- 스코프는 `src/lib/api/scopes.ts`의 `SCOPES` / 스크립트의 `KNOWN_SCOPES` /
  계약 §8.1 표 **세 곳이 일치**해야 합니다. 어긋나면 발급이 거부되거나 라우트가
  `internal`(500)로 실패합니다. 가드레일은 `scopes.ts`만 정본으로 보므로 이
  드리프트를 잡지 못합니다 — 스코프를 추가할 때 손으로 세 곳을 확인합니다.
- 운영·스테이징 자격증명을 분리합니다.

회전:

- 같은 client id로 스크립트를 다시 실행하고 `secret_prefix` + `secret_hash`를
  UPDATE합니다. `id`는 유지하므로 감사 기록의 연속성이 끊기지 않습니다.
- 회전 사실을 `api_client_events`에 남깁니다(계약 §13: credential 발급·회전·폐기).
- 호출자에게 새 평문을 전달할 때 채팅·이슈·커밋 메시지를 쓰지 않습니다.

폐기·정지:

| 상태 | 효과 |
| --- | --- |
| `status = 'suspended'` | `requireClient()`가 `forbidden_scope`로 거절하고 감사에 `status_suspended`를 남깁니다 |
| `status = 'revoked'` | 같은 경로로 거절. 행은 남겨 감사 이력을 보존합니다 |
| `expires_at` 경과 | `forbidden_scope` "Credential has expired." |
| 행 삭제 | 하지 않습니다. 과거 `api_client_events`가 고아가 됩니다 |

한도:

- `rate_limit_per_min` — client별 분 단위 고정 창(`api_rate_buckets`).
- `quota_limit` — 기간 누적. `null`이면 무제한. 크레딧 기반 에이전트 과금은 이
  필드를 그대로 씁니다.
- `ip_allowlist` — 비어 있으면 검사하지 않습니다. 채우면 `x-forwarded-for` 첫 값
  또는 `cf-connecting-ip`이 목록에 있어야 합니다.
- `max_tier` — 스코프와 별개인 상한입니다. tier 요건은 tier가 명시적으로 부여된
  스코프만 통과합니다.

환경 바인딩:

| 이름 | 없으면 |
| --- | --- |
| `AUTH_TRUST_PLATFORM_HEADERS` | 게이트웨이 신원 헤더를 **완전히 무시**합니다. OpenAI Apps 인증 프록시 배포에서만 `1` 또는 `true`로 설정합니다 |
| `PLATFORM_GATEWAY_SECRET` | 게이트웨이 신원 헤더를 **완전히 무시**합니다. 16자 이상의 값을 opt-in과 함께 설정해야 하며 기본값은 닫힘입니다 |
| `TELEMETRY_SALT` | `session_hash`가 요청별 난수가 되어 세션 그룹핑을 잃습니다. salt 없는 해시로 폴백하지 않습니다 |
| `KNOWLEDGE_API_CORS_ORIGINS` | 기본 allowlist(`https://bean-wiki.vercel.app`)만 허용 |
| `PLATFORM_OWNER_EMAILS` | 새 DB에 역할을 부여할 수 있는 사람이 없습니다 |

## 봇 운영

- 표면은 셋(웹 관리 콘솔, 채팅 어댑터, MCP 도구)이고 코어는 하나
  (`POST /api/bot/v1/commands`)입니다. 표면마다 카탈로그를 복제하지 않습니다.
- 클라이언트 자격증명은 **어댑터**를 인증합니다. 사람이 아닙니다. 어댑터는
  `on_behalf_of`로 운영자 계정을 밝혀야 하고, 실행 권한은 그 운영자의
  `profiles.role`이 결정합니다. 없으면 `invalid_request`입니다.
- 읽기는 자동 실행, 쓰기는 확인 토큰(`bcf_…`, TTL 5분, 단발성, actor·command
  바인딩) 2단계입니다.
- 모호한 매칭은 실행하지 않습니다. read 후보가 정확히 1개일 때만 자동 선택되고,
  분류기(LLM)는 read 전용 후보 목록만 받습니다. 쓰기는 명시 지정만 가능합니다.
- 모든 실행이 `bot_command_events`에 남습니다. **원문 메시지와 결과 행은 남기지
  않습니다.**

## 절대 하지 않는 것

| 금지 | 이유 | 대신 |
| --- | --- | --- |
| 봇이 SQL을 생성 | 프롬프트 인젝션의 피해가 "임의 쿼리 실행"으로 확대됩니다 | `BOT_COMMANDS`의 고정 파라미터화 쿼리. LLM은 카탈로그 ID 분류만 |
| 사람 검수 없이 기여를 게시 | 출처 없는 자동 게시는 되돌릴 근거가 없습니다 | `POST /api/requests/v1/contributions`는 `received`에 멈춥니다. 기존 편집 게이트 + 사람 승인 커밋 또는 PR 제안 |
| 명시적 opt-in 또는 공유 비밀 확인 없이 게이트웨이 신원 헤더를 신뢰 | 배포처가 직접 접근 가능하면 임의 호출자가 타인 신원을 주장할 수 있습니다 | `AUTH_TRUST_PLATFORM_HEADERS=1`과 16자 이상의 `PLATFORM_GATEWAY_SECRET`을 모두 요구하고, `x-platform-gateway-secret`을 상수 시간 비교. 하나라도 없으면 헤더 무시 |
| 최소 인원 기준 미달 집계를 노출 | 1~4 세션 뒤의 행은 그 사람을 지목하는 것에 가깝습니다 | `applySuppression()` / `suppressSmall(rows, "subject_count")`, `K_ANONYMITY_FLOOR = 5`. 억제 건수를 함께 보고 |
| 어휘 ID를 삭제하거나 변경 | 외부 앱 DB에 저장된 값입니다 | `status: "deprecated"` + `replacedBy`. 이름이 바뀌면 `labels`만 |
| 상태 컬럼을 직접 UPDATE | "accepted를 거치지 않은 published"가 표현 가능해집니다 | `transitionRequest()` / `PATCH …/content-requests/{id}` |
| `Response.json({ error })` | 클라이언트가 두 가지 오류 형식을 처리해야 합니다 | `problem(code)` — `PROBLEMS` 카탈로그 |
| 모든 예외를 503으로 매핑 | 결함이 장애로 위장됩니다 | `D1UnavailableError`만 503, 나머지는 rethrow → 500 |
| 로그·감사에 secret·token·OCR 원문·자유 서술·만료 asset URL 기록 | 계약 §13 | `request_id`로만 추적 |
| 텔레메트리 표에 IP·User-Agent·이메일 저장 | 복원·프로파일링이 가능해집니다 | 일일 회전 salt의 `session_hash`만 |
| 지식 API에 tier·동의 기계를 얹기 | 이미 공개된 CC-BY 콘텐츠에 의례를 붙이는 것뿐입니다 | 캐시 + rate limit + CORS allowlist |
| 수령 경로에 지식 API의 관례(익명 읽기, 공개 캐시)를 복사 | T1 가명 기록이 공개 캐시로 나갑니다 | `requireClient()` + tier 검사 + 감사 |
| v1 안에서 필드 삭제·의미 변경·필수화 | 클라이언트가 조용히 깨집니다 | major 상승, 이전 major를 최소 한 릴리스 병행 |
| credential을 query string으로 받기 | 로그·리퍼러에 남습니다 | `Authorization: Bearer` 헤더만 |

## 운영 체크리스트

- 같은 파일을 두 에이전트가 동시에 수정하지 않았는지 확인합니다.
- `api-contract-reviewer`와 `privacy-guardian`의 `VERDICT`가 둘 다 `PASS`인지
  확인합니다. 기각한 지적은 사유를 보고에 남깁니다.
- 가드레일 스크립트의 **경고까지** 0인지 확인합니다. 경고를 남긴 채 머지하지
  않습니다.
- 라우트를 추가했으면 해당 `docs/*-API-V1.md` 표에 행이 있는지 확인합니다.
- 스키마를 바꿨으면 마이그레이션이 생성·적용됐는지 확인합니다.
- 자격증명을 발급·회전했으면 평문이 대화 기록·커밋에 남지 않았는지 확인합니다.
- 어휘를 바꿨으면 `check-vocabulary` 요약의 엔티티 수·매칭 키 수·충돌 0을
  보고에 인용합니다.
- 커밋 메시지는 Conventional Commit입니다. API·어휘·봇 변경은 콘텐츠 커밋과
  분리합니다.
  - 예: `feat(api): add knowledge/v1/entities list endpoint`
  - 예: `chore(vocab): deprecate origin:et-yirga in favour of origin:et-yirgacheffe`
