// Scope grammar: `resource:action[:tier]`
// Deliberately identical to the Beanote contract (BEANOTE-DATA-API-V1.md §8) so
// one mental model covers both directions of the integration.

export const SCOPES = {
  knowledgeRead: "knowledge:read",
  contentRequestsRead: "content-requests:read",
  contentRequestsWrite: "content-requests:write",
  contentRequestsTriage: "content-requests:triage",
  contributionsWrite: "contributions:write",
  metricsRead: "metrics:read",
  botCommand: "bot:command",
  recommendationsWrite: "recommendations:write",
} as const;

export type Scope = (typeof SCOPES)[keyof typeof SCOPES];

export const ALL_SCOPES: readonly string[] = Object.values(SCOPES);

export const TIERS = ["T0", "T1", "T2", "T3"] as const;
export type Tier = (typeof TIERS)[number];

export function isKnownScope(value: string): boolean {
  return ALL_SCOPES.includes(stripTier(value));
}

function stripTier(scope: string): string {
  const parts = scope.split(":");
  if (parts.length === 3 && (TIERS as readonly string[]).includes(parts[2])) {
    return `${parts[0]}:${parts[1]}`;
  }
  return scope;
}

/**
 * A granted scope satisfies a required scope when the resource and action match
 * and the granted tier is at least the required tier. A grant with no tier
 * satisfies any tier-less requirement only — tier must be granted explicitly so
 * widening never happens by accident.
 */
export function scopeSatisfies(granted: string, required: string): boolean {
  const g = parseScope(granted);
  const r = parseScope(required);
  if (!g || !r) return false;
  if (g.resource !== r.resource || g.action !== r.action) return false;
  if (!r.tier) return true;
  if (!g.tier) return false;
  return tierRank(g.tier) >= tierRank(r.tier);
}

export function grantsScope(granted: readonly string[], required: string): boolean {
  return granted.some((scope) => scopeSatisfies(scope, required));
}

type ParsedScope = { resource: string; action: string; tier: Tier | null };

export function parseScope(scope: string): ParsedScope | null {
  const parts = scope.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const [resource, action, tier] = parts;
  if (!resource || !action) return null;
  if (tier !== undefined && !(TIERS as readonly string[]).includes(tier)) {
    return null;
  }
  return { resource, action, tier: (tier as Tier | undefined) ?? null };
}

function tierRank(tier: Tier): number {
  return TIERS.indexOf(tier);
}

/** Highest tier a client may ever receive, independent of its scope list. */
export function tierWithinCeiling(tier: Tier, ceiling: Tier): boolean {
  return tierRank(tier) <= tierRank(ceiling);
}
