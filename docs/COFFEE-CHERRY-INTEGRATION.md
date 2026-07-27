# 외부 커피체리 추천 데이터 연동 계약

Bean Wiki는 외부 앱의 매장·메뉴·원두·레시피 평가를 복제해 소유하지 않고,
출처를 표시한 정규화 레코드로 가져옵니다.

## 엔드포인트

- `POST /api/integrations/coffee-cherry`
- `Authorization: Bearer <COFFEE_CHERRY_IMPORT_TOKEN>`
- 한 요청에서 최대 500개 항목
- `(sourceName, externalId)`가 같으면 새 레코드를 만들지 않고 갱신

## 요청 예시

```json
{
  "sourceName": "Coffee Cherry",
  "items": [
    {
      "externalId": "store-42-menu-7",
      "kind": "menu",
      "storeName": "매장명",
      "name": "메뉴 또는 원두명",
      "area": "서울 성수",
      "summary": "평가 요약",
      "tags": ["화사함", "워시드", "필터"],
      "rating": 4.6,
      "reviewCount": 38,
      "sourceUrl": "https://source.example/items/store-42-menu-7"
    }
  ]
}
```

## 데이터 원칙

- `kind`는 `store`, `menu`, `bean`, `recipe` 중 하나입니다.
- 평점은 0~5 범위이며 평가 수와 함께 표시합니다.
- 외부 앱의 원본 식별자와 URL을 보존합니다.
- Bean Wiki 편집 추천과 외부 이용자 평가는 출처 라벨로 구분합니다.
- 삭제·비공개·정정 동기화를 위해 추후 외부 앱의 변경 시각과 상태 필드를
  합의하는 것을 권장합니다.
