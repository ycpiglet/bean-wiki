"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EMPTY_PROGRESS,
  levelFromXp,
  levelTitle,
  progressBadges,
  PROGRESS_EVENT,
  readProgress,
  touchDailyVisit,
  type LearningProgress,
} from "@/lib/learning-progress";

export function LearningDashboard() {
  const [progress, setProgress] = useState<LearningProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    const sync = () => setProgress(readProgress());
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener("storage", sync);
    const frame = window.requestAnimationFrame(() => {
      touchDailyVisit();
      sync();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const level = levelFromXp(progress.xp);
  const badges = progressBadges(progress);

  return (
    <section className="learning-panel" aria-labelledby="learning-title">
      <div className="learning-level">
        <span>LEVEL {String(level.level).padStart(2, "0")}</span>
        <strong id="learning-title">{levelTitle(level.level)}</strong>
        <p>
          읽고, 풀고, 나눌수록 커피 지식 여정이 쌓입니다. 모든 기록은 이
          브라우저에만 안전하게 저장됩니다.
        </p>
        <div
          className="xp-track"
          role="progressbar"
          aria-label="다음 레벨까지 경험치"
          aria-valuemin={level.currentFloor}
          aria-valuemax={level.nextTarget}
          aria-valuenow={progress.xp}
        >
          <i style={{ width: `${level.percent}%` }} />
        </div>
        <small>
          {progress.xp} XP · 다음 레벨까지 {level.nextTarget - progress.xp} XP
        </small>
      </div>

      <div className="learning-stats">
        <div>
          <strong>{progress.streak}</strong>
          <span>연속 방문일</span>
        </div>
        <div>
          <strong>{progress.seenArticles.length}</strong>
          <span>읽은 문서</span>
        </div>
        <div>
          <strong>{progress.quizCorrect}</strong>
          <span>맞힌 퀴즈</span>
        </div>
        <div>
          <strong>{progress.postsWritten}</strong>
          <span>작성한 글</span>
        </div>
      </div>

      <div className="learning-badges" aria-label="학습 배지">
        {badges.map((badge) => (
          <span
            key={badge.id}
            className={badge.earned ? "is-earned" : ""}
            title={badge.description}
            aria-label={`${badge.label}: ${badge.description}${badge.earned ? ", 획득" : ", 미획득"}`}
          >
            {badge.label}
          </span>
        ))}
      </div>

      <div className="learning-actions">
        <Link href="/quiz">오늘의 퀴즈 +10 XP</Link>
        <Link href="/wiki">새 문서 읽기 +5 XP</Link>
        <Link href="/community">지식 나누기 +20 XP</Link>
      </div>
    </section>
  );
}
