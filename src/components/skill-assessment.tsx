"use client";

// 10-question skill check. Questions arrive without answer keys and grading
// happens on the server, so the result screen only learns what was right after
// submitting.
import { useState } from "react";
import Link from "next/link";
import { SKILL_TIER_LABEL, type SkillTier } from "@/lib/profile-store";

type Question = {
  id: string;
  level: string;
  category: string;
  question: string;
  choices: string[];
};

type Result = {
  correct: number;
  total: number;
  percent: number;
  skillTier: SkillTier;
  results: {
    id: string;
    correct: boolean;
    answer: number;
    explanation: string;
    source: string;
    sourceLabel: string;
  }[];
};

type Phase =
  | { kind: "intro" }
  | { kind: "loading" }
  | { kind: "running"; questions: Question[]; index: number; answers: Record<string, number> }
  | { kind: "grading" }
  | { kind: "done"; result: Result; questions: Question[] }
  | { kind: "error"; message: string };

export function SkillAssessment({
  tier,
  attempts,
  bestPct,
}: {
  tier: SkillTier;
  attempts: number;
  bestPct: number;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });

  async function start() {
    setPhase({ kind: "loading" });
    try {
      const res = await fetch("/api/profile/assessment");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.questions)) {
        setPhase({ kind: "error", message: data.message ?? `HTTP ${res.status}` });
        return;
      }
      setPhase({ kind: "running", questions: data.questions, index: 0, answers: {} });
    } catch (error) {
      setPhase({
        kind: "error",
        message: error instanceof Error ? error.message : "network error",
      });
    }
  }

  async function pick(questionId: string, choice: number) {
    if (phase.kind !== "running") return;
    const answers = { ...phase.answers, [questionId]: choice };
    const next = phase.index + 1;
    if (next < phase.questions.length) {
      setPhase({ ...phase, index: next, answers });
      return;
    }

    const questions = phase.questions;
    setPhase({ kind: "grading" });
    try {
      const res = await fetch("/api/profile/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhase({ kind: "error", message: data.message ?? `HTTP ${res.status}` });
        return;
      }
      setPhase({ kind: "done", result: data as Result, questions });
    } catch (error) {
      setPhase({
        kind: "error",
        message: error instanceof Error ? error.message : "network error",
      });
    }
  }

  if (phase.kind === "running") {
    const q = phase.questions[phase.index];
    return (
      <div className="acct-assess">
        <div className="acct-assess-head">
          <span className="acct-note">
            {phase.index + 1} / {phase.questions.length} · {q.category} · {q.level}
          </span>
          <div className="acct-assess-bar">
            <i style={{ width: `${(phase.index / phase.questions.length) * 100}%` }} />
          </div>
        </div>
        <p className="acct-assess-q">{q.question}</p>
        <ul className="acct-assess-choices">
          {q.choices.map((choice, i) => (
            <li key={i}>
              <button type="button" onClick={() => pick(q.id, i)}>
                {choice}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (phase.kind === "done") {
    const { result, questions } = phase;
    const byId = new Map(questions.map((q) => [q.id, q]));
    return (
      <div className="acct-assess">
        <div className="acct-assess-score">
          <strong>
            {result.correct} / {result.total}
          </strong>
          <span className={`acct-tier is-${result.skillTier}`}>
            {SKILL_TIER_LABEL[result.skillTier]}
          </span>
        </div>
        <p className="acct-note">
          최고 기록이 갱신되면 등급이 올라갑니다. 다시 측정해도 등급이 내려가지는 않습니다.
        </p>
        <ul className="acct-assess-review">
          {result.results.map((r) => {
            const q = byId.get(r.id);
            return (
              <li key={r.id} className={r.correct ? "is-ok" : "is-miss"}>
                <span className="acct-assess-mark">{r.correct ? "정답" : "오답"}</span>
                <div>
                  <strong>{q?.question}</strong>
                  {!r.correct && q && <p className="acct-note">정답: {q.choices[r.answer]}</p>}
                  <p>{r.explanation}</p>
                  <Link href={`/wiki/${r.source}`}>{r.sourceLabel} 문서 보기 →</Link>
                </div>
              </li>
            );
          })}
        </ul>
        <button type="button" className="acct-button is-quiet" onClick={start}>
          다시 측정하기
        </button>
      </div>
    );
  }

  return (
    <div className="acct-assess">
      <dl className="acct-facts">
        <div>
          <dt>현재 등급</dt>
          <dd>
            {tier === "unranked" ? (
              "아직 측정하지 않았습니다."
            ) : (
              <span className={`acct-tier is-${tier}`}>{SKILL_TIER_LABEL[tier]}</span>
            )}
          </dd>
        </div>
        {attempts > 0 && (
          <div>
            <dt>측정 기록</dt>
            <dd>
              {attempts}회 · 최고 {bestPct}%
            </dd>
          </div>
        )}
      </dl>
      <p className="acct-note">
        입문 4 · 중급 4 · 전문 2문항을 무작위로 출제하고 서버에서 채점합니다. 50% 중급,
        70% 숙련, 90% 전문가 등급이 됩니다.
      </p>
      {phase.kind === "error" && (
        <p className="acct-inline-err" role="alert">
          {phase.message}
        </p>
      )}
      <button
        type="button"
        className="acct-button"
        onClick={start}
        disabled={phase.kind === "loading" || phase.kind === "grading"}
      >
        {phase.kind === "loading"
          ? "문항 준비 중…"
          : phase.kind === "grading"
            ? "채점 중…"
            : attempts > 0
              ? "다시 측정하기"
              : "실력 측정 시작"}
      </button>
    </div>
  );
}
