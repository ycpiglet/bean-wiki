// Account profiles, expertise credentials and skill assessments, stored in
// Supabase Postgres. Plain fetch against PostgREST — no SDK, matching the
// GitHub client in src/lib/github.ts.
//
// Access is server-only: the tables have RLS enabled with no policies, so the
// publishable key can read and write nothing; every call here uses the
// service-role key, which bypasses RLS. Never import this from a client
// component. Until SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set the store
// reports itself unconfigured and the UI degrades to read-only, the same way
// the editor behaves without OAuth credentials.
import type { PlatformUser } from "@/lib/platform-auth";

export type Gender = "female" | "male" | "other" | "undisclosed";
export type CoffeeRole =
  | "enthusiast"
  | "home_brewer"
  | "barista"
  | "roaster"
  | "q_grader"
  | "educator"
  | "producer"
  | "other";
export type SkillTier = "unranked" | "beginner" | "intermediate" | "advanced" | "expert";
export type CredentialStatus = "pending" | "verified" | "rejected";
export type CredentialKind =
  | "sca_barista"
  | "sca_brewing"
  | "sca_roasting"
  | "sca_sensory"
  | "sca_green"
  | "q_grader"
  | "cqi_r_grader"
  | "wbc_competitor"
  | "other";

export type Profile = {
  account_key: string;
  display_name: string;
  nickname: string | null;
  full_name: string | null;
  gender: Gender;
  pronouns: string | null;
  bio: string | null;
  region: string | null;
  website: string | null;
  role: CoffeeRole;
  years_experience: number | null;
  quiz_score: number;
  quiz_attempts: number;
  quiz_best_pct: number;
  skill_tier: SkillTier;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Credential = {
  id: string;
  account_key: string;
  kind: CredentialKind;
  title: string;
  issuer: string | null;
  credential_id: string | null;
  issued_on: string | null;
  expires_on: string | null;
  evidence_url: string | null;
  status: CredentialStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export function profileStoreConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export class ProfileStoreError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = "ProfileStoreError";
  }
}

async function rest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new ProfileStoreError("profile store not configured", 501);

  const { prefer, ...rest } = init;
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...(rest.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // 23505 = unique violation; the only user-correctable one is the nickname.
    if (res.status === 409 || detail.includes("23505")) {
      throw new ProfileStoreError("이미 사용 중인 닉네임입니다.", 409);
    }
    throw new ProfileStoreError(`supabase ${res.status}: ${detail.slice(0, 300)}`, 502);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const PROFILE_COLS =
  "account_key,display_name,nickname,full_name,gender,pronouns,bio,region,website,role,years_experience,quiz_score,quiz_attempts,quiz_best_pct,skill_tier,is_admin,created_at,updated_at";

// Fetch the caller's profile, creating a bare row on first visit so the rest of
// the UI can assume it exists.
export async function getOrCreateProfile(user: PlatformUser): Promise<Profile> {
  const key = encodeURIComponent(user.accountKey);
  const found = await rest<Profile[]>(`profiles?account_key=eq.${key}&select=${PROFILE_COLS}`);
  if (found.length > 0) return found[0];

  const created = await rest<Profile[]>("profiles", {
    method: "POST",
    prefer: "return=representation,resolution=merge-duplicates",
    body: JSON.stringify({
      account_key: user.accountKey,
      display_name: user.displayName,
      full_name: user.fullName,
    }),
  });
  return created[0];
}

// Read-only lookup used where a missing profile should not create one
// (e.g. rendering someone else's byline).
export async function findProfile(accountKey: string): Promise<Profile | null> {
  const rows = await rest<Profile[]>(
    `profiles?account_key=eq.${encodeURIComponent(accountKey)}&select=${PROFILE_COLS}`,
  );
  return rows[0] ?? null;
}

export type ProfilePatch = {
  nickname?: string | null;
  full_name?: string | null;
  gender?: Gender;
  pronouns?: string | null;
  bio?: string | null;
  region?: string | null;
  website?: string | null;
  role?: CoffeeRole;
  years_experience?: number | null;
};

const GENDERS: Gender[] = ["female", "male", "other", "undisclosed"];
const ROLES: CoffeeRole[] = [
  "enthusiast",
  "home_brewer",
  "barista",
  "roaster",
  "q_grader",
  "educator",
  "producer",
  "other",
];
const NICKNAME_RE = /^[\p{L}\p{N}_.-]{2,24}$/u;

// Validate and normalise a user-supplied patch. Skill fields and is_admin are
// deliberately absent: they are server-derived, never client-writable.
export function sanitizeProfilePatch(raw: Record<string, unknown>): {
  patch: ProfilePatch;
  errors: string[];
} {
  const patch: ProfilePatch = {};
  const errors: string[] = [];
  const str = (v: unknown, max: number) => {
    const s = typeof v === "string" ? v.trim() : "";
    return s ? s.slice(0, max) : null;
  };

  if ("nickname" in raw) {
    const n = str(raw.nickname, 24);
    if (n && !NICKNAME_RE.test(n)) {
      errors.push("닉네임은 2~24자의 문자·숫자·_.- 만 쓸 수 있습니다.");
    } else {
      patch.nickname = n;
    }
  }
  if ("full_name" in raw) patch.full_name = str(raw.full_name, 60);
  if ("pronouns" in raw) patch.pronouns = str(raw.pronouns, 30);
  if ("bio" in raw) patch.bio = str(raw.bio, 500);
  if ("region" in raw) patch.region = str(raw.region, 60);
  if ("website" in raw) {
    const w = str(raw.website, 200);
    if (w && !/^https?:\/\//i.test(w)) errors.push("웹사이트는 http(s):// 로 시작해야 합니다.");
    else patch.website = w;
  }
  if ("gender" in raw) {
    const g = String(raw.gender);
    if (GENDERS.includes(g as Gender)) patch.gender = g as Gender;
    else errors.push("성별 값이 올바르지 않습니다.");
  }
  if ("role" in raw) {
    const r = String(raw.role);
    if (ROLES.includes(r as CoffeeRole)) patch.role = r as CoffeeRole;
    else errors.push("역할 값이 올바르지 않습니다.");
  }
  if ("years_experience" in raw) {
    if (raw.years_experience === null || raw.years_experience === "") {
      patch.years_experience = null;
    } else {
      const y = Number(raw.years_experience);
      if (!Number.isInteger(y) || y < 0 || y > 80) errors.push("경력은 0~80년 사이여야 합니다.");
      else patch.years_experience = y;
    }
  }
  return { patch, errors };
}

export async function updateProfile(accountKey: string, patch: ProfilePatch): Promise<Profile> {
  if (Object.keys(patch).length === 0) {
    const current = await findProfile(accountKey);
    if (!current) throw new ProfileStoreError("profile not found", 404);
    return current;
  }
  const rows = await rest<Profile[]>(
    `profiles?account_key=eq.${encodeURIComponent(accountKey)}&select=${PROFILE_COLS}`,
    { method: "PATCH", prefer: "return=representation", body: JSON.stringify(patch) },
  );
  if (rows.length === 0) throw new ProfileStoreError("profile not found", 404);
  return rows[0];
}

// --- Skill assessment -------------------------------------------------------

// Tier from the best score achieved. Using the best (not latest) result keeps a
// bad-luck retry from demoting someone, and the thresholds are wide enough that
// a single lucky guess cannot promote a tier.
export function skillTierFor(bestPct: number, attempts: number): SkillTier {
  if (attempts === 0) return "unranked";
  if (bestPct >= 90) return "expert";
  if (bestPct >= 70) return "advanced";
  if (bestPct >= 50) return "intermediate";
  return "beginner";
}

export const SKILL_TIER_LABEL: Record<SkillTier, string> = {
  unranked: "미측정",
  beginner: "입문",
  intermediate: "중급",
  advanced: "숙련",
  expert: "전문가",
};

// Record a graded attempt and roll the derived skill fields forward.
export async function recordAssessment(
  accountKey: string,
  result: { correct: number; total: number; level?: string | null },
): Promise<Profile> {
  const total = Math.max(1, Math.trunc(result.total));
  const correct = Math.min(total, Math.max(0, Math.trunc(result.correct)));
  const percent = Math.round((correct / total) * 100);

  await rest<unknown>("quiz_attempts", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      account_key: accountKey,
      correct,
      total,
      percent,
      level: result.level ?? null,
    }),
  });

  const current = await findProfile(accountKey);
  if (!current) throw new ProfileStoreError("profile not found", 404);

  const attempts = current.quiz_attempts + 1;
  const bestPct = Math.max(current.quiz_best_pct, percent);
  const rows = await rest<Profile[]>(
    `profiles?account_key=eq.${encodeURIComponent(accountKey)}&select=${PROFILE_COLS}`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify({
        quiz_attempts: attempts,
        quiz_score: current.quiz_score + correct,
        quiz_best_pct: bestPct,
        skill_tier: skillTierFor(bestPct, attempts),
      }),
    },
  );
  return rows[0];
}

// --- Credentials ------------------------------------------------------------

export const CREDENTIAL_LABEL: Record<CredentialKind, string> = {
  sca_barista: "SCA Barista Skills",
  sca_brewing: "SCA Brewing",
  sca_roasting: "SCA Roasting",
  sca_sensory: "SCA Sensory Skills",
  sca_green: "SCA Green Coffee",
  q_grader: "Q Grader",
  cqi_r_grader: "CQI R Grader",
  wbc_competitor: "WBC 출전",
  other: "기타 자격·경력",
};

const CREDENTIAL_KINDS = Object.keys(CREDENTIAL_LABEL) as CredentialKind[];

export async function listCredentials(accountKey: string): Promise<Credential[]> {
  return rest<Credential[]>(
    `credentials?account_key=eq.${encodeURIComponent(accountKey)}&select=*&order=created_at.desc`,
  );
}

// Only verified credentials become public badges.
export async function listVerifiedCredentials(accountKey: string): Promise<Credential[]> {
  return rest<Credential[]>(
    `credentials?account_key=eq.${encodeURIComponent(accountKey)}&status=eq.verified&select=*&order=issued_on.desc`,
  );
}

export function sanitizeCredential(raw: Record<string, unknown>): {
  value: Record<string, unknown>;
  errors: string[];
} {
  const errors: string[] = [];
  const kind = String(raw.kind ?? "");
  if (!CREDENTIAL_KINDS.includes(kind as CredentialKind)) errors.push("자격 종류를 선택해주세요.");

  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 120) : "";
  if (!title) errors.push("자격 이름을 입력해주세요.");

  const url = typeof raw.evidence_url === "string" ? raw.evidence_url.trim() : "";
  if (url && !/^https?:\/\//i.test(url)) errors.push("증빙 링크는 http(s):// 로 시작해야 합니다.");

  const date = (v: unknown) => {
    const s = typeof v === "string" ? v.trim() : "";
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };

  return {
    value: {
      kind,
      title,
      issuer: typeof raw.issuer === "string" ? raw.issuer.trim().slice(0, 120) || null : null,
      credential_id:
        typeof raw.credential_id === "string" ? raw.credential_id.trim().slice(0, 80) || null : null,
      issued_on: date(raw.issued_on),
      expires_on: date(raw.expires_on),
      evidence_url: url || null,
    },
    errors,
  };
}

export async function addCredential(
  accountKey: string,
  value: Record<string, unknown>,
): Promise<Credential> {
  const rows = await rest<Credential[]>("credentials", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({ ...value, account_key: accountKey, status: "pending" }),
  });
  return rows[0];
}

export async function deleteCredential(accountKey: string, id: string): Promise<void> {
  await rest<unknown>(
    `credentials?id=eq.${encodeURIComponent(id)}&account_key=eq.${encodeURIComponent(accountKey)}`,
    { method: "DELETE", prefer: "return=minimal" },
  );
}

// --- Admin review -----------------------------------------------------------

export async function listPendingCredentials(): Promise<Credential[]> {
  return rest<Credential[]>("credentials?status=eq.pending&select=*&order=created_at.asc");
}

export async function reviewCredential(
  id: string,
  status: "verified" | "rejected",
  reviewer: string,
  note?: string | null,
): Promise<Credential> {
  const rows = await rest<Credential[]>(`credentials?id=eq.${encodeURIComponent(id)}&select=*`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({
      status,
      reviewed_by: reviewer,
      reviewed_at: new Date().toISOString(),
      review_note: note?.trim() ? note.trim().slice(0, 500) : null,
    }),
  });
  if (rows.length === 0) throw new ProfileStoreError("credential not found", 404);
  return rows[0];
}
