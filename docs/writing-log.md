# 글 작성 기록 (운영 로그)

## 2026-07-27

- 초보자 10편 배치 기준으로 1~10편 중 2~10편을 실사용형 구조로 재작성·보강했습니다.
  - 변경 대상(확장/보강): `arabica-and-robusta`, `coffee-varieties`, `coffee-processing`, `roasting-basics`, `grinder-basics`, `water-for-coffee`, `extraction-basics`, `espresso-basics`, `cupping-basics`
  - 보강 항목: 핵심 섹션 확장, 실습·오해·퀴즈·표·참고 자료, 체크리스트, 내부 링크 정렬
- `src/content/beginner-curriculum.ts`에서 해당 9개 항목 상태를 `집필 완료`로 갱신했습니다.
- 영어 보조 파일(`src/content/articles/en/*`)에서 구조 불일치 항목은 커널과 동일 구조로 정렬해 검증 게이트를 통과시켰습니다.
- 작성 검증 실행:
  - `npm run build:content`
  - `npm run check-content`
  - `npm run check:editorial`
- 다음 조치: `npm run publish:content:live -- --message "docs(content): publish beginner operations and sensory batch"`로 웹 동기화 예정.
