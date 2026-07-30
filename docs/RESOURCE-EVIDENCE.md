# 아티클 설명 리소스와 근거

사진 외에도 표·수치·그래프·인터뷰·서적 인용은 독자의 이해를 크게 돕지만,
본문보다 더 강한 오해를 만들 수도 있습니다. 이 문서는 리소스를 채택하고
검증하는 최소 계약입니다.

## 공통 원칙

1. 먼저 “이 자료가 없으면 무엇을 이해하기 어려운가”를 한 문장으로 씁니다.
2. 원출처, 작성자·기관, 발행일 또는 확인일, 이용 조건을 기록합니다.
3. 출처가 주장하는 범위를 넘겨 캡션을 쓰지 않습니다.
4. 변환·요약·재계산한 자료는 `derived`로 표시하고 변환 과정을 남깁니다.
5. 접근 가능한 대체 표현을 제공합니다. 그래프에는 표, 표에는 요약, 인터뷰에는
   발화자와 맥락을 붙입니다.
6. 권리가 불명확하면 복제하지 않고 공식 원문 링크만 제공합니다.

## 리소스별 채택 기준

| 종류 | 필수 증거 | 적용 기준 |
| --- | --- | --- |
| 표 | 원자료 URL, 단위, 기준일, 열 정의 | 원표를 복제했는지 재계산했는지 표시하고 숫자 반올림 규칙을 기록 |
| 수치 | 주장 단위의 출처, 단위, 표본·기간 | “현재”, “평균”, “증가” 같은 표현에는 반드시 기준 시점과 비교 대상을 표시 |
| 그래프 | 데이터 파일, 생성 방법, 축·단위, 표 형태 대체 | 잘린 축, 이중축, 3D 표현을 피하고 불확실성 또는 표본 수를 숨기지 않음 |
| 인터뷰 | 동의, 인터뷰 날짜, 역할, 녹취 또는 승인본 | 문맥을 바꾸는 편집 금지. 익명 인터뷰는 익명화 범위와 확인 절차 기록 |
| 서적 문구 | 저자, 서명, 판, 출판사, 연도, 페이지 | 짧은 인용만 사용하고 나머지는 자신의 문장으로 요약. 긴 저작물 복제 금지 |
| 공개 데이터 | 데이터셋명, 배포자, 버전, 라이선스 | 재현 가능한 필터·정렬·계산을 기록하고 원본 스냅샷 또는 체크섬 보존 |

## 증거 매니페스트

아티클별 자료는 `src/content/resource-evidence/<slug>/<resource-id>.json`에
기록합니다.

```json
{
  "schemaVersion": 1,
  "articleSlug": "coffee-flavor-wheel",
  "resourceId": "volatile-aroma-table",
  "kind": "table",
  "purpose": "향미 지각과 휘발성 화합물을 같은 것으로 오해하지 않도록 구분한다.",
  "source": {
    "title": "원자료 제목",
    "creator": "저자 또는 기관",
    "url": "https://example.org/source",
    "publishedAt": "2025-06-01",
    "checkedAt": "2026-07-30"
  },
  "rights": {
    "mode": "link-only",
    "license": "All rights reserved",
    "licenseUrl": null
  },
  "derivation": {
    "derived": true,
    "method": "원자료의 공개 수치를 단위 변환 없이 범주별로 재정렬"
  },
  "accessibility": {
    "summary": "표가 보여 주는 결론",
    "tableFallback": true
  }
}
```

`rights.mode`는 `licensed-copy`, `public-domain`, `original`, `link-only` 중
하나입니다. `link-only` 자료의 이미지·표·긴 문구를 로컬에 복제하면 안 됩니다.

## 검증

```bash
node scripts/audit-article-resources.mjs --slug <slug>
node scripts/audit-article-resources.mjs --slug <slug> --strict
```

첫 명령은 인벤토리와 누락을 보여 줍니다. `--strict`는 표·figure·blockquote가
있는데 증거 매니페스트가 없거나, 매니페스트의 출처·권리·접근성 필드가 빠지면
실패합니다.
