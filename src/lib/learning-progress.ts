export const PROGRESS_STORAGE_KEY = "bean-wiki-learning-v1";
export const PROGRESS_EVENT = "bean-wiki-progress";

export type LearningProgress = {
  xp: number;
  visits: number;
  articleViews: number;
  quizCorrect: number;
  quizAnswered: number;
  quizzesCompleted: number;
  postsWritten: number;
  streak: number;
  lastVisit: string | null;
  seenArticles: string[];
  rewardedQuizQuestions: string[];
  rewards: string[];
};

export const EMPTY_PROGRESS: LearningProgress = {
  xp: 0,
  visits: 0,
  articleViews: 0,
  quizCorrect: 0,
  quizAnswered: 0,
  quizzesCompleted: 0,
  postsWritten: 0,
  streak: 0,
  lastVisit: null,
  seenArticles: [],
  rewardedQuizQuestions: [],
  rewards: [],
};

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const daysBetween = (from: string, to: string) =>
  Math.round(
    (new Date(`${to}T00:00:00`).getTime() -
      new Date(`${from}T00:00:00`).getTime()) /
      86_400_000,
  );

export function readProgress(): LearningProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    return { ...EMPTY_PROGRESS, ...JSON.parse(raw) } as LearningProgress;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function saveProgress(progress: LearningProgress) {
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(
    new CustomEvent<LearningProgress>(PROGRESS_EVENT, { detail: progress }),
  );
  return progress;
}

export function touchDailyVisit() {
  const progress = readProgress();
  const today = localDate();
  if (progress.lastVisit === today) return { progress, awarded: 0 };
  if (progress.lastVisit && progress.lastVisit > today) {
    return { progress, awarded: 0 };
  }

  const gap = progress.lastVisit ? daysBetween(progress.lastVisit, today) : 0;
  const streak = gap === 1 ? progress.streak + 1 : 1;
  const next = saveProgress({
    ...progress,
    xp: progress.xp + 2,
    visits: progress.visits + 1,
    streak,
    lastVisit: today,
  });
  return { progress: next, awarded: 2 };
}

export function recordArticleView(slug: string) {
  const progress = readProgress();
  const firstView = !progress.seenArticles.includes(slug);
  const next = saveProgress({
    ...progress,
    xp: progress.xp + (firstView ? 5 : 0),
    articleViews: progress.articleViews + (firstView ? 1 : 0),
    seenArticles: firstView
      ? [...progress.seenArticles, slug]
      : progress.seenArticles,
  });
  return { progress: next, awarded: firstView ? 5 : 0 };
}

export function recordQuizAnswer(questionId: string, correct: boolean) {
  const progress = readProgress();
  const firstCorrect =
    correct && !progress.rewardedQuizQuestions.includes(questionId);
  const next = saveProgress({
    ...progress,
    xp: progress.xp + (firstCorrect ? 10 : 0),
    quizCorrect: progress.quizCorrect + (correct ? 1 : 0),
    quizAnswered: progress.quizAnswered + 1,
    rewardedQuizQuestions: firstCorrect
      ? [...progress.rewardedQuizQuestions, questionId]
      : progress.rewardedQuizQuestions,
  });
  return { progress: next, awarded: firstCorrect ? 10 : 0 };
}

export function recordQuizCompletion(sessionId: string) {
  const progress = readProgress();
  const rewardKey = `quiz-session:${sessionId}`;
  const rewarded = !progress.rewards.includes(rewardKey);
  const next = saveProgress({
    ...progress,
    xp: progress.xp + (rewarded ? 15 : 0),
    quizzesCompleted: progress.quizzesCompleted + 1,
    rewards: rewarded ? [...progress.rewards, rewardKey] : progress.rewards,
  });
  return { progress: next, awarded: rewarded ? 15 : 0 };
}

export function recordPostWritten(postId: string) {
  const progress = readProgress();
  const today = localDate();
  const dailyPrefix = `post:${today}:`;
  const rewardedToday = progress.rewards.filter((key) =>
    key.startsWith(dailyPrefix),
  ).length;
  const rewardKey = `${dailyPrefix}${postId}`;
  const rewarded =
    rewardedToday < 3 && !progress.rewards.includes(rewardKey);
  const next = saveProgress({
    ...progress,
    xp: progress.xp + (rewarded ? 20 : 0),
    postsWritten: progress.postsWritten + 1,
    rewards: rewarded ? [...progress.rewards, rewardKey] : progress.rewards,
  });
  return { progress: next, awarded: rewarded ? 20 : 0 };
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xp >= level * (level + 1) * 50) level += 1;
  const currentFloor = (level - 1) * level * 50;
  const nextTarget = level * (level + 1) * 50;
  return {
    level,
    currentFloor,
    nextTarget,
    percent: Math.min(
      100,
      Math.round(((xp - currentFloor) / (nextTarget - currentFloor)) * 100),
    ),
  };
}

export function levelTitle(level: number) {
  if (level >= 10) return "커피 아카이비스트";
  if (level >= 7) return "커피 연구자";
  if (level >= 5) return "감각 설계자";
  if (level >= 3) return "브루잉 탐험가";
  if (level >= 2) return "호기심 많은 테이스터";
  return "첫 잔을 든 독자";
}

export function progressBadges(progress: LearningProgress) {
  return [
    {
      id: "first-visit",
      label: "첫 모금",
      description: "첫 학습 방문",
      earned: progress.visits >= 1,
    },
    {
      id: "explorer",
      label: "탐험가",
      description: "서로 다른 문서 5편 읽기",
      earned: progress.seenArticles.length >= 5,
    },
    {
      id: "quiz",
      label: "정답 수집가",
      description: "퀴즈 10문항 맞히기",
      earned: progress.quizCorrect >= 10,
    },
    {
      id: "streak",
      label: "꾸준한 한 잔",
      description: "3일 연속 방문",
      earned: progress.streak >= 3,
    },
    {
      id: "writer",
      label: "지식 나눔",
      description: "커뮤니티 글 작성",
      earned: progress.postsWritten >= 1,
    },
  ];
}
