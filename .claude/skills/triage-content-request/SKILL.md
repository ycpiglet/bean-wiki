---
name: triage-content-request
description: 콘텐츠 요청 큐를 처리해 accept·decline·duplicate를 판정하고 상태를 전이. 사용자가 요청 큐 트리아지, 대기 요청 처리, 요청 승인·거절을 요청하면 사용. 인자로 요청 ID(들) 또는 "queue"를 받는다.
---

# 요청 큐 트리아지 하네스

`content_requests`(기계 접수)와 `suggestions`(사람 접수)를 하나의 큐로 보고
판정하는 스킬입니다. 상태 기계는 `src/lib/requests/status.ts`가 정본입니다.

## 절차

1. **전이표를 먼저 읽는다**: `src/lib/requests/status.ts`의 `TRANSITIONS`와
   `TRANSITION_REQUIREMENTS`를 확인한다. 상태를 **직접 쓰지 않는다** —
   `PATCH /api/requests/v1/content-requests/{id}`(또는
   `transitionRequest()` in `src/lib/requests/store.ts`)만 사용한다. 직접 UPDATE는
   "accepted를 거치지 않은 published"를 표현 가능하게 만들고 큐를 조용히 오염시킨다.

   ```text
   received → triaged → accepted → drafting → in_review → published
                      → declined
                      → duplicate
   ```

   | from | 허용되는 to |
   | --- | --- |
   | `received` | triaged, declined, duplicate |
   | `triaged` | accepted, declined, duplicate |
   | `accepted` | drafting, declined |
   | `drafting` | in_review, accepted, declined |
   | `in_review` | published, drafting, declined |
   | `published`·`declined`·`duplicate` | (종결. 다시 전이하지 않음) |

   불법 전이는 `409 state-conflict`이며 응답에 `current_status`와 `allowed_next`가
   실려 온다. 두 단계를 건너뛰려 하지 말고 중간 상태를 거친다. 같은 행을 다른
   트리아지 주체가 먼저 바꿨으면 `concurrent_change`(역시 409, `current_revision`
   포함)다 — 최신 상태를 다시 읽고 판정을 재검토한다. 재시도로 밀어붙이지 않는다.

2. **큐를 읽는다**: 봇 `requests.queue`(우선순위 → `updated_at DESC`)를 쓴다.
   `GET /api/requests/v1/content-requests`와 `GET …/{id}`는 **자기 client의 행만**
   돌려주므로 트리아지 전체 뷰가 아니다(사람 접수 행은 `client_id`가 없어 아예
   보이지 않는다). 전체 큐는 봇 명령이나 `content-requests` 테이블 직접 읽기로
   본다. `client_id`가 있으면 앱 요청, 없으면 사람 제안이다.

3. **근거를 본다 — 제목·본문보다 먼저**:

   | 신호 | 위치 | 읽는 법 |
   | --- | --- | --- |
   | `demand_evidence.observation_count` / `window` | 요청 행 | "지난 30일 214건"이 사람이 쓴 요청문보다 우선순위 판단에 유용하다 |
   | `demand_evidence.unresolved_terms` | 요청 행 | `/resolve`가 실패한 실제 문자열 |
   | `entity_refs` | 요청 행 | 이미 검증된 어휘 ID 목록(제출 시 `byId`로 검증됨) |
   | `resolve_misses` | 봇 `content.gaps`, `topMisses()` | `hit_count`·`last_seen_at`. 요청과 무관한 수요까지 보인다 |

   `demand_evidence.context`는 자유 서술이다. 판정 근거로 인용할 때 원문을 감사
   기록·커밋 메시지에 복사하지 않는다.

4. **중복 판정**: 세 곳을 모두 확인한다.
   - 기존 문서: `src/content/articles/index.ts`의 슬러그·제목, `redirects.json`
   - 열린 요청: 같은 `entity_refs` 또는 같은 정규화 용어를 가진 미종결 행
   - 용어집: `src/content/glossary.ts` — 문서가 아니라 용어 한 줄로 충분한 요청

   같은 client가 같은 `external_id`로 다시 보낸 것은 중복이 아니다. 그것은 이미
   멱등 처리되어 기존 리소스를 200으로 돌려받았다(계약 §10).

5. **판정한다**(아래 루브릭). `triaged`로 옮긴 뒤 accept/decline/duplicate를
   결정한다. 종결 상태는 **설명 필드가 없으면 422로 거부**된다.

   | 종결 상태 | 필수 필드 | 없으면 |
   | --- | --- | --- |
   | `published` | `resolution_article_slug` | `missing_field` — 요청한 앱이 무엇을 읽어야 할지 알 수 없다 |
   | `declined` | `declined_reason` | `missing_field` — 요청자가 다음에 무엇을 할지 알 수 없다 |
   | `duplicate` | `duplicate_of` | `missing_field` — 가리킬 대상이 없다 |

6. **accept면 집필로 인계**: `accepted` → `drafting`으로 옮기고 `write-article`
   스킬에 넘긴다. 인계 시 주제·분야·난이도와 함께 **요청 ID, `entity_refs`,
   `demand_evidence` 요약**을 전달한다. 초안이 완성되면 `in_review`,
   게시되면 `published` + `resolution_article_slug`다. 요청 큐가 문서를 게시하지
   않는다 — 게시는 기존 편집 게이트(`check-content`, `check:editorial`, 패널 리뷰,
   사람 승인)를 그대로 통과한 뒤다.

7. **미스 행을 연결한다**: 요청의 근거가 된 `resolve_misses` 행에
   `content_request_id`를 채운다(`linkMissToRequest(entityType, normalizedQuery,
   contentRequestId)` in `src/lib/knowledge/gaps.ts`). 이것을 빠뜨리면 봇
   `content.gaps`가 `onlyUnfiled` 필터로 걸러내지 못해 **이미 진행 중인 작업을 계속
   다시 추천한다**. 현재 이 함수는 자동 호출되는 곳이 없으므로 트리아지가
   책임진다.

8. **마감**: 요청별 판정·사유·전이 결과 표와, 인계한 집필 항목, 연결한 미스 행을
   보고한다. 커밋은 사용자 요청 시에만.

## 판정 루브릭

| 판정 | 조건 | 필요한 것 |
| --- | --- | --- |
| **accept** | 커피 도메인이고, 기존 문서가 없고, 어휘·문서로 설명 가능하며, 근거가 실재한다(`observation_count` ≥ 5 또는 미스 `hit_count` ≥ 5 또는 커리큘럼상 선수 개념) | `triaged` → `accepted`. 집필 인계 |
| **duplicate** | 같은 주제의 문서가 이미 있거나, 같은 내용의 미종결 요청이 이미 있다 | `duplicate_of`에 기존 요청 ID 또는 문서 슬러그. 문서가 있는 경우엔 `published` + 해당 슬러그가 더 정확할 수 있다 |
| **decline** | 범위 밖(커피 도메인 아님), 근거 없음(수요 증거 0 + 어휘 근거 0), 판정 불가한 모호한 요청, 사실 확인이 불가능한 주장, 문서가 아니라 용어집·기능 요청 | `declined_reason` 한 줄. 요청자가 다음에 할 수 있는 행동을 포함 |
| **보류** | 근거는 있지만 선행 문서가 필요하다 | `triaged`에 남기고 선행 주제를 별도 요청으로 만든다. 종결시키지 않는다 |

경계 사례:

- **수요는 큰데 근거 문서가 없는 산지·품종**: decline이 아니다. accept해서 문서를
  쓰고, 문서가 게시된 뒤 `curate-vocabulary`로 어휘를 추가한다. 순서를 뒤집지 않는다.
- **`kind: "question"`**: 문서가 아니라 답변이 필요한 경우가 많다. 답할 수 있으면
  용어집 항목이나 기존 문서 섹션으로 흡수하고 `duplicate_of`로 그 문서를 가리킨다.
- **`kind: "correct_article"`**: 큐 트리아지가 아니라 사실 검증 문제다. accept 후
  `research-librarian`으로 검증하고 `enrich-article`/`review-article`로 넘긴다.
  반박되면 decline이 아니라 문서 수정이다.
- **사람 제안(`suggestions`)**: `SUGGESTION_KIND_MAP`이 한국어 `kind` 값을 기계
  `kind`로 매핑한다. 입구는 둘이지만 트리아지 판정 기준은 하나다.

## 규칙

- 상태를 직접 쓰지 않습니다. 전이표를 통과하는 경로만 씁니다.
- 종결 상태를 설명 없이 만들지 않습니다. 거절 사유 "범위 밖"만으로는 부족합니다 —
  무엇이 범위 밖이고 어디로 가야 하는지 한 줄로 적습니다.
- 요청을 수락했다는 것이 게시를 뜻하지 않습니다. 사람 검수 없는 게시는 없습니다.
- 요청 본문의 자유 서술을 감사 기록·커밋 메시지에 복사하지 않습니다.
- 우선순위는 `priority_hint`(요청자 주장)보다 `demand_evidence`(관측치)를
  우선합니다. 새로움보다 실제 수요입니다.
- 커밋은 사용자가 요청했을 때만 합니다.
