// Operator roles.
//
// The site already had two env allowlists (GOOGLE_ALLOWED_EMAILS,
// GITHUB_ALLOWED_LOGINS) but they answer "may this person sign in / edit", not
// "may this person read site-wide metrics or approve a request". Those are
// different questions, so operator roles live on the D1 `profiles.role`.
// Supabase also has a `profiles.role`, but that value is a coffee vocation
// (barista, roaster, and so on), never an authorization decision.
//
// PLATFORM_OWNER_EMAILS bootstraps the first owners; without it a fresh
// database has no one who can grant roles.

import { getD1 } from "../../db";
import { getRuntimeBindings } from "../../platform/runtime-bindings";

export const ROLES = ["reader", "editor", "admin", "owner"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = {
  reader: 0,
  editor: 1,
  admin: 2,
  owner: 3,
};

export function roleAtLeast(actual: Role, required: Role): boolean {
  return RANK[actual] >= RANK[required];
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

function bootstrapOwners(): string[] {
  const raw =
    getRuntimeBindings().PLATFORM_OWNER_EMAILS ??
    process.env.PLATFORM_OWNER_EMAILS ??
    "";
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolves the effective operator role for an account key (normally a
 * lowercased email). This intentionally does not query the optional Supabase
 * expertise profile, so pausing Supabase cannot grant or revoke platform
 * permissions.
 *
 * The env bootstrap wins over the stored row so an operator locked out by a bad
 * role edit can always recover by setting PLATFORM_OWNER_EMAILS.
 */
export async function resolveRole(accountKey: string | null): Promise<Role> {
  if (!accountKey) return "reader";
  const key = accountKey.toLowerCase();
  if (bootstrapOwners().includes(key)) return "owner";
  try {
    const row = await getD1()
      .prepare(`SELECT role FROM profiles WHERE email = ?`)
      .bind(key)
      .first<{ role: string }>();
    const role = row?.role ?? "reader";
    return isRole(role) ? role : "reader";
  } catch {
    // Storage unbound: deny elevated access rather than assume it.
    return "reader";
  }
}
