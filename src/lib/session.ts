// Encrypted, httpOnly session cookie for the editor. The payload includes the
// logged-in GitHub user's access token (used to attribute commits), so it is
// AES-256-GCM encrypted with a key derived from AUTH_SECRET — never a plain
// signed JWT. Node runtime only (uses node:crypto and next/headers cookies).
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "bw_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = {
  login: string;
  name: string;
  avatar?: string;
  token: string;
  exp: number; // unix seconds
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
    const session = JSON.parse(decrypted.toString("utf8")) as Session;
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function newSession(user: {
  login: string;
  name?: string | null;
  avatar?: string | null;
  token: string;
}): Session {
  return {
    login: user.login,
    name: user.name || user.login,
    avatar: user.avatar || undefined,
    token: user.token,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
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
