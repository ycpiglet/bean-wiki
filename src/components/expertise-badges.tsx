// Badges shown beside a profile name: the quiz-derived skill tier plus any
// admin-verified credentials. Pending and rejected credentials never render
// here — only `verified` earns a public badge.
import {
  CREDENTIAL_LABEL,
  SKILL_TIER_LABEL,
  type Credential,
  type SkillTier,
} from "@/lib/profile-store";

function SealIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 3 2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6L4 15.4l1-2.5-1-2.5 2.2-1.6.9-2.6 2.7.2Z" />
      <path d="m9.2 12.3 1.9 1.9 3.7-3.9" />
    </svg>
  );
}

export function SkillTierBadge({ tier }: { tier: SkillTier }) {
  if (tier === "unranked") return null;
  return (
    <span className={`acct-tier is-${tier}`} title="퀴즈 실력 측정 결과">
      {SKILL_TIER_LABEL[tier]}
    </span>
  );
}

export function ExpertiseBadges({
  tier,
  credentials,
}: {
  tier: SkillTier;
  credentials: Credential[];
}) {
  const verified = credentials.filter((c) => c.status === "verified");
  if (tier === "unranked" && verified.length === 0) return null;

  return (
    <span className="acct-badges">
      <SkillTierBadge tier={tier} />
      {verified.map((c) => (
        <span
          key={c.id}
          className="acct-cred-badge"
          title={`${c.title}${c.issuer ? ` · ${c.issuer}` : ""} · 관리자 확인됨`}
        >
          <SealIcon />
          {CREDENTIAL_LABEL[c.kind]}
        </span>
      ))}
    </span>
  );
}
