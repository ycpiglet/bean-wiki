"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/content/quiz";
import {
  recordQuizAnswer,
  recordQuizCompletion,
} from "@/lib/learning-progress";

// Client-side quiz. Questions arrive prebuilt from the server (SSG) so the
// answer key ships with the page — this is a learning aid, not an exam, so
// that trade-off is intentional and keeps the site fully static.
type Filter = "오늘의 5문항" | "전체" | "입문" | "중급" | "전문";
const FILTERS: Filter[] = ["오늘의 5문항", "전체", "입문", "중급", "전문"];

export function QuizRunner({ questions }: { questions: QuizQuestion[] }) {
  const [filter, setFilter] = useState<Filter>("오늘의 5문항");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const pool = useMemo(
    () => {
      if (filter === "전체") return questions;
      if (filter === "오늘의 5문항") {
        const today = new Date().toLocaleDateString("sv-SE");
        const seed = [...today].reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return Array.from(
          { length: Math.min(5, questions.length) },
          (_, offset) => questions[(seed + offset * 7) % questions.length],
        );
      }
      return questions.filter((q) => q.level === filter);
    },
    [questions, filter],
  );

  const current = pool[index];
  const isLast = index >= pool.length - 1;

  function reset(nextFilter: Filter = filter) {
    setFilter(nextFilter);
    setIndex(0);
    setPicked(null);
    setScore({ correct: 0, answered: 0 });
    setDone(false);
    setEarnedXp(0);
  }

  function choose(choiceIndex: number) {
    if (picked !== null) return;
    setPicked(choiceIndex);
    const correct = choiceIndex === current.answer;
    const { awarded } = recordQuizAnswer(current.id, correct);
    setEarnedXp((value) => value + awarded);
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      answered: s.answered + 1,
    }));
  }

  function next() {
    if (isLast) {
      const today = new Date().toLocaleDateString("sv-SE");
      const { awarded } = recordQuizCompletion(`${today}:${filter}`);
      setEarnedXp((value) => value + awarded);
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  const percent = score.answered ? Math.round((score.correct / score.answered) * 100) : 0;

  return (
    <div className="quiz">
      <div className="quiz-filters" role="group" aria-label="난이도 선택">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={filter === option ? "is-active" : ""}
            aria-pressed={filter === option}
            onClick={() => reset(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {done || !current ? (
        <div className="quiz-result">
          <span className="quiz-result-label">결과</span>
          <strong>
            {score.correct} / {score.answered}
          </strong>
          <p>
            {percent >= 80
              ? "훌륭합니다. 전문 난이도 문항도 도전해 보세요."
              : percent >= 50
                ? "좋은 출발입니다. 틀린 문항의 해설 문서를 읽어 보세요."
                : "해설의 관련 문서를 먼저 읽고 다시 도전해 보세요."}
          </p>
          <div className="quiz-xp-earned">
            이번 학습에서 <strong>+{earnedXp} XP</strong>
          </div>
          <button type="button" className="quiz-restart" onClick={() => reset()}>
            다시 풀기
          </button>
        </div>
      ) : (
        <div className="quiz-card">
          <div className="quiz-meta">
            <span className={`quiz-level accent-${current.accent}`}>{current.level}</span>
            <span className="quiz-category">{current.category}</span>
            <span className="quiz-progress" aria-live="polite">
              {index + 1} / {pool.length}
            </span>
          </div>

          <h2 className="quiz-question">{current.question}</h2>

          <ul className="quiz-choices">
            {current.choices.map((choice, i) => {
              const isAnswer = i === current.answer;
              const state =
                picked === null ? "" : isAnswer ? "is-correct" : picked === i ? "is-wrong" : "";
              return (
                <li key={choice}>
                  <button
                    type="button"
                    className={`quiz-choice ${state}`}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                  >
                    <span className="quiz-choice-mark" aria-hidden="true">
                      {picked === null ? String.fromCharCode(65 + i) : isAnswer ? "✓" : picked === i ? "✕" : ""}
                    </span>
                    {choice}
                  </button>
                </li>
              );
            })}
          </ul>

          {picked !== null && (
            <div className="quiz-explain" role="status">
              <strong>{picked === current.answer ? "정답입니다" : "아쉽습니다"}</strong>
              <p>{current.explanation}</p>
              <Link href={`/wiki/${current.source}`}>더 읽기 · {current.sourceLabel} →</Link>
            </div>
          )}

          <div className="quiz-actions">
            <div>
              <span className="quiz-score">
                맞힘 {score.correct} / 푼 문항 {score.answered}
              </span>
              <span className="quiz-live-xp">+{earnedXp} XP</span>
            </div>
            <button
              type="button"
              className="quiz-next"
              onClick={next}
              disabled={picked === null}
            >
              {isLast ? "결과 보기" : "다음 문항"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
