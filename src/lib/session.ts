// Encrypted, httpOnly session cookie. Two layers live in one cookie:
//   user   — the account identity (Google or GitHub sign-in). Site-wide login.
//   github — an optional GitHub *link* that carries the access token used to
//            attribute commits. Editing (commit / PR proposal) requires it.
// The payload includes an access token, so it is AES-256-GCM encrypted with a
// key derived from AUTH_SECRET — never a plain signed JWT. Node runtime only
// (uses node:crypto and next/headers cookies).
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "bw_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  provider: "google" | "github";
  id: string; // google `sub` or github login
  name: string;
  email?: string;
  avatar?: string;
};

export type GitHubLink = {
  login: string;
  name?: string;
  avatar?: string;
  token: string;
};

export type Session = {
  v: 2;
  user: SessionUser;
  github?: GitHubLink;
  exp: number; // unix seconds
};

// Pre-v2 sessions were GitHub-only and flat: { login, name, avatar, token, exp }.
type LegacySession = {
  login: string;
  name: string;
  avatar?: string;
  token: string;
  exp: number;
};

function key(): Buffer | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

export function authConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET);
}

export function encryptSession(session: Session): string | null {
  const k = key();
  if (!k) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const plaintext = Buffer.from(JSON.stringify(session), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSession(value: string): Session | null {
  const k = key();
  if (!k) return null;
  try {
    const raw = Buffer.from(value, "base64url");
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    const parsed = JSON.parse(decrypted.toString("utf8")) as Session | LegacySession;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if ("v" in parsed && parsed.v === 2) return parsed;
    // Migrate a legacy GitHub-only cookie so existing logins survive the upgrade.
    if ("login" in parsed && "token" in parsed) {
      return {
        v: 2,
        user: {
          provider: "github",
          id: parsed.login,
          name: parsed.name || parsed.login,
          avatar: parsed.avatar,
        },
        github: {
          login: parsed.login,
          name: parsed.name,
          avatar: parsed.avatar,
          token: parsed.token,
        },
        exp: parsed.exp,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function expiry(): number {
  return Math.floor(Date.now() / 1000) + MAX_AGE;
}

// Google sign-in: (re)set the account layer, keep any existing GitHub link.
export function newGoogleSession(
  user: { sub: string; name?: string | null; email?: string | null; picture?: string | null },
  existing: Session | null,
): Session {
  return {
    v: 2,
    user: {
      provider: "google",
      id: user.sub,
      name: user.name || user.email || "Google user",
      email: user.email || undefined,
      avatar: user.picture || undefined,
    },
    github: existing?.github,
    exp: expiry(),
  };
}

// GitHub sign-in / link: attach the edit-rights layer. When a session already
// exists (e.g. Google account), keep its account identity; otherwise GitHub
// becomes the account too.
export function linkGitHub(
  gh: { login: string; name?: string | null; avatar?: string | null; token: string },
  existing: Session | null,
): Session {
  const link: GitHubLink = {
    login: gh.login,
    name: gh.name || undefined,
    avatar: gh.avatar || undefined,
    token: gh.token,
  };
  return {
    v: 2,
    user:
      existing?.user ??
      ({
        provider: "github",
        id: gh.login,
        name: gh.name || gh.login,
        avatar: gh.avatar || undefined,
      } satisfies SessionUser),
    github: link,
    exp: existing?.exp ?? expiry(),
  };
}

// Drop the GitHub link but keep the account signed in. Returns null when the
// account *is* the GitHub identity (unlinking would leave an empty session).
export function unlinkGitHub(existing: Session): Session | null {
  if (existing.user.provider === "github") return null;
  return { ...existing, github: undefined };
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

// Read the current session from the request cookies (Route Handler / Server
// Component context). Returns null when unauthenticated or misconfigured.
export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return decryptSession(value);
}
