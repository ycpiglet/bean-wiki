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
- 문서 제목과 요약 검색 (⌘K / Ctrl+K 단축키)
- 입문·중급·전문 학습 경로
- 정적 위키 문서와 연관 문서 연결
- 반응형 화면, 검색엔진 메타데이터, `sitemap.xml`·`robots.txt`

진행 상황과 다음 작업은 [BACKLOG.md](BACKLOG.md)에서 확인할 수 있습니다.

## 기술

Next.js App Router, React, TypeScript, Tailwind CSS를 사용합니다.
