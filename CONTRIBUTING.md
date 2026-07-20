# Bean Wiki 기여 가이드

Bean Wiki는 함께 검토하고 발전시키는 열린 커피 백과사전입니다. 모든 서술은
근거를 갖추고, 이름이나 수치 하나로 단정하지 않는 태도를 지향합니다.

## 콘텐츠는 어디에 있나요

문서는 코드와 분리되어 **문서 하나당 파일 하나**로 관리됩니다.

```
src/content/
├─ types.ts               # Article · Category · GlossaryTerm 등 타입 정의
├─ categories.ts          # 6개 분야
├─ glossary.ts            # 용어집 항목
└─ articles/
   ├─ index.ts            # 문서 순서를 정하는 등록부
   ├─ coffee-cherry-to-bean.ts
   ├─ extraction-basics.ts
   └─ …                    # 문서마다 파일 하나
```

`src/lib/content.ts`는 이 데이터를 페이지에 제공하는 **공개 API(파사드)**입니다.
페이지는 모두 `@/lib/content`에서 가져다 쓰므로, 문서를 추가·수정할 때
`src/content/` 아래만 건드리면 됩니다.

## Article 필드

| 필드 | 의미 | 규칙 |
| --- | --- | --- |
| `slug` | URL 경로 | 영소문자-하이픈, 고유 |
| `title` / `summary` / `fact` | 제목 / 요약 / 핵심 한 줄 | 한국어 |
| `category` | 분야 이름 | `categories`의 `name`과 정확히 일치 |
| `level` | 난이도 | `입문` · `중급` · `전문` 중 하나 |
| `readingTime` | 읽는 시간 | 예: `"8분"` |
| `updatedAt` | 최근 수정 | `YYYY. MM. DD.` |
| `accent` | 색 토큰 | 해당 분야 `accent`와 일치 |
| `sections` | 본문 | `{ id, title, paragraphs[], points? }` |
| `related` | 연관 문서 | 유효한 slug만 |
| `tags` | 태그(선택) | 한국어, 다른 문서와 겹치도록 |
| `history` | 개정 이력(선택) | `{ date, note }[]`, 최신순 |

각 문서 파일은 `satisfies Article`로 검증되므로, 필드 이름이나 `level` 값에
오타가 있으면 `npm run build` 단계에서 바로 잡힙니다.

## 문서 추가

1. `src/content/articles/<slug>.ts` 파일을 만들고 기존 문서를 본떠 `Article`
   객체를 `satisfies Article`로 default export 합니다.
2. `history`에 최초 항목을 넣습니다:
   `history: [{ date: "2026. 07. 20.", note: "문서 최초 작성" }]`.
3. `src/content/articles/index.ts`에 import 한 줄과 배열 항목 한 줄을 추가합니다.
   (배열 순서가 목록·사이트맵 순서를 결정합니다.)
4. `related`를 상호 연결하고, `accent`를 분야와 맞춥니다.
5. `npm run dev`로 `/wiki/<slug>`를 확인합니다.

## 문서 수정

- 내용을 바꾸면 `updatedAt`을 갱신하고, `history` 맨 앞에 새 항목을 추가합니다
  (최신순). 두 날짜는 함께 맞춥니다.

## 용어집·태그

- 용어는 `src/content/glossary.ts`에 추가합니다. `category`는 분야 이름과
  정확히 일치해야 그룹에 표시됩니다.
- 태그는 다른 문서와 겹치도록 지으면 `/tags/<태그>` 페이지가 더 유용해집니다.

## 근거 기반 검토

- 사실 주장에는 근거를, 논쟁적 서술에는 조건을 답니다.
- 과대일반화와 단정 표현을 피합니다.

## PR 절차

1. 포크 후 브랜치를 만듭니다.
2. `npm run lint`와 `npm run build`를 통과시킵니다.
3. 커밋 후 PR을 올리고, 리뷰에서 근거를 함께 확인합니다.
