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
  browse: {
    category: "분야",
    level: "난이도",
    all: "전체",
    count: (n: number) => `문서 ${n}편`,
    readingTime: "읽는 시간",
    empty:
      "조건에 맞는 문서가 아직 없습니다. 필터를 바꾸거나 첫 문서를 작성해보세요.",
  },
  levels: { 입문: "입문", 중급: "중급", 전문: "전문" } as Record<string, string>,
};

export type Dictionary = typeof ko;
