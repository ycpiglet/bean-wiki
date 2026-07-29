# 글 작성 기록 (운영 로그)

## 2026-07-28

- 7/28 운영 점검:
  - 게이트 실행: `npm run build:content`, `npm run check-content`, `npm run check:editorial`.
  - 결과: `build:content` 151/151 생성, `check-content` 레퍼런스/슬러그/구조 정합성 통과, `check:editorial` 초보자 배치 게이트 통과.
  - 상태: 파생 문서·슬러그 연동은 유지되며, 다음 배치로 바로 연결 가능한 상태.

- 7/28 정합성 후속 보강(메타 동기화):
  - 기존 수정 문서의 상태 정합성 정리를 위해 아래 14개 문서의 `updatedAt`를 `2026. 07. 28.`로 갱신하고 `history`에 `2026. 07. 28.` 항목을 추가했습니다.
  - 대상 문서:
    - `bean-structure-compounds`(KO/EN), `coffee-ritual-map`, `coffee-trade-history`, `coffee-varieties`, `coffeehouse-culture`, `cupping-basics`, `extraction-basics`, `global-coffee-history`, `global-coffee-zones`, `home-brew-recipes`, `roast-profile-design`, `roaster-machine-types-comparison`, `roasting-basics`.
  - 반영 항목: `updatedAt` 갱신, `history`에 `정합성 보강: updatedAt 및 history 동기화, 문서 상태 정렬` 항목 추가.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-03 보강(`coffee-tipica-bourbon-lineage`)
  - 계통 비교 오차를 줄이기 위해 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가하고 문서 이력을 갱신했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-03 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-04 보강(`ethiopian-heirloom-diversity`)
  - 에티오피아 재래종 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 오해 분해와 운영 전달력을 강화했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-04 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-05 보강(`catimor-sarchimor-blight-resistance`)
  - `catimor-sarchimor-blight-resistance`에 교대 인수인계 체크리스트를 추가해 현장 전달 규칙을 보강했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-05 보강: 교대 인수인계 체크리스트 추가로 운영 전달 규칙 고정`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-02 보강(`coffee-variety-cultivar-hybrid`)
  - 용어 층위 혼선 문서를 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트와 자기 점검으로 보강했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-02 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-01 보강(`arabica-canephora-liberica-comparison`)
  - 3종 비교 문서를 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트로 보강해 종 비교의 전달 규칙을 확정했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-01 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-06 보강(`f1-hybrid-coffee-breeding`)
  - F1 하이브리드 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 세대 기반 오판을 줄였습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-06 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-09 보강(`coffee-propagation-methods`)
  - 번식법 문서를 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트로 보강해 운영 선택 오차를 줄였습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-09 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-10 보강(`coffee-variety-authenticity-traceability`)
  - 품종 진위·추적 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 계약·검수 전달력을 강화했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-10 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-08 보강(`coffee-breeding-reality-cycle`)
  - 육종 출시 파이프라인 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 선발·시험·출하 판단의 전달 규칙을 고정했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-08 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- GEN-07 보강(`canephora-clones-and-selections`)
  - 카네포라 클론·집단 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 용어 정합성과 실험 전달 규칙을 보강했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목(`GEN-07 보강: 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트 추가`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- EXT-08 보강(`brew-control-chart-and-sensory`)
  - 브루 컨트롤 차트 문서에서 실패 지도(수치-관능 불일치/원두 변경 적응/샘플링 편향)와 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 오차 분해·운영 전달력을 강화.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
  - `npm run check:editorial` (성공)

- CAF-08·HLT-10·SEN-01·굴절계 보강(`machine-cleaning-water-hygiene`, `very-hot-beverage-and-food-safety`, `sca-cupping-workflow`, `refractometer-measurement-uncertainty`)
  - `machine-cleaning-water-hygiene`: 오염/세정 루틴 문서에 실패 지도와 교대 인수인계 체크리스트 섹션을 추가해 교대 손실 지점과 대응 순서를 고정했습니다.
  - `very-hot-beverage-and-food-safety`: 매우 뜨거운 음료 운영 문서에 실패 지도와 교대 인수인계 체크리스트를 추가해 열·알레르겐·세척 리스크를 교대 라운드로 분리했습니다.
  - `sca-cupping-workflow`: SEN-01 커핑 워크플로 문서에 실패 지도, 교대 인수인계 체크리스트를 추가해 감각 로그의 반복 실무 전이 기준을 보강했습니다.
  - `refractometer-measurement-uncertainty`: 교대 인수인계 체크리스트 헤더 문구를 `교대 인수인계 체크리스트`로 정규화했습니다.
  - 각 문서에 `history` 보강 이력(`2026. 07. 28.`) 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- EXT-10 보강(`post-roast-gas-and-freshness`)
  - 로스팅 후 가스·신선도 문서에 실패 지도, 2주 정렬 루프, 인수인계 체크리스트를 추가해 운영 보존 규칙(포장/개봉/해동) 분해를 강화.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- BRW-10 보강(`recipe-comparison-experimental-design`)
  - 비교 실험에서 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 오차 분해·운영 전달력을 강화.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- BRW-09 보강(`cold-brew-chemistry-safety-storage`)
  - 콜드브루 추출·희석·보관 분해 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 단계별 오차 전달력을 강화.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- BRW-08 보강(`turkish-chezve-control`)
  - BRW-08 터키 커피 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 미분·거품·침전 오차 분해를 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)
    - `npm run lint` (현재 `.next` 산출물 스크립트에서 기존 ESLint 이슈(기존 다수 규칙 위반) 노출로 실패)

- BRW-05 보강(`aeropress-variable-map`)
  - 4축 변수 지도 문서에 실패 지도(가압/필터/모드/채점 문구 변동), 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 실행 재현성 전달을 강화.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- BRW-04 보강(`clever-switch-hybrid-brewing`)
  - BRW-04 하이브리드 추출 문서에 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 구간별 오차 분해와 교대 전달 규칙을 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)
    - `npm run lint` (현재 `.next` 산출물 스크립트에서 기존 ESLint 이슈(기존 다수 규칙 위반) 노출로 실패)

- EXT-09 보강(`dialing-in-experimental-design`)
  - 실패 지도와 운영 실패 우선순위 분해, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 실험 설계-운영 연결을 강화.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- 굴절계 실무 보강(`refractometer-measurement-uncertainty`)
  - 오차 분해 이후 실패 지도(채취 편차/보정 편차/해석 편차)를 추가하고, 2주 정렬 루프 및 교대 인수인계 체크리스트를 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- CAF-01 보강(`espresso-dialing-protocol`)
  - 다이얼인 실패 지도(유량 편차/온도 불안정/끝맛 거칠음/로그 흔들림), 2주 운영 루프, 인수인계형 체크리스트를 추가해 재현성 판단 루틴을 강화.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- HLT-05 보강(`cafestol-kahweol-and-filtering`)
  - 성분 프레임 오판 4가지를 분해한 실패 지도, 위험 신호-오해-재검증 분기 정렬, `교대 인수인계 체크리스트(HLT-05)`를 추가해 중급 운영 전달력을 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- HLT-03 보강(`decaffeination-processes`)
  - 디카페인 공정 문서에 실패 지도(공정명 고정 오해/라벨 오판/의학 신호 미분리/기준선 부재), 2주 정렬 분해 경로, 교대 인수인계 체크리스트를 추가해 공정 비교 오차 전달 규칙을 강화했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- HLT-09 보강(`gastrointestinal-reflux-low-acidity-coffee`)
  - 위장관·역류 문서에 실패 지도(원인 단순화/루틴 고정/저산도 라벨 오해/의학 신호 지연), 오차 전이 정렬 포인트, 교대 인수인계 체크리스트를 추가해 운영 전달력을 보강했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- BRW-07 보강(`siphon-thermodynamics-control`)
  - 4축 변수 지도 기반의 실패 지도(과열/하강 지연/클램프 편차)와 2주 정렬 루프를 추가해 원인 분해 체계를 강화.
  - 조기 경보/안전 체크리스트(불/밀봉/열충격·회수 저항) 항목을 삽입해 운영 루틴 전환 시 오차 전이 억제 규칙을 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 추가.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- SEN-07~10 연속 보강(`sensory-descriptive-cata-affective`, `sensory-data-reliability`, `sensory-expert-vs-consumer-preference`, `sensory-lab-design`)
  - `sensory-descriptive-cata-affective`: 실패 지도(방법 혼재 오판), 2주 정렬 루프, 축별 용어 정렬, `참고 자료` 확장 및 보강 이력 추가.
  - `sensory-data-reliability`: 통계 통과 후 재현성 실패 패턴 지도, 2주 정비 루프, 신뢰도 용어 정렬 및 참고 링크 보강, 이력 업데이트.
  - `sensory-expert-vs-consumer-preference`: 충돌 패턴의 실패 지도, 2주 분기 루프, 축별 용어 정렬을 추가해 품질/선호 의사결정 분리를 강화.
  - `sensory-lab-design`: 랩 운영 오차 실패 지도, 2주 정비 루프, 용어 정렬 체크리스트 확장 및 관련 링크 추가, 이력 업데이트.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- SEN-03/04 연속 보강(`taste-smell-touch-sensory-mapping`, `taste-threshold-adaptation-fatigue`)
  - `taste-smell-touch-sensory-mapping`: 오해 지도/2주 분해 루프/축별 용어 정렬을 재점검하고, SEN-04·센서리 랩 설계 문서와 교차 참조를 보강.
  - `taste-threshold-adaptation-fatigue`: 실패 지도(역치·순응·피로·온도), 2주 정비 루프, 채널별 용어 정렬 표를 추가하고, 기존 판정 템플릿을 운영 규칙 중심으로 정렬.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- SEN-03~10 및 BRW-07 보강(`sensory-data-reliability`, `sensory-defect-origin-mapping`, `sensory-descriptive-cata-affective`, `sensory-expert-vs-consumer-preference`, `sensory-lab-design`, `sensory-panel-calibration-triangle`, `siphon-thermodynamics-control`, `taste-threshold-adaptation-fatigue`, `taste-smell-touch-sensory-mapping`)
  - `SEN`군·`BRW-07` 문서 9건에 대해 `교대 인수인계 체크리스트`를 모두 추가해 교대 전달 실패지점을 줄였고, `SEN-03`은 `오해·오염 패턴 지도`를 `실패 지도` 용어로 정규화했습니다.
  - 각 문서 `history`에 `2026. 07. 28.` 보강 항목(인수인계 체크리스트/용어 정규화) 추가.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)

- 중간 배치(로스팅·추출 심화): `roast-development`, `en/roast-development`, `roast-development-signals`, `water-chemistry-basics`
  - `roast-development`: 운영 중심으로 단계형 구조(정의→타임라인→신호→의사결정→리스크맵→실습→퀴즈→참고자료)로 확장, frontmatter `updatedAt: 2026. 07. 28.`, `related` 4개/`tags` 4개 반영.
  - `en/roast-development`: KO 확장본과 앵커 정렬 유지하여 동일 섹션 구조로 보강.
  - `roast-development-signals`: 실무형 신호 지도, 보정 루프, 위험 지도, 오해 정리, 실습, 용어 사전, 자기 점검(5문항) 섹션 추가.
  - `water-chemistry-basics`: 출발점 프레임, 조정 루프, 오해/실습/연결·참고자료, 자기 점검 추가로 중급 분량 확장.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 장비/추출 실행성 보강: `grinder-burr-profile`, `espresso-machines-grinders`, `brew-ratio-practice`
  - 각 문서를 분쇄 분포 판독, 장비 구매·운영 체크리스트, 비율 실험 루틴, 실패 지도 중심으로 중급 실무형 구조로 보강.
  - `updatedAt` 갱신 및 `history`에 `2026. 07. 28.` 항목 추가 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 추출/우유 실무 문서 보강(중급): `brew-profile-observables`, `milk-steaming`, `milk-microfoam-checklist`
  - `brew-profile-observables`: 관측값층 분해, 방식별 우선 관측 항목, 오차 지도, 2주 실습 루프를 추가해 운영 기록성을 강화.
  - `milk-steaming`: 주입·회전·마무리 단계와 온도 운영, 실패 지도, 시프트 루틴, 셀프 점검으로 중급 실무 프레임 보강.
  - `milk-microfoam-checklist`: 오픈 점검표, 제조 루틴 4단, 실패 지도, 2주 교육 루프, 재료별 체크 포인트를 추가.
  - 각 문서 `updatedAt` 갱신 및 `history`에 `2026. 07. 28.` 이력 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 센서리·산지 중급 문서 확장: `q-grader-certification`, `sca-cupping-protocol`, `catimor-sarchimor-blight-resistance`
  - `q-grader-certification`: 점검 프레임, 2주 실무 루틴, 실패 패턴 지도, 자기 점검 추가.
  - `sca-cupping-protocol`: 운영 루틴, 점수 오해 지도, 실패 시나리오, 2주 실험 루프 보강.
  - `catimor-sarchimor-blight-resistance`: 운영 체크리스트, 오해·실수 지도, 2주 루틴, 의사결정 키워드 보강.
  - 각 문서 `updatedAt: 2026. 07. 28.` 갱신 및 `history`에 2026-07-28 항목 추가 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 센서리/장비 미기록 정합성 보강: `espresso-machines-grinders`, `q-grader-certification`, `sca-cupping-protocol`, `sensory-data-analysis`, `sensory-defect-diagnosis`
  - 5건 모두 `frontmatter`(updatedAt/related/tags/level/history) 및 내용 구성(정의·핵심 기준·오해 정리·실습 또는 적용 단계)을 리뷰 기준(Writer/Domain Persona/Interviewer)으로 확인 후 미기록 정합성만 처리.
  - `docs/writing-log.md`에 선행 로그 등록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 카페 운영 중급 문서 연속 보강: `sensory-defect-diagnosis`, `cafe-quality-system`, `cafe-shift-operations`
  - `sensory-defect-diagnosis`: `우선순위 룰`, `실패 지도`, `2주 정합성 루프`와 문헌-실험 연계 프레임 추가.
  - `cafe-quality-system`: `실패 패턴 지도`, `2주 품질 루프`, `자기 점검` 섹션으로 운영형 정합성 강화.
  - `cafe-shift-operations`: 인수인계 표준 템플릿, `실패 지도`, `2주 교대 정합 루프`를 추가해 교대 손실을 줄이는 기준 고정.
  - 각 문서 `updatedAt` 갱신 및 `history`에 `2026. 07. 28.` 항목 추가 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 센서리 언어기반 문서 보강(`sensory-brewing-grammar`)
  - `감각 언어 4단 프레임`, 오해 지도, 2주 반복 실습 루프, 기록 템플릿, 참고자료 섹션을 추가해 초안 길이 대비 적용 가이드를 강화.
  - `history`에 보강 이력 추가(`2026. 07. 28.`).
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 센서리 문법 후속 보강(`sensory-brewing-grammar`)
  - 관능 언어 판단이 흔들리는 상황을 정리한 `실패 지도`, 교대 인수인계 체크리스트, `자기 점검` 항목을 추가해 운영 전달력을 보강했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목을 `센서리 언어 운영 문서에 실패 지도·교대 인수인계 체크리스트·자기 점검을 추가해 실무 전달력 보강`으로 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check-editorial` (성공, 블로킹 없음)

- HLT-01 후속 보강(`caffeine-and-health`)
  - 카페인 운영 규칙의 오차가 반복되지 않도록 `실패 지도(총량-시간대-고위험군)`, `2주 정렬 루프`, `교대 인수인계 체크리스트`를 추가해 판단 기준을 고정했습니다.
  - `history`에 `2026. 07. 28.` 보강 항목 반영:
    - `HLT-01 보강: 실패 지도(총량-시간대-고위험군), 2주 정렬 루프, 교대 인수인계 체크리스트 추가`
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check-editorial` (성공, 블로킹 없음)

- 카페 일일 루틴 보강(`daily-cafe-routine`)
  - 오픈/운영/마감 구간의 판단 기준, 오해 정리, 체크리스트 템플릿, 2주 실습 루프, 자기 점검 질문을 추가해 실무 적용성을 보강.
  - `history`에 보강 이력 추가(`2026. 07. 28.`).
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- 에스프레소 프리인퓨전 보강(`espresso-preinfusion-guide`)
  - 실패 신호 분기, 2주 실험 루프, 시작 5분 점검표, 참고자료를 추가해 적용 가이드를 정교화.
  - `history`에 보강 이력 추가(`2026. 07. 28.`).
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- HLT/EXT 연속 보강: `very-hot-beverage-and-food-safety`, `caffeine-pregnancy-lactation-youth`, `post-roast-gas-and-freshness`
  - `very-hot-beverage-and-food-safety`: 임상 응급 분기 콜아웃 추가, 식품안전 링크 정합성 보완.
  - `caffeine-pregnancy-lactation-youth`: 의료 연계 기준 요약 섹션 추가, 임상 경고·보수 규칙 정밀화.
  - `post-roast-gas-and-freshness`: 판단 임계치 섹션 추가 및 오해 정리 문구 정돈.
  - 게이트 재실행:
    - `npm run build:content` (성공)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)
- HLT-08 보강(`caffeine-pregnancy-lactation-youth`)
  - 건강군 대상 문서에 실패 지도(누락 변수/반복 역전/군 간 이식/임상 연계 기준)와 교대 인수인계 체크리스트를 추가해 2주 이전 판단 전이를 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 추가 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- HLT-04 보강(클로로겐산): `chlorogenic-acids-roasting-health`
  - `chlorogenic-acids-roasting-health`: 임계 신호 분기(의학 경고), 근거 번역 규칙, 4주 루프 보강, 비교 매트릭스 및 오해 확장으로 실무 판단 문장 정렬 강화.
  - `chlorogenic-acids-roasting-health` 추가 보강: 실패 지도(로스팅·측정·해석·임상 분기)와 교대 인수인계 체크리스트를 삽입해 오차 전이 대응을 강화.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)
- HLT-06 보강(아크릴아마이드·퓨란): `acrylamide-and-furans`
  - `acrylamide-and-furans`: 의학적 경고 분기, 근거 번역 규칙, 비교 매트릭스, 실무 시나리오 및 오해 정리 확장으로 조건부 판단 규칙 강화.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)
- HLT 보완 연속(디카페인·위장관·카페스톨): `decaffeination-processes`, `gastrointestinal-reflux-low-acidity-coffee`, `cafestol-kahweol-and-filtering`
  - `decaffeination-processes`: 의료 분기 임계치, 근거 번역 표, 4주 루프 및 오해 정리 보강.
  - `gastrointestinal-reflux-low-acidity-coffee`: 의학적 경고/약물교차 체크리스트 및 루프 정밀화로 실무 판단 규칙 강화.
  - `cafestol-kahweol-and-filtering`: 위험 신호 규칙, 4주 루프, 비교 매트릭스, 오해 확장 보강.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check-editorial` (성공, 블로킹 없음)
- PRO-02 보강(`harvest-maturity-selection`)
  - 성숙도 오차를 줄이기 위해 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 수확-건조 전달을 고정했습니다.
  - `history`에 보강 이력 추가(`2026. 07. 28.`).
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check-editorial` (성공, 블로킹 없음)

- 입문 집필 연속 편집: `bean-structure-compounds`, `home-brew-recipes`
  - `bean-structure-compounds`(KO): `mapping`, `misconceptions`, `quiz`, `references` 섹션 보강 및 문단 확장
  - `home-brew-recipes`(KO): `decision`, `adaptation`, `practice` 추가 및 결론부 `references`, `quiz` 보강
  - `bean-structure-compounds`(EN): `mapping`, `misconceptions`, `quiz`, `references` 섹션 동시 보강 및 `mapping`/`transform` 순서 정렬
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 에이전트형 편집 연속 실행: `coffee-storage`(입문 보관 가이드 확장)
  - `article-composer` 작업: `보관 방식 의사결정`·`개봉 루틴`·`오해 정리`·`참고자료`·`퀴즈` 섹션 추가
  - `evidence-curator` 작업: 내부 링크 3개 + 기관/기관성 자료 2개 반영
  - `quiz-and-practice-builder` 작업: 14일 실험형 실습 절차, 4문항 자기 점검 보강
  - `wiki-link-architect` 작업: 관련문서 링크(`bean-structure-compounds`, `roast-development`, `coffee-cherry-to-bean`) 배치
  - 게이트 재실행:
    - `npm run check:editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 에이전트형 편집 연속 실행: `coffee-drink-taxonomy`(입문 음료 지도)
  - `article-composer` 작업: `misconceptions`, `practice`, `references`, `quiz` 확장으로 항목 완결도 향상
  - `evidence-curator` 작업: 내부 링크 3개 + WCR/SCA 외부 자료 링크 추가
  - `quiz-and-practice-builder` 작업: 실무 주문·설계 루틴과 4문항 자기 점검 보강
  - `wiki-link-architect` 작업: `espresso-basics`, `milk-steaming`, `cold-brew` 관련문서 연결 강화
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 에이전트형 편집 연속 실행: `brewing-gear-guide`(입문 도구 가이드)
  - `article-composer` 작업: 장비 선택 프레임·동선·예산 기준 섹션 추가로 구성 완결도 향상
  - `evidence-curator` 작업: 관리 포인트 및 WCR/SCA 링크 보강
  - `quiz-and-practice-builder` 작업: 2주 장비 정합성 실습 루틴과 자기 점검 4문항 추가
  - `wiki-link-architect` 작업: `brew-methods`, `grinder-basics`, `home-brew-recipes`, `water-for-coffee` 교차 링크 보강
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 에이전트형 편집 연속 실행: `brew-methods`(입문 추출법 총람)
  - `article-composer` 작업: `방식 선택 의사결정 프레임` 추가 및 기사 흐름 정렬
  - `quiz-and-practice-builder` 작업: 자기 점검 4문항 추가
  - `evidence-curator` 작업: 실무 기준표(목표·우선점검·보정) 보강
  - `naturalness-editor` 작업: 문단 간 전이 문구 정리로 초안 가독성 보강
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 에이전트형 편집 연속 실행: `cold-brew`(입문 콜드브루 가이드)
  - `article-composer` 작업: 의사결정 프레임·오해 정리·참고자료·퀴즈 섹션 확장
  - `evidence-curator` 작업: 추출/물/안전 링크 추가 및 외부 참고 링크 보강
  - `quiz-and-practice-builder` 작업: 7일 안정화 루틴 실습 및 자기 점검 4문항 추가
  - `wiki-link-architect` 작업: `water-for-coffee`, `extraction-basics`, `home-brew-recipes` 연계 보강
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 에이전트형 편집 연속 실행: `coffee-flavor-wheel`(입문 관능어휘 지도)
  - `article-composer` 작업: 용어 계층 이동 프레임·감각 매핑 표·흔한 오해 정리·참고자료 섹션 추가
  - `quiz-and-practice-builder` 작업: 자기 점검 4문항 보강 및 실습 흐름 정렬
  - `wiki-link-architect` 작업: 센서리 문법/커핑 관련 내부 링크 정렬
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 에이전트형 편집 연속 실행: `home-tasting`(입문 집에서 테이스팅)
  - `article-composer` 작업: 3단 실전 기준·비교 지도 표·흔한 오해 정리 섹션 추가
  - `quiz-and-practice-builder` 작업: 자기 점검 4문항 및 실습/기록 루틴 보강
  - `evidence-curator` 작업: SCA/감각 훈련 외부 자료 링크 추가
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 집중 보완(입문): `water-for-coffee`, `grinder-basics`, `coffee-processing`
  - KO: 각 문서에 `decision`/`map`/`quiz`/`misconceptions`(해당 문서) 섹션 추가 및 `updatedAt` 갱신
  - EN: KO와 앵커 정합성 유지하도록 동일 섹션 정렬, 중복 `updatedAt` 제거, 유효하지 않은 내부 링크 정정
  - EN(`coffee-processing`): 중복 `references` 헤더 삭제로 구조 정합성 복구
  - 게이트 재실행:
    - `npm run check-editorial` (통과)
    - `npm run check-content` (통과)
    - `npm run build:content` (통과, `ko: 151, en: 151`)

- 2026-07-28 기획-로그 정합성 보강:
  - 상태: 누락 34개 항목이 기존 초안 파일/순서 반영은 되었으나 `writing-log` 미기록 상태라 이번에 정합성만 동기화했습니다.
  - ORG-02: `global-coffee-zones`
  - GEN-07: `canephora-clones-and-selections`
  - GEN-08: `coffee-breeding-reality-cycle`
  - PRO-02: `harvest-maturity-selection`
  - PRO-03: `coffee-fermentation-microbiology`
  - PRO-06: `green-bean-grading-defects`
  - PRO-07: `honey-pulped-natural-processing`
  - PRO-08: `wet-hulling`
  - PRO-09: `anaerobic-coffee-processing`
  - PRO-10: `green-bean-moisture-management`
  - ROA-01: `roast-stage-and-cracks` (크랙 신호-색도-감각 정렬 프레임 보강)
  - ROA-02: `roaster-heat-transfer`
  - ROA-03: `roast-maillard-strecker-pyrolysis`
  - ROA-04: `roaster-machine-types-comparison`
  - ROA-05: `roast-profile-design`
  - ROA-06: `roast-development`
  - ROA-07: `roast-development-signals`
  - ROA-08: `roast-profile-design` (샘플·생산 로스팅 관점 확장 완료)
  - ROA-09: `roaster-machine-types-comparison` (배치 크기/스케일업 관점 확장 완료)
  - ROA-10: `post-roast-gas-and-freshness` (로스팅 품질관리 운영 프레임 보강 완료)
  - EXT-01: `extraction-basics`
  - EXT-02: `water-chemistry-basics`
  - EXT-03: `particle-size-distribution`
  - EXT-04: `particle-size-distribution` (용해도·물질전달 분해 프레임 보강 완료)
  - HIS-01: `global-coffee-history`
  - HIS-02: `coffeehouse-culture`
  - HIS-03: `global-coffee-history`
  - HIS-04: `coffee-trade-history`
  - HIS-05: `global-coffee-history`
  - HIS-06: `coffeehouse-culture` (이탈리아 바 문화·에스프레소 문단 보강 완료)
  - HIS-07: `global-coffee-history` (인스턴트·진공·캡슐 문단 보강 완료)
  - HIS-08: `global-coffee-history` (물결 서사 비판 문단 보강 완료)
  - HIS-09: `coffee-trade-history` (한국 다방 이행 문단 보강 완료)
  - HIS-10: `coffee-ritual-map` (세계의 커피 의례 지도 보강 완료)
  - CAF-01: `espresso-basics` (변수 조정 순서 보강, 실험 오차 분리 테이블 추가)

- BOT-03 초안 집필(중급): `coffee-cherry-anatomy`
  - 주제 대응: `BOT-03` 커피 체리와 씨앗의 해부학
  - frontmatter 반영: `fact`, `related`(6개), `tags`(6개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 층별 관찰축(균일성·수분·안전·추적), 가공 모드별 영향 프레임, 실습 보강, 오해 정리 추가
  - 내부 링크: `coffee-cherry-to-bean`, `coffee-processing`, `post-harvest-processing-map`, `coffee-plant-taxonomy`, `coffee-varieties`, `coffee-fermentation-microbiology`
  - 기록 위치: `docs/writing-log.md`
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `121 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BOT-01 초안 집필(입문): `coffee-plant-taxonomy`
  - 주제 대응: `BOT-01` 커피나무의 분류학과 생물학
  - frontmatter 반영: `fact`, `related`(4개), `tags`(6개), `history`, `level: 입문`, `accent: sage`, `updatedAt`
  - 본문 반영: 분류 축 정렬 프레임, 상업 재배군 비교표, 분류의 실무 의미, 용어 정리, 1주 실습 루프, 오해 정리(4개), 참고자료(5개), 자기 점검(4문항)
  - 내부 링크: `coffee-plant-life-cycle`, `coffee-flowering-pollination`, `arabica-canephora-liberica-comparison`, `coffee-processing`, `coffee-cherry-to-bean`
  - 편성 반영: 기존 위치(`coffee-cherry-to-bean` 직후) 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BOT-02 초안 집필(중급): `coffee-plant-life-cycle`
  - 주제 대응: `BOT-02` 커피나무의 생애주기와 생육 달력
  - frontmatter 반영: `fact`, `related`(4개), `tags`(6개), `history` 누적(2건), `level: 중급`, `accent: sage`, `updatedAt`
  - 본문 반영: 단계별 표(5단계), 격년결실 프레임, 월별 운영 논리, 5주 실습 루프, 흔한 오해(4개), 참고자료(5개), 자기 점검(4문항)
  - 내부 링크: `coffee-plant-taxonomy`, `coffee-flowering-pollination`, `coffee-cherry-to-bean`, `coffee-processing`
  - 편성 반영: 기존 위치(`coffee-cherry-to-bean` 직후) 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BOT-04 초안 집필(중급): `coffee-flowering-pollination`
  - 주제 대응: `BOT-04` 개화·수분·착과
  - frontmatter 반영: `fact`, `related`(4개), `tags`(6개), `history` 누적(2건), `level: 중급`, `accent: sage`, `updatedAt`
  - 본문 반영: 개화 동기화-수분 방식-착과 병목 프레임, 운영 체크리스트, 오해 정리(3개), 3주 실습 루프, 참고자료(5개), 자기 점검(4문항)
  - 내부 링크: `coffee-plant-life-cycle`, `coffee-plant-taxonomy`, `coffee-processing`, `coffee-cherry-to-bean`
  - 편성 반영: 기존 위치(`coffee-plant-life-cycle` 직후) 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BOT-05 초안 집필(전문): `root-canopy-photosynthesis`
  - 주제 대응: `BOT-05` 수분·수관·광합성
  - frontmatter 반영: `updatedAt`, `history` 누적(2건)
  - 본문 반영: BOT-05 3축 진단 프레임(수분·수관·광합성), 증상-우선점검-후속항목 매핑, 오해 정리 보강
  - 편성 반영: 기존 위치 유지(`src/content/articles/order.json` 변경 없음)
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `121 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BOT-06 초안 집필(중급): `altitude-rain-temp-physiology`
  - 주제 대응: `BOT-06` 온도·강우·고도의 생리적 효과
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime`(16분), `related`(5개), `tags`(6개), `fact`, `accent`
  - 본문 반영: 온도·강우·고도 3축 생리 반응 프레임, 운영 판단 매트릭스, 오해 정리(4개), 실습 루프(5단계), 참고자료(5개), 자기 점검(4문항)
  - 편성 반영: 기존 위치(`src/content/articles/order.json` 인덱스 122) 유지
  - 게이트 재실행:
    - `npm run build:content`
    - `npm run check-content`
    - `npm run check:editorial`
    - `npm run lint`

- BOT-07 초안 집필(중급): `coffee-soil-nutrient-diagnosis`
  - 주제 대응: `BOT-07` 토양·영양 관리
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime`(16분), `related`(5개), `tags`(6개), `fact`, `accent`
  - 본문 반영: 3축 진단 프레임(유기물·수분·양분), 반복 샘플링 루프, 개입 우선순위 매트릭스, 흔한 오해(4개), 실습 루프(5단계), 참고자료(5개), 자기 점검(4문항)
  - 편성 반영: 기존 위치(`src/content/articles/order.json` 인덱스 124) 유지
  - 게이트 재실행:
    - `npm run build:content`
    - `npm run check-content`
    - `npm run check:editorial`
    - `npm run lint`

- BOT-08 초안 집필(입문): `coffee-shade-intercropping`
  - 주제 대응: `BOT-08` 셰이드·혼농재배 운영
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime`(14분), `related`(6개), `tags`(6개), `fact`, `accent`
  - 본문 반영: 운영 축 재구성(그늘율·동반작물·수분), 유형 정렬, 우선순위 매트릭스, 계절형 운영 루프(4회), A/B 실증 설계, 오해 정리(4개), 체크리스트(8개), 참고자료(4개), 자기 점검(4문항)
  - 편성 반영: 기존 위치 유지 (`src/content/articles/order.json`)
  - 게이트 재실행:
    - `npm run build:content`
    - `npm run check-content`
    - `npm run check:editorial`
    - `npm run lint`

- BOT-09 초안 집필(전문): `coffee-canopy-pruning-rejuvenation`
  - 주제 대응: `BOT-09` 전정·갱신·수관 관리
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime`(20분), `related`(6개), `tags`(6개), `fact`, `accent`
  - 본문 반영: 4축 진단 프레임 정렬, 전정/갱신/Stumping 의사결정 표, 밀식재배 운영 루프, 시기 설계 보강, 실패 패턴 매트릭스, 오해 정리(5개), 실습 루프(6단계), 용어 정리(5개), 참고자료(8개), 자기 점검(5문항)
  - 편성 반영: 기존 위치 유지 (`src/content/articles/order.json`)
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`, `all references valid`)
    - `npm run check:editorial` (성공, `151 articles checked; beginner batch gate passed`, `18 legacy warning(s)`)
    - `npm run lint` (실패: 기존 `.claude/worktrees/platform-interop/.next/types`에서 타입 규칙 위반 205건, 콘텐츠 변경으로 인한 변경 없음)

- BOT-10 초안 집필(전문): `coffee-pest-symptom-map`
  - 주제 대응: `BOT-10` 병해충 지도(증상·구획·시기 의사결정 설계)
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime`(16분), `related`(5개), `tags`(6개), `fact`, `accent`
  - 본문 반영: 3축 정렬 프레임(증상/공간/시기), 4단 루프(탐지·판단·개입·복기), 시기별 우선순위표, 개입 강도 매트릭스, 오해 정리(5개), 용어 정리(5개), 실습 루프(8주), 참고자료(7개), 자기 점검(5문항)
  - 내부 링크: `coffee-plant-life-cycle`, `coffee-shade-intercropping`, `coffee-soil-nutrient-diagnosis`, `coffee-climate-resilience`, `climate-risk-and-quality`
  - 편성 반영: `src/content/articles/index.ts` 갱신(현재 기준 집계 포함)
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`, `all references valid`)
    - `npm run check:editorial` (성공, `151 articles checked; beginner batch gate passed`, `18 legacy warning(s)`)
    - `npm run lint` (실패: 기존 `.claude/worktrees/platform-interop/.next/types`에서 타입 규칙 위반 205건, 콘텐츠 변경으로 인한 변경 없음)

- BRW-01 초안 집필(입문): `brew-methods`
  - 주제 대응: `BRW-01` 침지·투과·가압 추출 통합 지도
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime` 업데이트(12분), `related`(6개), `tags`(7개), `fact` 교정
  - 본문 반영: 방식 통합 행렬, 실무 매핑표, 오해 정리(5개), 실습 루프(5단계), 참고자료(6개), BRW-01 전용 섹션 및 자기 점검
  - 편성 반영: `src/content/articles/order.json` 변경 없음
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `121 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-02 초안 집필(중급): `pour-over-rhythm-control`
  - 주제 대응: `BRW-02` 푸어오버 유체역학
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime` 업데이트(10분), `related`(6개), `tags`(7개), `fact` 교정
  - 본문 반영: 블룸-붓기-마무리 프레임, 구간별 오차-점검 표, 오해 정리(5개), 변수 분할 실습(4회 루프), BRW-02 전용 섹션
  - 편성 반영: `src/content/articles/order.json` 변경 없음
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `121 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-03 초안 집필(입문): `french-press-immersion-guide`
  - 주제 대응: `BRW-03` 프렌치프레스와 침지형 추출 정렬
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime` 업데이트(10분), `related`(6개), `tags`(6개), `fact` 유지
  - 본문 반영: BRW-03 전용 3단계 정렬 프레임, 오차-점검 표, 오해 정리(5개), 실습 루프(기본 실습 + BRW-03 3회 분해 루프), 자체 항목 식별자 `topic-brw-03`
  - 편성 반영: `src/content/articles/order.json` 변경 없음
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `121 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-04 초안 집필(중급): `clever-switch-hybrid-brewing`
  - 주제 대응: `BRW-04` 클레버·스위치형 하이브리드 추출
  - frontmatter 반영: `updatedAt`, `history` 신규(1건), `readingTime`(10분), `related`(6개), `tags`(6개), `fact`
  - 본문 반영: BRW-04 전용 정렬 프레임(침지·배수·마무리), 오차-점검 표, 오해 정리(5개), 실습 루프(4회), 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `clever-switch-hybrid-brewing`를 `french-press-immersion-guide` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `122 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-05 초안 집필(중급): `aeropress-variable-map`
  - 주제 대응: `BRW-05` 에어로프레스 변수 지도
  - frontmatter 반영: `updatedAt`, `history` 신규(1건), `readingTime`(10분), `related`(6개), `tags`(7개), `fact`
  - 본문 반영: BRW-05 전용 4축 지도(방향/침지/가압/분리), 정방향·역방향 비교표, 필터·바이패스 프레임, 오해 정리(5개), 실습 루프(4회), 체크 템플릿, 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `aeropress-variable-map`를 `clever-switch-hybrid-brewing` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `123 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-06 초안 집필(중급): `moka-pot-pressure-control`
  - 주제 대응: `BRW-06` 모카포트의 압력과 열관리
  - frontmatter 반영: `updatedAt`, `history` 누적(2건), `readingTime`, `related`(6개), `tags`(7개), `fact`
  - 본문 반영: BRW-06 전용 가열·증기·차단 정렬 프레임(3단), 오차 신호 표, 보안/안전 점검, 오해 정리(5개), 실습 루프(4회), 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `moka-pot-pressure-control` 추가 및 기존 BRW 시퀀스 반영
  - 게이트 재실행:
    - `npm run build:content` (성공, 해당 시점 `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)
    - `npm run lint` (성공)

- BRW-07 초안 집필(전문): `siphon-thermodynamics-control`
  - 주제 대응: `BRW-07` 사이폰 추출의 열·압력·진공 정렬
  - frontmatter 반영: `updatedAt`, `history` 신규(1건), `readingTime`(10분), `related`(6개), `tags`(7개), `fact`
  - 본문 반영: BRW-07 전용 열·압력·진공 4구간 프레임(상향/하강), 필터·클램프 점검 항목, 오해 정리(5개), 실습 루프(4회), 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `siphon-thermodynamics-control`를 `moka-pot-pressure-control` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 124, en: 124`)
    - `npm run check-content` (성공, `124 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-08 초안 집필(중급): `turkish-chezve-control`
  - 주제 대응: `BRW-08` 체즈베·터키 커피
  - frontmatter 반영: `updatedAt`, `history` 신규(1건), `readingTime`(10분), `related`(6개), `tags`(7개), `fact`
  - 본문 반영: BRW-08 전용 3구간 정렬 프레임(분쇄·거품·침전), 초미분 관리, 거품/침전 오차 해석, 오해 정리(5개), 실습 루프(4회), 템플릿, 참고자료(6개), 자기점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `turkish-chezve-control`를 `siphon-thermodynamics-control` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 125, en: 125`)
    - `npm run check-content` (성공, `125 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-09 초안 집필(중급): `cold-brew-chemistry-safety-storage`
  - 주제 대응: `BRW-09` 콜드브루의 추출화학 분해와 보관 안전 정렬
  - frontmatter 반영: `updatedAt`, `history` 신규(1건), `readingTime`(10분), `related`(6개), `tags`(6개), `fact`
  - 본문 반영: BRW-09 전용 구간 분리 프레임(추출·희석·보관), 축별 점검 표, 안전·보관 체크리스트, 오해 정리(5개), 실습 루프(4회), 템플릿, 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `cold-brew-chemistry-safety-storage`를 `turkish-chezve-control` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 126, en: 126`)
    - `npm run check-content` (성공, `126 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- EXT-07 초안 집필(중급): `refractometer-measurement-uncertainty`
  - 주제 대응: `EXT-07` 굴절계와 측정 불확도
  - frontmatter 반영: `updatedAt`, `history`(1건), `readingTime`(10분), `related`(6개), `tags`(5개), `fact`, `accent: blue`, `level: 중급`
  - 본문 반영: 측정 신호 정의 → 오차 층위 분해 → 보정·채취·반복측정 표준화 루프 → 오차 보고 항목 → 장비별 관점 비교 → 오해 정리(5개) → 실습 루프(4회) → 자기 점검(5문항)
  - 내부 링크: `thermal-time-agitation-control`, `brew-profile-observables`, `extraction-basics`, `espresso-machine-hydraulics-thermal`, `particle-size-distribution`, `water-for-coffee`
  - 편성 반영: `src/content/articles/order.json`에 `refractometer-measurement-uncertainty`를 `permeability-channeling-control` 뒤, `brew-profile-observables` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 147, en: 147`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `147 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- EXT-08 초안 집필(전문): `brew-control-chart-and-sensory`
  - 주제 대응: `EXT-08` 브루 컨트롤 차트와 관능 정렬
  - frontmatter 반영: `updatedAt`, `history`(1건), `readingTime`(12분), `related`(6개), `tags`(6개), `fact`, `accent: blue`, `level: 전문`
  - 본문 반영: 역사적 권장 구간 배경 → 관능-공정 동시 추적 프레임 → 차트 설계/해석 표준 → 오해 정리(5개) → 5주 실습 루프 → 템플릿/자기 점검(5문항) 정비
  - 내부 링크: `brew-profile-observables`, `thermal-time-agitation-control`, `extraction-basics`, `coffee-aroma-chemistry`, `sensory-attributes`, `taste-smell-touch-sensory-mapping`
  - 편성 반영: `src/content/articles/order.json`에 `brew-control-chart-and-sensory`를 `refractometer-measurement-uncertainty` 뒤, `brew-profile-observables` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 148, en: 148`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `148 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- EXT-09 초안 집필(전문): `dialing-in-experimental-design`
  - 주제 대응: `EXT-09` 다이얼인을 실험으로 설계하기
  - frontmatter 반영: `updatedAt`, `history`(1건), `readingTime`(12분), `related`(7개), `tags`(6개), `fact`, `accent: blue`, `level: 전문`
  - 본문 반영: 다이얼인 실패 패턴 정리 → 목표·가설·통제·판정 프레임 → 축 분해표 및 프로토콜 → 반복·재현성 규칙 → 감각/수치 융합 방식 → 오해 정리(5개) → 5주 실습 루프 → 템플릿·자기점검(6문항)
  - 내부 링크: `espresso-dialing-protocol`, `brew-experiment-design`, `thermal-time-agitation-control`, `permeability-channeling-control`, `grinder-burr-retention-control`, `brew-ratio-practice`, `sensory-brewing-grammar`
  - 편성 반영: `src/content/articles/order.json`에 `dialing-in-experimental-design`를 `brew-control-chart-and-sensory` 뒤, `brew-profile-observables` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 149, en: 149`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `149 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- EXT-09 후속 보강(`dialing-in-experimental-design`)
  - `교대 인수인계 체크리스트(EXT-09)` 제목 표기를 정규화하고, 실패 지도·2주 정렬 루프·체크리스트 항목의 이력을 보강 반영.
  - `history`에 `2026. 07. 28.` 보강 항목을 추가 반영.

- EXT-10 초안 집필(중급): `post-roast-gas-and-freshness`
  - 주제 대응: `EXT-10` 로스팅 후 가스와 신선도
  - frontmatter 반영: `updatedAt`, `history`(1건), `readingTime`(11분), `related`(8개), `tags`(7개), `fact`, `accent: blue`, `level: 중급`
  - 본문 반영: 로스팅 후 가스 메커니즘 분해 → 시간축 구간 분리 → 포장/개봉 규칙 → 동결·냉장 보관 비교 → 추출-감각 매칭 프레임 → 오해 정리(5개) → 4주 실습 루프 → 템플릿·자기점검(5문항)
  - 내부 링크: `roaster-heat-transfer`, `roast-development-signals`, `coffee-storage`, `brew-profile-observables`, `brew-experiment-design`, `cold-brew-chemistry-safety-storage`, `particle-size-distribution`, `roast-maillard-strecker-pyrolysis`
  - 편성 반영: `src/content/articles/order.json`에 `post-roast-gas-and-freshness`를 `dialing-in-experimental-design` 뒤, `brew-profile-observables` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 150, en: 150`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `150 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- BRW-10 초안 집필(전문): `recipe-comparison-experimental-design`
  - 주제 대응: `BRW-10` 레시피 비교 실험법(랜덤화·블라인드·반복)
  - frontmatter 반영: `updatedAt`, `history` 신규(1건), `readingTime`(10분), `related`(6개), `tags`(6개), `fact`
  - 본문 반영: BRW-10 전용 실험 설계 프레임(축 고정·랜덤화·블라인드), 반복-재현성 체크, 오해 정리(5개), 실습 루프(4회), 기록 템플릿, 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `recipe-comparison-experimental-design`를 `cold-brew-chemistry-safety-storage` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 127, en: 127`)
    - `npm run check-content` (성공, `127 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-01 초안 집필(입문): `espresso-dialing-protocol`
  - 주제 대응: `CAF-01` 에스프레소 다이얼인 프레임
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(5개), `fact`, `accent: sand`, `level: 입문`
  - 본문 반영: 다이얼인 우선순위 축표, 기본 순서, 오차 신호·우선 수정표, 오해 정리(5개), 실습(4회 루프), 템플릿, 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `espresso-dialing-protocol`를 `espresso-preinfusion-guide` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 129, en: 129`)
    - `npm run check-content` (성공, `129 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-01 보강(`espresso-dialing-protocol`)
  - 교대 인수인계 체크리스트 항목을 추가해 다이얼인 전달성(핵심 축/예외 조건/안전 조건)을 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- CAF-02 초안 집필(중급): `espresso-puck-preparation`
  - 주제 대응: `CAF-02` 실습: 퍽 준비와 채널링 정렬
  - frontmatter 반영: `updatedAt`, `history`(2건), `readingTime`(11분), `related`(6개), `tags`(6개), `fact`, `accent: sand`, `level: 중급`
  - 본문 반영: 4축 프레임 정비, 도즈/분배/탬핑/헤드스페이스별 고정 규칙, 채널링 진단표 및 우선 조치, 오해 정리(5개), 실습 루프(5회), 템플릿, 참고자료(8개), 자기 점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `espresso-puck-preparation`를 `espresso-machine-hydraulics-thermal` 뒤에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 150, en: 150`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `150 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-01 초안 집필(중급): `sca-cupping-workflow`
  - 주제 대응: `SEN-01` SCA CVA와 커핑 워크플로 정렬
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(5개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: CVA 정렬구조, 5단계 워크플로, 편향 방지/보정표, 용어 재현성, 오해 정리(5개), 실습(4회 루프), 템플릿, 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `sca-cupping-workflow`를 `sensory-brewing-grammar` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 129, en: 129`)
    - `npm run check-content` (성공, `129 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
  - `npm run lint` (성공)

- SEN-02 초안 집필(입문): `wcr-lexicon-sensory-wheel`
  - 주제 대응: `SEN-02` WCR 렉시콘과 향미 휠 정렬
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: berry`, `level: 입문`
  - 본문 반영: 감각 레이어 정의 프레임, WCR 4단계 정렬, 편향 차단표, 실습 루프(4회), 오해 정리(5개), 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `wcr-lexicon-sensory-wheel`를 `coffee-flavor-wheel` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 131, en: 131`)
    - `npm run check-content` (성공, `131 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-02 보강(`wcr-lexicon-sensory-wheel`)
  - 센서리 렉시콘 정렬에서 레이어 오차/용어 과다/결점 혼선 오해를 줄이기 위해 실패 지도와 교차 교체 규칙, 교대 인수인계 체크리스트를 추가해 실무 전달력을 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, `151 articles checked; beginner batch gate passed`)

- SEN-02 후속 보강(`wcr-lexicon-sensory-wheel`)
  - `2주 정렬 루프: 감각 언어 정합 고정` 절을 추가해 4회 실습 루프 이전의 2주 교정 프레임을 분리 정렬함.
  - `history`에 `2026. 07. 28.` 보강 항목을 추가 반영.

- SEN-03 초안 집필(입문): `taste-smell-touch-sensory-mapping`
  - 주제 대응: `SEN-03` 맛·향·촉각·삼차신경 분리 관찰
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(5개), `tags`(6개), `fact`, `accent: berry`, `level: 입문`
  - 본문 반영: 4감각 축 분해 프레임, 편향 분기표, 실습 루프(4회), 템플릿, 참고자료(5개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `taste-smell-touch-sensory-mapping`를 `sca-cupping-workflow` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 133, en: 133`)
    - `npm run check-content` (성공, `133 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-04 초안 집필(중급): `taste-threshold-adaptation-fatigue`
  - 주제 대응: `SEN-04` 역치·순응·피로·온도 효과
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(5개), `tags`(6개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 역치/순응/피로/온도 4요인 프레임, 통제 프로토콜, 실습 루프(4회), 오해 정리(5개), 템플릿, 참고자료(5개), 자기 점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `taste-threshold-adaptation-fatigue`를 `taste-smell-touch-sensory-mapping` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 133, en: 133`)
    - `npm run check-content` (성공, `133 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-05 초안 집필(중급): `sensory-defect-origin-mapping`
  - 주제 대응: `SEN-05` 생두·로스팅·추출 결점 향미 분리
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(6개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 생두·로스팅·추출 단계 분해 프레임, 단계별 후보 제거 규칙, 실습 루프(4회), 템플릿, 오해 정리(5개), 참고자료(6개), 자기 점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `sensory-defect-origin-mapping`를 `taste-threshold-adaptation-fatigue` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 134, en: 134`)
    - `npm run check-content` (성공, `134 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-06 초안 집필(중급): `sensory-panel-calibration-triangle`
  - 주제 대응: `SEN-06` 패널 캘리브레이션과 삼각검사
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 캘리브레이션 4단계 프레임, 삼각검사 운영 규칙, 오해 정리(5개), 실습 루프(4회), 참고자료(6개), 자기 점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `sensory-panel-calibration-triangle`를 `sensory-defect-origin-mapping` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 135, en: 135`)
    - `npm run check-content` (성공, `135 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-03~06 보강 연속: `taste-smell-touch-sensory-mapping`, `sensory-defect-origin-mapping`, `sensory-panel-calibration-triangle`
  - `taste-smell-touch-sensory-mapping`: 오해/오염 패턴 지도, 2주 루프, 축별 용어 정렬을 추가해 기록 분해 품질을 강화.
  - `sensory-defect-origin-mapping`: 단계별 실패 지도, 후보 축소 규칙 보강, 2주 결점 정합 루프 추가.
  - `sensory-panel-calibration-triangle`: 실패 지도(오판 패턴), 2주 캘리브레이션 루프, 운영 용어 정렬 보강으로 반복 교차 실무 설계를 정비.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- SEN-07 초안 집필(전문): `sensory-descriptive-cata-affective`
  - 주제 대응: `SEN-07` 묘사분석·CATA·정서평가 선택
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: berry`, `level: 전문`
  - 본문 반영: 방법론 비교 표, 질문 기반 선택 규칙, 통합 4회 루프, 오해 정리(5개), 템플릿, 참고자료(6개), 자기 점검(6문항)
  - 편성 반영: `src/content/articles/order.json`에 `sensory-descriptive-cata-affective`를 `sensory-panel-calibration-triangle` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 136, en: 136`)
    - `npm run check-content` (성공, `136 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-08 초안 집필(전문): `sensory-data-reliability`
  - 주제 대응: `SEN-08` 관능 데이터와 신뢰도 운영
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: berry`, `level: 전문`
  - 본문 반영: 신뢰도 3축(반복성·재현성·판별력) 프레임, 지표 매트릭스, 오해 정리(5개), 실습 루프(4회), 템플릿, 참고자료(6개), 자기 점검(6문항)
  - 편성 반영: `src/content/articles/order.json`에 `sensory-data-reliability`를 `sensory-descriptive-cata-affective` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 137, en: 137`)
    - `npm run check-content` (성공, `137 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-09 초안 집필(중급): `sensory-expert-vs-consumer-preference`
  - 주제 대응: `SEN-09` 전문가 품질과 소비자 선호 분리
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 품질축·선호축 분리 프레임, 3문항 의사결정 루틴, 충돌 패턴표, 실습 루프(4회), ANOVA/PCA 최소 규칙, 오해 정리(6개), 참고자료(6개), 자기 점검(6문항)
  - 편성 반영: `src/content/articles/order.json`에 `sensory-expert-vs-consumer-preference`를 `sensory-data-reliability` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 138, en: 138`)
    - `npm run check-content` (성공, `138 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- SEN-10 초안 집필(전문): `sensory-lab-design`
  - 주제 대응: `SEN-10` 센서리 랩 설계
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: berry`, `level: 전문`
  - 본문 반영: 센서리 랩 6대 원칙, 공간·시료·코드·순서·패널·캘리브레이션 분리 운영, 실습 루프(4회), 체크리스트, 오해 정리(6개), 참고자료(12개), 자기 점검(6문항)
  - 편성 반영: `src/content/articles/order.json`에 `sensory-lab-design`을 `sensory-expert-vs-consumer-preference` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 139, en: 139`)
    - `npm run check-content` (성공, `139 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-01 초안 집필(중급): `caffeine-and-health`
  - 주제 대응: `HLT-01` 카페인의 흡수·대사·섭취량
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 흡수·대사·반감기 프레임, 음료별 편차 표, 기관 기준 해석 방식, 개인차·상호작용, 실습(5단계), 오해 정리(5개), 용어정리(5개), 참고자료(12개), 자기 점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `caffeine-and-health`를 `sensory-lab-design` 뒤, `daily-cafe-routine` 앞(기존 위치 제거)로 조정
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 139, en: 139`)
    - `npm run check-content` (성공, `139 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-02 초안 집필(중급): `coffee-and-health-research`
  - 주제 대응: `HLT-02` 커피와 건강 연구를 읽는 법
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(6개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 연구 질문 분해, 설계별 강도 비교표, 교란·측정 요건 점검, 통계 해석 규칙, 번역 루틴, 실습(3단계), 오해 정리(5개), 용어정리(6개), 참고자료(9개), 자기점검(5문항)
  - 보강: 임상 분기 신호, 연구 번역 매트릭스, 실무 의사결정 그리드, 실무 시나리오를 추가해 조건부 적용 흐름을 강화.
  - 편성 반영: `src/content/articles/order.json`에 `coffee-and-health-research`를 `caffeine-and-health` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, beginner batch gate passed)

- HLT-02 보강(`coffee-and-health-research`)
  - 실패 지도(해석 오차 4축), 인수인계 체크리스트를 추가해 연구 번역 신호를 현장 전달 기준으로 정렬.
  - `history`에 `2026. 07. 28.` 보강 항목 기록.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, `151 articles checked; beginner batch gate passed`)

- HLT-03 초안 집필(중급): `decaffeination-processes`
  - 주제 대응: `HLT-03` 디카페인 공정
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(6개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 공정 분류 3계열 매트릭스, 품질·잔류 해석 프레임, 연구 질문 재해석 규칙, 3주 실무 루프, 오해 정리(5개), 용어정리(5개), 참고자료(10개), 자기점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `decaffeination-processes`를 `coffee-and-health-research` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공)
    - `npm run check-editorial` (성공)
    - `npm run lint` (성공)

- HLT-04 초안 집필(중급): `chlorogenic-acids-roasting-health`
  - 주제 대응: `HLT-04` 클로로겐산과 로스팅을 읽는 법
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(6개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 용어·단계별 반응 지도, 연구 질문 검증 규칙, 4주 실무 로그, 오해 정리(5개), 핵심 용어(5개), 참고자료(10개), 자기점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `chlorogenic-acids-roasting-health`를 `decaffeination-processes` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공)
    - `npm run check-editorial` (성공)
    - `npm run lint` (성공)

- HLT-05 초안 집필(중급): `cafestol-kahweol-and-filtering`
  - 주제 대응: `HLT-05` 카페스톨·카웨올과 필터를 읽는 법
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(5개), `tags`(6개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 성분·추출·필터 기전 분해, 필터 조건 비교표, HLT-02 프레임 적용, 2주 실무 루프, 오해 정리(5개), 핵심 용어(5개), 참고자료(10개), 자기점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `cafestol-kahweol-and-filtering`를 `chlorogenic-acids-roasting-health` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 143, en: 143`)
    - `npm run check-content` (성공, `143 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-06 초안 집필(전문): `acrylamide-and-furans`
  - 주제 대응: `HLT-06` 아크릴아마이드·퓨란과 열처리
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: olive`, `level: 전문`
  - 본문 반영: 열반응 지도, 노출 판단 4축, 증거 매트릭스, 트레이드오프 프레임, 4주 실무 루프, 오해 정리(5개), 핵심 용어(5개), 참고자료(10개), 자기점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `acrylamide-and-furans`를 `cafestol-kahweol-and-filtering` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 143, en: 143`)
    - `npm run check-content` (성공, `143 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-07 초안 집필(중급): `caffeine-timing`
  - 주제 대응: `HLT-07` 카페인과 수면·일주기
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(6개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 수면 조절 메커니즘 정리, 섭취 시각 4구간 프레임, 연구 판독 규칙(관측·교란·인과), 수면 지연 지표 매트릭스, 3주 실무 루프, 시나리오, 오해 정리(5개), 핵심 용어(5개), 참고자료(10개), 자기점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `caffeine-timing`를 `acrylamide-and-furans` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 143, en: 143`)
    - `npm run check-content` (성공, `143 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-08 초안 집필(중급): `caffeine-pregnancy-lactation-youth`
  - 주제 대응: `HLT-08` 임신·수유·청소년과 카페인
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(5개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 대상군 분기표(임신·수유·청소년), 근거 프레임(관측·교란·해석), 임신/수유/청소년별 적용 시나리오, 비교표, 현장 전달 패턴, 4주 실무 루프, 오해 정리(5개), 핵심 용어(5개), 참고자료(10개), 자기점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `caffeine-pregnancy-lactation-youth`를 `caffeine-timing` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 143, en: 143`)
    - `npm run check-content` (성공, `143 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-09 초안 집필(중급): `gastrointestinal-reflux-low-acidity-coffee`
  - 주제 대응: `HLT-09` 위장관·역류·저산도 커피
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(6개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 위장관 반응 3축 프레임, 증상 분류표, 저산도 라벨 검증 단계, 실무 시나리오, 4주 로그 루프, 오해 정리(6개), 핵심 용어(5개), 참고자료(10개), 자기 점검(5문항)
  - 편성 반영: `src/content/articles/order.json`에 `gastrointestinal-reflux-low-acidity-coffee`를 `caffeine-pregnancy-lactation-youth` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 144, en: 144`)
    - `npm run check-content` (성공, `144 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-10 초안 집필(중급): `very-hot-beverage-and-food-safety`
  - 주제 대응: `HLT-10` 매우 뜨거운 음료와 식품안전
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(4개), `tags`(5개), `fact`, `accent: olive`, `level: 중급`
  - 본문 반영: 3축 위험 지도(열·알레르겐·위생), 온도 판단 프레임, 알레르겐 4단계, 교차 오염 점검표, 증거 변환 규칙, 4주 현장 루프, 오해 정리, 핵심 용어, 참고자료, 자기 점검
  - 편성 반영: `src/content/articles/order.json`에 `very-hot-beverage-and-food-safety`를 `gastrointestinal-reflux-low-acidity-coffee` 뒤, `daily-cafe-routine` 앞에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 146, en: 146`)
    - `npm run check-content` (성공, `146 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- HLT-07~10 보강 연속(중급): `caffeine-timing`, `caffeine-pregnancy-lactation-youth`, `gastrointestinal-reflux-low-acidity-coffee`, `very-hot-beverage-and-food-safety`
  - 공통 패턴: 임상 분기(의학 경고/의심 신호)와 연구 번역 브릿지(조건부 규칙/근거 번역 매트릭스/의사결정 그리드) 보강
  - `caffeine-timing`: 임상 경계, 증거 번역 매트릭스, 분기형 결정표, 전달 패턴 분리
  - `caffeine-pregnancy-lactation-youth`: 대상군 분기/의사결정 그리드/현장 전달 패턴 정밀화
  - `gastrointestinal-reflux-low-acidity-coffee`: 의학적 경고, 약물 교차, 의사결정 매트릭스, 전달 템플릿 보강
  - `very-hot-beverage-and-food-safety`: 임상 게이트, 메뉴 운영 결정표, 근거 번역 규칙, 전달 루프 보강
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, 블로킹 없음)

- EXT-05 초안 집필(중급): `thermal-time-agitation-control`
  - 주제 대응: `EXT-05` 온도·시간·교반
  - frontmatter 반영: `updatedAt`, `history`(최신 추가), `readingTime`(10분), `related`(5개), `tags`(5개), `fact`, `accent: blue`, `level: 중급`
  - 본문 반영: 3축 분리 프레임, 고정-이동-교차검증 프로토콜, 구간별 템플릿, 장비별 적용 지도, 흔한 오해 정리(5개), 실습 루프(4회), 용어 정리(4개), 참고자료(11개), 자기 점검(5문항), 콜아웃 2개 포함
  - 편성 반영: `src/content/articles/order.json` 기존 위치 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)
    - `npm run lint` (성공)

- EXT-06 초안 집필(중급): `permeability-channeling-control`
  - 주제 대응: `EXT-06` 투과성·채널링·필터 막힘
  - frontmatter 반영: `updatedAt`, `history`(최신 추가), `readingTime`(10분), `related`(5개), `tags`(6개), `fact`, `accent: blue`, `level: 중급`
  - 본문 반영: 투과성·채널링·막힘 개념 분리, 3단계 관측 프로토콜, 원인 분리 매트릭스, 장비별 관점(3개), 흔한 오해 정리(5개), 실습 루프(5회), 예방·유지 가이드, 용어 정리(4개), 참고자료(11개), 자기 점검(5문항), 콜아웃 2개 포함
  - 편성 반영: `src/content/articles/order.json` 기존 위치 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공)
    - `npm run lint` (성공)

- CAF-03 초안 집필(중급): `grinder-burr-retention-control`
  - 주제 대응: `CAF-03` 그라인더의 버·입자·잔류 통제
  - frontmatter 반영: `updatedAt`, `history`, `readingTime`, `related`(6개), `tags`(6개), `fact`, `accent: sand`, `level: 중급`
  - 본문 반영: 그라인더 축 정렬 프레임, 잔류 지도, 오해 정리(5개), 실습 루프(4회), 템플릿, 참고자료(6개), 자기 점검(4문항)
  - 편성 반영: `src/content/articles/order.json`에 `grinder-burr-retention-control`를 `grinder-burr-profile` 직후 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 131, en: 131`)
    - `npm run check-content` (성공, `131 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-03 보강(`grinder-burr-retention-control`)
  - 실패 지도, 2주 정렬 루프, 교대 인수인계 체크리스트를 추가해 잔류 기반의 오차 분해와 다음 교대 전달 규칙을 보강.
  - `history`에 `2026. 07. 28.` 보강 항목 반영.
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`)
    - `npm run check-content` (성공)
    - `npm run check:editorial` (성공, 블로킹 없음)

- CAF-04 초안 집필(전문): `espresso-machine-hydraulics-thermal`
  - 주제 대응: `CAF-04` 에스프레소 머신의 수력·열 시스템
  - frontmatter 반영: `updatedAt`(2건), `history`(2건), `readingTime`(11분), `related`(5개), `tags`(7개), `fact`, `accent: sand`, `level: 전문`
  - 본문 반영: 수력/열 분리 프레임, 상호작용 지도, 고장 신호 지도, 4일 분리 튜닝, 템플릿, 흔한 오해 정리(5개), 참고자료(6개), 자기 점검(5문항), 실습(4회)
  - 편성 반영: `src/content/articles/order.json`에 `espresso-machine-hydraulics-thermal`(기존 위치 유지)
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 150, en: 150`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `150 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-05 초안 집필(중급): `milk-steaming-protein-chemistry`
  - 주제 대응: `CAF-05` 우유 스티밍의 과학
  - frontmatter 반영: `updatedAt`, `history`(2건), `readingTime`(10분), `related`(4개), `tags`(6개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 4요소 분해, 스티밍 단계별 동역학, 신호 지도, 원유 조성별 기준표, 실무 루프(4회), 템플릿, 흔한 오해 정리(5개), 용어 정리(5개), 참고자료(10개), 자기 점검(5문항)
  - 내부 링크: `milk-steaming`, `milk-microfoam-checklist`, `plant-based-milk-steaming`, `latte-art-readability`, `espresso-machine-hydraulics-thermal`, `water-for-coffee`
  - 편성 반영: `src/content/articles/order.json` 기존 위치 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 150, en: 150`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `150 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-06 초안 집필(중급): `plant-based-milk-steaming`
  - 주제 대응: `CAF-06` 식물성 음료 스티밍
  - frontmatter 반영: `updatedAt`, `history`(2건), `readingTime`(10분), `related`(4개), `tags`(5개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 조성 지도(단백질·지방·점도), 재료별 반응 프레임, 신호 지도, 실무 루프(4회 분리 실험), 템플릿, 알레르겐·교차 오염 운용 원칙, 오해 정리(5개), 용어(5개), 참고자료(9개), 자기 점검(5문항)
  - 내부 링크: `milk-steaming`, `milk-steaming-protein-chemistry`, `milk-microfoam-checklist`, `espresso-machine-hydraulics-thermal`
  - 편성 반영: `src/content/articles/order.json` 기존 위치 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 150, en: 150`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `150 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-07 초안 집필(중급): `latte-art-readability`
  - 주제 대응: `CAF-07` 라테아트의 유동 제어
  - frontmatter 반영: `updatedAt`, `history`(2건), `readingTime`(11분), `related`(4개), `tags`(5개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 3축 유동 모델(피처 높이·유량·대비), 오해 정리(5개), 실무 루프(4회 분리 실습), 템플릿, 핵심 용어(5개), 참고자료(9개), 자기 점검(5문항)
  - 내부 링크: `milk-microfoam-checklist`, `milk-steaming-protein-chemistry`, `milk-steaming`, `plant-based-milk-steaming`, `espresso-machine-hydraulics-thermal`, `espresso-dialing-protocol`
  - 편성 반영: 기존 글(`latte-art-readability`)을 CAF-07 과제로 재정의
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 150, en: 150`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `150 articles (+12 en), 12 categories`)
    - `npm run check-editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-08 초안 집필(중급): `machine-cleaning-water-hygiene`
  - 주제 대응: `CAF-08` 머신 청소와 물 위생
  - frontmatter 반영: `updatedAt`, `history`(1건), `readingTime`(11분), `related`(4개), `tags`(6개), `fact`, `accent: berry`, `level: 중급`
  - 본문 반영: 오염 경로 지도(3축), 백플러시/세제/스팀완드/물 위생 분리, 실무 루프(4회 분리 실습), 오해 정리(5개), 템플릿, 핵심 용어(5개), 참고자료(10개), 자기 점검(5문항)
  - 내부 링크: `water-for-coffee`, `water-chemistry-basics`, `espresso-machine-hydraulics-thermal`, `cafe-quality-system`, `very-hot-beverage-and-food-safety`
  - 편성 반영: `src/content/articles/order.json`에 `machine-cleaning-water-hygiene`를 `plant-based-milk-steaming` 뒤에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 150, en: 150`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `150 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-09 초안 집필(전문): `bar-throughput-and-flow`
  - 주제 대응: `CAF-09` 바 동선·인체공학·처리량
  - frontmatter 반영: `updatedAt`, `history`(1건), `readingTime`(14분), `related`(5개), `tags`(6개), `fact`, `accent: sand`, `level: 전문`
  - 본문 반영: 3층 흐름 지도, 처리량 지표 4종, 동선 분리 프레임, 인체공학 관리축 3종, 피크 제어 루틴(5단계), 안전 통합 규칙, 실습 루프(4주), 오해 정리(5개), 참고자료(11개), 자기 점검(5문항)
  - 내부 링크: `daily-cafe-routine`, `cafe-shift-operations`, `cafe-quality-system`, `espresso-machine-hydraulics-thermal`, `very-hot-beverage-and-food-safety`, `water-for-coffee`, `water-chemistry-basics`
  - 편성 반영: `src/content/articles/order.json`에 기존 위치(`plant-based-milk-steaming` 뒤, `machine-cleaning-water-hygiene` 뒤) 유지
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- CAF-10 초안 집필(전문): `cafe-menu-pricing-quality`
  - 주제 대응: `CAF-10` 카페 메뉴 원가와 품질관리
  - frontmatter 반영: `updatedAt`, `history`(1건), `readingTime`(15분), `related`(5개), `tags`(6개), `fact`, `accent: sand`, `level: 전문`
  - 본문 반영: 4분면 수익성 프레임, 레시피 거버넌스, 폐기 루프, 배치브루 보온 기준, 가격-처리량 결합, 실무 루프(4주), KPI 대시보드, 오해 정리(5개), 참고자료(13개), 자기 점검(6문항)
  - 내부 링크: `daily-cafe-routine`, `cafe-quality-system`, `bar-throughput-and-flow`, `cafe-shift-operations`, `roastery-cafe-business-economics`, `espresso-machine-hydraulics-thermal`, `espresso-puck-preparation`, `water-for-coffee`
  - 편성 반영: `src/content/articles/order.json`에서 `bar-throughput-and-flow` 직후에 배치
  - 게이트 재실행:
    - `npm run build:content` (성공, `ko: 151, en: 151`, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `151 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- PRO-04 초안 집필(중급): `washed-processing-deep-dive`
  - 주제 대응: `PRO-04` 워시드 가공 심화
  - frontmatter 반영: `fact`, `related`(6개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 오해 해소(4개) → 워시드 3단계 분기(펄핑/발효/세척) → 점검 프레임 → 실습 → 참고자료(6개) → 자기점검(4문항)
  - 내부 링크: `post-harvest-processing-map`, `coffee-processing`, `coffee-fermentation-microbiology`, `green-bean-grading-defects`, `coffee-storage`, `coffee-climate-resilience`
  - 편성 반영: `src/content/articles/order.json`에 `washed-processing-deep-dive`를 `coffee-fermentation-microbiology` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 110, en: 110`)
    - `npm run check-content` (성공, `110 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- PRO-05 초안 집필(중급): `natural-processing-deep-dive`
  - 주제 대응: `PRO-05` 내추럴 가공 심화
  - frontmatter 반영: `fact`, `related`(6개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 오해 해체 → 건조 동선 4축 → 운영 실수 4건 → 구매·로스팅 체크리스트 → 실습 → 참고자료(6개) → 자기점검(4문항)
  - 내부 링크: `coffee-processing`, `post-harvest-processing-map`, `coffee-fermentation-microbiology`, `coffee-storage`, `honey-pulped-natural-processing`, `coffee-trade-history`
  - 편성 반영: `src/content/articles/order.json`에 `natural-processing-deep-dive`를 `honey-pulped-natural-processing` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 111, en: 111`)
    - `npm run check-content` (성공, `111 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- ORG-06 초안 집필(중급): `brazil-scale-and-diversity`
  - 주제 대응: `ORG-06` 브라질의 규모와 다양성(Cerrado, Sul de Minas, Mogiana)
  - frontmatter 반영: `fact`, `related`(6개), `tags`(6개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 지역 프레임(3축) → 규모-품질 트레이드오프 → 기계수확·수분관리 → 실무 체크리스트 → 흔한 오해(4개) → 실습(5단계) → 참고자료(10개) → 자기점검(5문항)
  - 내부 링크: `global-coffee-zones`, `coffee-climate-resilience`, `coffee-processing`, `post-harvest-processing-map`, `coffee-storage`, `coffee-plant-taxonomy`, `columbia-harvest-cycle`
  - 편성 반영: `src/content/articles/order.json`에 `brazil-scale-and-diversity`를 `columbia-harvest-cycle` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 105, en: 105`)
    - `npm run check-content` (성공, `105 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- ORG-07 초안 집필(중급): `central-america-regional-comparison`
  - 주제 대응: `ORG-07` 중앙아메리카 산지 비교(과테말라·코스타리카·엘살바도르·온두라스·파나마)
  - frontmatter 반영: `fact`, `related`(6개), `tags`(6개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 국가 비교표 → 운영 공통 루프 → 구매·점검 4단계 → 흔한 오해(5개) → 실습(5단계) → 참고자료(10개) → 자기점검(5문항)
  - 내부 링크: `global-coffee-zones`, `coffee-terroir-science`, `coffee-processing`, `post-harvest-processing-map`, `coffee-storage`, `coffee-climate-resilience`
  - 편성 반영: `src/content/articles/order.json`에 `central-america-regional-comparison`를 `brazil-scale-and-diversity` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 106, en: 106`)
    - `npm run check-content` (성공, `106 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- ORG-08 초안 집필(중급): `yemen-and-mocha`
  - 주제 대응: `ORG-08` 예멘과 모카
  - frontmatter 반영: `fact`, `related`(6개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 모카 명칭/역사 층 분리 → 건식 가공 운용표 → 지역 제약 요인(기후·물류·인력) → 구매 체크포인트 → 오해(4개) → 실습(5단계) → 참고자료(10개) → 자기점검(4문항)
  - 내부 링크: `global-coffee-zones`, `coffee-trade-history`, `coffee-terroir-science`, `coffee-processing`, `global-coffee-history`, `coffee-storage`, `coffee-climate-resilience`
  - 편성 반영: `src/content/articles/order.json`에 `yemen-and-mocha`를 `central-america-regional-comparison` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 107, en: 107`)
    - `npm run check-content` (성공, `107 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- ORG-09 초안 집필(중급): `indonesia-archipelago-coffee`
  - 주제 대응: `ORG-09` 인도네시아 군도의 커피(수마트라·자바·술라웨시)
  - frontmatter 반영: `fact`, `related`(6개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 인도네시아군도 운영 지도 → 웻 헐링 변수 → 구매 체크포인트 → 오해(4개) → 실습(5단계) → 참고자료(10개) → 자기점검(4문항)
  - 내부 링크: `global-coffee-zones`, `wet-hulling`, `coffee-processing`, `post-harvest-processing-map`, `coffee-storage`, `coffee-climate-resilience`
  - 편성 반영: `src/content/articles/order.json`에 `indonesia-archipelago-coffee`를 `yemen-and-mocha` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 108, en: 108`)
    - `npm run check-content` (성공, `108 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- ORG-10 초안 집필(중급): `robusta-hubs-and-emerging-regions`
  - 주제 대응: `ORG-10` 카네포라의 중심지와 신흥 산지(베트남·우간다·인도)
  - frontmatter 반영: `fact`, `related`(6개), `tags`(6개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 카네포라 중심지/신흥 산지 비교표 → 관찰 규칙 → 신흥 리스크 신호 → 점검표(5단계) → 오해(4개) → 실습(5단계) → 참고자료(10개) → 자기점검(4문항)
  - 내부 링크: `global-coffee-zones`, `coffee-processing`, `post-harvest-processing-map`, `coffee-variety-authenticity-traceability`, `catimor-sarchimor-blight-resistance`, `coffee-climate-resilience`
  - 편성 반영: `src/content/articles/order.json`에 `robusta-hubs-and-emerging-regions`를 `indonesia-archipelago-coffee` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 109, en: 109`)
    - `npm run check-content` (성공, `109 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- GEN-01 초안 집필(중급): `arabica-canephora-liberica-comparison`
  - 주제 대응: `GEN-01` 아라비카·카네포라·리베리카 비교
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`(1건), `level: 중급`, `accent: sage`, `readingTime`(18분)
  - 본문 반영: 종 비교 3축 프레임, 실습 루프, 오해 정리, 참고자료, 자기점검 포함
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- GEN-02 초안 집필(중급): `coffee-variety-cultivar-hybrid`
  - 주제 대응: `GEN-02` 품종·재래종·컬티바·하이브리드
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`(1건), `level: 중급`, `accent: sage`, `readingTime`(16분)
  - 본문 반영: 명칭 구분과 분류 기준 정렬, 실습 루프, 오해 정리, 자기점검 포함
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- GEN-03 초안 집필(중급): `coffee-tipica-bourbon-lineage`
  - 주제 대응: `GEN-03` 티피카와 버번 계통도
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`(1건), `level: 중급`, `accent: olive`, `readingTime`(13분)
  - 본문 반영: 계통도 정렬 프레임, 오해 정리, 실습/체크 항목 정리
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- GEN-04 초안 집필(전문): `ethiopian-heirloom-diversity`
  - 주제 대응: `GEN-04` 에티오피아 재래종과 유전적 다양성
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`(1건), `level: 전문`, `accent: olive`, `readingTime`(14분)
  - 본문 반영: 용어 경계 분해, 오해 정리, 실무 연결 포인트 정리
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- GEN-05 초안 집필(중급): `catimor-sarchimor-blight-resistance`
  - 주제 대응: `GEN-05` 카티모르·사르치모르와 녹병 내성 이해와 관리 트레이드오프
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`(1건), `level: 중급`, `accent: sage`, `readingTime`(11분)
  - 본문 반영: 녹병·생산성 트레이드오프 프레임과 구매 판단 체크
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- GEN-06 초안 집필(전문): `f1-hybrid-coffee-breeding`
  - 주제 대응: `GEN-06` F1 하이브리드
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`(1건), `level: 전문`, `accent: sage`, `readingTime`(13분)
  - 본문 반영: 생산성/향미/재배 리스크 분해, 판단 프레임 정리
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- ORG-01 초안 집필(중급): `coffee-terroir-science`
  - 주제 대응: `ORG-01` 테루아를 과학적으로 읽는 법
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`(1건), `level: 중급`, `accent: sage`, `readingTime`(17분)
  - 본문 반영: 테루아 구성요소 분해, 비교 프레임, 실습 루프 정리
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- ORG-04 초안 집필(중급): `kenya-coffee-system`
  - 주제 대응: `ORG-04` 케냐 커피 시스템
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`(1건), `level: 중급`, `accent: sage`, `readingTime`(12분)
  - 본문 반영: 생산·경매·가공 고리 정리, 구매·로스팅 연계 관점
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- ORG-05 초안 집필(중급): `columbia-harvest-cycle`
  - 주제 대응: `ORG-05` 콜롬비아의 다중 수확기와 지역성
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`(1건), `level: 중급`, `accent: sage`, `readingTime`(12분)
  - 본문 반영: main crop·mitaca 수확주기 운영 프레임, 실습 정리
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- PRO-01 초안 집필(입문): `post-harvest-processing-map`
  - 주제 대응: `PRO-01` 수확 후 가공 전체 지도
  - frontmatter 반영: `fact`, `related`(4개), `tags`(6개), `history`(1건), `level: 입문`, `accent: sage`, `readingTime`(14분)
  - 본문 반영: 입고~출하 지도 정렬, 단계별 점검 루프, 오해 정리, 자기점검 포함
  - 편성 반영: `src/content/articles/order.json` 반영됨 (확인됨)

- IND-01 초안 집필(입문): `farm-to-cafe-value-chain`
  - 주제 대응: `IND-01` 농장에서 카페까지의 가치사슬
  - frontmatter 반영: `fact`, `related`(6개), `tags`(6개), `history`, `level: 입문`, `accent: sage`
  - 본문 반영: 가치 전환 노드 5개 → 오해 교정 → 신호 연결 루틴 4단계 → 점검 실습(4단계) → 참고자료(6개) → 자기점검(4문항)
  - 내부 링크: `coffee-trade-history`, `coffee-climate-resilience`, `supply-chain-transparency`, `farmer-income-basics`, `coffee-storage`, `coffee-processing`
  - 편성 반영: `src/content/articles/order.json`에 `farm-to-cafe-value-chain`를 `coffee-trade-history` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 112, en: 112`)
    - `npm run check-content` (성공, `112 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-02 초안 집필(전문): `coffee-futures-and-differentials`
  - 주제 대응: `IND-02` 커피 가격·선물시장·디퍼렌셜
  - frontmatter 반영: `fact`, `related`(6개), `tags`(6개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 선물·현물 관계 정의 → 디퍼렌셜 3축 분해 → basis/헤지 오차점 → 환율·보험·물류 리스크 점검 → 협상 프레임(6단계) → 오해(5개) → 실습/용어 정리 → 참고자료(10개) → 자기점검(6문항)
  - 내부 링크: `coffee-trade-history`, `farmer-income-basics`, `supply-chain-transparency`, `coffee-climate-resilience`, `global-coffee-history`, `climate-risk-and-quality`
  - 편성 반영: `src/content/articles/order.json`에 `coffee-futures-and-differentials`를 `farm-to-cafe-value-chain` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 113, en: 113`)
    - `npm run check-content` (성공, `113 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-03 초안 집필(전문): `green-bean-purchase-contracts-and-logistics`
  - 주제 대응: `IND-03` 생두 구매 계약과 물류(Incoterms, 샘플 승인, 보험/지연 관리)
  - frontmatter 반영: `fact`, `related`(6개), `tags`(6개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 계약 블록 분해 → 샘플 승인 루틴(4단계) → Incoterms 책임 매트릭스 → 보험·클레임 운영 포인트 → 물류 8점검 → 오해(4개) → 실습(6단계) → 용어 정리 → 참고자료(10개) → 자기점검(6문항)
  - 내부 링크: `coffee-trade-history`, `supply-chain-transparency`, `farmer-income-basics`, `climate-risk-and-quality`, `farm-to-cafe-value-chain`, `coffee-climate-resilience`
  - 편성 반영: `src/content/articles/order.json`에 `green-bean-purchase-contracts-and-logistics`를 `coffee-futures-and-differentials` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 114, en: 114`)
    - `npm run check-content` (성공, `114 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-04 초안 집필(중급): `coffee-certification-comparison`
  - 주제 대응: `IND-04` 인증 제도 비교(Organic, Fairtrade, Rainforest Alliance)
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 인증 범위 지도(3축) → 구매·입고·로스팅 분할 점검 → 계약 언어 전환 → 오해(5개) → 실습(6단계) → 용어 정리 → 참고자료(10개) → 자기점검(5문항)
  - 내부 링크: `coffee-trade-history`, `farmer-income-basics`, `supply-chain-transparency`, `farm-to-cafe-value-chain`
  - 편성 반영: `src/content/articles/order.json`에 `coffee-certification-comparison`를 `green-bean-purchase-contracts-and-logistics` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 115, en: 115`)
    - `npm run check-content` (성공, `115 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-05 초안 집필(전문): `producer-income-and-livelihood`
  - 주제 대응: `IND-05` 생산자 소득과 생활소득
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 소득 3층 분해 → 현금흐름 vs 재생산 비용 → 리스크 조정 포인트 → 가격/소득 분리 오해 5개 → 협상 루프(5단계) → 실습(8단계) → 참고자료(12개) → 자기점검(6문항)
  - 내부 링크: `farmer-income-basics`, `coffee-climate-resilience`, `supply-chain-transparency`, `climate-risk-and-quality`
  - 편성 반영: `src/content/articles/order.json`에 `producer-income-and-livelihood`를 `coffee-certification-comparison` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 116, en: 116`)
    - `npm run check-content` (성공, `116 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-06 초안 집필(전문): `climate-risks-and-just-adaptation`
  - 주제 대응: `IND-06` 기후위험과 공정한 적응
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 4축 위험 프레임 → 품종·그늘·관개 적응 조합 → 비용 분담 조항(6개) → 조기 경보 지표 → 오해(5개) → 12주 프로토콜 → 공정성 체크리스트 → 참고자료(10개) → 자기점검(6문항)
  - 내부 링크: `coffee-climate-resilience`, `farmer-income-basics`, `climate-risk-and-quality`, `supply-chain-transparency`, `farm-to-cafe-value-chain`
  - 편성 반영: `src/content/articles/order.json`에 `climate-risks-and-just-adaptation`를 `producer-income-and-livelihood` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 117, en: 117`)
    - `npm run check-content` (성공, `117 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-07 초안 집필(전문): `coffee-carbon-water-footprint`
  - 주제 대응: `IND-07` 커피의 탄소·물 발자국
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 경계 개념 정리 → 탄소/물 분리 프레임 → 데이터 품질 오차 6가지 → 로스팅·보관·폐기물 구간 점검 표 → 비교 프레임(4단계) → 트레이드오프/공정성 → 오해(5개) → 실습(8단계) → 참고자료(12개) → 자기점검(6문항)
  - 내부 링크: `climate-risk-and-quality`, `coffee-climate-resilience`, `supply-chain-transparency`, `farm-to-cafe-value-chain`, `coffee-trade-history`
  - 편성 반영: `src/content/articles/order.json`에 `coffee-carbon-water-footprint`를 `climate-risks-and-just-adaptation` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 118, en: 118`)
    - `npm run check-content` (성공, `118 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-08 초안 집필(전문): `coffee-traceability-and-due-diligence`
  - 주제 대응: `IND-08` 추적성·투명성·실사 규제
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 추적성·투명성·실사 구분 → lot 경계 규칙 → 규제 대응 4단계 → 데이터 오차 6가지 → 서류군 4분면 → 감사루프(9단계) → 오해(5개) → 실습(6주) → 용어정리 → 참고자료(11개) → 자기점검(6문항)
  - 내부 링크: `supply-chain-transparency`, `farmer-income-basics`, `climate-risk-and-quality`, `farm-to-cafe-value-chain`, `coffee-trade-history`
  - 편성 반영: `src/content/articles/order.json`에 `coffee-traceability-and-due-diligence`를 `coffee-carbon-water-footprint` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 119, en: 119`)
    - `npm run check-content` (성공, `119 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-09 초안 집필(중급): `coffee-byproducts-and-circular-economy`
  - 주제 대응: `IND-09` 커피 부산물과 순환경제
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 부산물 4분류 → 가치화 분기점 4가지 → 품질·안전 기준 → 회계 항목(4개) → 계약 설계(6단계) → 오해(5개) → 8주 파일럿 → 참고자료(11개) → 자기점검(5문항)
  - 내부 링크: `coffee-carbon-water-footprint`, `coffee-traceability-and-due-diligence`, `producer-income-and-livelihood`, `supply-chain-transparency`, `climate-risk-and-quality`
  - 편성 반영: `src/content/articles/order.json`에 `coffee-byproducts-and-circular-economy`를 `coffee-traceability-and-due-diligence` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신, `ko: 120, en: 120`)
    - `npm run check-content` (성공, `120 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- IND-10 초안 집필(전문): `roastery-cafe-business-economics`
  - 주제 대응: `IND-10` 로스터리·카페 사업 경제학
  - frontmatter 반영: `fact`, `related`(4개), `tags`(6개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 수익 구조 4구간 분해 → 수율·재고 회전표 → 고정비/인건비 분해 → 가격 설계(기여마진·손익분기) → 운영 루프(6단계) → 오해(5개) → 용어 정리 → 실습(8주 스프린트) → 참고자료(14개) → 자기점검(6문항)
  - 내부 링크: `coffee-futures-and-differentials`, `green-bean-purchase-contracts-and-logistics`, `cafe-menu-pricing-quality`, `cafe-shift-operations`, `coffee-traceability-and-due-diligence`
  - 편성 반영: `src/content/articles/order.json`에 `roastery-cafe-business-economics`를 `coffee-byproducts-and-circular-economy` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, `121 articles (+12 en), 12 categories`)
    - `npm run check:editorial` (성공, `18 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- ORG-03 초안 집필(중급): `ethiopia-regional-guide`
  - 주제 대응: `ORG-03` 에티오피아 산지 안내( Sidama·Yirgacheffe·Guji·Jimma )
  - frontmatter 반영: `fact`, `related`(5개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 산지 프레임(4축) → 수집·가공 체인 → 판단 문항/오해 정리 → 구매·로스팅 프레임(표) → 실습(8회) → 다음 연결 → 참고자료(10개) → 자기점검(5문항)
  - 내부 링크: `global-coffee-zones`, `coffee-terroir-science`, `coffee-processing`, `coffee-variety-cultivar-hybrid`, `coffee-trade-history`, `coffee-plant-taxonomy`
  - 편성 반영: `src/content/articles/order.json`에 `ethiopia-regional-guide`를 `global-coffee-zones` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, 모든 참조 정합성 통과)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- GEN-10 초안 집필(전문): `coffee-variety-authenticity-traceability`
  - 주제 대응: `GEN-10` “품종 진위와 유전 추적성”(SNP/KASP·이력추적·혼입 리스크) 정합성 정리
  - frontmatter 반영: `fact`, `related`(5개), `tags`(6개), `history`, `level: 전문`, `accent: sage`
  - 본문 반영: 혼입 경로 진단 → 3층 증거 프레임(형태·이력·유전) → 체크리스트 및 실습(8주) → 흔한 오해(5개) → 다음 링크 정리 → 참고자료(10개) → 자기점검(6문항)
  - 내부 링크: `coffee-breeding-reality-cycle`, `coffee-variety-cultivar-hybrid`, `arabica-canephora-liberica-comparison`, `f1-hybrid-coffee-breeding`, `canephora-clones-and-selections`
  - 편성 반영: `src/content/articles/order.json`에 `coffee-variety-authenticity-traceability`를 `coffee-propagation-methods` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, 모든 참조 정합성 통과)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- GEN-09 초안 집필(중급): `coffee-propagation-methods`
  - 주제 대응: `GEN-09` “종자·삽목·접목·조직배양” 비교·선정 기준 정리
  - frontmatter 반영: `fact`, `related`(4개), `tags`(5개), `history`, `level: 중급`, `accent: sage`
  - 본문 반영: 개념 정의 → 방식별 비교 → 점검 체크리스트 → 흔한 오해(4개) → 실습 → 다음 학습 연결 → 참고자료 → 자기 점검(5문항)
  - 내부 링크: `coffee-breeding-reality-cycle`, `coffee-variety-cultivar-hybrid`, `canephora-clones-and-selections`, `f1-hybrid-coffee-breeding`
  - 편성 반영: `src/content/articles/order.json`에 `coffee-propagation-methods`를 `coffee-breeding-reality-cycle` 직후에 등록
  - 게이트 재실행:
    - `npm run build:content` (성공, `src/content/articles/index.ts` 갱신)
    - `npm run check-content` (성공, 모든 참조 정합성 통과)
    - `npm run check:editorial` (성공, `17 legacy warning`, 블로킹 없음)
    - `npm run lint` (성공)

- GEN 트랙 누락 항목의 다음 과제를 이어서 진행:
  - 신규 작성: `arabica-canephora-liberica-comparison` (GEN-01)
  - 초안 포맷: `category: 산지와 생두`, `level: 중급`, `fact` 및 related/tags 4개 이상 반영
  - 점검: `npm run build:content`, `npm run check-content`, `npm run check:editorial`
  - 검증 결과: `check-content` 통과, `check:editorial` 경고 17건(기존 문서 분량 경고 포함, 본문 게이트 블로킹 없음)
  - 반영 포인트: 종 비교를 3층 분해(분류학/공정/운영) 구조로 정렬, 흔한 오해 3개 + 실습/자기 점검 섹션 추가
- 다음 편성: GEN-02(품종/재래종/컬티바/하이브리드)와 GEN-01의 상호 연결을 위해 `related`를 `coffee-variety-cultivar-hybrid` 등으로 정렬해 배치했습니다.
- 동일 계획 연장(1차 보강): `canephora-clones-and-selections` 새 글 초안 완료
  - 수정 포인트: frontmatter `related`의 존재하지 않는 slug를 `coffee-varieties`로 정정
  - 편성 반영: `src/content/articles/order.json`에 `canephora-clones-and-selections` 삽입
  - 게이트 재실행: `npm run build:content`(성공, index.ts 갱신), `npm run check-content`(성공), `npm run check:editorial`(17건 legacy warning, 블로킹 없음), `npm run lint`(성공)
- GEN-08 연속 집필(전문): `coffee-breeding-reality-cycle` 초안 작성
  - 주제 대응: GEN-08 ‘커피 육종의 실제’(선발·교배·다지역 시험·출하 적합성 연결)
  - frontmatter/본문 반영: `fact`, `related`(5개), `tags`(5개), 실습·오해·자기점검·표·콜아웃 포함
  - 편성 반영: `src/content/articles/order.json`에 `coffee-breeding-reality-cycle`를 `f1-hybrid-coffee-breeding` 뒤에 등록
  - 게이트 재실행: `npm run build:content`(성공, `index.ts` 갱신), `npm run check-content`(성공), `npm run check-editorial`(17건 legacy warning, 블로킹 없음), `npm run lint`(성공)

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

- 신규 글 10편 작성 완료(카테고리 확장) 및 동기화 준비:
  - `coffee-trade-history`, `coffeehouse-culture`, `coffee-ritual-map`, `supply-chain-transparency`,
    `climate-risk-and-quality`, `farmer-income-basics`, `coffee-solvent-chemistry`,
    `coffee-oxidation-pathway`, `caffeine-timing`, `cafe-shift-operations`
  - 실행 작업: 각 기사 본문 확장(원인-개념-실습-오해-퀴즈-참고자료), `order.json` 신규 슬러그 반영, 상호 참조 정합성 점검
