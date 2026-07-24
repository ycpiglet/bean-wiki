# Bean Wiki 디자인 시스템 (SSOT)

> 이 문서는 색·타이포·간격의 **단일 기준(SSOT)** 입니다. 새 스타일을 쓸 때는
> 하드코딩 대신 여기의 토큰을 참조하세요. 토큰은 모두 `src/app/globals.css`
> 상단 `:root`(라이트)와 `[data-theme="dark"]`(다크)에 정의됩니다.

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

## 3. 타입 스케일 (관례)

현재는 컴포넌트별 `px` 지정입니다. 대략의 스케일:

- 페이지 타이틀 `h1`: 40–52px, `letter-spacing: -.03em`
- 섹션 제목 `.article-content h2`: 29px, `-.04em`
- 본문 `p`: 16px / `line-height: 1.95` / `word-break: keep-all`(한글 줄바꿈)
- 목록 `li`: 14px / 1.7
- 라벨·번호(mono): 8–13px, 넓은 자간(`.02–.09em`)

> **한글 팁**: 본문에는 `word-break: keep-all`을 유지해 단어 중간에서 줄이
> 끊기지 않게 합니다. 큰 제목의 강한 음수 자간(`-.04em`)은 라틴 기준이라
> 한글에서 다소 조이게 보일 수 있으니, 한글 비중이 큰 화면은 눈으로 확인 후
> 필요하면 완화하세요.

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
- 파비콘/아이콘: `src/app/icon.svg`, `src/app/favicon.ico`.
- OG 이미지: `src/app/opengraph-image.tsx`(`next/og`로 동적 생성).
- 외부 폰트 파일은 저장소에 두지 않습니다(next/font가 빌드 시 자체 호스팅).
