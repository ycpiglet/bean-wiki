// Korean UI strings (chrome: navigation, search, footers). Page/article prose
// stays with its content source; only reusable interface strings live here.
export const ko = {
  brand: { home: "Bean Wiki 홈" },
  mobileNav: {
    open: "메뉴 열기",
    close: "메뉴 닫기",
    ariaLabel: "모바일 메뉴",
    home: "홈",
    allDocs: "전체 문서",
    glossary: "용어집",
    topics: "분야",
    privacy: "개인정보 처리방침",
    contribute: "기여하기 ↗",
  },
  search: {
    label: "커피 지식 검색",
    placeholder: "추출, 그라인더, ㄹㅅㅌ 프로파일…",
    resultsLabel: "검색 결과",
    resultsCount: (n: number, fuzzy: boolean) =>
      `${n}개의 ${fuzzy ? "유사 " : ""}검색 결과`,
    noResults: "검색 결과가 없습니다",
    empty: "아직 해당 주제의 문서가 없습니다. 첫 문서의 작성자가 되어보세요.",
    recent: "최근 검색",
    clearRecent: "전체 지우기",
    approx: "유사",
  },
} as const;

export type Dictionary = typeof ko;
