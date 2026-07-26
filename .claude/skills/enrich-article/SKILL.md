---
name: enrich-article
description: 기존 Bean Wiki 문서에 표·이미지·콜아웃·레퍼런스를 보강. 사용자가 문서의 시각 자료·데이터·출처 보강을 요청하면 사용. 인자로 슬러그(들)를 받는다.
---

# 문서 보강 하네스 (표·이미지·데이터·레퍼런스)

텍스트 위주의 문서에 리치 블록과 검증된 이미지를 더하는 스킬입니다. 기준은
`docs/EDITORIAL.md` §2(블록 사용 기준)과 `docs/DESIGN.md`.

## 절차

1. 대상 소스(`src/content/articles/<slug>.html`)를 읽고 현재 블록 구성
   (표/콜아웃/토글/figure 개수)을 파악한다.

2. **제안 수집(병렬)**:
   - `media-curator`: 표·콜아웃 설계 + 이미지 후보(작가·라이선스·출처 포함)
   - `research-librarian`: 본문 수치 중 출처 보강이 필요한 진술의 근거 대조

3. **반영**: 제안 중 EDITORIAL §2 기준에 맞는 것만 소스에 직접 반영한다.
   - 표·콜아웃: 제안 HTML을 새니타이즈 가능한 형태(허용 태그만)로 삽입.
   - 이미지: **라이선스가 확정된 후보만**. figure 형식은
     `<figure class="article-figure" data-author=".." data-license=".."
     data-source=".."><img src=".." alt=".." /><figcaption>캡션</figcaption></figure>`
     원격 URL은 Commons 직링크를 사용하고, 저장소 업로드가 필요하면 사용자에게
     에디터 업로드 경로(/edit/<slug> → 이미지 → 업로드)를 안내한다.
   - 근거: 리브레리언 판정이 "부분확인/반박"인 수치는 본문을 수정하거나 헤지를
     추가한다.

4. **마감**: `npm run build:content && npm run check-content` 통과 확인.
   history에 보강 이력 추가, updatedAt 갱신. 반영/기각 요약을 보고한다.
   커밋은 사용자 요청 시에만.

## 규칙

- 장식용 이미지 금지 — 개념 전달에 기여하는 것만.
- 블록 과밀 금지: 문서당 콜아웃 1~3, 연속 두 블록 사이에 본문 문단 최소 1개.
- 라이선스 불명 이미지는 절대 넣지 않는다.
