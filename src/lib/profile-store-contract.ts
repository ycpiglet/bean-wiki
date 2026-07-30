// Shared, serializable profile-store contract. Client components may import
// this module; database access stays in the server-only profile-store module.
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
export type SkillTier =
  | "unranked"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";
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
  // Coffee vocation/self-description. This is not an authorization role;
  // operator permissions live in the D1-backed src/lib/roles.ts domain.
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

export const SKILL_TIER_LABEL: Record<SkillTier, string> = {
  unranked: "미측정",
  beginner: "입문",
  intermediate: "중급",
  advanced: "숙련",
  expert: "전문가",
};

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
