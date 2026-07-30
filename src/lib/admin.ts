// Who counts as staff. This is the job the login allowlists used to do badly:
// GOOGLE_ALLOWED_EMAILS / GITHUB_ALLOWED_LOGINS gated *sign-in*, so opening the
// wiki to readers meant losing the only privilege check. Sign-in is now open
// and privilege is a separate, much smaller list.
//
// ADMIN_EMAILS is a comma-separated list of credential-review admins. It is
// deliberately separate from PLATFORM_OWNER_EMAILS, which controls D1-backed
// platform/operator permissions. profiles.is_admin can additionally promote a
// reviewer from the optional Supabase expertise store.
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
