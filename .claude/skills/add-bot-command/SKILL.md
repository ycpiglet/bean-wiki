---
name: add-bot-command
description: 운영 봇 명령을 카탈로그에 추가·수정. 사용자가 봇에 새 질문·명령 추가, 발화 패턴 보강, 쓰기 명령 추가를 요청하면 사용. 인자로 명령 의도와 예시 발화를 받는다.
---

# 봇 명령 추가 하네스

`src/lib/bot/catalog.ts`의 `BOT_COMMANDS`에 항목을 더하는 스킬입니다. 봇의 보안
모델 전체가 이 카탈로그입니다: 프롬프트 인젝션의 최대 피해가 "이 목록에서 잘못된
명령을 골랐다"이고, "운영자 권한으로 임의 SQL을 돌렸다"가 아닙니다.

**봇은 SQL을 생성하지 않습니다.** 명령마다 사전 검수된 파라미터화 고정 쿼리를
소유합니다. 새 명령이 새 쿼리를 필요로 하면 그 쿼리는 `src/lib/metrics/catalog.ts`
(지표) 또는 `src/lib/bot/execute.ts`(테이블 직접 읽기)에 **전문이 쓰여 있어야**
합니다. 호출자 입력은 바인드 파라미터로만 들어갑니다.

## 절차

1. **지표인지 판단**: 답이 집계 숫자라면 `src/lib/metrics/catalog.ts`에 지표를
   먼저 추가하고 명령은 `metricId`로 그것을 가리킨다. `handler: "metric"`이면
   추가 코드가 필요 없다. 지표를 두 곳에 정의하면 두 곳이 서로 다른 답을 낸다.
   테이블을 직접 읽어야 하면 `execute.ts`에 named handler를 추가한다.

2. **카탈로그 항목 작성**: 아래 필드를 모두 채운다. 하나라도 비면
   `check-bot-catalog.mjs`가 실패한다.

   | 필드 | 규칙 |
   | --- | --- |
   | `id` | `<도메인>.<동작>` (예: `articles.top_read`) |
   | `title`·`description` | 한국어. 도움말 응답과 관리 콘솔에 그대로 노출됨 |
   | `patterns` | **한국어와 영어 각각** 최소 1개. 아래 4단계의 모호성 규칙을 지킬 만큼 좁게 |
   | `examples` | 실제 발화 3개 내외(한국어 2 + 영어 1). 도움말과 테스트가 함께 씀 |
   | `params` | `kind`는 `day` `window_days` `limit` `status` 중 하나. 기본값을 주면 `extractParams()`가 먼저 채운다 |
   | `requiredRole` | `reader` `editor` `admin` `owner` (`src/lib/roles.ts`). 지표 읽기 = `editor`, 클라이언트·계정 관련 = `admin`, 쓰기 = `admin` 이상 |
   | `requiredScope` | `SCOPES` 상수. 문자열 리터럴 금지 |
   | `mode` | `read` 또는 `write` |
   | `metricId` | 지표 명령이면 카탈로그 id, 아니면 `null` |
   | `handler` | `execute.ts`의 `switch`에 존재하는 이름. 없으면 실행 시 "구현되어 있지 않습니다"로 실패 |

3. **집계면 억제를 통과시킨다**: 사람 주체가 있는 모든 집계는
   `applySuppression(metric, rows)`를 통과해야 한다
   (`src/lib/metrics/catalog.ts`, `K_ANONYMITY_FLOOR = 5`). 지표를 거치지 않는
   handler라면 `suppressSmall(rows, "subject_count")`를 직접 호출하고 억제 건수를
   `suppressed`로 보고한다.

   | 항목 | 값 |
   | --- | --- |
   | 기준 | 행의 `subject_count`(구분되는 세션 수) < 5 |
   | 처리 | 마스킹이 아니라 **행 제거**. 마스킹은 "이 차원이 존재하고 1~4명이 봤다"를 남긴다 |
   | 보고 | 응답의 `suppressed`. 소비자가 "억제됨"과 "0"을 구분해야 한다 |
   | 예외 | `value = 0 AND subject_count = 0`은 0으로 보고. 조용한 하루를 장애처럼 보이게 하지 않는다 |
   | `suppression: "exempt"` | 사람 주체가 없는 운영 메타데이터만(현재 `requests.open_count` 하나) |

   응답 텍스트·`data`에 **이메일·표시명·계정 키·개별 사용자 행을 넣지 않습니다.**
   집계와 차원 키(문서 슬러그, 정규화 질의, 클라이언트 이름)까지입니다.

4. **패턴의 모호성 규칙**(`src/lib/bot/router.ts`):

   | 상황 | 동작 |
   | --- | --- |
   | 패턴 히트 1개 | 그 명령 실행 |
   | 히트 2개 이상, read가 정확히 1개 | 그 read 실행, 나머지는 `alternates` |
   | 히트 2개 이상, read가 0개 또는 2개 이상 | `ambiguous` — **아무것도 실행하지 않음** |
   | 히트 0개 + classifier | classifier는 **read 전용 후보 목록**만 받는다 |
   | 히트 0개 | 카탈로그를 보여주고 실행하지 않음 |

   따라서 **쓰기 명령은 모호한 매칭에서 절대 이길 수 없습니다.** 새 write 명령의
   패턴은 read 명령과 겹치지 않게 좁게 씁니다(대상 ID나 동작 동사를 요구).
   새 read 명령을 넣을 때는 기존 명령의 `examples` 전부를 새 패턴에 통과시켜 보고,
   하나라도 새로 매칭되면 패턴을 좁힙니다. write는 `explicitCommandId`(버튼·슬래시
   명령)로만 확정 지정할 수 있습니다.

5. **쓰기면 확인 절차**: `mode: "write"`는 단일 메시지로 실행되지 않는다.
   1차 호출이 `issueConfirmation()`으로 확인 토큰(`bcf_…`, TTL 5분, 단발성,
   actor·command에 바인딩)을 발급하고 `will_do`로 무엇이 일어날지 알린다.
   2차 호출이 `confirmation_token`을 실어야 `consumeConfirmation()`을 통과해
   실행된다(`src/lib/bot/audit.ts`, `src/app/api/bot/v1/commands/route.ts`).
   쓰기 handler는 자체적으로 상태를 쓰지 않고 정식 API를 호출한다 —
   요청 상태 변경은 `PATCH /api/requests/v1/content-requests/{id}`이며,
   전이표(`src/lib/requests/status.ts`)를 우회하지 않는다.

6. **감사**: 모든 실행은 `recordCommand()`로 남는다 — actor, role, surface,
   command id, 추출 파라미터, mode, outcome, 행 수, 억제 수. **원문 메시지와 결과
   행은 남기지 않는다.** 새 handler가 감사 대상 필드를 늘려야 한다고 판단되면
   먼저 `privacy-guardian`에 확인받는다.

7. **문서 갱신**: `docs/BOT-COMMAND-CATALOG.md`의 명령 표에 행을 추가한다
   (id, 예시 발화, 근거 데이터, role, mode). 문서 누락은 가드레일 실패 조건이다.

8. **마감**: `node scripts/check-bot-catalog.mjs`,
   `node scripts/check-api-contract.mjs`, `npx tsc --noEmit`을 통과시킨다.
   `examples`의 각 발화가 의도한 명령으로 라우팅되는지 실제로 확인한다.
   `privacy-guardian`으로 응답 필드를 검토받는다. 커밋은 사용자 요청 시에만.

## 사전 점검표

| 항목 | 근거 |
| --- | --- |
| 새 SQL이 `metrics/catalog.ts` 또는 `execute.ts`에 전문으로 있는가 | 카탈로그 외 쿼리 금지 |
| 호출자 입력이 바인드 파라미터로만 들어가는가 | 문자열 연결로 SQL을 만들지 않는다 |
| `requiredRole`·`requiredScope`·`mode`가 모두 지정됐는가 | 가드레일 실패 조건 |
| `requiredScope`가 `SCOPES` 상수인가 | `src/lib/api/scopes.ts` |
| `handler`가 `execute.ts`의 `switch`에 있는가 | 없으면 런타임 실패 |
| `patterns`에 한국어·영어가 모두 있는가 | 가드레일 실패 조건 |
| 기존 명령의 `examples`가 새 패턴에 걸리지 않는가 | `router.ts` 모호성 |
| 집계가 `applySuppression()`/`suppressSmall()`을 통과하는가 | `K_ANONYMITY_FLOOR = 5` |
| 억제 건수를 응답에 보고하는가 | "억제됨"과 "0"의 구분 |
| 응답에 이메일·표시명·개별 사용자 행이 없는가 | 절대 조건 |
| write면 확인 토큰 경로를 타는가 | `bot/audit.ts` |
| write면 상태 변경을 정식 API로 위임하는가 | `requests/status.ts` 전이표 |
| `docs/BOT-COMMAND-CATALOG.md`에 행을 추가했는가 | 가드레일 실패 조건 |
| `node scripts/check-bot-catalog.mjs`가 통과하는가 | 필수 |

## 규칙

- **봇이 SQL을 생성하는 경로를 만들지 않습니다.** LLM은 카탈로그 ID 분류만 합니다.
  테이블명·컬럼명·쿼리 조각을 모델 출력에서 받지 않습니다.
- 파라미터 값도 모델이 만들지 않습니다. `extractParams()`가 고정 패턴으로 뽑고
  지표 계층이 클램프합니다.
- `mode: "read"`인 명령이 상태를 바꾸지 않는지 확인합니다. handler가 UPDATE·INSERT를
  하면 그것은 write입니다.
- 최소 인원 기준을 우회하는 "관리자니까 괜찮다" 예외를 카탈로그에 넣지 않습니다.
  관리 콘솔의 원본 열람은 봇 경로가 아닙니다.
- 명령을 추가하면 비용도 생깁니다. 크레딧 기반 과금은 `api_clients`의 quota 필드를
  그대로 쓰므로, 무거운 명령은 `requiredRole`을 올려 노출을 좁힙니다.
- 커밋은 사용자가 요청했을 때만 합니다.
