import type { Category } from "@/content/types";

export const categories: Category[] = [
  {
    slug: "coffee-basics",
    name: "커피 기초",
    description: "커피의 구조와 한 잔이 만들어지는 전체 흐름",
    icon: "seed",
    accent: "olive",
  },
  {
    slug: "origin-and-green",
    name: "산지와 생두",
    description: "품종, 재배 환경, 가공과 생두 품질",
    icon: "mountain",
    accent: "sage",
  },
  {
    slug: "roasting",
    name: "로스팅",
    description: "열 전달부터 프로파일 설계와 품질 관리",
    icon: "flame",
    accent: "copper",
  },
  {
    slug: "brewing",
    name: "추출",
    description: "물, 분쇄도, 비율로 맛을 설계하는 방법",
    icon: "drop",
    accent: "blue",
  },
  {
    slug: "sensory",
    name: "센서리",
    description: "커핑, 향미 언어와 관능평가의 원리",
    icon: "nose",
    accent: "berry",
  },
  {
    slug: "cafe-and-gear",
    name: "카페와 장비",
    description: "에스프레소 머신, 그라인더와 바 운영",
    icon: "cup",
    accent: "sand",
  },
];
