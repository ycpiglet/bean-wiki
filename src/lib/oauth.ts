// GitHub OAuth (web application flow) for editor login. Plain fetch, no SDK.
// Configuration is user-supplied (like CI): GITHUB_OAUTH_CLIENT_ID,
// GITHUB_OAUTH_CLIENT_SECRET, AUTH_SECRET; optional GITHUB_ALLOWED_LOGINS and
// GITHUB_OAUTH_SCOPE. Until these are set, login is disabled and the editor
// stays in preview mode.
import type { NextRequest } from "next/server";

export const STATE_COOKIE = "bw_oauth_state";

export function oauthConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_OAUTH_CLIENT_ID &&
      process.env.GITHUB_OAUTH_CLIENT_SECRET &&
      process.env.AUTH_SECRET,
  );
}

// The public origin used for the OAuth redirect_uri. Must match the callback
// URL registered on the GitHub OAuth app. Overridable for proxied deployments.
export function getOrigin(req: NextRequest): string {
  return process.env.AUTH_ORIGIN || req.nextUrl.origin;
}

export function callbackUrl(origin: string): string {
  return `${origin}/api/auth/github/callback`;
}

export function authorizeUrl(state: string, origin: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_OAUTH_CLIENT_ID as string,
    redirect_uri: callbackUrl(origin),
    scope: process.env.GITHUB_OAUTH_SCOPE || "public_repo read:user",
    state,
    allow_signup: "false",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, origin: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl(origin),
    }),
  });
  const json = (await res.json()) as { access_token?: string; error_description?: string };
  if (!json.access_token) throw new Error(json.error_description || "token exchange failed");
  return json.access_token;
}

export async function fetchGitHubUser(
  token: string,
): Promise<{ login: string; name: string | null; avatar: string | null }> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "bean-wiki-editor",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status}`);
  const json = (await res.json()) as { login: string; name: string | null; avatar_url: string | null };
  return { login: json.login, name: json.name, avatar: json.avatar_url };
}

// An optional comma-separated allowlist of GitHub logins. When unset, any
// authenticated user may log in — but a commit still requires their token to
// have push access to the repo, so this is a convenience gate, not the only one.
export function isAllowedLogin(login: string): boolean {
  const allow = process.env.GITHUB_ALLOWED_LOGINS;
  if (!allow) return true;
  return allow
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(login.toLowerCase());
}

// Reject off-site / protocol-relative returnTo values (open-redirect guard).
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
