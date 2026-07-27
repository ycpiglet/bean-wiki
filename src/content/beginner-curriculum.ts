export type BeginnerModule = {
  order: number;
  slug: string;
  title: string;
  question: string;
  practice: string;
  status: "집필 완료" | "보강 예정";
};

export const beginnerCurriculum: BeginnerModule[] = [
  {
    order: 1,
    slug: "coffee-cherry-to-bean",
    title: "커피는 무엇인가",
    question: "열매가 어떻게 우리가 마시는 한 잔이 될까요?",
    practice: "집에 있는 원두 봉투에서 산지·가공·로스팅 정보를 찾아봅니다.",
    status: "집필 완료",
  },
  {
    order: 2,
    slug: "arabica-and-robusta",
    title: "아라비카와 로부스타",
    question: "종이 다르면 맛과 재배 환경은 어떻게 달라질까요?",
    practice: "두 종이 섞인 제품의 표시사항과 향미 설명을 비교합니다.",
    status: "집필 완료",
  },
  {
    order: 3,
    slug: "coffee-varieties",
    title: "품종을 읽는 법",
    question: "품종명은 맛을 어디까지 설명할 수 있을까요?",
    practice: "티피카·버번·게이샤 중 하나를 골라 재배 지역을 찾아봅니다.",
    status: "집필 완료",
  },
  {
    order: 4,
    slug: "coffee-processing",
    title: "가공 방식",
    question: "워시드·내추럴·허니는 무엇을 바꿀까요?",
    practice: "같은 산지의 서로 다른 가공 원두를 향과 후미 중심으로 비교합니다.",
    status: "집필 완료",
  },
  {
    order: 5,
    slug: "roasting-basics",
    title: "로스팅의 역할",
    question: "열은 씨앗의 색과 향을 어떻게 바꿀까요?",
    practice: "밝은 로스팅과 어두운 로스팅 원두의 색·향·질감을 기록합니다.",
    status: "집필 완료",
  },
  {
    order: 6,
    slug: "grinder-basics",
    title: "분쇄와 입자",
    question: "왜 분쇄도가 추출 속도를 바꿀까요?",
    practice: "같은 원두를 두 분쇄도로 내려 흐르는 시간과 맛을 비교합니다.",
    status: "집필 완료",
  },
  {
    order: 7,
    slug: "water-for-coffee",
    title: "물과 온도",
    question: "대부분이 물인 음료에서 물은 어떤 일을 할까요?",
    practice: "생수 두 종류로 같은 레시피를 내려 차이를 메모합니다.",
    status: "집필 완료",
  },
  {
    order: 8,
    slug: "extraction-basics",
    title: "추출과 레시피",
    question: "진한 커피와 많이 추출된 커피는 왜 다를까요?",
    practice: "1:15와 1:17 비율을 비교하되 다른 변수는 유지합니다.",
    status: "집필 완료",
  },
  {
    order: 9,
    slug: "espresso-basics",
    title: "에스프레소 이해",
    question: "짧은 시간과 압력은 무엇을 다르게 만들까요?",
    practice: "도징·추출량·시간을 적고 맛과 함께 한 줄로 기록합니다.",
    status: "집필 완료",
  },
  {
    order: 10,
    slug: "cupping-basics",
    title: "맛을 관찰하고 말하기",
    question: "좋다·나쁘다를 넘어 어떻게 감각을 기록할까요?",
    practice: "향·산미·단맛·질감·후미를 각각 한 단어로 적습니다.",
    status: "집필 완료",
  },
];
