# 텔레메트리와 개인정보

- 문서 ID: `telemetry-and-privacy`
- 계약 버전: `1`
- 상태: 구현 기준
- 갱신일: 2026-07-28
- 대상: Bean Wiki 개발자, 운영 봇 구현자, 지표를 소비하는 앱

이 문서는 조회 통계 read model의 **정본**입니다. 지표 정의는
`src/lib/metrics/catalog.ts`에만 존재하고, 이 문서는 그 카탈로그를 사람이 읽는
형태로 옮긴 것입니다. 둘이 어긋나면 카탈로그가 맞습니다.

관련 문서: [플랫폼 공용 계약 v1](./PLATFORM-CONTRACT-V1.md),
[플랫폼 상호운용 기획](./PLATFORM-INTEROP-PLAN.md) §4 Phase 5.

## 1. 왜 새 테이블인가

기존 `activity_events`로는 "가장 많이 읽힌 글"에 답할 수 없습니다. 설계상
불가능하며, 튜닝으로 해결되지 않습니다.

`db/schema.ts`:

```text
uniqueIndex("activity_event_once_idx").on(table.email, table.kind, table.entityKey)
```

| 제약 | 결과 |
| --- | --- |
| `UNIQUE (email, kind, entity_key)` | 같은 사람이 같은 문서를 다시 읽어도 두 번째 행이 생기지 않습니다. XP 중복 지급 방지가 목적이므로 정확한 동작입니다 |
| `email` NOT NULL + `POST /api/progress`가 세션 필수 | 비로그인 트래픽이 아예 기록되지 않습니다 |
| 목적 자체 | XP 원장(ledger)입니다. "누가 무엇으로 보상을 받았는가"에 답하는 표이며 "무엇이 몇 번 읽혔는가"에 답하는 표가 아닙니다 |

따라서 **원장과 트래픽 로그를 분리**합니다. `activity_events`는 그대로 두고,
append-only 트래픽 로그를 새로 둡니다.

| 표 | 성격 | 개인 식별 |
| --- | --- | --- |
| `activity_events` | 사람 단위 XP 원장, 1인 1엔티티 1행 | 이메일 있음 |
| `page_views` | 조회 1건 = 1행, 중복 제거 없음 | 없음 |
| `daily_metrics` | 일별 롤업 집계 | 없음 |
| `resolve_misses` | 정규화 실패 질의 (Phase 2에서 적재) | 없음 |

## 2. `page_views`가 저장하는 것

| 컬럼 | 값 | 비고 |
| --- | --- | --- |
| `path` | `/wiki/coffee-cherry-anatomy` | 최대 300자. **쿼리스트링·프래그먼트는 저장 전 절단** |
| `entity_type` | `article` `glossary` `topic` `tag` `page` `quiz` `""` | 목록 외 값은 저장하지 않고 거부 |
| `entity_key` | 슬러그·용어 키 | 최대 160자. `entity_type`이 있으면 필수 |
| `locale` | `ko` `en` | 그 외 거부 |
| `day` | UTC 날짜 | 모든 집계 단위. 로컬 시간 미사용 |
| `session_hash` | 32자 hex | 3절 |
| `referrer_class` | `internal` `search` `social` `direct` `app:<clientId>` | 분류값만 |
| `country_code` | `KR`, `US`, `ZZ` | 배포 플랫폼이 제공한 2자리 국가 코드만. 없거나 잘못되면 `ZZ` |
| `hour_bucket` | `0`–`23` | UTC 시각의 정수 구간. 분·초는 분석 차원으로 사용하지 않음 |
| `device_class` | `desktop` `mobile` `tablet` `bot` `unknown` | 요청 시 서버에서 분류한 뒤 원본 User-Agent 폐기 |
| `created_at` | UTC timestamp | |

### 저장하지 않는 것

| 항목 | 이유 |
| --- | --- |
| IP 원문 | `session_hash` 입력으로만 쓰고 즉시 버립니다 |
| User-Agent 원문 | 요청 시 기기 대분류를 만든 뒤 즉시 버립니다. 브라우저·OS·모델은 저장하지 않습니다 |
| 이메일·계정 키·표시명 | 트래픽 로그는 사람을 식별하지 않습니다 |
| Referer URL 원문 | 검색어가 실려 옵니다. 분류값만 남깁니다 |
| 쿼리스트링 | 사이트 내 검색어가 실려 옵니다 |
| 화면 해상도·언어 헤더·핑거프린트성 값 | 수집하지 않습니다 |

값을 잘라 맞추지 않고 **거부**합니다. 잘못된 경로가 섞인 조회 표는 구멍이 있는
표보다 나쁩니다. 순위가 조용히 틀어지기 때문입니다.

## 3. `session_hash` — 일일 회전 salt

```text
session_hash = SHA-256( TELEMETRY_SALT ‖ NUL ‖ UTC일자 ‖ NUL ‖ IP ‖ NUL ‖ User-Agent )
               를 hex로 만들고 앞 32자(128비트)만 사용
```

| 성질 | 근거 |
| --- | --- |
| 같은 날, 같은 방문자 → 같은 해시 | 순 세션 수를 셀 수 있습니다 |
| 다른 날, 같은 방문자 → 무관한 해시 | 입력에 UTC 일자가 들어갑니다. **날짜 간 연결이 구조적으로 불가능**하며, salt를 가진 사람도 프로필을 만들 수 없습니다 |
| 원문 복원 | salt 없이는 불가능. salt는 D1이 아니라 런타임 바인딩에만 존재합니다 |
| 32자 절단 | 128비트. 하루 트래픽 규모에서 충돌 확률은 무의미한 수준입니다 |

`TELEMETRY_SALT` 미설정 시:

| 동작 | 값 |
| --- | --- |
| 해시 | **salt 없는 해시로 폴백하지 않습니다.** 요청마다 난수 32자를 씁니다 |
| 이유 | salt 없는 SHA-256(IP, UA)는 IP 대역 전수 조사로 복원됩니다. 그 순간 이 컬럼은 개인정보가 됩니다. 그룹핑을 잃는 쪽이 싼 실패입니다 |
| 알림 | `sessionGroupingAvailable()`가 `false`. `GET /api/metrics/v1` 응답의 `session_grouping: false`로 노출됩니다 |
| 영향 | 모든 조회가 새 방문자로 보이므로 `views.unique_sessions`가 `views.total`과 같아집니다 |

## 4. `referrer_class`

| 값 | 판정 |
| --- | --- |
| `internal` | Referer 호스트가 서비스 호스트와 같거나 하위 도메인 |
| `search` | google, bing, duckduckgo, search.naver.com, search.daum.net, yahoo, baidu, yandex 등 |
| `social` | facebook, instagram, threads, x/twitter, t.co, linkedin, reddit, youtube, tiktok, kakao, band.us, blog·cafe.naver.com, tistory, velog 등 |
| `direct` | Referer 없음, 파싱 실패, **또는 목록에 없는 외부 유입** (열거값이 고정이므로 여기로 합칩니다) |
| `app:<clientId>` | 서버 사이드 호출자가 client id를 넘긴 경우. 브라우저 비콘은 이 값을 만들 수 없습니다 |

분류는 **서버에서** Referer 헤더로 계산합니다. 본문으로 받지 않습니다.

## 5. 수집·조회 경로

| Method | Path | 인증 | 스키마 |
| --- | --- | --- | --- |
| POST | `/api/telemetry/v1/views` | **없음** (공개 비콘) | `page_view.v1`, 202 |
| POST | `/api/telemetry/v1/rollup` | `metrics:read` + `client_type = internal` | `metric_rollup.v1` |
| GET | `/api/metrics/v1` | `metrics:read` | `metric_series.v1` |

`/views`에 자격증명을 요구하지 않는 이유: 이 엔드포인트가 담당하는 트래픽이
바로 `activity_events`가 못 보는 비로그인 트래픽입니다. 브라우저에 자격증명을
내려보내면 그것은 자격증명이 아닙니다. 대신 값싸고 지루하게 만듭니다.

| 방어 | 값 |
| --- | --- |
| 본문 상한 | 1024 byte (`content-length`와 실제 본문 모두 검사) |
| 허용 필드 | `path`, `entityType`, `entityKey`, `locale`. 국가·시간·기기는 신뢰 가능한 요청 헤더와 서버 시각에서 파생 |
| referrer | 본문 값을 신뢰하지 않고 서버에서 계산 |
| rate limit | `session_hash`당 분당 30회. **in-process best-effort** |

best-effort의 뜻: 카운터가 isolate 메모리에 있으므로 cold start로 초기화되고
리전 간 공유되지 않습니다. 비콘 1건마다 D1 쓰기를 추가하는 비용이 막으려는
남용보다 크기 때문에 의도한 타협입니다. 지속적인 rate limit이 필요한
자격증명 엔드포인트는 `src/lib/api/auth.ts`의 `api_rate_buckets`를 씁니다.

`/rollup`을 `internal`로 제한하는 이유: 이 엔드포인트는 read model을 다시 쓰고
raw 행을 삭제합니다. `metrics:read`를 정당하게 가진 파트너 앱이라도 트리거할
일이 아닙니다. 위반 시 `problem("forbidden_scope")`.

## 6. 보존과 정리

| 데이터 | 보존 | 근거 |
| --- | --- | --- |
| `page_views` (raw) | **90일** (`RAW_RETENTION_DAYS`) | 개인 식별 요소가 없어도 세션 단위 행이므로 오래 둘 이유가 없습니다 |
| `daily_metrics` (롤업) | **무기한** | 세션 컬럼이 없는 집계입니다. 시간이 지나도 개인정보 부채가 되지 않습니다 |
| `resolve_misses` | 무기한 | 앱이 정규화하려 한 문자열이며 콘텐츠 공백 목록의 원천입니다 |

정리 위치:

| 항목 | 값 |
| --- | --- |
| 구현 | `pruneRawViews()` / `pruneStoredPageViews()` |
| D1 실행 지점 | `rollupDays()` 마지막 단계 — `POST /api/telemetry/v1/rollup` 1회당 1회 |
| Supabase 실행 지점 | Vercel Cron이 매일 `GET /api/telemetry/retention` 호출 |
| 쿼리 | D1 `DELETE`; Supabase `bean_wiki_prune_page_views()` RPC. 둘 다 `day < (오늘 - 90일)` |
| 인증 | 롤업은 internal API credential, Vercel Cron은 `CRON_SECRET` |
| 보고 | 롤업 응답의 `pruned_views` 또는 retention 응답의 `deletedRows` |

쓰기 경로(비콘)에서 정리하지 않습니다. 독자의 요청 하나가 무작위로 대량 삭제를
떠안는 구조를 만들지 않기 위해서입니다. 롤업 cron이 멈추면 정리도 멈추므로,
cron 실패는 보존 위반으로 취급합니다.

## 7. 최소 건수 임계값 (k-익명)

| 항목 | 값 |
| --- | --- |
| 상수 | `K_ANONYMITY_FLOOR = 5` (`src/lib/metrics/catalog.ts`) |
| 판정 기준 | 행의 `subject_count`(구분되는 세션 수) |
| 처리 | 마스킹이 아니라 **행 제거**. 마스킹은 "이 차원이 존재하고 1~4명이 봤다"를 그대로 노출하므로 숨기려던 것의 대부분이 남습니다 |
| 보고 | 응답의 `suppressed_rows`. 소비자가 "억제됨"과 "값이 없음"을 구분할 수 있어야 합니다 |
| 예외 | `value = 0 AND subject_count = 0`인 집계는 그대로 0으로 보고합니다. 아무도 없었다는 사실은 누구에 대한 정보도 아니며, 억제하면 조용한 하루가 장애처럼 보입니다 |

적용 지점:

| 표면 | 적용 |
| --- | --- |
| `GET /api/metrics/v1` | `applySuppression()` 통과 필수 |
| 운영 봇 (Phase 6) | 같은 카탈로그·같은 함수를 사용 |
| 공개 `/analytics` 대시보드 | 날짜·문서·유입·국가·시간대 행은 서로 다른 익명 세션이 5개 이상일 때만 표시. 전체 트래픽도 5개 미만이면 0으로 보고 |
| 롤업 저장 (`daily_metrics`) | 억제하지 않고 `subject_count`를 함께 저장합니다. 읽기 시점에 판정하기 위해서입니다 |
| 관리자 콘솔 | 원본 열람이 필요한 경우에만 예외이며, 그 경로도 이메일·계정 키는 다루지 않습니다 |

`suppression: "exempt"`는 사람 주체가 없는 지표에만 붙입니다. 현재
`requests.open_count` 하나뿐입니다. 대기 요청 2건을 5건 미만이라는 이유로 숨기면
운영 정보를 잃을 뿐 보호되는 사람이 없습니다.

`resolve.top_misses`는 예외가 아닙니다. 결과적으로 **5회 이상 관측된 미스만**
비관리 표면에 나타납니다.

## 8. 지표 카탈로그

`src/lib/metrics/catalog.ts`가 정본입니다. `id`, 제목, 단위, 차원, 기간, 원천,
억제 정책, SQL 생성 함수를 한 곳에 둡니다.

| id | 제목 | 단위 | 차원 | 기간 | 원천 | 억제 |
| --- | --- | --- | --- | --- | --- | --- |
| `views.total` | 일일 조회수 | views | 없음 | 일 | 롤업 | k-익명 |
| `views.unique_sessions` | 일일 순 세션 | sessions | 없음 | 일 | 롤업 | k-익명 |
| `views.by_article` | 문서별 일일 조회수 | views | article | 일 | 롤업 | k-익명 |
| `articles.top_read` | 가장 많이 읽힌 문서 | views | article | 구간 | 라이브 | k-익명 |
| `trending.now` | 지금 뜨는 문서 | ratio | article | 일 | 라이브 | k-익명 |
| `resolve.top_misses` | 정규화 실패 상위 질의 | misses | resolve_query | 구간 | 라이브 | k-익명 |
| `requests.open_count` | 미처리 글 요청 수 | requests | 없음 | 스냅샷 | 라이브 | 면제 |

공식:

| id | 계산 |
| --- | --- |
| `views.total` | `COUNT(*) FROM page_views WHERE day = :day`. `subject_count = COUNT(DISTINCT session_hash)` |
| `views.unique_sessions` | `COUNT(DISTINCT session_hash) FROM page_views WHERE day = :day` |
| `views.by_article` | `COUNT(*) … WHERE day = :day AND entity_type = 'article' GROUP BY entity_key ORDER BY value DESC LIMIT :limit` |
| `articles.top_read` | `COUNT(*) … WHERE day BETWEEN :day-(:window-1) AND :day AND entity_type='article' GROUP BY entity_key ORDER BY value DESC` |
| `trending.now` | 9절 |
| `resolve.top_misses` | `hit_count FROM resolve_misses WHERE last_seen_at >= :day-(:window-1) ORDER BY hit_count DESC`. 기본 window 30일 |
| `requests.open_count` | `COUNT(*) FROM content_requests WHERE status NOT IN ('published','declined','duplicate')` |

원천이 "롤업"인 지표는 `daily_metrics`에서 읽고, 해당 일자의 롤업 행이 없으면
같은 정의로 라이브 계산합니다. cron 1회 실패가 잘못된 0이 되지 않도록 하기
위해서이며, 어느 경로를 썼는지는 응답의 `computed_from`(`rollup` | `live`)에
표시됩니다.

롤업 멱등성: 매 실행이 raw에서 다시 계산해
`ON CONFLICT(day, metric, dimension_key) DO UPDATE SET value = excluded.value`로
씁니다. `value = value + ?`는 어디에도 없습니다. 같은 날짜를 두 번 돌려도 결과가
같습니다. 기본 대상은 **어제와 오늘**(오늘은 아직 누적 중, 어제는 마지막 시간대
트래픽이 늦게 도착할 수 있음), 1회 최대 31일입니다.

## 9. `trending.now` 전문

"핫한 것"은 누적 합계가 아닙니다. 누적 합계로 정의하면 항상 인기 있는 문서가
영구적으로 1위이고, 지금 무슨 일이 일어나는지는 알 수 없습니다.

```text
today     = 기준일의 해당 문서 조회수
baseline  = 기준일 직전 7일의 해당 문서 조회수 합 / 7      (총합이 아니라 일평균)
score     = (today + 1) / (baseline + 1)
```

양쪽의 `+1`은 Laplace 스무딩입니다. 두 가지 일을 합니다.

1. 이력이 없는 문서(baseline 0)에서 0으로 나누는 문제를 제거합니다.
2. 작은 수를 눌러줍니다. 1 → 3 조회는 21배가 아니라 `(3+1)/(1/7+1) = 3.5`가
   됩니다.

스무딩만으로는 부족하므로 세 개의 관문을 함께 둡니다.

| 상수 | 값 | 역할 |
| --- | --- | --- |
| `TRENDING_BASELINE_DAYS` | 7 | 기준선 구간 (기준일 제외, 직전 7일) |
| `TRENDING_SMOOTHING` | 1 | 분자·분모 스무딩 |
| `TRENDING_MIN_VIEWS` | 10 | 기준일 조회수 하한. 노이즈 제거 |
| `TRENDING_MIN_SESSIONS` | 5 (= `K_ANONYMITY_FLOOR`) | 기준일 순 세션 하한. 공개 가능 최소 인원 |
| `TRENDING_MIN_RATIO` | 1.5 | 실제로 상승 중일 때만 |

즉 **1 → 3 조회는 애초에 목록에 오르지 않습니다.** 조회수 하한(10)에서 걸립니다.

예시:

| 문서 | 직전 7일 합 | baseline | today | 세션 | score | 결과 |
| --- | --- | --- | --- | --- | --- | --- |
| A (급상승) | 11 | 1.57 | 24 | 8 | 9.72 | 노출 |
| B (꾸준히 인기) | 126 | 18.0 | 18 | 6 | 1.00 | 제외 (상승 아님) |
| C (소규모 급증) | 1 | 0.14 | 3 | 1 | 3.50 | 제외 (조회수·세션 하한) |

`value`는 비율이며 조회수가 아닙니다. 소비자가 "조회 9.72회"로 오해하지 않도록
`unit: "ratio"`를 함께 반환합니다.

## 10. `GET /api/metrics/v1` 파라미터

| 파라미터 | 필수 | 기본 | 제약 |
| --- | --- | --- | --- |
| `metric` | 필수 | — | 카탈로그 id. 미등록 값은 `invalid_request` + `valid_metrics` 목록 |
| `day` | 선택 | 오늘(UTC) | `YYYY-MM-DD`. 구간 지표에서는 구간의 **마지막 날** |
| `window` | 선택 | 지표별 (`articles.top_read` 7, `resolve.top_misses` 30) | 1~90. 일·스냅샷 지표에 주면 `invalid_request` |
| `dimension` | 선택 | 없음 | 최대 160자. 차원 없는 지표에 주면 `invalid_request`. `resolve.top_misses`에서는 `entity_type` 필터 |
| `limit` | 선택 | 20 | 1~100 (초과는 100으로 절단) |

응답 예시:

```http
GET /api/metrics/v1?metric=trending.now&day=2026-07-28&limit=10
Authorization: Bearer bwk_…
```

```json
{
  "contract_version": 1,
  "schema_version": "metric_series.v1",
  "request_id": "req_…",
  "snapshot_at": "2026-07-28T10:00:00Z",
  "page": { "limit": 10, "has_more": false, "next_cursor": null },
  "data": {
    "metric": {
      "id": "trending.now",
      "title": "지금 뜨는 문서",
      "unit": "ratio",
      "dimension": "article",
      "period": "day",
      "source": "live",
      "formula": "score = (today_views + 1) / (trailing_7d_views / 7 + 1), gated by today_views >= 10, today_sessions >= 5, score >= 1.5"
    },
    "period": { "kind": "day", "day": "2026-07-28" },
    "computed_from": "live",
    "dimension_filter": null,
    "session_grouping": true,
    "k_anonymity_floor": 5,
    "suppression": "k_anonymity",
    "suppressed_rows": 2,
    "rows": [
      { "dimension_key": "coffee-cherry-anatomy", "value": 9.7222, "subject_count": 8 }
    ]
  }
}
```

`suppressed_rows: 2`는 "데이터가 없다"가 아니라 "임계값 미달로 2행을
보류했다"는 뜻입니다.

잘못된 `metric`은 `problem("invalid_request")`이며 본문에 `valid_metrics`로
전체 id 목록을 돌려줍니다.

## 11. 운영

| 항목 | 값 |
| --- | --- |
| 필수 바인딩 | `TELEMETRY_SALT` (미설정 시 3절의 축소 동작), Vercel은 `CRON_SECRET` |
| salt 교체 | 언제든 가능. 교체 시점 이후의 세션 그룹핑만 끊기고 과거 롤업은 영향 없습니다 |
| D1 cron | `POST /api/telemetry/v1/rollup`을 하루 1회 이상. `client_type = internal` 자격증명 사용 |
| Supabase cron | `vercel.json`이 매일 03:17 UTC에 `GET /api/telemetry/retention` 호출. Vercel이 `Authorization: Bearer $CRON_SECRET`을 추가 |
| 백필 | `{"days": ["2026-07-01", "2026-07-02"]}` (최대 31일) |
| 자격증명 발급 | `scripts/mint-api-client.mjs` |

```bash
curl -X POST https://bean-wiki.vercel.app/api/telemetry/v1/rollup \
  -H "Authorization: Bearer $BEAN_WIKI_INTERNAL_KEY" \
  -H "content-type: application/json" -d '{}'
```

파일 지도:

| 파일 | 역할 |
| --- | --- |
| `src/lib/telemetry/session.ts` | `sessionHash`, `classifyReferrer`, UTC 일자 도구 |
| `src/lib/telemetry/ingest.ts` | 검증·삽입(`recordView`), 보존 정리(`pruneRawViews`) |
| `src/lib/metrics/catalog.ts` | 지표 정의, `K_ANONYMITY_FLOOR`, `suppressSmall` |
| `src/lib/metrics/rollup.ts` | 일별 롤업 upsert, `daily_metrics` 읽기 |
| `src/app/api/telemetry/v1/views/route.ts` | 공개 비콘 |
| `src/app/api/telemetry/v1/rollup/route.ts` | 내부 cron |
| `src/app/api/telemetry/retention/route.ts` | Vercel Supabase 원본 보존 cron |
| `src/app/api/metrics/v1/route.ts` | 지표 조회 |
| `src/components/view-beacon.tsx` | 클라이언트 비콘 컴포넌트 (마운트 위치는 파일 주석) |

## 12. 금지 사항

| 금지 | 대안 |
| --- | --- |
| 텔레메트리 표에 IP·User-Agent·이메일·계정 키 저장 | `session_hash`만 |
| salt 없이 해시 폴백 | 요청별 난수 |
| 카탈로그 밖에서 집계 SQL 작성 | 지표 정의 추가 후 `build()` 사용 |
| 억제 없이 차원별 집계 노출 | `applySuppression()` |
| 지표 응답에 개별 사용자 식별 정보 포함 | 집계만 |
| `daily_metrics`에 누적 가산(`value = value + ?`) | 재계산 후 `excluded.value` |
| 비콘 응답에 상세 오류 노출 | problem+json의 고정 목록 |
