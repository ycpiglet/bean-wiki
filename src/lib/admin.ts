// Who counts as staff. This is the job the login allowlists used to do badly:
// GOOGLE_ALLOWED_EMAILS / GITHUB_ALLOWED_LOGINS gated *sign-in*, so opening the
// wiki to readers meant losing the only privilege check. Sign-in is now open
// and privilege is a separate, much smaller list.
//
// ADMIN_EMAILS is a comma-separated list of account emails. It is the bootstrap
// source of truth (no database round-trip needed to grant the first admin);
// profiles.is_admin can additionally promote someone from the database.
import type { PlatformUser } from "@/lib/platform-auth";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function adminConfigured(): boolean {
  return adminEmails().length > 0;
}

export function isAdminUser(
  user: PlatformUser | null,
  profile?: { is_admin?: boolean } | null,
): boolean {
  if (!user) return false;
  if (profile?.is_admin) return true;
  const email = user.email?.trim().toLowerCase();
  if (!email) return false;
  return adminEmails().includes(email);
}
