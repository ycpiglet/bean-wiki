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

type AuthState = "loading" | "authenticated" | "anonymous" | "error";

export function LearningDashboard({
  showAccountAction = true,
  lockWhenSignedOut = false,
}: {
  showAccountAction?: boolean;
  lockWhenSignedOut?: boolean;
}) {
  const [progress, setProgress] = useState<LearningProgress>(EMPTY_PROGRESS);
  const [accountName, setAccountName] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    const controller = new AbortController();
    const sync = () => setProgress(readProgress());
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener("storage", sync);
    const frame = window.requestAnimationFrame(() => {
      touchDailyVisit();
      sync();
      void fetch("/api/me", { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Unable to load account");
          return response.json();
        })
        .then((data: {
          user?: { displayName: string } | null;
          profile?: { xp: number } | null;
          stats?: Record<string, number>;
        }) => {
          if (!data.user) {
            setAuthState("anonymous");
            return;
          }
          setAuthState("authenticated");
          setAccountName(data.user.displayName);
          if (!data.profile) return;
          setProgress((current) => ({
            ...current,
            xp: Math.max(current.xp, data.profile?.xp ?? 0),
            articleViews: Math.max(
              current.articleViews,
              data.stats?.article_view ?? 0,
            ),
            quizCorrect: Math.max(
              current.quizCorrect,
              data.stats?.quiz_correct ?? 0,
            ),
            postsWritten: Math.max(
              current.postsWritten,
              data.stats?.post ?? 0,
            ),
          }));
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setAuthState("error");
        });
    });
    return () => {
      controller.abort();
      window.cancelAnimationFrame(frame);
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const level = levelFromXp(progress.xp);
  const badges = progressBadges(progress);
  const isLocked = lockWhenSignedOut && authState !== "authenticated";
  const gateCopy =
    authState === "loading"
      ? {
          title: "계정 기록을 불러오는 중입니다",
          body: "나의 레벨과 배지를 안전하게 확인하고 있습니다.",
        }
      : authState === "error"
        ? {
            title: "계정 상태를 확인할 수 없습니다",
            body: "계정 페이지에서 로그인 상태를 다시 확인해 주세요.",
          }
        : {
            title: "로그인이 필요합니다",
            body: "경험치, 레벨, 방문·퀴즈·작성 기록은 계정과 연결되는 개인 설정입니다.",
          };

  return (
    <section
      className={`learning-panel ${isLocked ? "is-locked" : ""}`}
      aria-labelledby={isLocked ? "learning-gate-title" : "learning-title"}
    >
      <div
        className="learning-panel-content"
        aria-hidden={isLocked || undefined}
        inert={isLocked}
      >
        <div className="learning-level">
          <span>LEVEL {String(level.level).padStart(2, "0")}</span>
          <strong id="learning-title">{levelTitle(level.level)}</strong>
          <p>
            읽고, 풀고, 나눌수록 커피 지식 여정이 쌓입니다.{" "}
            {accountName
              ? `${accountName}님의 계정과 동기화 중입니다.`
              : "로그인하면 여러 기기에서 기록을 이어갈 수 있습니다."}
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
          {showAccountAction && (
            <Link href="/account">
              {accountName ? "내 계정 보기" : "경험치 동기화"}
            </Link>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="learning-login-gate" role="status">
          <span className="learning-lock-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M7 10V8a5 5 0 0 1 10 0v2M5 10h14v10H5V10Zm7 4v3" />
            </svg>
          </span>
          <span className="trivia-label">ACCOUNT ONLY · 개인 학습 설정</span>
          <strong id="learning-gate-title">{gateCopy.title}</strong>
          <p>{gateCopy.body}</p>
          {authState !== "loading" && (
            <Link href="/account?returnTo=%2F">
              {authState === "error"
                ? "계정 페이지에서 확인하기"
                : "로그인하고 내 여정 보기"}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
