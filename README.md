# Bean Wiki

초심자부터 바리스타, 로스터, Q 그레이더까지 함께 만들고 배우는 열린 커피 백과사전입니다.

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인할 수 있습니다.

## 현재 구성

- 커피 지식 6개 분야별 탐색 (`/topics/[slug]`)
- 전체 문서 목록과 분야·난이도 필터 (`/wiki`)
- 커피 용어집 (`/glossary`)과 태그별 문서 모음 (`/tags/[tag]`)
- 본문까지 검색하고 결과를 강조하는 검색 (⌘K / Ctrl+K, 최근 검색 기록)
- 입문·중급·전문 학습 경로
- 정적 위키 문서, 연관 문서 연결, 문서별 개정 이력
- 라이트·다크 모드 (시스템 설정 존중, 선택 저장)
- 반응형 화면, 검색엔진 메타데이터, `sitemap.xml`·`robots.txt`

문서는 코드와 분리되어 `src/content/`에 문서당 파일 하나로 관리됩니다.
진행 상황과 다음 작업은 [BACKLOG.md](BACKLOG.md)에서 확인할 수 있습니다.

## 기술

Next.js App Router, React, TypeScript, Tailwind CSS를 사용합니다.

## 기여

문서를 추가하거나 고치는 방법은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 배포

Vercel에 배포합니다. 명령과 도메인 연결 절차는 [DEPLOY.md](DEPLOY.md)에 있습니다.
