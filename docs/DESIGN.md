# Bean Wiki 디자인 시스템 (SSOT)

> 이 문서는 색·타이포·간격의 **단일 기준(SSOT)** 입니다. 새 스타일을 쓸 때는
> 하드코딩 대신 여기의 토큰을 참조하세요. 토큰은 모두 `src/app/globals.css`
> 상단 `:root`(라이트)와 `[data-theme="dark"]`(다크)에 정의됩니다.

## 0. 브랜드 컬러 — 커피 라이프사이클 팔레트

브랜드 정체성은 **커피의 여정**에서 옵니다: 체리(빨강) → 생두(초록) → 로스팅
갈변(갈색 스펙트럼) → 크레마/폼. **프라이머리 액센트 = 미디엄 로스트 브라운**
(`--brand` = `--roast-medium`). 시각 카탈로그: **`/design/colors`** 페이지.

| 토큰 | 라이트 | 다크 | 의미 |
|---|---|---|---|
| `--cherry` | `#a03d36` | `#cd7a6e` | 익은 커피 체리 |
| `--cherry-deep` | `#712a28` | `#a75950` | 완숙 체리 |
| `--green-bean` | `#7d8f69` | `#9db184` | 생두 |
| `--parchment` | `#e3d4b4` | `#d9c8a6` | 파치먼트 |
| `--honey` | `#c08a3e` | `#d9a95e` | 허니 프로세스 |
| `--roast-light` | `#a26a42` | `#c08a5c` | 라이트(시나몬, Agtron ~85) |
| `--roast-medium` | `#7c5233` | `#c89e6f` | 미디엄(시티, ~55) — **프라이머리** |
| `--roast-dark` | `#4e3524` | `#8d6844` | 다크(프렌치, ~35) |
| `--espresso` | `#2b1d13` | `#3a2a1c` | 다크 패널·아이콘 배경 |
| `--crema` | `#c99b5f` | `#d9b586` | 다크 패널 위 강조 |
| `--foam` | `#f6efe3` | `#efe6d6` | 가장 밝은 표면 |
| `--brand` / `--brand-strong` | roast-medium / dark | 밝힌 값 | UI 프라이머리/호버 |

- 로고·헤더 마크·링크·버튼·포커스 링 등 **사이트 수준 액센트는 `--brand`**.
  (과거 `--olive`가 그 역할이었으나, 올리브는 이제 "커피 기초" 분야 액센트로만.)
- `--forest`는 이름과 달리 현재 값이 **딥 에스프레소**(#26190f)입니다 — 다크
  패널 배경 용도(호환을 위해 토큰명 유지).
- Agtron 번호는 대략적 대응입니다. 절대 기준처럼 쓰지 마세요.

### 파생 틴트 규칙 (color-mix)

옅은 배경 틴트는 **파스텔 hex를 새로 만들지 말고** `color-mix`로 토큰에서
파생합니다 — 라이트/다크가 자동으로 맞춰집니다:

```css
/* 예: 콜아웃·노트·표 헤더·호버 배경 */
background: color-mix(in oklab, var(--copper) 9%, var(--paper));
```

- 관례 비율: 배경 틴트 6~10%, 선택 영역·마크 30~45%.
- 콜아웃/knowledge-note/표 헤더/태그·검색 호버가 이 방식입니다. 다크 전용
  배경 오버라이드를 추가하지 마세요(토큰이 이미 테마를 압니다).

### 상시 다크 패널 규칙

테마와 무관하게 **항상 어두워야 하는 패널**(학습 경로 강조 카드 등)은 테마
토큰을 쓰면 다크 모드에서 밝게 뒤집혀 흰 텍스트가 사라집니다. 이런 표면은
라이프사이클 **고정색**(espresso `#2b1d13`~roast-dark `#4e3524` 그라데이션)과
크레마 계열 텍스트(`#d3ac79`, `#f6efe3`)를 직접 사용하세요. 히어로 원과
피처드 카드의 로스팅 라디얼 그라데이션은 토큰 기반(테마 적응)입니다.
그래픽 선(오빗 링 등)은 잉크 고정 rgba 대신 `var(--line)`을 씁니다.

## 1. 색 토큰

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--paper` | `#f4f0e7` | `#14170f` | 페이지 배경 |
| `--paper-deep` | `#e8e1d4` | `#1b1f16` | 살짝 눌린 면(카드 등) |
| `--cream` | `#fbf8f1` | `#1e2318` | 입력·표면(에디터 등) |
| `--ink` | `#182019` | `#ece7da` | 기본 텍스트·제목 |
| `--muted` | `#62675f` | `#a0a394` | 보조 텍스트·라벨 |
| `--prose` | `#3f463f` | `#cfcabc` | 본문 문단 텍스트 |
| `--prose-soft` | `#454b45` | `#c4c0b3` | 목록 등 약한 본문 |
| `--line` | `rgba(24,32,25,.16)` | `rgba(236,231,218,.16)` | 구분선·테두리 |

### 분야 액센트 (6개, 카테고리 1:1)

| 토큰 | 분야 | 콜아웃 톤 |
|---|---|---|
| `--olive` | 커피 기초 | `callout-tip` |
| `--sage` | 산지와 생두 | — |
| `--copper` | 로스팅 | `callout-warn` |
| `--blue` | 추출 | `callout-note` |
| `--berry` | 센서리 | `callout-important` |
| `--sand` | 카페와 장비 | — |

액센트는 라이트/다크에서 각각 다른 값을 가집니다(다크에서 더 밝게). 카테고리와
액센트의 매핑은 `src/content/categories.ts`가 정본이며, `check-content`가
문서 `accent`와 분야 `accent`의 일치를 강제합니다.

> **규칙**: 본문/컴포넌트 CSS에서 회색·베이지 계열을 새 hex로 박지 말고 위
> 토큰을 쓰세요. 다크모드 대응이 자동으로 됩니다(토큰 하나만 오버라이드).

## 2. 폰트

| 토큰 | 값 | 용도 |
|---|---|---|
| `--font-sans` | `var(--font-geist-sans), var(--font-noto-kr), …` | 기본 UI·본문 |
| `--font-mono` | `var(--font-geist-mono), ui-monospace, …` | 라벨·번호·코드 |

- **로딩**: `src/app/layout.tsx`에서 `next/font/google`로 Geist / Geist Mono /
  Noto Sans KR을 로드하고 각각 `--font-geist-sans` · `--font-geist-mono` ·
  `--font-noto-kr` CSS 변수로 노출합니다(`<html>` className).
- **라틴/한글 전략**: Geist에는 한글 글리프가 없습니다. 스택에서 Geist를 먼저,
  Noto Sans KR을 그다음에 두어 브라우저가 **글자마다** 고릅니다 — 라틴(로고·숫자·
  영문)은 Geist, 한글은 Noto. Noto는 용량이 커서 `preload: false`로 논블로킹.
- ⚠️ **주의(과거 버그)**: CSS에서 `"Geist"` 같은 **리터럴 이름**을 쓰면 안 됩니다.
  next/font는 해시된 패밀리명을 만들고 오직 `var(--font-*)` 변수로만 노출하므로,
  리터럴 이름은 매칭되지 않아 시스템 폰트로 떨어집니다. 항상 변수를 참조하세요.

## 3. 타입 스케일

- 히어로 `h1`: `clamp(38px, 4.4vw, 56px)` / lh 1.18 / ls `-0.035em`
- 문서 타이틀 `.wiki-title h1`: `clamp(30px, 3.8vw, 44px)` / lh 1.22 / ls `-.03em`
- 섹션 헤딩 `.section-heading h2`: `clamp(26px, 2.6vw, 36px)` / ls `-.03em`
- 본문 섹션 제목 `.article-content h2`: 27px / ls `-.025em`
- 본문 `p`: 18px / lh 1.9 / `word-break: keep-all`
- 목록 `li`: 17px / 1.75 · 일반 UI: 16px · 문서 메타/태그: 14px
- 장식용 mono 라벨: **최소 12px** · 정보를 담은 라벨: **최소 13px**

### 한글 줄맞춤 규칙 (강제)

전역 규칙으로 모든 `h1–h4`에 적용됩니다:

```css
h1, h2, h3, h4 {
  word-break: keep-all;      /* 단어(어절) 중간에서 줄 안 끊음 */
  overflow-wrap: break-word; /* 예외적으로 긴 토큰만 줄바꿈 허용 */
  text-wrap: balance;        /* 여러 줄일 때 줄 길이 균형 → 한 글자 고아 방지 */
}
```

- "…들어 있을\n까" 같은 **한 글자 고아 줄**과 어절 중간 끊김을 막는 조합입니다.
- 큰 제목의 음수 자간은 라틴 기준 `-.05em`대에서 한글 가독 기준 `-.02~-.035em`로
  완화되어 있습니다. 새 제목 스타일도 이 범위를 지키세요.
- 라벨성 텍스트의 **최소 크기는 12px**(mono 캡션), 본문성 메타는 14px 이상.

## 4. 간격·레이아웃

- 컨테이너: `.shell` = `width: min(1180px, calc(100% - 48px))`, 가운데 정렬.
- 헤더 높이: 86px(`.site-header`, `.article-header`).
- 리치 블록(콜아웃·토글·표·figure)의 스타일은 `.article-content` 아래에 정의되어
  발행 문서와 에디터(`.editor-surface.article-content`)가 **같은 CSS**를 공유합니다.

## 5. 다크 모드

- `<html data-theme="light|dark">`. `layout.tsx`의 인라인 스크립트가 저장값 →
  시스템 설정 순으로 초기 테마를 정해 플래시를 막습니다(`ThemeToggle`이 토글).
- 규칙: 컴포넌트는 토큰만 쓰고, 다크 값은 `[data-theme="dark"]` **토큰 블록에서
  한 번**만 바꿉니다. 셀렉터마다 다크 오버라이드를 추가하지 마세요(프로즈 색을
  토큰화하며 그런 중복 오버라이드를 제거했습니다).

## 6. 에셋

- 로고/마크: `src/components/bean-logo.tsx`(`BeanMark`) — 인라인 SVG, `currentColor`.
  원두 몸통은 `--espresso`(진한 갈색) 채움 + `--crema` 센터 크리즈(가운데 갈라진
  선)입니다. 과거 폼(크림)색 채움은 원두가 아니라 빈 자리처럼 읽혀 교체했습니다.
  헤더의 작은 마크는 `--brand` 윤곽선만 사용합니다(`.bean-mark-small`).
- 파비콘/아이콘: `src/app/icon.svg`, `src/app/favicon.ico`.
- OG 이미지: `src/app/opengraph-image.tsx`(`next/og`로 동적 생성).
- 외부 폰트 파일은 저장소에 두지 않습니다(next/font가 빌드 시 자체 호스팅).
