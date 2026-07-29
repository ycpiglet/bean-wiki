# 운영 봇 명령 카탈로그

- 문서 ID: `bot-command-catalog`
- 계약 버전: `1`
- 상태: 구현 기준
- 갱신일: 2026-07-28
- 대상: 운영자, 봇 어댑터 개발자

승인된 운영자가 자연어로 운영 질문을 하고 즉시 답을 받는 창구입니다.
구현은 `src/lib/bot/`이고 엔드포인트는 `POST /api/bot/v1/commands`입니다.

## 1. 설계 원칙

### 1.1 봇은 SQL을 생성하지 않는다

봇은 **사전 검수된 고정 명령 카탈로그**만 실행합니다. 메시지는 명령 ID로만
매핑되고, 쿼리는 `src/lib/bot/execute.ts`와
`src/lib/metrics/catalog.ts`에 전문이 적혀 있습니다.

프롬프트 인젝션이나 창의적인 표현의 최대 피해는 "이 목록에서 잘못된 명령을
골랐다"이며, "운영자 권한으로 임의 SQL을 실행했다"가 될 수 없습니다.
`scripts/check-bot-catalog.mjs`가 SQL 템플릿에 값이 보간되면 빌드를
실패시킵니다.

### 1.2 라우팅 순서

```text
1. 정규식·키워드 매칭      결정적·감사 가능·비용 0
2. (선택) 분류기            카탈로그 ID만 반환. read 명령만 대상
3. 미매칭                   카탈로그를 보여주고 아무것도 실행하지 않음
```

현재 분류기는 연결되어 있지 않습니다. 검수된 분류기가 들어오기 전까지
라우팅은 완전히 결정적이며, 미매칭 메시지는 추측하지 않고 명령 목록을
반환합니다.

모호한 매칭(여러 명령이 걸림)에서는 **쓰기 명령이 절대 선택되지 않습니다.**
read 명령이 정확히 하나면 그것을 택하고, 그렇지 않으면 `ambiguous`로
되돌립니다. 구현: `src/lib/bot/router.ts`.

### 1.3 봇은 표면이 아니라 코어

명령 카탈로그 하나에 표면 셋이 붙습니다.

| 표면 | 인증 |
| --- | --- |
| 웹 관리 콘솔 | 세션 쿠키 + `profiles.role` |
| 채팅 어댑터 (Slack 등) | client credential(`bot:command`) + `on_behalf_of` |
| MCP 도구 | 위와 동일 |

**중요:** client credential은 *어댑터*를 인증하는 것이고 사람을 인증하는 것이
아닙니다. 어댑터는 `on_behalf_of`에 실제 운영자 계정을 넣어야 하며, 실행
권한은 그 운영자의 `profiles.role`로 판정합니다. 이 규칙이 없으면 채팅 채널에
있는 누구나 어댑터의 권한을 물려받습니다.

### 1.4 읽기는 자동, 쓰기는 확인

`mode: "write"` 명령은 한 번의 메시지로 실행되지 않습니다.

```text
1차 호출  → 무엇을 할 것인지 설명 + confirmation_token (5분 유효)
2차 호출  → token 제시 시에만 실행
```

토큰은 단일 사용이며 `consumed_at IS NULL` 조건부 UPDATE로 소비되므로 동시
호출이 둘 다 통과할 수 없습니다. actor와 command가 발급 시점과 다르면
거부합니다. 구현: `src/lib/bot/audit.ts`.

## 2. 명령 목록

| ID | 역할 | scope | mode | 지표 |
| --- | --- | --- | --- | --- |
| `stats.today` | admin | `metrics:read` | read | `views.total`, `views.unique_sessions` |
| `articles.top_read` | editor | `metrics:read` | read | `articles.top_read` |
| `trending.now` | editor | `metrics:read` | read | `trending.now` |
| `content.gaps` | editor | `metrics:read` | read | `resolve.top_misses` |
| `requests.queue` | editor | `metrics:read` | read | — |
| `clients.usage` | admin | `metrics:read` | read | — |
| `requests.triage` | admin | `content-requests:triage` | **write** | — |

### 2.1 `stats.today` — 오늘의 이용 통계

- 예시: `오늘의 유저 통계를 내줘`, `오늘 통계 보여줘`, `today's stats`
- 파라미터: `day`(선택, `YYYY-MM-DD` 또는 `yesterday`)
- 반환: 조회수, 고유 세션, 전일 대비 변화율, 미처리 요청 수
- 고유 세션이 최소 인원 기준(5) 미만이면 문서별 분해를 제공하지 않고 그
  사실을 함께 알립니다.

### 2.2 `articles.top_read` — 가장 많이 읽힌 문서

- 예시: `어떤 게시글이 가장 많이 읽혔지?`, `이번 주 인기 문서 알려줘`
- 파라미터: `window_days`(기본 7), `limit`(기본 10)
- **`activity_events`가 아니라 `page_views`를 읽습니다.** 전자는
  `uniqueIndex(email, kind, entity_key)` 때문에 재방문을 기록하지 않는 XP
  원장이므로 조회수 질문에 답할 수 없습니다.

### 2.3 `trending.now` — 지금 뜨는 문서

- 예시: `뭐가 가장 핫하지?`, `what's hot`
- 누적 순위가 **아닙니다.** 오늘의 조회 속도를 최근 7일 기준선과 비교한
  상승률이며, 최소 조회수·최소 세션 문턱을 넘겨야 등장합니다. 정확한 산식은
  `src/lib/metrics/catalog.ts`의 `TRENDING_FORMULA`와
  [TELEMETRY-AND-PRIVACY](./TELEMETRY-AND-PRIVACY.md)에 있습니다.

### 2.4 `content.gaps` — 콘텐츠 공백

- 예시: `지금 뭘 써야 해?`, `콘텐츠 공백 보여줘`
- 파라미터: `window_days`(기본 30), `limit`(기본 15)
- 출처는 `resolve_misses`, 즉 외부 앱이 `/api/knowledge/v1/resolve`로
  정규화하려다 실패한 용어입니다. 이미 요청이 등록된 항목은 제외합니다.
- **이 명령이 루프를 닫습니다.** 테이스팅 카드 스캐너가 못 찾은 산지가 곧
  다음에 쓸 글이 됩니다. Knowledge API → 공백 → 요청 큐 → 문서 게시 →
  다시 resolve 성공.

### 2.5 `requests.queue` — 콘텐츠 요청 큐

- 예시: `대기 중인 글 요청 보여줘`, `open requests`
- 파라미터: `status`(선택), `limit`(기본 20)
- 사람 제안과 기계 요청을 한 목록에서 보여주고 `client_id` 유무로 구분합니다.
- 종결 상태(`published`/`declined`/`duplicate`)는 기본 제외입니다.

### 2.6 `clients.usage` — API 클라이언트 사용량

- 예시: `어느 앱이 API를 얼마나 썼어?`
- 파라미터: `window_days`(기본 7), `limit`(기본 20)
- 클라이언트 단위 호출 수와 거절 수만 반환합니다. 요청 본문, scope secret,
  최종 사용자 단위 분해는 포함하지 않습니다.

### 2.7 `requests.triage` — 요청 상태 변경 (쓰기)

- 확인 토큰 필수. 실제 상태 전이는
  `PATCH /api/requests/v1/content-requests/{id}`의 전이 표를 따릅니다.
- 종결 상태는 설명 필드를 요구합니다
  (`published`→`resolution_article_slug`, `declined`→`declined_reason`,
  `duplicate`→`duplicate_of`).

## 3. 가드레일

| 규칙 | 강제 위치 |
| --- | --- |
| SQL 생성 금지 | `scripts/check-bot-catalog.mjs` — SQL 템플릿 값 보간 시 실패 |
| 개인정보 컬럼 조회 금지 | 같은 스크립트 — `email`, `display_name`, `session_hash`, `secret_hash`, `body_html` 선택 시 실패 |
| 최소 인원 기준 | `applySuppression()` / `suppressSmall()`, `K_ANONYMITY_FLOOR = 5` |
| 역할·scope·mode 선언 | 같은 스크립트 — 누락 시 실패 |
| 쓰기 확인 흐름 | 같은 스크립트 — 확인 함수와 단일 사용 조건 존재 확인 |
| 모호할 때 쓰기 금지 | `router.ts`, 스크립트가 `mode === "read"` 제한을 확인 |
| 핸들러 실존 | 같은 스크립트 — `execute.ts`에 `case` 없으면 실패 |
| 한국어·영어 트리거 | 같은 스크립트 (경고) |

응답에 **넣지 않는 것**: 이메일, 표시명, 개별 사용자 행, 세션 해시, secret,
요청 본문.

감사 기록(`bot_command_events`)에 **넣지 않는 것**: 원본 메시지 텍스트,
결과 행 내용. 기록하는 것은 actor, 역할, 매칭된 명령 ID, 파라미터, 반환 행
수, 숨긴 행 수, `request_id`입니다.

## 4. 요청 형식

```http
POST /api/bot/v1/commands
Authorization: Bearer bwk_<prefix>_<secret>
Content-Type: application/json

{
  "message": "뭐가 가장 핫하지?",
  "on_behalf_of": "operator@example.com",
  "surface": "slack"
}
```

응답은 공용 envelope이며 `schema_version`은 `bot_command_result.v1`입니다.

```json
{
  "contract_version": 1,
  "schema_version": "bot_command_result.v1",
  "request_id": "req_…",
  "snapshot_at": "2026-07-28T09:40:00Z",
  "data": {
    "matched": true,
    "command_id": "trending.now",
    "match_source": "pattern",
    "params": { "limit": 10 },
    "text": "**지금 뜨는 문서**\n1. …",
    "result": { "metric": "trending.now", "rows": [] },
    "suppressed": 0
  }
}
```

`message`와 `command_id`가 모두 없으면 역할에 허용된 명령 목록을 반환합니다.
`GET`은 실행 없이 같은 목록만 반환합니다.

## 5. 명령 추가 절차

`.claude/skills/add-bot-command`를 사용합니다. 요약:

1. `src/lib/bot/catalog.ts`에 `requiredRole`, `requiredScope`, `mode`,
   한국어·영어 `patterns`, `examples`, `metricId`(또는 `null`), `handler`를
   모두 채워 추가한다.
2. 지표 읽기라면 `src/lib/metrics/catalog.ts`에 지표를 먼저 정의한다.
   테이블 직접 조회라면 `execute.ts`에 파라미터 바인딩 쿼리를 전문으로
   적는다.
3. 집계는 `applySuppression()`을 통과시킨다.
4. 쓰기라면 확인 흐름을 거치게 한다.
5. 이 문서에 명령을 추가한다.
6. `npm run check:bot-catalog`를 통과시킨다.

## 6. 미해결

- 분류기 미연결. 결정적 매칭이 실패하면 카탈로그를 보여주는 것이 현재
  동작입니다.
- 채팅 어댑터(Slack 등) 미구현. 코어와 엔드포인트만 존재합니다.
- `requests.triage`는 확인 토큰 발급까지 구현되어 있고, 실제 전이는 콘텐츠
  요청 API를 호출해야 합니다. 봇 내부에서 전이를 수행하지는 않습니다.
- 익명 트래픽에 대한 봇 rate limit은 client rate limit에 의존합니다.
