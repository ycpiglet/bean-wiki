# Beanote Data API v1·Export 계약

- 문서 ID: `beanote-data-api-v1`
- 상태: 구현 전 초안
- URL major version: `v1`
- 공통 계약 버전: `1`

## 1. 계약의 목적

Beanote의 가명 커피 기록과 OCR 처리 계보를 Bean Wiki 같은 승인된 외부
시스템이 다음 조건으로 반복 수집할 수 있게 합니다.

- Supabase를 직접 노출하지 않음
- API Client별 권한과 `subject_key`
- 리소스별 안정 ID와 revision
- 원문, 정규화 값, 품질 상태, 처리 계보의 분리
- 철회·삭제의 명시적 전달
- 같은 요청을 재실행해도 중복되지 않는 동기화

## 2. API와 Export의 공통 모델

### 2.1 리소스 관계

| 데이터셋/리소스 | 한 행의 의미 | PK 제안 | 주요 FK | 최소 tier |
| --- | --- | --- | --- | --- |
| `brew_logs` | 한 사용자가 커피를 마신 사건 | `brew_log_id` | `subject_key`, `business_place_id` | T1 |
| `scans` | 커피 카드 스캔 한 건 | `scan_id` | `brew_log_id` | T1 |
| `scan_fields` | 스캔에서 관측된 한 필드 | `scan_field_id` | `scan_id` | T1 구조화/T2 Raw |
| `candidates` | 한 필드의 OCR/정규화 후보 | `candidate_id` | `scan_field_id` | T2 |
| `corrections` | 필드의 사용자·운영자·시스템 보정 | `correction_id` | `scan_field_id` | T2 |
| `assets` | 스캔 이미지의 메타데이터 | `asset_id` | `scan_id` | T1 메타/T3 파일 |
| `revocations` | 삭제·동의 철회·scope 축소 이벤트 | `revocation_id` | 대상 resource 또는 subject | T1 |

실제 PK/FK 이름이 이미 존재하면 serializer에서 계약 이름으로 매핑합니다.
DB를 이 이름에 맞추기 위한 불필요한 migration은 하지 않습니다.

### 2.2 공통 리소스 필드

모든 데이터 레코드는 다음 의미를 제공해야 합니다.

| 필드 | 타입 | 규칙 |
| --- | --- | --- |
| `<resource>_id` | string | Beanote 내부에서 안정적이고 재사용하지 않는 ID |
| `revision` | positive integer | 내용·공유·삭제가 바뀔 때 증가 |
| `record_status` | enum | `active`, `deleted` |
| `created_at` | RFC 3339 | 원본 생성 시각 |
| `updated_at` | RFC 3339 | 현재 revision 시각 |
| `deleted_at` | RFC 3339 또는 null | deleted이면 필수 |
| `subject_key` | string 또는 생략 | Client 범위 가명 ID; 필요한 리소스에만 |

수집 측 idempotency key는
`(source = "beanote", resource_type, resource_id, revision)`입니다. 더 낮은
revision이 늦게 도착하면 무시합니다.

### 2.3 개인정보 등급

| tier | API/Export에서 허용되는 범위 |
| --- | --- |
| T0 | 최소 인원 기준을 통과한 집계 |
| T1 | 가명화된 brew log, scan 식별·연결, 구조화된 scan field, asset 메타 |
| T2 | OCR 원문, 후보, confidence, 보정 이력 |
| T3 | 이미지 파일, 자유 메모, 직접 식별 가능 정보 |

응답의 `privacy.tier`는 **응답에 실제 포함된 최고 등급**입니다. Client의 최대
권한을 그대로 적지 않습니다.

## 3. API 공통 envelope

성공 응답은 endpoint별 `schema_version`과 공통 운영 문맥을 함께 전달합니다.

```json
{
  "contract_version": 1,
  "schema_version": "scan_observation.v1",
  "request_id": "req_01K1DX8F2YMCJZ1G",
  "snapshot_at": "2026-07-28T08:29:00Z",
  "privacy": {
    "tier": "T2",
    "subject_namespace": "client_01HZX..."
  },
  "lineage": {
    "pipeline_name": "beanote-card-ocr",
    "pipeline_version": "2026.07.3",
    "normalization_version": "coffee-fields.4"
  },
  "page": {
    "limit": 100,
    "has_more": false,
    "next_cursor": null
  },
  "data": []
}
```

| 필드 | 역할 |
| --- | --- |
| `contract_version` | envelope, pagination, 오류 등 공통 계약 major |
| `schema_version` | `brew_log.v1`, `scan.v1`, `scan_observation.v1` 같은 리소스 schema |
| `request_id` | 호출 추적 ID; 데이터 ID가 아님 |
| `snapshot_at` | 이 페이지들이 기준으로 삼는 일관된 snapshot 시각 |
| `privacy` | 실제 응답 tier와 subject namespace |
| `lineage` | OCR·정규화 파이프라인 버전 |
| `page` | cursor pagination |
| `data` | endpoint에 해당하는 리소스 배열 |

API timestamp는 RFC 3339를 사용합니다. 서버 이벤트는 UTC `Z`로 전달합니다.
사용자가 마신 시각은 당시 offset을 보존하고 `timezone`에 IANA 이름을 둡니다.

## 4. 품질과 빈 값

### 4.1 값 표현

```json
{
  "name": "origin_country",
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

- `confidence`: `null` 또는 `0..1`; `98` 같은 백분율 금지
- `raw_value`: 관측된 문자열, 없으면 `null`
- `normalized_value`: 계약상 정규화 값, 없으면 `null`
- `NaN`, `Infinity`, `undefined`: 금지, `null`과 상태 사용

### 4.2 상태

| 필드 | 값 | 의미 |
| --- | --- | --- |
| `value_state` | `present` | 값이 유효하게 존재 |
|  | `missing` | 수집 대상이지만 값 없음 |
|  | `not_collected` | 해당 시점/버전에서 수집하지 않음 |
|  | `redacted` | 권한 또는 정책 때문에 제거 |
|  | `expired` | 보존기간 만료 |
|  | `invalid` | 값은 있었으나 계약 검증 실패 |
|  | `parse_failed` | Raw에서 구조화하지 못함 |
| `verification_state` | `unverified` | 사람 또는 확정 규칙으로 확인 안 됨 |
|  | `verified` | 확인됨 |
|  | `corrected` | 이전 값이 보정됨 |
|  | `not_applicable` | 검수 개념이 해당하지 않음 |
| `is_outlier` | boolean/null | 이상치 판정 또는 판정하지 않음 |

`value_state != "present"`이면 value는 원칙적으로 `null`입니다. 예외적으로
`invalid`/`parse_failed`의 Raw 값을 T2에서 제공할 때는
`raw_value`만 남고 `normalized_value`는 `null`일 수 있습니다.

CSV는 각 값 열 옆에 최소한 `_value_state`, `_verification_state`,
`_is_outlier` 열을 둡니다.

## 5. 리소스 계약

필드 목록은 실제 Beanote DB 매핑 검토 후 JSON Schema로 각각 확정합니다. 아래는
API v1에서 필요한 최소 의미입니다.

### 5.1 `brew_log.v1`

```json
{
  "brew_log_id": "bl_01K1...",
  "subject_key": "sub_6B0H...",
  "revision": 2,
  "record_status": "active",
  "cafe_name": "샘플 커피바",
  "business_place_id": "bp_01K0...",
  "place_region": "서울",
  "coffee_name": "Ethiopia Guji Hambela",
  "menu_name": null,
  "tasted_at": "2026-07-26T12:05:00+09:00",
  "timezone": "Asia/Seoul",
  "created_at": "2026-07-26T03:12:30Z",
  "updated_at": "2026-07-28T04:02:11Z",
  "deleted_at": null
}
```

- 사용자 GPS는 포함하지 않습니다.
- `business_place_id`는 Beanote 내부 연결용입니다.
- 상세 공개 주소·좌표는 T1 기본 응답에서 제외하고 `place_region`처럼 일반화한
  지역만 제공합니다.
- `menu_name`은 선택 필드이며 기존 기록은 `null` +
  `not_collected` 의미를 data dictionary에서 표시합니다.
- 사용자 자유 메모와 닉네임은 T1에 포함하지 않습니다.

### 5.2 `scan.v1`

```json
{
  "scan_id": "sc_01K1...",
  "brew_log_id": "bl_01K1...",
  "revision": 3,
  "record_status": "active",
  "capture_method": "card_ocr",
  "source_asset_id": "as_01K1...",
  "analysis_asset_id": "as_01K2...",
  "captured_at": "2026-07-26T03:12:00Z",
  "created_at": "2026-07-26T03:12:02Z",
  "updated_at": "2026-07-28T04:02:11Z",
  "deleted_at": null
}
```

`source_asset_id`는 휴대폰 원본이 아니라 EXIF/GPS 제거·재인코딩을 거친
**정제된 소스 이미지**를 가리킵니다. T1에서는 ID와 메타데이터만 제공하며
파일 또는 URL은 제공하지 않습니다.

### 5.3 `scan_observation.v1`

`scan_fields` endpoint의 한 행입니다. 실행 가능한 정본은
[JSON Schema](./beanote-scan-observation-v1.schema.json)와
[예시 응답](./beanote-scan-observation-v1.example.json)을 사용합니다.

```json
{
  "scan_field_id": "sf_01K1...",
  "scan_id": "sc_01K1...",
  "revision": 2,
  "record_status": "active",
  "name": "origin_country",
  "raw_value": "ETHIOPIA",
  "normalized_value": "Ethiopia",
  "confidence": 0.98,
  "quality": {
    "value_state": "present",
    "verification_state": "verified",
    "is_outlier": false
  },
  "observed_at": "2026-07-26T03:12:10Z",
  "updated_at": "2026-07-28T04:02:11Z",
  "deleted_at": null
}
```

T1 응답은 `normalized_value`와 품질 상태 중심으로 제공하고 `raw_value`와
`confidence`를 `null`/`redacted` 처리할 수 있습니다. T2 scope에서만 OCR Raw와
confidence를 제공합니다.

### 5.4 `candidate.v1`

최소 필드:

```text
candidate_id, scan_field_id, revision, rank, candidate_value,
confidence, generator, generated_at, updated_at, record_status
```

- `rank`: 1부터 시작하는 양의 정수
- `confidence`: 0..1 또는 null
- `generator`: pipeline 단계 ID, secret 또는 내부 경로 금지
- T2만 제공

### 5.5 `correction.v1`

최소 필드:

```text
correction_id, scan_field_id, revision, previous_value, corrected_value,
actor_type, reason_code, corrected_at, updated_at, record_status
```

`actor_type`은 `user`, `operator`, `system`만 전달하고 실제 운영자·사용자 ID는
외부 계약에 포함하지 않습니다. 자유 서술 사유보다 제한된 `reason_code`를
우선합니다.

### 5.6 `asset.v1`

```json
{
  "asset_id": "as_01K1...",
  "scan_id": "sc_01K1...",
  "revision": 1,
  "record_status": "active",
  "role": "source_image",
  "content_type": "image/jpeg",
  "byte_size": 483201,
  "sha256": "0123456789abcdef...",
  "sanitization": {
    "exif_removed": true,
    "gps_removed": true,
    "reencoded": true
  },
  "created_at": "2026-07-26T03:12:02Z",
  "updated_at": "2026-07-26T03:12:02Z",
  "deleted_at": null
}
```

허용 `role`:

- `source_image`: 정제된 소스 이미지
- `analysis_image`: 분석 파이프라인용 변환 이미지
- `thumbnail`: 콘솔 미리보기

T1에는 위 메타데이터만 제공할 수 있습니다. T3 파일 접근은 별도 승인·재인증·
기간 제한 grant가 필요합니다. 이미지 bytes를 JSON base64로 반환하지 않습니다.

### 5.7 `revocation.v1`

```json
{
  "revocation_id": "rv_01K2...",
  "revision": 1,
  "effective_at": "2026-07-28T08:15:00Z",
  "action": "consent_withdrawn",
  "subject_key": "sub_6B0H...",
  "resource_type": "brew_log",
  "resource_id": "bl_01K1...",
  "cascade": true,
  "reason_code": "user_request"
}
```

| `action` | 소비자 동작 |
| --- | --- |
| `deleted` | 대상 resource와 파생 데이터 삭제 |
| `consent_withdrawn` | 대상 및 cascade 범위의 외부 사용 중단·삭제 |
| `scope_reduced` | 허용 tier/필드에 맞춰 redaction 또는 삭제 |
| `retention_expired` | 보존 만료 데이터 삭제 |

철회 이벤트 자체는 삭제 처리가 완료될 때까지 다시 조회할 수 있어야 합니다.
보존기간은 정책으로 확정하되 API Client의 최대 동기화 중단 기간보다 길어야
합니다.

## 6. Endpoint

Base path:

```text
/api/data/v1
```

| Method | Path | 최소 scope | 응답 schema |
| --- | --- | --- | --- |
| GET | `/brew-logs` | `brew-logs:read:t1` | `brew_log.v1` |
| GET | `/scans` | `scans:read:t1` | `scan.v1` |
| GET | `/scans/{scan_id}/fields` | `scan-fields:read:t1` 또는 `:t2` | `scan_observation.v1` |
| GET | `/candidates` | `candidates:read:t2` | `candidate.v1` |
| GET | `/corrections` | `corrections:read:t2` | `correction.v1` |
| GET | `/assets` | `assets:read:t1` | `asset.v1` 메타 |
| GET | `/revocations` | 각 Client 필수 | `revocation.v1` |
| POST | `/exports` | `exports:create:t1` 이상 | `export_job.v1` |
| GET | `/exports/{export_id}` | 같은 Client | `export_job.v1` |

`candidates`, `corrections`, T3 asset 파일 접근은 Phase 3까지 비활성화할 수
있습니다. 문서화된 endpoint가 비활성일 때는 `404` 또는 명시적 기능 상태
응답 중 하나를 정책으로 통일합니다.

## 7. 목록 query와 cursor

공통 query:

| query | 규칙 |
| --- | --- |
| `limit` | 기본 100, 최소 1, 최대 500 |
| `cursor` | 서버 생성 불투명 문자열 |
| `updated_after` | 전체 복구·관리 목적의 선택 RFC 3339 필터 |
| `include_deleted` | 동기화 Client에서는 기본 true |

cursor에는 snapshot과 정렬 위치를 서버가 서명하거나 변조 불가능한 방식으로
담습니다. Client는 cursor를 해석하지 않습니다.

정렬은 최소 `(updated_at ASC, resource_id ASC)`처럼 결정적이어야 합니다.
페이지를 처리하고 저장한 뒤에만 `next_cursor`를 checkpoint합니다.

| 상황 | 응답 |
| --- | --- |
| cursor 없음 | 새 snapshot의 첫 페이지 |
| 중간 cursor | 같은 snapshot의 다음 페이지 |
| 마지막 페이지 | `has_more: false`, 다음 증분용 checkpoint 제공 |
| 만료/무효 cursor | `410 Gone` Problem Details |

구현이 change feed cursor를 지원하지 못하면 `updated_after`에 overlap을 두고
resource ID와 revision으로 중복 제거합니다. 경계 시각 동률 테스트가 필수입니다.

## 8. 인증·권한·속도 제한

- HTTPS만 허용
- `Authorization: Bearer <client_secret>`
- secret은 query string 금지
- DB에는 원문이 아닌 검증용 hash 저장
- 운영·스테이징 credential 분리
- Client별 scope, tier, dataset/field 제한, 만료, rate limit
- 키 생성 시 한 번만 원문 표시
- 회전 overlap과 즉시 revoke
- 로그에는 header/token/만료 asset URL을 남기지 않음

권장 응답 header:

```text
X-Request-Id
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
Retry-After
```

## 9. 오류

오류는 `application/problem+json`을 사용합니다.

```json
{
  "type": "https://beanote.example/problems/cursor-expired",
  "title": "Cursor expired",
  "status": 410,
  "detail": "Start a new full synchronization without a cursor.",
  "request_id": "req_01K1DX8F2YMCJZ1G"
}
```

| 상태 | 의미 | 재시도 |
| --- | --- | --- |
| `400` | query/body 오류 | 수정 전 재시도 금지 |
| `401` | credential 오류 | 중단 |
| `403` | scope/tier/승인 부족 | 권한 변경 전 중단 |
| `404` | resource 없음 또는 비공개 | 중단 |
| `409` | Export 상태 충돌 | 최신 상태 조회 |
| `410` | cursor 또는 다운로드 만료 | 새 snapshot/Export |
| `422` | 문법은 맞지만 의미 검증 실패 | 입력 수정 |
| `429` | rate limit | `Retry-After` 이후 |
| `500/502/503` | 일시 오류 | 제한된 지수 backoff |

## 10. 비동기 Export

### 10.1 생성

```http
POST /api/data/v1/exports
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "purpose": "Bean Wiki integration contract validation",
  "recipient": "Bean Wiki",
  "privacy_tier": "T1",
  "datasets": [
    "brew_logs",
    "scans",
    "scan_fields"
  ],
  "time_range": {
    "from": "2026-07-01T00:00:00Z",
    "to": "2026-08-01T00:00:00Z"
  },
  "format": "jsonl",
  "expires_in_hours": 24,
  "include_assets": false,
  "include_free_text": false
}
```

MVP 검증:

- T1만
- `include_assets = false`
- `include_free_text = false`
- 만료 1~72시간
- purpose와 recipient 필수
- 정책 미승인 시 실제 사용자 데이터 요청 거부

성공 응답:

```http
202 Accepted
Location: /api/data/v1/exports/ex_01K2...
```

```json
{
  "export_id": "ex_01K2...",
  "status": "queued",
  "created_at": "2026-07-28T08:30:00Z",
  "expires_at": null
}
```

### 10.2 상태 조회

`GET /api/data/v1/exports/{export_id}`는 다음 상태를 반환합니다.

```text
queued → running → ready → expired
                    ├─ failed
                    └─ revoked
```

`ready`일 때만 다음을 포함합니다.

```json
{
  "export_id": "ex_01K2...",
  "status": "ready",
  "snapshot_at": "2026-07-28T08:30:05Z",
  "download_url": "https://signed.example/...",
  "expires_at": "2026-07-29T08:30:05Z",
  "byte_size": 1283902,
  "sha256": "0123456789abcdef...",
  "row_counts": {
    "brew_logs": 100,
    "scans": 98,
    "scan_fields": 842,
    "revocations": 3
  }
}
```

`download_url`은 짧게 만료되며 Export 만료보다 길 수 없습니다. URL을 갱신하는
대신 새 Export를 생성합니다.

## 11. Export bundle

권장 ZIP 구조:

```text
beanote-export-ex_01K2.zip
├─ manifest.json
├─ data_dictionary.json
├─ checksums.sha256
├─ revocations.jsonl
└─ data/
   ├─ brew_logs.jsonl
   ├─ scans.jsonl
   ├─ scan_fields.jsonl
   ├─ candidates.jsonl        # 선택
   ├─ corrections.jsonl       # 선택
   └─ assets.jsonl            # 메타데이터만
```

CSV를 선택하면 `data/*.csv`로 바뀌고 나머지 부속 파일은 유지합니다.

### 11.1 `manifest.json`

```json
{
  "contract_version": 1,
  "export_id": "ex_01K2...",
  "request_id": "req_01K2...",
  "created_at": "2026-07-28T08:30:00Z",
  "snapshot_at": "2026-07-28T08:30:05Z",
  "expires_at": "2026-07-29T08:30:05Z",
  "privacy": {
    "tier": "T1",
    "subject_namespace": "client_01HZX..."
  },
  "lineage": {
    "pipeline_version": "2026.07.3",
    "normalization_version": "coffee-fields.4"
  },
  "format": "jsonl",
  "datasets": [
    {
      "name": "brew_logs",
      "schema_version": "brew_log.v1",
      "path": "data/brew_logs.jsonl",
      "row_count": 100
    }
  ],
  "revocations_path": "revocations.jsonl",
  "data_dictionary_path": "data_dictionary.json",
  "checksums_path": "checksums.sha256"
}
```

### 11.2 JSONL

- UTF-8, BOM 없음
- 한 줄에 완전한 JSON object 하나
- 줄 사이 쉼표와 바깥 배열 없음
- 마지막 줄 newline 권장
- API envelope는 각 줄에 반복하지 않고 manifest에 기록
- 리소스마다 `revision`, `record_status`, `updated_at` 포함

### 11.3 CSV

- UTF-8 BOM 포함
- comma delimiter와 header
- RFC 4180 quoting
- nested object/array는 가능한 한 관계형 dataset으로 분리
- 피할 수 없는 배열은 JSON 문자열
- 값 열과 상태 열을 함께 제공
- 빈 셀만으로 결측 원인을 표현하지 않음

### 11.4 `data_dictionary.json`

데이터셋별로 다음을 기록합니다.

```text
field_name
display_name
description
type
nullable
unit
enum_values
privacy_tier
source
normalization
missingness_rule
retention
```

### 11.5 `checksums.sha256`

ZIP 내부 각 파일의 SHA-256을 일반적인 다음 형식으로 기록합니다.

```text
<hex digest><two spaces><relative path>
```

ZIP 자체 checksum은 Export 상태 응답에서 별도로 제공합니다.

## 12. 버전 호환성

- `contract_version`: 공통 envelope의 breaking version, integer
- `schema_version`: resource별 `<name>.v<major>`
- 선택 필드 추가: 같은 major에서 허용, 소비자는 모르는 필드 무시
- 필드 삭제·타입/의미 변경: 새 resource schema major
- URL major 변경: 공통 동작이 깨질 때 `/api/data/v2`
- 변경 전 deprecation 공지와 병행 운영 기간은 정책으로 확정

OpenAPI와 JSON Schema를 저장소에 두고 serializer fixture를 CI에서 검증합니다.
문서 예시는 모두 합성 데이터여야 합니다.

## 13. 감사와 철회 처리

서버가 기록할 API 감사 메타데이터:

```text
request_id, client_id, endpoint, scope, privacy_tier, status,
row_count, started_at, completed_at
```

기록하지 않을 값:

```text
Authorization header, secret, OCR raw text, free-text note,
signed asset URL, response body
```

Bean Wiki 동기화 순서:

1. data page의 schema/version 검증
2. transaction 또는 재시도 가능한 단위로 upsert
3. 페이지 성공 후 cursor checkpoint
4. revocations feed 처리
5. 원본·검색·집계·캐시 삭제
6. 처리 완료 audit와 실패 재시도

철회가 데이터 page와 경합하면 더 높은 revision 또는 더 늦은
`effective_at`의 철회가 우선합니다.

## 14. 인수 테스트

| 시나리오 | 통과 조건 |
| --- | --- |
| 같은 페이지 재호출 | 동일 snapshot·정렬, 중복 없이 upsert 가능 |
| 동일 ID revision 증가 | 새 값으로 갱신 |
| 높은 revision 뒤 낮은 revision | 낮은 revision 무시 |
| null 값 | `value_state`가 원인을 설명 |
| confidence 98 입력 | serializer가 0.98로 변환하거나 입력을 거부 |
| confidence 범위 밖 | `422` 또는 Export 작업 실패 |
| T1 Client의 Raw 요청 | `403` 또는 redacted 계약대로 처리 |
| T1 asset 조회 | 메타만 있고 URL/bytes 없음 |
| 사용자 GPS·이메일·원본 ID | T1 응답과 bundle에 없음 |
| source image | `role=source_image`, “휴대폰 원본” 표현 없음 |
| cursor 중간 실패 | 마지막 성공 checkpoint부터 재개 |
| cursor 만료 | `410` 후 새 snapshot |
| 동의 철회 | revocation 전달 후 파생 데이터 삭제 가능 |
| JSONL | 모든 줄 독립 JSON object |
| CSV 특수문자 | 한글·쉼표·따옴표·줄바꿈 보존 |
| checksum | 모든 내부 파일과 ZIP 검증 성공 |
| Export 만료/폐기 | URL 즉시 사용 불가 |
| 감사 로그 | secret·Raw·자유 메모 없음 |

## 15. 구현 전에 확정할 항목

- 실제 리소스 PK/FK와 revision을 생성할 기준
- change feed와 tombstone 저장 위치
- `subject_key` 파생·키 회전 방식
- T1의 일반화된 카페 위치 단위
- 현재 confidence 척도와 변환 규칙
- 동의·철회 정책 버전 ID
- cursor와 snapshot 보존기간
- revocation 보존기간과 삭제 SLA
- Export object storage 암호화·파기 방식
- T2/T3 승인자와 재인증 방식
