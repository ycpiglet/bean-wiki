# Bean Wiki 배포 가이드

> 정적 Next.js 16 앱을 Vercel에 배포합니다. 모든 페이지가 정적으로 프리렌더되며
> (서버리스/엣지 함수 없음), 별도 빌드·플랫폼 설정 파일은 필요하지 않습니다.
> Vercel이 `nextjs` 프리셋을 자동 감지합니다.

## 사전 준비

- Vercel 계정과 팀 `bean-wiki`(org `team_egjq2g5lbAr46LZbjeu3AcvC`) 접근 권한
- `npm i -g vercel` 또는 `npx vercel`
- 이 저장소는 이미 연결되어 있습니다(`.vercel/project.json`,
  projectId `prj_rKTNOygzBEVLVIodL42KN5RuV1TR`). 새로 클론한 경우에만
  `vercel link`가 필요합니다. `.vercel/`은 `.gitignore`에 포함됩니다.

## 로컬 빌드 확인 (비대화형 · 배포 전 필수)

```bash
npm install
npm run build   # next build — 정적 프리렌더가 성공하는지 확인
```

## 배포 단계 (모두 대화형 인증 필요)

> 아래 명령은 브라우저/토큰 인증이 필요하여 자동화 환경에서는 실행할 수 없습니다.

```bash
vercel login              # 브라우저 인증
vercel link               # 새로 클론한 경우에만: 팀 + 기존 'bean-wiki' 프로젝트 선택
vercel                    # 프리뷰 배포
vercel deploy --prod      # 프로덕션 배포 (별칭: vercel --prod)
```

## 도메인 연결 (선택)

```bash
vercel domains add <도메인>
vercel alias set <배포-URL> <도메인>
```

명령이 출력하는 DNS 레코드(A/CNAME)를 도메인 등록기관에 설정합니다.

## 기본 도메인

프로덕션 기본 URL은 **https://bean-wiki.vercel.app** 이며, 아래 세 곳의 값과
일치합니다. 기본 도메인 배포에는 코드 변경이 필요 없습니다.

- `src/app/layout.tsx` — `metadataBase`
- `src/app/sitemap.ts` — `baseUrl`
- `src/app/robots.ts` — `baseUrl` + `sitemap`

## 커스텀 도메인 체크리스트

비-`vercel.app` 도메인을 연결하면 위 세 곳의 하드코딩된 origin을 **함께**
수정해야 OG 태그·사이트맵·robots가 일관됩니다. 권장: 셋을 공유 상수나
`NEXT_PUBLIC_SITE_URL` 환경 변수로 통합하세요.
