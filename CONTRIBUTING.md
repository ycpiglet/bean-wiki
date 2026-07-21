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

### 무엇이 자동으로 검증되나요

- **`satisfies Article` (타입 체크)** — 필드 이름과 `level`·`accent`·`icon` 같은
  리터럴 유니언 값의 오타를 잡습니다. `npm run build`에서 실패합니다.
- **`npm run check-content`** — 타입 체크가 잡지 못하는 **참조 무결성**을 잡습니다:
  `related` 슬러그가 실제로 존재하는지, `category`가 `categories.ts`의 이름과
  정확히 일치하는지, `accent`가 분야 accent와 맞는지, 파일명이 slug와 같은지,
  용어집 `category`·`related`가 유효한지, 분야마다 문서가 하나 이상 있는지.
  `prebuild`로 연결되어 있어 `npm run build` 전에 자동 실행됩니다.

즉, `related`에 오타를 내면 타입 체크는 통과하지만 `check-content`가 막습니다.

## 문서 추가

가장 빠른 방법은 스캐폴딩입니다:

```bash
npm run new-article -- --slug my-article --category "추출" --accent blue
```

이 명령이 `src/content/articles/my-article.ts` 템플릿을 만들고
`index.ts`에 자동 등록합니다. 이후:

1. 생성된 파일의 필드(제목, 요약, 본문, `related`, `tags`, `history`)를 채웁니다.
2. `related`를 상호 연결하고, `accent`를 분야와 맞춥니다.
3. `npm run check-content`로 참조를 검증하고, `npm run dev`로 `/wiki/<slug>`를 확인합니다.

수동으로 추가할 때는 파일을 만든 뒤 `index.ts`에 import 한 줄과 배열 항목 한 줄을
직접 추가합니다(배열 순서가 목록·사이트맵 순서를 결정합니다).

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
