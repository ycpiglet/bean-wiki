export type HomeHighlight = {
  id: string;
  title: string;
  body: string;
};

export const homeHighlights: HomeHighlight[] = [
  {
    id: "connected-knowledge",
    title: "지식은 연결될수록 선명해집니다.",
    body: "산지에서 물까지, 한 가지 맛 뒤에 놓인 원인과 결과를 함께 읽어보세요.",
  },
  {
    id: "many-variables",
    title: "맛은 한 가지 변수로 설명되지 않습니다.",
    body: "품종·가공·로스팅·추출을 이어 보면 같은 원두가 다르게 느껴지는 이유가 보입니다.",
  },
  {
    id: "better-questions",
    title: "좋은 질문은 다음 문서를 엽니다.",
    body: "모르는 용어에서 시작해 근거 문헌과 실전 레시피까지 자연스럽게 확장해보세요.",
  },
  {
    id: "practice-memory",
    title: "읽은 지식은 써볼 때 오래 남습니다.",
    body: "오늘의 한 문제로 바로 확인하고, 해설에서 관련 문서로 더 깊이 들어가세요.",
  },
];
