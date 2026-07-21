# Bean Wiki 기여 가이드

Bean Wiki는 함께 검토하고 발전시키는 열린 커피 백과사전입니다. 모든 서술은
근거를 갖추고, 이름이나 수치 하나로 단정하지 않는 태도를 지향합니다.

## 콘텐츠는 어디에 있나요

문서는 코드와 분리되어 **마크다운 파일**로 관리됩니다(문서 하나당 `.md` 하나).

```
src/content/
├─ types.ts               # Article · Category · GlossaryTerm 등 타입 정의
├─ categories.ts          # 6개 분야
├─ glossary.ts            # 용어집 항목
└─ articles/
   ├─ order.json          # 문서 노출 순서(슬러그 목록)
   ├─ index.ts            # ⚙️ .md에서 생성됨 — 직접 편집 금지
   ├─ coffee-cherry-to-bean.md
   ├─ extraction-basics.md
   └─ …                    # 문서마다 .md 하나
```

각 `.md`는 프론트매터(제목·분야·태그 등)와 본문(`## 제목 {#id}` 섹션)으로
이루어집니다. `npm run build:content`(개발·빌드 시 자동 실행)가 `.md`를 읽어
타입이 붙은 `index.ts`를 생성하고, `src/lib/content.ts` 파사드가 이를 페이지에
공급합니다. 즉 **`.md`와 `order.json`만 편집**하면 됩니다(`index.ts`는 생성물).

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

- **타입 체크** — 생성된 `index.ts`가 `Article[]` 타입으로 검사되어, 필드 이름과
  `level`·`accent` 같은 리터럴 유니언 값의 오타를 잡습니다. `npm run build`에서 실패합니다.
- **`npm run check-content`** — 타입 체크가 잡지 못하는 **참조 무결성**을 잡습니다:
  `related` 슬러그가 실제로 존재하는지, `category`가 `categories.ts`의 이름과
  정확히 일치하는지, `accent`가 분야 accent와 맞는지, 파일명이 slug와 같은지,
  `order.json`이 `.md`와 일치하는지, 용어집 `category`·`related`가 유효한지,
  분야마다 문서가 하나 이상 있는지. `prebuild`에 연결되어 `npm run build` 전에
  자동 실행됩니다.

즉, `related`에 오타를 내면 타입 체크는 통과하지만 `check-content`가 막습니다.

## 문서 추가

가장 빠른 방법은 스캐폴딩입니다:

```bash
npm run new-article -- --slug my-article --category "추출" --accent blue
```

이 명령이 `src/content/articles/my-article.md` 템플릿을 만들고
`order.json`에 등록합니다. 이후:

1. `.md`의 프론트매터와 본문(`## 제목 {#id}` 섹션)을 채웁니다.
2. `related`를 상호 연결하고, `accent`를 분야와 맞춥니다.
3. `npm run dev`(또는 `npm run build:content`)로 `index.ts`를 재생성하고,
   `npm run check-content`로 참조를 검증한 뒤 `/wiki/<slug>`를 확인합니다.

수동으로 추가할 때는 `.md` 파일을 만들고 `order.json`에 슬러그를 추가하면 됩니다
(`order.json` 순서가 목록·사이트맵 순서를 결정합니다).

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
