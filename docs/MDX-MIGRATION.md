# 콘텐츠 마크다운/MDX 전환 설계

> 상태: ✅ **구현 완료** (2026-07-21). 아래 설계 중 접근 (b)의 **빌드타임 코드젠**
> 변형을 채택했습니다: `.md` → 생성된 `src/content/articles/index.ts`(순수 데이터).
> 런타임 `fs` 없이 번들되므로 클라이언트 임포트(`mobile-nav`)와 온디맨드 `/tags`
> 경로에서도 안전합니다. 이행은 `.ts`→`.md` 자동 변환 + 왕복 동등성 게이트로
> 무손실 검증했습니다. 파서/직렬화기: `scripts/content-md.mjs`, 생성기:
> `scripts/build-content.mjs`(predev/prebuild), 검증: `scripts/check-content.mjs`.
> 아래는 당시 설계 기록입니다.

## 목표

비개발자도 마크다운으로 문서를 쓰고 고칠 수 있게 하되, 지금의 타입 안전한
공개 API(`src/lib/content.ts` 파사드)와 모든 페이지 코드는 그대로 둡니다.
즉 **소비자(페이지)는 바뀌지 않고, 데이터 소스만 `.ts` 모듈에서 `.md`로** 바뀝니다.

## 현재 데이터 형태

`Article`은 구조화된 데이터입니다(단순 본문이 아님):

```
slug, title, summary, category, level, readingTime, updatedAt, accent, fact,
sections: { id, title, paragraphs[], points? }[],
related[], tags?, history?
```

페이지는 `sections[].paragraphs`, `section.points`, `related`, `fact` 등을
개별 필드로 렌더링합니다. 따라서 "마크다운 본문 → 렌더된 HTML" 한 덩어리로는
현재 마크업(번호 매긴 섹션, 앵커 id, 포인트 목록 분리)을 재현할 수 없습니다.
전환의 핵심 난제는 **마크다운을 이 구조로 되돌리는 규약**을 정하는 것입니다.

## 접근 방식 결정

| 방식 | 장점 | 단점 | 판단 |
| --- | --- | --- | --- |
| (a) 순수 `@next/mdx` | 표준, JSX 임베드 | 렌더 컴포넌트를 반환 → 구조 데이터 아님. 페이지 재작성 필요. 프론트매터 미지원 | ✗ |
| (b) 마크다운 + 빌드타임 파서 | 파일=문서, 구조 유지, 런타임 비용 0 | 파서 규약 필요, 잘못된 기여가 빌드를 깰 수 있음 | **채택** |
| (c) `.ts` 모듈 유지(현재) | 타입 안전, 무의존성 | 비개발자 진입장벽 | 유지(폴백) |

권장: **(b) 빌드타임 파싱**. 파사드 뒤에서 로더만 교체하므로 페이지는 무변경.

## 파일 규약(제안)

`src/content/articles/<slug>.md`:

```markdown
---
title: 추출의 기본: 농도와 수율
summary: 진한 커피와 많이 추출된 커피의 차이를 이해합니다.
category: 추출
level: 입문
readingTime: 8분
updatedAt: 2026. 07. 20.
accent: blue
fact: 농도는 잔 안의 진하기를, 수율은 얼마나 꺼냈는지를 나타냅니다.
related: [water-for-coffee, coffee-cherry-to-bean, cupping-basics]
tags: [추출, 수율, 레시피, 기초]
history:
  - { date: 2026. 07. 20., note: 초안 작성 }
---

## 농도와 수율은 서로 다른 값입니다 {#two-measures}

첫 문단…

두 번째 문단…

## 추출을 움직이는 주요 변수 {#variables}

문단…

- 분쇄도와 입자 분포
- 커피와 물의 비율
```

매핑 규약:

- **스칼라 필드**는 프론트매터 키로 1:1.
- **`sections`**: 본문의 각 `## 제목 {#id}`가 한 섹션. `{#id}`는 앵커 id
  (생략 시 제목을 slugify). 제목 아래 일반 문단들이 `paragraphs`, 섹션 말미의
  연속된 불릿 목록이 `points`.
- **`related`/`tags`**는 프론트매터 배열, **`history`**는 객체 배열.

## 로더 설계

- 위치: `src/content/loader.ts` (또는 기존 `articles/index.ts` 대체).
- 빌드타임에 `.md`를 읽어 프론트매터(경량 파서 또는 `gray-matter`)와 본문을
  파싱해 `Article[]`을 만든다. 파사드 `content.ts`는 이 배열을 그대로 re-export.
- 의존성: `gray-matter`(프론트매터). 본문 섹션 파싱은 구조가 단순하므로
  경량 정규식/라인 파서로 충분(무거운 remark AST 불필요). 도입 시 `package.json`
  devDependency로 추가하고 그 사실을 명시.

## 검증

`scripts/check-content.mjs`를 확장해 `.md`에도 동일 규약을 강제:

- 프론트매터 필수 키 존재, `category`/`accent`/`level` 유효값
- 각 문서에 최소 1개 `##` 섹션, `{#id}` 중복 없음
- `related` 슬러그 실재, 파일명==slug

## 단계별 이행

1. 로더 + 파서 작성, 문서 **한 편**만 `.md`로 전환(파일럿). 파사드 뒤라 페이지 무변경.
   렌더 결과가 기존과 동일한지 스냅샷 비교.
2. `check-content`를 `.md` 규약까지 확장.
3. 나머지 문서를 순차 전환(`.ts`와 `.md` 혼재 허용하도록 로더가 양쪽 처리).
4. `CONTRIBUTING.md`와 `npm run new-article`을 `.md` 생성으로 갱신.

## 리스크

- 규약을 벗어난 마크다운이 파싱 실패 → 빌드 실패로 드러나게(사일런트 금지).
- `points` vs `paragraphs` 구분이 저자에게 헷갈릴 수 있음 → 규약 문서화 + 파일럿에서 확인.
- 전환 중 데이터 손실 방지 → 파일럿 단계의 스냅샷 동등성 검증을 게이트로.
