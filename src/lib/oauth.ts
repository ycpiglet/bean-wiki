// OAuth (web application flow) for both identity providers. Plain fetch, no SDK.
//   Google — account sign-in (site-wide identity).       /api/auth/google
//   GitHub — edit-rights link (commit / PR proposals).   /api/auth/github
// Configuration is user-supplied (like CI): AUTH_SECRET plus per-provider
// client id/secret. Until a provider's vars are set, its flow is disabled and
// the editor stays in preview mode.
import type { NextRequest } from "next/server";

export const STATE_COOKIE = "bw_oauth_state";

export function oauthConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_OAUTH_CLIENT_ID &&
      process.env.GITHUB_OAUTH_CLIENT_SECRET &&
      process.env.AUTH_SECRET,
  );
}

export function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.AUTH_SECRET,
  );
}

// The public origin used for the OAuth redirect_uri. Must match the callback
// URL registered on the OAuth app. Overridable for proxied deployments.
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

// ---------------------------------------------------------------------------
// Google (OpenID Connect authorization-code flow)

export function googleCallbackUrl(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function googleAuthorizeUrl(state: string, origin: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
    redirect_uri: googleCallbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, origin: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string,
      code,
      redirect_uri: googleCallbackUrl(origin),
      grant_type: "authorization_code",
    }),
  });
  const json = (await res.json()) as { access_token?: string; error_description?: string };
  if (!json.access_token) throw new Error(json.error_description || "google token exchange failed");
  return json.access_token;
}

export type GoogleUser = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

// The UserInfo endpoint validates the access token server-side, so no local
// JWT verification of the id_token is needed.
export async function fetchGoogleUser(accessToken: string): Promise<GoogleUser> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google user fetch failed: ${res.status}`);
  return (await res.json()) as GoogleUser;
}

// ---------------------------------------------------------------------------
// Allowlists

// An optional comma-separated allowlist of GitHub logins. When unset, any
// authenticated user may link GitHub — but a commit still requires their token
// to have push access to the repo (otherwise the save becomes a PR proposal),
// so this is a convenience gate, not the only one.
export function isAllowedLogin(login: string): boolean {
  return allowed(process.env.GITHUB_ALLOWED_LOGINS, login);
}

// Optional comma-separated allowlist of Google account emails. When unset,
// anyone may sign in — a Google account alone carries no edit rights.
export function isAllowedGoogleEmail(email: string | undefined): boolean {
  const allow = process.env.GOOGLE_ALLOWED_EMAILS;
  if (!allow) return true;
  if (!email) return false;
  return allowed(allow, email);
}

function allowed(list: string | undefined, value: string): boolean {
  if (!list) return true;
  return list
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(value.toLowerCase());
}

// Reject off-site / protocol-relative returnTo values (open-redirect guard).
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
