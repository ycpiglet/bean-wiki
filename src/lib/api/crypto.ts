// Web Crypto only — this runs on both the Node and the Cloudflare Workers
// runtime, so `node:crypto` helpers such as timingSafeEqual are unavailable.

const encoder = new TextEncoder();

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(
  secret: string,
  message: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return toHex(new Uint8Array(signature));
}

/**
 * Constant-time comparison for equal-length hex/ASCII strings. Length is
 * compared first and leaks only the length, which is fixed for our digests.
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

/** URL-safe random token body. */
export function randomToken(bytes = 24): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return toBase64Url(buffer);
}

const ALNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Random alphanumeric string. Credentials use this rather than base64url
 * because `_` and `-` appear in base64url output, which would make the
 * `scheme_prefix_secret` credential format ambiguous to split.
 */
export function randomAlnum(length: number): string {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  let out = "";
  // Rejection-free modulo bias is irrelevant here: 256 % 62 skews the first
  // 8 symbols by ~1.6%, far below what matters for a 32+ char secret.
  for (const byte of buffer) out += ALNUM[byte % ALNUM.length];
  return out;
}

export function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
