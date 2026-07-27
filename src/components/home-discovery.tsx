"use client";

import Link from "next/link";
import type { FocusEvent } from "react";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import type { QuizQuestion } from "@/content/quiz";
import type { TriviaItem } from "@/content/trivia";
import { recordQuizAnswer } from "@/lib/learning-progress";
import { useAutoplayState } from "@/lib/use-autoplay-state";

type HomeDiscoveryProps = {
  items: TriviaItem[];
  questions: QuizQuestion[];
};

type AnswerState = {
  questionId: string;
  choiceIndex: number;
  earnedXp: number;
};

function dailyQuestionIndex(length: number) {
  if (!length) return 0;
  const date = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const seed = [...date].reduce((sum, character) => {
    return sum + character.charCodeAt(0);
  }, 0);
  return seed % length;
}

export function HomeDiscovery({ items, questions }: HomeDiscoveryProps) {
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const { allowed: autoplayAllowed, reducedMotion } = useAutoplayState();

  const subscribeToDay = useCallback((onChange: () => void) => {
    const timer = window.setInterval(onChange, 60_000);
    document.addEventListener("visibilitychange", onChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, []);

  const readDailyQuestion = useCallback(
    () => dailyQuestionIndex(questions.length),
    [questions.length],
  );

  const questionIndex = useSyncExternalStore(
    subscribeToDay,
    readDailyQuestion,
    () => 0,
  );

  useEffect(() => {
    if (exitingIndex === null) return;
    const timer = window.setTimeout(() => setExitingIndex(null), 520);
    return () => window.clearTimeout(timer);
  }, [exitingIndex]);

  const moveTrivia = useCallback(
    (delta: 1 | -1, shouldAnnounce = false) => {
      if (items.length < 2 || exitingIndex !== null) return;
      const nextIndex =
        (triviaIndex + delta + items.length) % items.length;
      setDirection(delta === 1 ? "forward" : "backward");
      if (!reducedMotion) setExitingIndex(triviaIndex);
      setTriviaIndex(nextIndex);
      if (shouldAnnounce) {
        setAnnouncement(
          `${nextIndex + 1}번째 이야기: ${items[nextIndex].title}`,
        );
      }
    },
    [exitingIndex, items, reducedMotion, triviaIndex],
  );

  useEffect(() => {
    if (
      !autoplayAllowed ||
      paused ||
      interacting ||
      items.length < 2 ||
      exitingIndex !== null
    ) {
      return;
    }

    const timer = window.setInterval(() => moveTrivia(1), 7200);
    return () => window.clearInterval(timer);
  }, [
    autoplayAllowed,
    exitingIndex,
    interacting,
    items.length,
    moveTrivia,
    paused,
  ]);

  if (!items.length || !questions.length) return null;

  const currentTrivia = items[triviaIndex];
  const exitingTrivia =
    exitingIndex === null ? null : items[exitingIndex];
  const currentQuestion = questions[questionIndex] ?? questions[0];
  const picked =
    answer?.questionId === currentQuestion.id ? answer.choiceIndex : null;
  const earnedXp =
    answer?.questionId === currentQuestion.id ? answer.earnedXp : 0;

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setInteracting(false);
    }
  }

  function chooseAnswer(choiceIndex: number) {
    if (picked !== null) return;
    const correct = choiceIndex === currentQuestion.answer;
    const { awarded } = recordQuizAnswer(currentQuestion.id, correct);
    setAnswer({
      questionId: currentQuestion.id,
      choiceIndex,
      earnedXp: awarded,
    });
  }

  return (
    <section className="home-discovery shell" id="trivia">
      <div className="section-heading home-discovery-heading">
        <div>
          <span className="section-index">DAILY DISCOVERY</span>
          <h2>알고 계셨나요?</h2>
        </div>
        <p>
          한 가지 흥미로운 이야기와 오늘의 한 문제로 커피 지식을 가볍게
          시작하세요.
        </p>
      </div>

      <div className="home-discovery-grid">
        <article
          className={`home-fact accent-${currentTrivia.accent}`}
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={handleBlur}
        >
          <header className="home-fact-head">
            <span className="trivia-label">
              DID YOU KNOW? · {currentTrivia.label}
            </span>
            <div className="home-fact-arrows">
              <button
                type="button"
                aria-label="이전 이야기"
                disabled={exitingIndex !== null}
                onClick={() => moveTrivia(-1, true)}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="다음 이야기"
                disabled={exitingIndex !== null}
                onClick={() => moveTrivia(1, true)}
              >
                →
              </button>
            </div>
          </header>

          <div className="home-fact-viewport">
            {exitingTrivia && (
              <div
                className={`home-fact-panel is-exiting is-${direction}`}
                aria-hidden="true"
              >
                <strong>{exitingTrivia.title}</strong>
                <p>{exitingTrivia.body}</p>
              </div>
            )}
            <div
              className={`home-fact-panel is-current ${
                exitingTrivia ? `is-entering is-${direction}` : ""
              }`}
            >
              <strong>{currentTrivia.title}</strong>
              <p>{currentTrivia.body}</p>
              {currentTrivia.related && (
                <Link href={`/wiki/${currentTrivia.related}`}>
                  이어서 읽기 · {currentTrivia.relatedLabel} →
                </Link>
              )}
            </div>
          </div>

          <footer className="home-fact-footer">
            <span>
              {String(triviaIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
            {reducedMotion ? (
              <span className="motion-status">자동 전환 꺼짐</span>
            ) : (
              <button
                type="button"
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? "자동 재생" : "일시정지"}
              </button>
            )}
          </footer>
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
        </article>

        <article className="home-daily-quiz">
          <header className="home-quiz-head">
            <div>
              <span className="trivia-label">TODAY&apos;S QUIZ · +10 XP</span>
              <strong>오늘의 한 문제</strong>
            </div>
            <span className={`quiz-level accent-${currentQuestion.accent}`}>
              {currentQuestion.level} · {currentQuestion.category}
            </span>
          </header>

          <h3>{currentQuestion.question}</h3>
          <ol className="home-quiz-choices">
            {currentQuestion.choices.map((choice, choiceIndex) => {
              const isAnswer = choiceIndex === currentQuestion.answer;
              const state =
                picked === null
                  ? ""
                  : isAnswer
                    ? "is-correct"
                    : picked === choiceIndex
                      ? "is-wrong"
                      : "";

              return (
                <li key={choice}>
                  <button
                    type="button"
                    className={state}
                    aria-label={
                      picked === null
                        ? `${String.fromCharCode(65 + choiceIndex)}. ${choice}`
                        : isAnswer
                          ? `정답: ${choice}`
                          : picked === choiceIndex
                            ? `선택한 오답: ${choice}`
                            : choice
                    }
                    disabled={picked !== null}
                    onClick={() => chooseAnswer(choiceIndex)}
                  >
                    <span aria-hidden="true">
                      {picked === null
                        ? String.fromCharCode(65 + choiceIndex)
                        : isAnswer
                          ? "✓"
                          : picked === choiceIndex
                            ? "✕"
                            : ""}
                    </span>
                    {choice}
                  </button>
                </li>
              );
            })}
          </ol>

          {picked !== null && (
            <div className="home-quiz-feedback" role="status">
              <strong>
                {picked === currentQuestion.answer
                  ? `정답입니다${earnedXp ? ` · +${earnedXp} XP` : ""}`
                  : `아쉽습니다. 정답은 “${currentQuestion.choices[currentQuestion.answer]}”입니다.`}
              </strong>
              <p>{currentQuestion.explanation}</p>
              <Link href={`/wiki/${currentQuestion.source}`}>
                근거 문서 · {currentQuestion.sourceLabel} →
              </Link>
            </div>
          )}

          <Link href="/quiz" className="home-quiz-more">
            전체 커피 퀴즈 더 풀기 →
          </Link>
        </article>
      </div>
    </section>
  );
}
