"use client";

import { useEffect, useMemo, useState } from "react";
import {
  recordArticleView,
  recordQuizAnswer,
} from "@/lib/learning-progress";

export function ArticleViewReward({ slug }: { slug: string }) {
  const [awarded, setAwarded] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setAwarded(recordArticleView(slug).awarded);
      }
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [slug]);

  if (!awarded) return null;
  return (
    <div className="article-reward" role="status">
      처음 읽은 문서 · <strong>+{awarded} XP</strong>
    </div>
  );
}

type ArticleQuizProps = {
  slug: string;
  title: string;
  fact: string;
  decoys: string[];
  curated?: {
    id: string;
    question: string;
    choices: string[];
    answer: number;
    explanation: string;
  };
};

function stringHash(value: string) {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 7);
}

export function ArticleQuiz({
  slug,
  title,
  fact,
  decoys,
  curated,
}: ArticleQuizProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const [reward, setReward] = useState(0);
  const choices = useMemo(() => {
    if (curated) {
      return { items: curated.choices, answer: curated.answer };
    }
    const answer = Math.abs(stringHash(slug)) % 4;
    const pool = decoys.filter((item) => item !== fact).slice(0, 3);
    while (pool.length < 3) {
      pool.push("한 가지 변수만으로 모든 커피의 맛과 품질을 설명할 수 있습니다.");
    }
    const result = [...pool];
    result.splice(answer, 0, fact);
    return { items: result, answer };
  }, [curated, decoys, fact, slug]);

  function choose(index: number) {
    if (picked !== null) return;
    setPicked(index);
    const correct = index === choices.answer;
    setReward(
      recordQuizAnswer(curated?.id ?? `article:${slug}`, correct).awarded,
    );
  }

  return (
    <section className="article-quiz" aria-labelledby={`quiz-${slug}`}>
      <div className="article-quiz-heading">
        <span>이 글의 1분 퀴즈</span>
        <small>정답을 맞히면 최초 1회 +10 XP</small>
      </div>
      <h2 id={`quiz-${slug}`}>
        {curated?.question ?? `${title}의 핵심을 가장 잘 설명한 문장은?`}
      </h2>
      <div className="article-quiz-choices">
        {choices.items.map((choice, index) => {
          const state =
            picked === null
              ? ""
              : index === choices.answer
                ? "is-correct"
                : picked === index
                  ? "is-wrong"
                  : "";
          return (
            <button
              type="button"
              key={choice}
              className={state}
              disabled={picked !== null}
              onClick={() => choose(index)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {choice}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="article-quiz-result" role="status">
          <strong>
            {picked === choices.answer ? "정답입니다." : "핵심 한 줄을 다시 확인해 보세요."}
            {reward > 0 && ` +${reward} XP`}
          </strong>
          <p>{curated?.explanation ?? fact}</p>
        </div>
      )}
    </section>
  );
}
