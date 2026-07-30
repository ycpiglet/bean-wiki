export type SiteNotice = {
  id: string;
  date: string;
  label: string;
  title: string;
  href: string;
};

export const siteNotices: SiteNotice[] = [
  {
    id: "reading-signals",
    date: "2026. 07. 30.",
    label: "업데이트",
    title: "읽기·참여 통계와 인기 문서 신호를 공개합니다",
    href: "/analytics",
  },
  {
    id: "resource-evidence",
    date: "2026. 07. 30.",
    label: "편집 안내",
    title: "사진·표·수치 자료의 출처와 라이선스 검증 기준",
    href: "/community",
  },
  {
    id: "beginner-path",
    date: "2026. 07. 28.",
    label: "학습",
    title: "처음 읽는 독자를 위한 순차 학습 경로가 열렸습니다",
    href: "/learning-path",
  },
];
