# Bean Wiki — 백로그

> 목표: 초심자부터 전문가까지 함께 배우는 열린 커피 백과사전.
> 상태: ✅ 완료 · 🔨 진행 중 · ⬜ 대기
> 표기: [P1|P2|P3 = 우선순위] [S|M|L = 규모]

## Sprint 1 — 코어 경험 (✅ 완료, `3151878`)

- ✅ 홈: 히어로, 주제(6개 분야) 카드, 추천 문서, 학습 경로, 기여 안내
- ✅ 위키 문서 상세 페이지 (`/wiki/[slug]`) — 목차, 핵심 한 줄, 연관 문서
- ✅ 제목·요약·분야 기반 클라이언트 검색
- ✅ 시드 콘텐츠 6편 (기초·산지·로스팅·추출·센서리)
- ✅ 반응형 레이아웃, OG/메타데이터, 404 페이지

## Sprint 2 — 탐색 완성 (이번 작업)

- ✅ 전체 문서 목록 페이지 (`/wiki`) — 분야·난이도 필터
- ✅ 분야별 페이지 (`/topics/[slug]`) — 6개 분야 정적 생성
- ✅ 홈 연결 정리 — 주제 카드→분야 페이지, "모든 문서 보기"→`/wiki`, 학습 경로→난이도 필터
- ✅ 문서 수 하드코딩 제거 — 실제 데이터에서 집계
- ✅ 콘텐츠 커버리지 — 모든 분야에 최소 1편 (카페와 장비, 산지와 생두 보강)
- ✅ `sitemap.xml` / `robots.txt` 자동 생성
- ✅ 검색 ⌘K / Ctrl+K 단축키

## Sprint 3 — 콘텐츠·탐색 심화

- ✅ 문서를 파일 기반 콘텐츠로 분리 — `src/content/articles/*` 문서당 파일 하나, `src/lib/content.ts`는 공개 API 파사드 ([CONTRIBUTING.md](CONTRIBUTING.md))
- ✅ 용어집(`/glossary`)과 태그 페이지(`/tags/[tag]`)
- ✅ 문서 개정 이력 표시 및 기여 가이드 문서
- ✅ 다크 모드 — 시스템 설정 존중, 선택 저장, 플래시 방지 인라인 스크립트
- ✅ 검색 고도화 — 본문 검색, 일치 강조, 최근 검색 기록
- 🔨 Vercel 배포 및 도메인 연결 — 준비 완료([DEPLOY.md](DEPLOY.md)); 대화형 인증 후 배포

## Sprint 4 — 품질·신뢰 기반 (P1) — ✅ 완료

> 2026-07-21 전체 리뷰(6개 차원)에서 도출 → 같은 날 구현.

### 접근성·모바일
- ✅ [M] 모바일 내비게이션 — 햄버거 드로어(`MobileNav`)를 모든 헤더에, ≤980px에서 노출
- ✅ [M] 검색 결과 키보드 탐색 — ↑/↓·Enter·Esc + combobox/listbox ARIA
- ✅ [S] 포커스 인디케이터 — 링크·버튼·카드에 `:focus-visible` 아웃라인
- ✅ [S] 컬러 대비 WCAG AA — 하드코딩 회색 12개를 `var(--muted)`로 토큰화

### SEO·배포 안전성
- ✅ [S] 사이트맵 보완 — `/glossary`·태그 전체 포함, `lastModified`를 콘텐츠 날짜 기반으로 고정
- ✅ [M] OG 이미지·파비콘 — `opengraph-image.tsx`(site-wide), `icon.svg` 빈 파비콘
- ✅ [S] 사이트 오리진 상수화 — `src/lib/site.ts` `SITE_URL`(`NEXT_PUBLIC_SITE_URL` 오버라이드)
- ✅ [S] LICENSE + package.json 메타 — MIT(코드)/CC-BY-4.0(콘텐츠), 메타 필드 추가

### 콘텐츠
- ✅ [M] 로스팅 입문 문서 — `roasting-basics`
- ✅ [M] 용어집 확장 — 13 → 28개(6개 분야 각 3개 이상)
- ✅ [S] accent/icon 리터럴 유니언 타입

## Sprint 5 — 확장·자동화 (P2) — ✅ 완료

- ✅ [M] `npm run check-content` — 참조 무결성 검증, prebuild 게이트
- 🔨 [M] GitHub Actions CI — 워크플로 작성 완료([docs/ci-workflow.yml.example](docs/ci-workflow.yml.example)); `workflow` 스코프 토큰으로 `.github/workflows/ci.yml`에 복사 시 활성화
- ✅ [S] CONTRIBUTING.md 검증 범위 명확화 + 스캐폴딩 안내
- ✅ [M] canonical URL — 동적 페이지 `alternates.canonical`
- ✅ [L] JSON-LD — Article·BreadcrumbList(문서), DefinedTermSet(용어집)
- ✅ [M] RSS 피드 — `/feed.xml`
- ✅ [S] 개인정보 페이지 — `/privacy`
- ✅ [S] 추출 문서 실전 수치 — 수율 18–22%, TDS 1.15–1.45%
- ✅ [M] 커피 기초 신규 문서 — `bean-structure-compounds`
- ✅ [S] 다크 모드 잔여 정리 — search-suggestions 토큰화, 앵커 scroll-margin
- ✅ [S] BeanLogo 공유 컴포넌트 — `src/components/bean-logo.tsx`

## Sprint 6 — 심화 (P3) — 대부분 완료

- ✅ [L] 마크다운 전환 — `.md` 소스 + 빌드타임 코드젠(무손실 이행, [docs/MDX-MIGRATION.md](docs/MDX-MIGRATION.md))
- ✅ [M] 검색 고도화 — 초성 검색·모든 매칭 하이라이트·오타 허용(퍼지 폴백)
- ✅ [M] 문서 편집 워크플로 — 문서별 GitHub 편집 딥링크 + `npm run new-article` 스캐폴딩
- ✅ [M] 품종 콘텐츠 — `coffee-varieties` 문서 + 용어집 '품종'
- ✅ [S] 인쇄 스타일 — `@media print`
- ✅ [M] 공유 버튼 — X·LinkedIn·링크 복사
- ✅ [M] PWA — manifest(설치 가능) + 오프라인 서비스 워커([public/sw.js](public/sw.js))
- 🔨 [L] i18n — 설계 완료([docs/I18N.md](docs/I18N.md)); 이행 보류(대상 로케일·번역 콘텐츠 부재 → 지금은 과투자)
- ✅ [S] 접근성 마무리 — 브레드크럼 `aria-hidden`, 목차 터치 타겟, 앵커 오프셋

## 남은 항목 (다음 후보)

- ⬜ i18n 이행 — 영어 등 실제 대상 로케일이 정해지면 착수(설계는 완료; UI 문자열 추출부터). 현재는 콘텐츠·UI가 한국어뿐이라 라우팅/사전 인프라만 넣으면 반쪽 기능이 되어 보류.
- ⬜ CI 활성화 — [docs/ci-workflow.yml.example](docs/ci-workflow.yml.example)를 `workflow` 스코프 토큰으로 `.github/workflows/ci.yml`에 복사
