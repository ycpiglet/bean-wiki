---
name: add-api-endpoint
description: Bean Wiki에 `/api/<domain>/v1` 엔드포인트를 추가·수정. 사용자가 새 기계 대상 API 라우트 추가나 기존 v1 라우트 변경을 요청하면 사용. 인자로 도메인·경로·메서드(필수), 스코프(선택)를 받는다.
---

# v1 엔드포인트 추가 하네스

`docs/PLATFORM-CONTRACT-V1.md`(정본)의 규약을 라우트 코드로 옮기는 스킬입니다.
산출물은 라우트 파일 + 계약 문서 표 갱신 + `check-api-contract.mjs` 통과입니다.

새 기계 대상 엔드포인트는 예외 없이 `/api/<domain>/v1` 아래에 둡니다(계약 §1).

## 절차

1. **준비**: `docs/PLATFORM-CONTRACT-V1.md` 전체와 가장 가까운 기존 라우트 2개를
   읽는다. 목록·커서 라우트는 `src/app/api/requests/v1/content-requests/route.ts`,
   공개 읽기 라우트는 `src/app/api/knowledge/v1/resolve/route.ts`가 기준입니다.
   해당 도메인의 계약 문서(`docs/<DOMAIN>-API-V1.md`)가 없으면 먼저 만든다.

2. **스코프 결정**: `src/lib/api/scopes.ts`의 `SCOPES`에 이미 있는 상수만 쓴다.
   없는 스코프가 필요하면 `SCOPES`에 추가하고 `scripts/mint-api-client.mjs`의
   `KNOWN_SCOPES`와 계약 §8.1 표에 같이 추가한다. 세 곳이 어긋나면 발급 스크립트가
   정당한 스코프를 거부하거나 라우트가 500으로 실패한다(`requireClient()`는
   `isKnownScope()` 미통과 스코프를 `internal`로 떨어뜨린다).

   | 방향 | 인증 |
   | --- | --- |
   | 공개 지식 읽기 | `optionalClient()` (`src/lib/knowledge/access.ts`). 자격증명 없으면 익명 통과, **깨진 자격증명은 익명으로 격하하지 않고 `access.rejection`을 그대로 반환** |
   | 그 밖의 읽기 | `requireClient(request, SCOPES.…)` |
   | 모든 쓰기 | `requireClient()`. 선택 인증만으로는 가드레일이 실패시킨다 |
   | 의도적 공개(브라우저 비콘 등) | `export const CONTRACT_AUTH = "public"` + `// contract-exempt: <이유>` 주석. 둘 중 하나만 있으면 실패 |

3. **작성**: 아래 스켈레톤에서 시작한다. 응답은 `ok()`/`problem()`만 만든다.
   `Response.json({ error })`와 맨 `new Response(...)`는 가드레일이 차단한다
   (`preflight()`만 예외). 오류 코드는 `src/lib/api/envelope.ts`의 `PROBLEMS`
   카탈로그에 있는 것만 쓴다: `invalid_request` `unauthorized` `forbidden_scope`
   `not_found` `state_conflict` `cursor_expired` `unprocessable` `rate_limited`
   `quota_exhausted` `storage_unavailable` `internal`.

4. **목록이면 커서**: 정렬은 최소 `(updated_at ASC, id ASC)`로 결정적이어야 한다
   (계약 §6). `clampLimit()`으로 1..500을 강제하고, `encodeCursor({k,i,s})`로
   마지막 행의 정렬 키·id·snapshot을 서명해 내보낸다. `decodeCursor()`의
   `reason === "expired"`는 `cursor_expired`(410), 나머지는 `invalid_request`.
   `offset`·`page` 쿼리는 금지다.

5. **헤더**: 인증 라우트는 `rateHeaders(auth.rate)`로 `X-RateLimit-*`을 붙인다
   (계약 §9). `requireClient()`가 성공 시 실제 소비된 예산을 `rate`로 돌려주므로
   값을 재구성하지 않는다.
   브라우저 노출 라우트는 `corsHeaders(request)`를 성공·오류 응답 **양쪽**에 붙이고
   `OPTIONS`에 `preflight()`를 둔다. 캐시가 가능한 공개 읽기는
   `knowledgeCacheControl(client)` 또는 명시적 `cacheControl`을 준다.
   `export const runtime = "nodejs"`를 반드시 고정한다(미고정은 경고).

6. **오류 매핑**: 저장소 예외는 `storage_unavailable`(503)로만 매핑하고, 그 밖의
   예외는 **다시 던져** 500으로 노출한다(계약 §4). `catch`가 전부 503으로
   삼키면 결함이 장애로 위장된다. 공용 헬퍼는
   `problemFromStorageError(error, requestId)`이며, 라우트 로컬
   `storageProblem()` 패턴도 같은 규칙이다.

7. **쓰기면 멱등성과 감사**: `(client_id, external_id)` 유일 제약으로 멱등하게
   만들고, 재전송은 새 리소스를 만들지 않고 기존 리소스를 200으로 돌려준다
   (신규는 201, 계약 §10). 성공 후 `auditOk()`로 client·경로·scope·행 수를 남긴다.
   감사 본문에 secret·토큰·이메일·자유 서술·만료 asset URL을 넣지 않는다(계약 §13).

8. **문서 갱신**: 해당 `docs/<DOMAIN>-API-V1.md`의 엔드포인트 표에 Method·Path·
   인증·스키마 행을 추가한다. `check-api-contract.mjs`는 문서에 없는 경로를
   **경고**로 알린다(실패가 아님). 경고를 남긴 채 머지하지 않는다.

9. **마감**: `node scripts/check-api-contract.mjs`와 `npx tsc --noEmit`을
   통과시킨다. 그다음 `api-contract-reviewer`와 `privacy-guardian`을 **한 메시지에서
   병렬로** 실행해 diff를 검토받는다(`docs/AGENT-PLATFORM-OPS.md`). 커밋은 사용자
   요청 시에만.

## 라우트 스켈레톤 (인증 목록 + 쓰기)

```ts
// GET  /api/<domain>/v1/<resource> — 목적 한 줄
// POST /api/<domain>/v1/<resource> — 목적 한 줄
//
// 계약: docs/<DOMAIN>-API-V1.md

import { ok, problem } from "@/lib/api/envelope";
import { requireClient, auditOk, rateHeaders } from "@/lib/api/auth";
import { SCOPES } from "@/lib/api/scopes";
import { clampLimit, decodeCursor, encodeCursor } from "@/lib/api/cursor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA = "<resource>.v1";

export async function GET(request: Request) {
  const auth = await requireClient(request, SCOPES.<key>);
  if (!auth.ok) return auth.response;
  const { client, requestId, rate } = auth;

  const url = new URL(request.url);
  const limit = clampLimit(url.searchParams.get("limit"));

  let after: { key: string; id: string } | undefined;
  let snapshotAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const cursorParam = url.searchParams.get("cursor");
  if (cursorParam) {
    const decoded = await decodeCursor(cursorParam);
    if (!decoded.ok) {
      return problem(
        decoded.reason === "expired" ? "cursor_expired" : "invalid_request",
        {
          requestId,
          detail:
            decoded.reason === "expired"
              ? "Restart the sync without a cursor."
              : "Cursor is not valid.",
        },
      );
    }
    after = { key: decoded.payload.k, id: decoded.payload.i };
    snapshotAt = decoded.payload.s;
  }

  try {
    // 정렬은 (updated_at ASC, id ASC). limit + 1을 읽어 has_more를 판정한다.
    const rows = await listRows({ clientId: client.id, after, limit: limit + 1 });
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page.at(-1);

    return ok(SCHEMA, page, {
      requestId,
      snapshotAt,
      page: {
        limit,
        has_more: hasMore,
        next_cursor:
          hasMore && last
            ? await encodeCursor({ k: last.updated_at, i: last.id, s: snapshotAt })
            : null,
      },
      // 이 호출에서 실제로 소비된 예산. 값을 재구성하지 않는다.
      headers: rateHeaders(rate),
    });
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

export async function POST(request: Request) {
  const auth = await requireClient(request, SCOPES.<writeKey>);
  if (!auth.ok) return auth.response;
  const { client, requestId } = auth;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return problem("invalid_request", { requestId, detail: "Body must be a JSON object." });
  }

  const externalId = str(body.external_id);
  if (!externalId || externalId.length > 160) {
    return problem("invalid_request", {
      requestId,
      detail: "`external_id` is required (<=160 chars) and makes this call idempotent.",
    });
  }
  // 문법 오류는 400 invalid_request, 의미 검증 실패는 422 unprocessable (계약 §4).

  try {
    const result = await createRow({ clientId: client.id, externalId /* … */ });
    await auditOk({
      clientId: client.id,
      requestId,
      action: result.created ? "<resource>.create" : "<resource>.create_idempotent",
      resource: `/api/<domain>/v1/<resource>/${result.row.id}`,
      scope: SCOPES.<writeKey>,
      rowCount: result.created ? 1 : 0,
    });
    return ok(SCHEMA, result.row, {
      requestId,
      status: result.created ? 201 : 200,
      headers: { location: `/api/<domain>/v1/<resource>/${result.row.id}` },
    });
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** 저장소 예외만 503. 그 밖의 예외는 다시 던져 500으로 드러낸다. */
function storageProblem(error: unknown, requestId: string): Response {
  if ((error as { name?: string } | null)?.name !== "D1UnavailableError") throw error;
  return problem("storage_unavailable", {
    requestId,
    detail: "Storage is not bound in this environment.",
  });
}
```

공개 읽기 변형은 `requireClient()` 대신 아래로 시작한다.

```ts
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function GET(request: Request) {
  const access = await optionalClient(request);
  if (access.rejection) return access.rejection; // 깨진 자격증명은 익명 격하 금지
  const { client, requestId } = access;
  const cors = corsHeaders(request);
  // … ok(SCHEMA, data, { requestId, headers: cors, cacheControl: knowledgeCacheControl(client) })
}
```

## 사전 점검표

머지 전에 전부 예여야 합니다.

| 항목 | 근거 |
| --- | --- |
| 경로가 `/api/<domain>/v1/…`인가 | 계약 §1 |
| 응답이 `ok()`/`problem()`만인가 | 계약 §3·§4, `src/lib/api/envelope.ts` |
| `schema_version`이 `<resource>.v<major>` 형식인가 | 계약 §3 |
| 오류 코드가 `PROBLEMS`에 있는가 | `src/lib/api/envelope.ts` |
| `detail`에 secret·개인정보·스택·쿼리 원문이 없는가 | 계약 §4 |
| 스코프가 `SCOPES` 상수인가 (문자열 리터럴 금지) | `src/lib/api/scopes.ts` |
| 쓰기가 `requireClient()`를 쓰는가 | 계약 §8, 가드레일 규칙 3 |
| tier 요건이 있으면 `clientAllowsTier()`로 상한을 확인했는가 | 계약 §8.1 |
| 목록이 결정적 정렬 + 커서인가 (`offset`·`page` 없음) | 계약 §6 |
| `limit`이 `clampLimit()`을 통과하는가 | 계약 §6 |
| 인증 응답에 `rateHeaders(auth.rate)`가 붙었는가 | 계약 §9 |
| 브라우저 노출이면 CORS allowlist + `preflight()`인가 (`*` 금지) | `src/lib/api/cors.ts` |
| 저장소 예외만 503이고 나머지는 rethrow인가 | 계약 §4 |
| 쓰기가 `(client_id, external_id)`로 멱등한가 | 계약 §10 |
| 쓰기 성공이 `auditOk()`로 기록되는가 | 계약 §13 |
| `export const runtime`을 고정했는가 | 가드레일 규칙 7 |
| `docs/<DOMAIN>-API-V1.md` 표에 행을 추가했는가 | 가드레일 규칙 8 |
| `node scripts/check-api-contract.mjs`가 오류 0인가 | 필수 |

## 규칙

- 필드 삭제·의미 변경·필수화는 major 상승입니다(계약 §12). 선택 필드 추가와 enum
  값 추가는 v1을 유지합니다. "그냥 필수로 바꾸면 된다"는 판단을 하지 않습니다.
- credential을 query string으로 받지 않습니다. 가드레일이 실패시킵니다(계약 §7.1).
- 게이트웨이 신원 헤더는 `PLATFORM_GATEWAY_SECRET` 일치를 확인한 경우에만
  신뢰합니다. 기본값은 닫힘입니다(계약 §7.3).
- `NaN`·`Infinity`·`undefined`를 응답에 넣지 않습니다. 값이 없으면 `null` +
  `quality.value_state`입니다(계약 §3·§5).
- 신뢰도는 계약 표면에서 항상 `0..1`입니다. 저장값이 `98`이면 `0.98`로 바꿔 냅니다.
- 비활성 엔드포인트는 `404`입니다(계약 §12).
- 커밋은 사용자가 요청했을 때만 합니다.
