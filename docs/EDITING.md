# 브라우저 편집 설정 (Sprint 7)

> 상태: 구현 완료(코드). 실제 게시 활성화에는 **사용자만 제공 가능한 자격증명**이
> 필요합니다 — CI와 동일한 차단 상태입니다. 자격증명이 없으면 에디터는
> **미리보기 모드**로 안전하게 동작하고, 사이트 읽기 경험에는 아무 영향이 없습니다.

## 무엇이 만들어졌나

- **정본 콘텐츠 = HTML.** 문서 소스는 `src/content/articles/*.html`(프론트매터 +
  정제 HTML 본문). 마크다운 파이프라인은 제거됐고, 직렬화는
  `src/lib/content-serialize.mjs`가 빌드·검증·저장 API에서 공유합니다.
- **인앱 에디터** `/edit/[slug]` (TipTap): 제목/요약, 툴바(제목2·3, 굵게/기울임/
  취소선, 목록, 인용, **링크 피커**, **이미지**), localStorage 초안 자동저장,
  편집 요약, 초안 토글.
- **저장 = GitHub 커밋 → Vercel 재배포.** 정제→검증→직렬화→커밋. 편집 시작 시점의
  파일 SHA로 **충돌 감지**, 새 문서 생성(+`order.json` 등록) 지원.
- **위키링크·붉은 링크·역링크**, **이미지**(Wikimedia/Unsplash 검색 + 업로드,
  출처·라이선스 표기), **이름 변경 리다이렉트**, **문서 역사/복원**, **초안**,
  **ko/en 구조 동기화 알림**.

## 게시 활성화에 필요한 것 (사용자 작업)

### 1. GitHub OAuth 앱

<https://github.com/settings/developers> → **New OAuth App**

- Homepage URL: `https://bean-wiki.vercel.app`
- Authorization callback URL: `https://bean-wiki.vercel.app/api/auth/github/callback`
  (로컬 테스트는 `http://localhost:3000/api/auth/github/callback`를 별도 앱으로)

Client ID와 새로 만든 Client secret을 환경변수로 넣습니다.

### 2. 환경변수 (Vercel Project Settings → Environment Variables)

| 변수 | 필수 | 용도 |
| --- | --- | --- |
| `AUTH_SECRET` | ✅ | 세션 쿠키(AES-256-GCM) 암호화 키. 임의의 긴 문자열(`openssl rand -hex 32`) |
| `GITHUB_OAUTH_CLIENT_ID` | ✅ | OAuth 앱 Client ID |
| `GITHUB_OAUTH_CLIENT_SECRET` | ✅ | OAuth 앱 Client secret |
| `GITHUB_ALLOWED_LOGINS` | 권장 | 편집 허용 GitHub 로그인(쉼표 구분). 미설정 시 인증된 누구나 로그인 가능하되, 커밋은 저장소 push 권한이 있어야 성공 |
| `GITHUB_REPO` | 선택 | 기본 `ycpiglet/bean-wiki` |
| `GITHUB_BRANCH` | 선택 | 기본 `main` |
| `AUTH_ORIGIN` | 선택 | 프록시 환경에서 OAuth redirect_uri 오리진 고정용 |
| `GITHUB_CONTENT_TOKEN` | 선택 | OAuth 대신(또는 폴백) 서버 신원으로 커밋할 fine-grained PAT(`contents:write`) |
| `UNSPLASH_ACCESS_KEY` | 선택 | Unsplash 이미지 검색. 미설정 시 Wikimedia Commons만 동작 |

커밋 토큰 우선순위: **로그인 사용자의 OAuth 토큰** → 없으면 `GITHUB_CONTENT_TOKEN`.
둘 다 없으면 편집은 미리보기 전용입니다.

### 3. 커밋 권한

커밋은 로그인 사용자의 토큰으로 이뤄지므로(편집 이력이 실제 GitHub 사용자에
귀속), 그 사용자가 저장소에 **push 권한**을 가져야 합니다. 공개 저장소이므로
OAuth 스코프는 기본 `public_repo read:user`(`GITHUB_OAUTH_SCOPE`로 변경 가능).

## 동작 방식 (아키텍처)

```
[문서 페이지] --[편집]--> /edit/[slug] (TipTap)
     │  로그인: /api/auth/github → GitHub → /callback (암호화 세션 쿠키)
     ▼  게시(편집 요약 + baseSha)
[POST /api/articles/[slug]]
     정제(HTML 새니타이즈) → 검증(카테고리·accent·related) → 직렬화
     → 충돌 감지(baseSha) → GitHub Contents API 커밋
[GitHub main] → Vercel 자동 빌드(~1–2분) → 라이브 반영
     ▲ 문서 역사 = git 커밋 (역사/복원 UI가 GitHub API로 읽기/역커밋)
```

- **이미지**: 업로드는 `public/uploads/<slug>/`에 커밋(별도 서비스 없이 동일 토큰).
  검색 삽입은 Wikimedia Commons(무자격증명) + Unsplash(키 필요), figure에 출처·
  작가·라이선스 저장·표기.
- **이름 변경**: `redirects.json`에 301 기록 + 참조(related·위키링크) 갱신을 Git
  Data API로 **단일 원자 커밋** 처리(`next.config.ts`가 301 방출).
- **초안**: 프론트매터 `draft: true` → 목록·검색·사이트맵·RSS 제외, 문서 페이지는
  noindex 배지 렌더.

## 관련 코드

- 직렬화·정제: `src/lib/content-serialize.mjs`
- 세션: `src/lib/session.ts` · GitHub: `src/lib/github.ts` · OAuth: `src/lib/oauth.ts`
- 저장/검증: `src/lib/editing.ts`, `src/app/api/articles/[slug]/*`
- 인증: `src/app/api/auth/*` · 이미지: `src/app/api/images/*`
- 에디터: `src/components/article-editor.tsx` · 역사: `src/components/article-history.tsx`
