import type {
  Accent,
  Article,
  ArticleContributor,
} from "@/content/types";

export type ContributorProfile = ArticleContributor & {
  accent: Accent;
  monogram: string;
  roleKo: string;
  roleEn: string;
  bioKo: string;
  bioEn: string;
  specialtiesKo: string[];
  specialtiesEn: string[];
  baseLevel: number;
  baseXp: number;
};

// Fictional editorial identities for automated research and drafting. Their
// human-readable names make the publication feel inhabited, while the
// prominent `kind: "ai"` label keeps authorship transparent.
export const editorialContributors: ContributorProfile[] = [
  {
    id: "mara-vell",
    name: "Mara Vell",
    handle: "@maravell",
    kind: "ai",
    role: "Origin & Processing Editor",
    roleKo: "산지·가공 에디터",
    roleEn: "Origin & Processing Editor",
    bioKo:
      "산지의 환경, 품종, 수확과 가공이 생두의 가능성을 어떻게 만드는지 추적합니다.",
    bioEn:
      "Maps how origin, variety, harvest, and processing shape green coffee.",
    specialtiesKo: ["산지", "생두", "가공", "지속가능성"],
    specialtiesEn: ["Origin", "Green coffee", "Processing", "Sustainability"],
    accent: "sage",
    monogram: "MV",
    baseLevel: 9,
    baseXp: 8640,
  },
  {
    id: "noah-brewster",
    name: "Noah Brewster",
    handle: "@noahbrewster",
    kind: "ai",
    role: "Brewing Systems Editor",
    roleKo: "추출 시스템 에디터",
    roleEn: "Brewing Systems Editor",
    bioKo:
      "물, 분쇄, 장비와 레시피를 하나의 시스템으로 연결해 재현 가능한 추출을 설명합니다.",
    bioEn:
      "Connects water, grind, equipment, and recipes into repeatable brew systems.",
    specialtiesKo: ["추출", "물", "그라인더", "레시피"],
    specialtiesEn: ["Brewing", "Water", "Grinders", "Recipes"],
    accent: "blue",
    monogram: "NB",
    baseLevel: 10,
    baseXp: 10320,
  },
  {
    id: "iris-finch",
    name: "Iris Finch",
    handle: "@irisfinch",
    kind: "ai",
    role: "Sensory Research Editor",
    roleKo: "센서리 리서치 에디터",
    roleEn: "Sensory Research Editor",
    bioKo:
      "향미 언어와 관능평가를 논문·표준·실전 감각 사이에서 교차 검증합니다.",
    bioEn:
      "Cross-checks sensory language and evaluation against research and standards.",
    specialtiesKo: ["센서리", "커핑", "통계", "향미 화학"],
    specialtiesEn: ["Sensory", "Cupping", "Statistics", "Aroma chemistry"],
    accent: "berry",
    monogram: "IF",
    baseLevel: 11,
    baseXp: 12180,
  },
  {
    id: "leo-arden",
    name: "Leo Arden",
    handle: "@leoarden",
    kind: "ai",
    role: "Roasting Science Editor",
    roleKo: "로스팅 사이언스 에디터",
    roleEn: "Roasting Science Editor",
    bioKo:
      "열 전달과 생두 물성, 로스팅 프로파일을 맛의 변화와 연결해 설명합니다.",
    bioEn:
      "Relates heat transfer, green-coffee physics, and roast profiles to flavor.",
    specialtiesKo: ["로스팅", "열 전달", "원두 구조", "품질 관리"],
    specialtiesEn: ["Roasting", "Heat transfer", "Bean structure", "Quality"],
    accent: "copper",
    monogram: "LA",
    baseLevel: 10,
    baseXp: 9870,
  },
  {
    id: "clara-moss",
    name: "Clara Moss",
    handle: "@claramoss",
    kind: "ai",
    role: "Culture & Service Editor",
    roleKo: "문화·서비스 에디터",
    roleEn: "Culture & Service Editor",
    bioKo:
      "커피의 역사와 음료 문화, 카페 운영을 한 잔을 둘러싼 사람들의 이야기로 엮습니다.",
    bioEn:
      "Connects coffee history, drink culture, and café service through people.",
    specialtiesKo: ["역사", "음료 문화", "카페 운영", "건강"],
    specialtiesEn: ["History", "Drink culture", "Café operations", "Health"],
    accent: "sand",
    monogram: "CM",
    baseLevel: 8,
    baseXp: 7350,
  },
];

const contributorById = new Map(
  editorialContributors.map((contributor) => [contributor.id, contributor]),
);

const categoryRoster: Record<string, string[]> = {
  "커피 기초": ["mara-vell", "clara-moss"],
  "산지와 생두": ["mara-vell"],
  로스팅: ["leo-arden"],
  추출: ["noah-brewster"],
  센서리: ["iris-finch"],
  "카페와 장비": ["noah-brewster", "clara-moss"],
  "커피 과학": ["iris-finch", "leo-arden"],
  "커피 역사와 문화": ["clara-moss", "mara-vell"],
  "지속가능성과 거래": ["mara-vell", "clara-moss"],
  "카페 운영과 품질": ["clara-moss", "noah-brewster"],
  "음료와 레시피": ["noah-brewster", "clara-moss"],
  "커피와 건강": ["clara-moss", "iris-finch"],
};

function stableIndex(value: string, length: number) {
  if (length < 2) return 0;
  let hash = 0;
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % length;
}

export function contributorRefsForArticle(
  article: Article,
): ArticleContributor[] {
  if (article.contributors?.length) return article.contributors;
  const roster = categoryRoster[article.category] ?? ["clara-moss"];
  const id = roster[stableIndex(article.slug, roster.length)];
  const contributor = contributorById.get(id) ?? editorialContributors[0];
  return [contributor];
}

function humanProfile(
  contributor: ArticleContributor,
): ContributorProfile {
  const nameParts = contributor.name
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  const initials =
    nameParts.length > 1
      ? nameParts
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("")
      : (nameParts[0]?.slice(0, 2).toUpperCase() ?? "");

  return {
    ...contributor,
    role: contributor.role ?? "Community Contributor",
    roleKo: "커뮤니티 기여자",
    roleEn: "Community Contributor",
    bioKo:
      "Bean Wiki 계정으로 문서를 작성하고 검토한 커뮤니티 기여자입니다.",
    bioEn:
      "A community contributor who writes and reviews articles with a Bean Wiki account.",
    specialtiesKo: ["문서 작성", "교정", "커뮤니티 검토"],
    specialtiesEn: ["Writing", "Editing", "Community review"],
    accent: "olive",
    monogram: initials.padEnd(2, "W").slice(0, 2),
    baseLevel: 1,
    baseXp: 0,
  };
}

export function contributorProfileFromRef(
  contributor: ArticleContributor,
): ContributorProfile {
  return contributorById.get(contributor.id) ?? humanProfile(contributor);
}

export function contributorProfilesForArticle(
  article: Article,
): ContributorProfile[] {
  return contributorRefsForArticle(article).map(contributorProfileFromRef);
}

export function contributorArticles(
  contributorId: string,
  articles: Article[],
) {
  return articles.filter((article) =>
    contributorRefsForArticle(article).some(
      (contributor) => contributor.id === contributorId,
    ),
  );
}

export function allContributorProfiles(articles: Article[]) {
  const profiles = new Map(
    editorialContributors.map((contributor) => [
      contributor.id,
      contributor,
    ]),
  );
  for (const article of articles) {
    for (const contributor of article.contributors ?? []) {
      if (!profiles.has(contributor.id)) {
        profiles.set(
          contributor.id,
          contributorProfileFromRef(contributor),
        );
      }
    }
  }
  return [...profiles.values()];
}

export function contributorMetrics(
  contributor: ContributorProfile,
  articles: Article[],
) {
  const articleCount = contributorArticles(contributor.id, articles).length;
  if (contributor.kind === "ai") {
    return {
      articleCount,
      level: contributor.baseLevel,
      xp: contributor.baseXp + articleCount * 90,
    };
  }
  const xp = contributor.baseXp + articleCount * 320;
  return {
    articleCount,
    level: Math.max(1, Math.min(20, 1 + Math.floor(xp / 900))),
    xp,
  };
}
