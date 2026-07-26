---
name: write-article
description: Bean Wiki 신규 문서를 편집 하네스(페르소나 패널 리뷰 + 루브릭 게이트)로 작성. 사용자가 새 위키 문서 작성을 요청하면 사용. 인자로 주제(필수), 분야/난이도(선택)를 받는다.
---

# 신규 문서 작성 하네스

`docs/EDITORIAL.md`(SSOT)의 프로세스 §5를 그대로 실행합니다. 산출물은
`draft: true` 상태의 소스 파일 + `order.json` 등록 + 검증 통과입니다.

## 절차

1. **준비**: `docs/EDITORIAL.md` 전체와 기존 유사 문서 2편을 읽는다. 분야는
   `src/content/categories.ts`의 6개 중에서, accent는 분야와 일치시킨다.
   slug 중복을 `order.json`에서 확인한다.

2. **초안**: `persona-writer` 에이전트에 주제·분야·난이도·유사 문서 경로를
   주고 완성 원고(프론트매터 + 정제 HTML)를 받는다. `[확인:...]` 마커 포함.
   받은 원고를 `src/content/articles/<slug>.html`에 `draft: true`로 저장하고
   `order.json`에 등록한다.

3. **패널 리뷰(병렬)**: 분야 매핑에 따라 도메인 페르소나(로스팅→
   persona-roaster, 추출/장비→persona-barista, 센서리→persona-q-grader,
   산지/생두→persona-farmer; 겹치면 2인) + `persona-interviewer`를 **한
   메시지에서 병렬로** 실행한다. 각자에게 파일 경로와 "EDITORIAL.md 루브릭으로
   리뷰하라"는 지시를 준다.

4. **리서치 검증**: `research-librarian`에 파일 경로 + 인터뷰어의 "웹 검증
   필요" 질문을 넘겨 수치·기관 기준을 대조한다. 반박된 진술은 반드시 수정.

5. **수정과 게이트**: 리뷰 FINDINGS(심각도 높음→낮음 순)와 VERIFICATIONS를
   반영해 파일을 직접 수정한다. 게이트(전 축 ≥3, 평균 ≥4.0) 미달 축이 있으면
   해당 페르소나만 재실행해 재채점받는다. 페르소나 간 2점 이상 차이는
   `persona-interviewer`(쟁점 정리 모드)로 중재한다.

6. **보강**: `media-curator`에 파일 경로를 넘겨 표·콜아웃·이미지 제안을 받고,
   EDITORIAL §2 기준에 맞는 것만 반영한다(이미지는 라이선스 확정 후보만).

7. **마감**: `npm run build:content && npm run check-content && npm run lint`
   통과 확인. 사용자에게 점수표(패널별 6축), 반영/기각한 지적 요약, 남은
   `draft: true` 상태를 보고하고 — 공개(draft 해제)는 사용자 결정에 맡긴다.

## 규칙

- 게이트를 통과하지 못한 원고를 "완료"로 보고하지 않는다.
- 페르소나 출력의 SCORES/FINDINGS 형식이 깨져 있으면 한 번 재요청한다.
- 커밋은 사용자가 요청했을 때만 한다.
