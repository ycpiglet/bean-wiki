# 플랫폼 공용 계약 v1

- 문서 ID: `platform-contract-v1`
- 계약 버전: `1`
- 상태: 구현 기준
- 갱신일: 2026-07-28
- 대상: 회사 내 모든 앱과 AI 에이전트

이 문서는 **앱에 중립적인 공통 규약**입니다. envelope, 오류, 페이지네이션,
인증, 버전 호환을 정의하고 도메인 리소스는 정의하지 않습니다.

리소스 계약은 각 문서를 정본으로 씁니다.

| 문서 | 범위 |
| --- | --- |
| [KNOWLEDGE-API-V1](./KNOWLEDGE-API-V1.md) | Bean Wiki가 제공하는 커피 지식 |
| [CONTENT-REQUEST-API-V1](./CONTENT-REQUEST-API-V1.md) | Bean Wiki가 받는 콘텐츠 요청·기여 |
| [BEANOTE-DATA-API-V1](./BEANOTE-DATA-API-V1.md) | Beanote가 제공하는 음용·스캔 기록 |
| [TELEMETRY-AND-PRIVACY](./TELEMETRY-AND-PRIVACY.md) | 사용 통계 지표와 보존 |
| [VOCABULARY-IDS](./VOCABULARY-IDS.md) | 공용 어휘 ID 규칙 |

이 규약은 Beanote Data API v1에서 이미 합의된 규칙을 앱 중립으로 승격한
것입니다. 내용을 복제하지 않고, Beanote 문서는 이 규약을 참조합니다.

## 1. 적용 범위

`/api/<domain>/v1/**` 경로의 모든 엔드포인트가 이 규약을 따릅니다.

규약 밖에 있는 것:

| 경로 | 이유 |
| --- | --- |
| `/api/integrations/coffee-cherry` | v1 이전 계약. 외부 앱이 이미 `{ imported }` 응답에 통합되어 있어 응답 형식을 바꾸지 않고 인증만 승격했습니다 |
| `/api/auth/*`, `/api/me`, `/api/progress` 등 | 브라우저 세션용 내부 라우트 |

새 기계 대상 엔드포인트는 예외 없이 `/api/<domain>/v1` 아래에 둡니다.

## 2. 메시지 형식

| 전달면 | 형식 |
| --- | --- |
| API 성공 응답 | JSON envelope |
| API 오류 응답 | `application/problem+json` (RFC 9457) |
| 대량 Export | JSONL + `manifest.json` |
| 사람이 열어볼 표 | 데이터셋별 CSV |
| 이미지·바이너리 | 별도 파일 또는 만료 URL. base64 금지 |

"JSON이냐 JSONL이냐"는 양자택일이 아닙니다. 호출 단위 응답은 JSON,
레코드 스트림은 JSONL입니다.

## 3. 성공 envelope

구현: `src/lib/api/envelope.ts`의 `ok()`.

```json
{
  "contract_version": 1,
  "schema_version": "coffee_entity.v1",
  "request_id": "req_0f3a9c21b47e5d6081af2c34",
  "snapshot_at": "2026-07-28T09:12:00Z",
  "page": { "limit": 100, "has_more": false, "next_cursor": null },
  "data": []
}
```

| 필드 | 규칙 |
| --- | --- |
| `contract_version` | envelope·페이지네이션·오류의 major. 현재 `1` |
| `schema_version` | `<resource>.v<major>` 형식의 리소스 스키마 |
| `request_id` | 호출 추적 ID. 데이터 ID가 아니며 로그·오류 본문에 넣어도 안전 |
| `snapshot_at` | 이 페이지 집합이 기준으로 삼는 시각 |
| `page` | 목록 응답에만 존재 |
| `data` | 리소스 배열 또는 객체 |

- 모든 응답에 `X-Request-Id` 헤더를 함께 둡니다.
- timestamp는 RFC 3339입니다. 서버 이벤트는 UTC `Z`로 보냅니다. 사용자
  행위 시각은 당시 offset을 보존하고 IANA 시간대 이름을 별도 필드에 둡니다.
- `NaN`, `Infinity`, `undefined`를 JSON에 넣지 않습니다. 값이 없으면 `null`과
  상태를 함께 보냅니다(5절).

라우트가 `Response.json({ error })`를 직접 만들면 `scripts/check-api-contract.mjs`가
빌드를 실패시킵니다.

## 4. 오류

구현: `src/lib/api/envelope.ts`의 `problem()`.

```json
{
  "type": "https://bean-wiki.vercel.app/problems/forbidden-scope",
  "title": "Scope or tier not granted",
  "status": 403,
  "detail": "Scope `content-requests:write` is required.",
  "request_id": "req_0f3a9c21b47e5d6081af2c34"
}
```

| 코드 | 상태 | 의미 | 재시도 |
| --- | --- | --- | --- |
| `invalid-request` | 400 | query/body 문법 오류 | 수정 전 금지 |
| `unauthorized` | 401 | credential 없음·불일치 | 중단 |
| `forbidden-scope` | 403 | scope·tier·상태 부족 | 권한 변경 전 중단 |
| `not-found` | 404 | 리소스 없음 또는 비공개 | 중단 |
| `state-conflict` | 409 | 상태 전이 충돌 | 최신 상태 조회 후 |
| `cursor-expired` | 410 | cursor 만료 | 새 snapshot |
| `unprocessable` | 422 | 문법은 맞고 의미 검증 실패 | 입력 수정 |
| `rate-limited` | 429 | 분당 한도 초과 | `Retry-After` 이후 |
| `quota-exhausted` | 429 | 기간 quota 소진 | 기간 갱신 후 |
| `internal` | 500 | 서버 결함 | 제한된 지수 backoff |
| `storage-unavailable` | 503 | 저장소 미연결 | 제한된 지수 backoff |

- `detail`은 사람이 읽는 안전한 요약입니다. secret, 개인정보, 내부 스택,
  쿼리 원문을 넣지 않습니다.
- 원인 추적은 `request_id`로만 합니다.
- 저장소 예외는 `storage-unavailable`(503)로만 매핑하고, 그 밖의 예외는
  삼키지 않고 500으로 노출합니다. 결함을 장애로 위장하지 않습니다.

## 5. 빈 값과 품질 상태

값이 없는 이유와 검수 여부는 서로 다른 축이므로 분리합니다.

```json
{
  "raw_value": "ETHIOPIA",
  "normalized_value": "Ethiopia",
  "confidence": 0.98,
  "quality": {
    "value_state": "present",
    "verification_state": "verified",
    "is_outlier": false
  }
}
```

| 축 | 허용 값 |
| --- | --- |
| `value_state` | `present`, `missing`, `not_collected`, `redacted`, `expired`, `invalid`, `parse_failed` |
| `verification_state` | `unverified`, `verified`, `corrected`, `not_applicable` |
| `is_outlier` | `true`, `false`, `null` |

신뢰도는 계약 표면에서 항상 `0..1`로 정규화합니다. 저장값이 `98`이면 계약
값은 `0.98`입니다.

## 6. 목록과 cursor

| query | 규칙 |
| --- | --- |
| `limit` | 기본 100, 최소 1, 최대 500 |
| `cursor` | 서버 생성 불투명 문자열. 클라이언트가 해석하지 않음 |
| `updated_after` | 복구·증분용 선택 RFC 3339 필터 |
| `include_deleted` | 동기화 클라이언트는 기본 `true` |

- 정렬은 결정적이어야 합니다. 최소 `(updated_at ASC, id ASC)`.
- cursor는 서명하거나 변조 불가능하게 인코딩합니다.
- 페이지를 처리하고 저장한 **뒤에만** `next_cursor`를 checkpoint합니다.
- 만료·무효 cursor는 `410 cursor-expired`이고, 클라이언트는 cursor 없이 새
  동기화를 시작합니다.
- cursor를 지원하지 못하는 구현은 `updated_after`에 overlap을 두고
  `(id, revision)`으로 중복을 제거합니다. 경계 시각 동률 테스트가 필수입니다.

## 7. 인증

### 7.1 기계 호출자

구현: `src/lib/api/auth.ts`의 `requireClient()`.

- HTTPS만 허용하고 `Authorization: Bearer <credential>`을 사용합니다.
- credential 형식은 `bwk_<prefix12>_<secret43>`이며 영숫자만 씁니다.
  base64url의 `_`·`-`는 형식을 모호하게 만들어 사용하지 않습니다.
- `prefix`는 조회 키로 평문 저장하고, `secret`은 SHA-256 해시만 저장합니다.
  평문은 발급 시 한 번만 표시하고 복구 기능을 제공하지 않습니다.
- query string에 credential을 넣지 않습니다.
- 발급: `node scripts/mint-api-client.mjs --name … --scopes …`
- 운영·스테이징 credential을 분리합니다.
- 로그·감사 기록에 header, token, 만료 asset URL을 남기지 않습니다.

### 7.2 사용자 신원

**사용자 신원은 앱 경계를 넘지 않습니다.** 회사 SSO는 이 계약의 범위가
아닙니다. 앱 사이에 사용자 단위 연결이 필요하면 client별로 다른 가명
`subject_key`를 씁니다. 원본 사용자 ID에 고정 salt를 붙인 단순 해시는 여러
수령 주체 사이의 연결 가능성을 만들므로 사용하지 않습니다.

### 7.3 게이트웨이 헤더

플랫폼 게이트웨이가 주입하는 신원 헤더(`oai-authenticated-user-*` 등)는
**요청이 실제로 그 게이트웨이를 통과했음을 증명할 때만** 신뢰합니다.

- 배포 opt-in: `AUTH_TRUST_PLATFORM_HEADERS`가 `1` 또는 `true`여야 합니다.
- 증명 수단: `x-platform-gateway-secret` 헤더가 16자 이상인
  `PLATFORM_GATEWAY_SECRET`과 일치해야 합니다(상수 시간 비교).
- opt-in과 공유 비밀 중 하나라도 없으면 신원 헤더를 **완전히 무시**합니다.
  기본값은 닫힘입니다.
- 배포처가 직접 접근 가능한 상태에서 헤더를 그대로 신뢰하면 임의 호출자가
  타인 신원을 주장할 수 있습니다. 구현: `src/lib/platform-auth.ts`.

## 8. 권한

### 8.1 scope

문법은 `resource:action[:tier]`입니다. 구현: `src/lib/api/scopes.ts`.

| scope | 용도 |
| --- | --- |
| `knowledge:read` | 커피 지식 조회 |
| `content-requests:write` | 콘텐츠 요청 제출 |
| `content-requests:read` | 자기 요청 상태 조회 |
| `content-requests:triage` | 요청 상태 변경 |
| `contributions:write` | 초안 제출 |
| `metrics:read` | 집계 지표 조회 |
| `bot:command` | 운영 봇 명령 실행 |
| `recommendations:write` | 외부 추천 데이터 적재 |

- tier가 요구되는 요건에는 tier가 **명시적으로 부여된** scope만 통과합니다.
  tier 없는 부여가 tier 요건을 자동 충족하지 않습니다. 권한이 실수로
  넓어지지 않게 하기 위한 규칙입니다.
- client의 `max_tier`는 scope와 별개인 상한입니다.
- 라우트가 선언한 scope가 목록에 없으면 500으로 실패합니다. scope 상수
  오타가 트래픽을 통과시키면 안 됩니다.

### 8.2 개인정보 등급

등급은 중요도가 아니라 외부 제공에 필요한 통제 수준입니다.

| 등급 | 범위 |
| --- | --- |
| T0 | 최소 인원 기준을 통과한 집계 |
| T1 | 가명화된 구조화 기록 |
| T2 | 원문·후보·신뢰도·보정 이력 |
| T3 | 이미지·자유 서술·직접 식별 가능 정보 |

Bean Wiki가 **제공하는** 지식은 공개 콘텐츠이므로 tier 기계를 적용하지
않습니다. Bean Wiki가 **수령하는** 사용자 기록에는 적용합니다. 두 방향에
같은 통제를 쓰지 않습니다.

## 9. 속도 제한과 quota

응답 헤더:

```text
X-Request-Id
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
Retry-After        # 429일 때만
```

- rate limit은 client별 분 단위 고정 창입니다.
- quota는 client별 기간 누적이며 `quota_limit`이 `null`이면 무제한입니다.
  크레딧 기반 에이전트 과금은 이 필드를 그대로 사용하고 별도 마이그레이션이
  필요하지 않습니다.

## 10. 멱등성

쓰기 엔드포인트는 `(client_id, external_id)` 유일 제약으로 멱등합니다.

- 같은 `external_id` 재전송은 새 리소스를 만들지 않고 기존 리소스를
  반환합니다.
- 리소스 갱신은 `revision`을 올립니다. pull 하는 쪽은 `(id, revision)`으로
  중복을 제거합니다.
- 낙관적 동시성이 필요한 리소스는 조건부 갱신을 쓰고 불일치는
  `409 state-conflict`입니다.

## 11. 알림

웹훅만 두면 반드시 놓칩니다. 두 경로를 모두 제공합니다.

- **폴링**: `GET …?updated_after=<RFC3339>` — 항상 동작하는 기준 경로
- **웹훅**: HMAC-SHA256 서명

```text
X-BeanWiki-Event: content_request.published
X-BeanWiki-Delivery: <uuid>
X-BeanWiki-Timestamp: 1785312000
X-BeanWiki-Signature: sha256=<hex>
```

서명 대상은 `"<timestamp>.<raw body>"`입니다. 수신 측은 timestamp가 5분
이내인지 확인해 재전송을 막고, 서명은 상수 시간으로 비교합니다. 전달은
at-least-once이므로 수신 측은 `X-BeanWiki-Delivery`로 중복을 제거합니다.

## 12. 버전 호환

| 변경 | 허용 |
| --- | --- |
| 선택 필드 추가 | major 유지 |
| enum 값 추가 | major 유지. 클라이언트는 미지의 값을 무시 |
| 필드 삭제·의미 변경·필수화 | major 상승 |
| 오류 코드 추가 | major 유지 |

- 클라이언트는 모르는 필드를 무시해야 합니다.
- major 상승 시 이전 major를 최소 한 릴리스 동안 병행 제공합니다.
- 비활성 엔드포인트의 응답은 정책으로 통일합니다. 이 플랫폼은 `404`를 씁니다.

## 13. 감사

`api_client_events`에 기록합니다.

| 이벤트 | 기록 |
| --- | --- |
| 인증 거절 | client(추정 가능하면), 경로, 상태, 사유 코드 |
| 속도 제한 | client, 경로 |
| 쓰기 성공 | client, 경로, scope, 영향 행 수 |
| 상태 전이 | 대상 리소스, 이전·이후 상태, actor |
| credential 발급·회전·폐기 | 대상, actor |

기록하지 않는 것: secret, token, 원문 쿼리, 결과 행 내용, 이메일, 자유 서술,
만료 asset URL.

감사 쓰기는 best-effort입니다. 감사 실패가 정상 요청을 오류로 바꾸지
않습니다. 손실은 추적 기록의 공백으로 드러납니다.

## 14. 공유 패키지

`@company/coffee-protocol`로 공유할 것:

- envelope·problem+json 타입
- 리소스 JSON Schema
- 공용 어휘 ID 상수와 타입
- 얇은 HTTP 클라이언트

각 앱은 독립 배포를 유지합니다. 패키지는 계약 공유 수단이며 런타임
결합점이 아닙니다. 중앙 게이트웨이·이벤트 버스는 앱이 4개 이상이거나 한
사건을 3곳 이상에 fan-out해야 할 때 도입합니다.

## 15. 참고 기준

- [RFC 3339 — 인터넷 timestamp](https://www.rfc-editor.org/rfc/rfc3339.html)
- [RFC 9457 — HTTP API Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core)
