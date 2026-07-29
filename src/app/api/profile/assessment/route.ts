// Skill assessment. GET hands out a sampled question set with the answer keys
// stripped; POST receives the picked choices and grades them here, on the
// server, so a client cannot simply post a perfect score.
//
// Honest limit: the quiz bank ships to the browser for the public /quiz page, so
// a determined reader can look answers up. The tier is therefore a
// self-calibration aid — verified credentials, reviewed by an admin, are what
// actually vouch for expertise.
import type { NextRequest } from "next/server";
import { quiz } from "@/content/quiz";
import { getPlatformUser } from "@/lib/platform-auth";
import { crossOriginBlocked } from "@/lib/same-origin";
import {
  ProfileStoreError,
  getOrCreateProfile,
  profileStoreConfigured,
  recordAssessment,
} from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SET_SIZE = 10;

type QuizLevel = (typeof quiz)[number]["level"];

// A spread across levels so the score means something: mostly 입문/중급 with a
// couple of 전문 questions to separate the top tiers.
const MIX: { level: QuizLevel; count: number }[] = [
  { level: "입문", count: 4 },
  { level: "중급", count: 4 },
  { level: "전문", count: 2 },
];

function sample<T>(items: T[], n: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function buildSet() {
  const picked = MIX.flatMap(({ level, count }) =>
    sample(
      quiz.filter((q) => q.level === level),
      count,
    ),
  );
  // Top up from the whole bank if a level is thin.
  if (picked.length < SET_SIZE) {
    const ids = new Set(picked.map((q) => q.id));
    picked.push(...sample(quiz.filter((q) => !ids.has(q.id)), SET_SIZE - picked.length));
  }
  return picked.slice(0, SET_SIZE);
}

export async function GET() {
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });

  const questions = buildSet().map((q) => ({
    id: q.id,
    level: q.level,
    category: q.category,
    question: q.question,
    choices: q.choices,
  }));
  return Response.json({ questions, total: questions.length });
}

export async function POST(req: NextRequest) {
  const blockedOrigin = crossOriginBlocked(req);
  if (blockedOrigin) return blockedOrigin;
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (!profileStoreConfigured()) {
    return Response.json(
      { error: "store_not_configured", message: "프로필 저장소가 설정되지 않았습니다." },
      { status: 501 },
    );
  }

  let raw: { answers?: Record<string, number> };
  try {
    raw = (await req.json()) as typeof raw;
  } catch {
    return Response.json({ error: "bad_request", message: "invalid JSON body" }, { status: 400 });
  }

  const answers = raw.answers ?? {};
  const ids = Object.keys(answers);
  if (ids.length === 0) {
    return Response.json({ error: "invalid", message: "답안이 비어 있습니다." }, { status: 422 });
  }
  if (ids.length > SET_SIZE) {
    return Response.json(
      { error: "invalid", message: `한 번에 최대 ${SET_SIZE}문항까지 채점합니다.` },
      { status: 422 },
    );
  }

  type Graded = { id: string; correct: boolean; level: QuizLevel };
  const byId = new Map(quiz.map((q) => [q.id, q]));
  const graded: Graded[] = [];
  for (const id of ids) {
    const q = byId.get(id);
    if (!q) continue; // unknown id: ignore rather than fail the whole submission
    graded.push({ id, correct: q.answer === Number(answers[id]), level: q.level });
  }

  if (graded.length === 0) {
    return Response.json({ error: "invalid", message: "알 수 없는 문항입니다." }, { status: 422 });
  }

  const correct = graded.filter((g) => g.correct).length;
  const hardest = graded.some((g) => g.level === "전문")
    ? "전문"
    : graded.some((g) => g.level === "중급")
      ? "중급"
      : "입문";

  try {
    await getOrCreateProfile(user);
    const profile = await recordAssessment(user.accountKey, {
      correct,
      total: graded.length,
      level: hardest,
    });
    return Response.json({
      correct,
      total: graded.length,
      percent: Math.round((correct / graded.length) * 100),
      skillTier: profile.skill_tier,
      profile,
      // Per-question feedback so the result screen can explain misses.
      results: graded.map((g) => {
        const q = byId.get(g.id)!;
        return {
          id: g.id,
          correct: g.correct,
          answer: q.answer,
          explanation: q.explanation,
          source: q.source,
          sourceLabel: q.sourceLabel,
        };
      }),
    });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "assessment failed";
    return Response.json({ error: "store_error", message }, { status });
  }
}
