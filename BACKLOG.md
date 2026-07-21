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

## Sprint 4 — 품질·신뢰 기반 (P1)

> 2026-07-21 전체 리뷰(코드·UX/접근성·성능/SEO·콘텐츠·아키텍처·운영 6개 차원)에서 도출.

### 접근성·모바일 (실사용 차단급)
- ⬜ [P1·M] **모바일 내비게이션** — 980px 이하에서 헤더 nav가 `display:none`이라 홈 외 페이지에서 `/wiki`·`/glossary`로 갈 수 없음. 햄버거/드로어 구현. _완료 기준: 680px·980px 뷰포트에서 모든 주 메뉴 접근 가능_
- ⬜ [P1·M] **검색 결과 키보드 탐색** — ↑/↓로 결과 이동, Enter 선택, Esc 닫기, `aria-activedescendant` 반영. _완료 기준: 마우스 없이 검색→문서 이동 가능_
- ⬜ [P1·S] **포커스 인디케이터** — 필터 칩·카드·버튼·링크에 `:focus-visible` 아웃라인 추가 (현재 hover만 존재). _완료 기준: Tab 순회 시 항상 포커스 위치가 보임_
- ⬜ [P1·S] **컬러 대비 WCAG AA** — 하드코딩 회색(#8d9188, #858980, #898e86, #a4a8a1, #9a9f96 등)이 3–4:1로 미달. 토큰 기반으로 교체. _완료 기준: 라이트/다크 모두 본문·보조 텍스트 4.5:1 이상_

### SEO·배포 안전성
- ⬜ [P1·S] **사이트맵 보완** — `/glossary`와 태그 페이지 전체(`allTags()`) 누락 → 추가. `lastModified: new Date()`가 매 빌드 갱신되어 거짓 업데이트 신호 → 문서 `updatedAt` 기반으로 고정. _완료 기준: sitemap.xml에 글로서리+태그 포함, 빌드 반복 시 lastmod 불변_
- ⬜ [P1·M] **OG 이미지·파비콘 브랜딩** — og:image 부재로 소셜 공유 미리보기 없음, 파비콘은 create-next-app 기본값. 1200×630 OG 이미지와 빈(bean) 파비콘 제작. _완료 기준: 링크 공유 미리보기에 이미지 표시_
- ⬜ [P1·S] **사이트 오리진 상수화** — `https://bean-wiki.vercel.app`이 layout/sitemap/robots 3곳에 하드코딩. `NEXT_PUBLIC_SITE_URL` 또는 공유 상수로 통합. _완료 기준: 도메인 변경이 한 곳 수정으로 완결_
- ⬜ [P1·S] **LICENSE + package.json 메타** — "OPEN KNOWLEDGE" 표방하나 라이선스 없음. 콘텐츠 CC-BY-4.0 / 코드 MIT 등 선택해 LICENSE 추가, package.json에 description·license·repository 기입. _완료 기준: 저장소 루트에 LICENSE 존재_

### 콘텐츠 (커버리지 공백)
- ⬜ [P1·M] **로스팅 입문 문서** — 로스팅 분야에 입문 문서가 없음(중급 1편뿐). '원두 색상과 로스팅 정도'(라이트/미디엄/다크, 1차·2차 크랙) 신규 작성, roast-development와 상호 연결. _완료 기준: `/topics/roasting`에 입문 문서 노출_
- ⬜ [P1·M] **용어집 확장 (+15 용어)** — 13개로는 초보 검색 수요 미충족. 미분·바디·라떼아트·오버/언더추출·배전도·품종 등 추가, 분야 균형 맞춤. _완료 기준: 총 28개 이상, 6개 분야 각 3개 이상_
- ⬜ [P1·S] **accent/icon 리터럴 유니언 타입** — `accent: string` → `"olive"|"sage"|…` 유니언으로 오타를 컴파일 타임에 차단. _완료 기준: 잘못된 accent 입력 시 빌드 실패_

## Sprint 5 — 확장·자동화 (P2)

### 기여 워크플로
- ⬜ [P2·M] **콘텐츠 무결성 검증 스크립트** (`npm run check-content`) — related 슬러그 실재 여부, 카테고리 이름 일치, accent-분야 일치, 고아 용어 검출. 현재는 오타가 조용히 링크 누락으로 이어짐. prebuild 연결. _완료 기준: 위반 시 exit 1과 원인 메시지_
- ⬜ [P2·M] **GitHub Actions CI** — PR마다 lint+build 게이트. _완료 기준: 실패 PR 병합 차단_
- ⬜ [P2·S] **CONTRIBUTING.md 검증 범위 명확화** — `satisfies` 검증이 참조 무결성(related 슬러그, 카테고리명)은 못 잡는다는 사실 명시. check-content 안내 추가.

### SEO·구독
- ⬜ [P2·M] **canonical URL** — 동적 페이지(generateMetadata)에 `alternates.canonical` 추가.
- ⬜ [P2·L] **JSON-LD 구조화 데이터** — Article·BreadcrumbList(문서), DefinedTermSet(용어집). _완료 기준: Google Rich Results Test 통과_
- ⬜ [P2·M] **RSS/Atom 피드** — 새 문서 구독 수단 제공 (`/feed.xml`).
- ⬜ [P2·S] **개인정보/분석 정책 페이지** — localStorage(테마·최근 검색) 사용 명시, 분석 도구 도입 시 고지 기반 마련.

### 콘텐츠 개선
- ⬜ [P2·S] **추출 기본 문서에 실전 수치** — 수율 18–22%, TDS 1.15–1.45% 등 업계 통용 범위를 조건부 서술로 추가.
- ⬜ [P2·M] **커피 기초 신규 문서** — '원두의 구조와 향미 성분' (입문): 분야 깊이 보강, 로스팅·추출 문서의 기초 역할.
- ⬜ [P2·S] **다크 모드 잔여 정리** — `.search-suggestions` 하드코딩 색상 토큰화, 용어집 앵커 `scroll-margin` 모바일 보정.
- ⬜ [P2·S] **BeanLogo 공유 컴포넌트화** — 동일 SVG가 6개 파일에 중복. `src/components/bean-logo.tsx`로 추출.

## Sprint 6 — 이후 (P3)

- ⬜ [P3·L] **마크다운/MDX 전환 설계·이행** — 필드↔frontmatter 매핑 설계 문서 먼저, 파사드 뒤에서 교체 (비개발자 기여 대비)
- ⬜ [P3·M] **검색 인덱스 고도화** — 초성 검색, 오타 허용, 모든 매칭 하이라이트
- ⬜ [P3·M] **문서 편집 제안 워크플로** — 문서별 "GitHub에서 편집" 딥링크, `npm run new-article` 스캐폴딩
- ⬜ [P3·M] **품종(Varietal) 콘텐츠** — 종 vs 품종 구분 문서 또는 용어 추가 (Bourbon, Typica, Geisha)
- ⬜ [P3·S] **인쇄 스타일** — `@media print`: 내비 숨김, 배경 제거
- ⬜ [P3·M] **공유 버튼** — Twitter·LinkedIn·카카오톡
- ⬜ [P3·M] **PWA 기본** — manifest + 오프라인 캐시 (정적 사이트라 적합)
- ⬜ [P3·L] **i18n 경로 설계** — 영문 확장 대비 콘텐츠 구조 검토
- ⬜ [P3·S] **접근성 마무리** — 브레드크럼 구분자 `aria-hidden`, 목차 터치 타겟 44px, 검색 제안 시맨틱 그룹화
