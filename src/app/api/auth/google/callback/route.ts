// Google OAuth callback: verify CSRF state, exchange the code for a token,
// fetch the user, enforce the optional email allowlist, and set the encrypted
// session cookie. A pre-existing GitHub link (edit rights) is preserved —
// Google only (re)sets the account layer.
import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeGoogleCode,
  fetchGoogleUser,
  getOrigin,
  googleConfigured,
  isAllowedGoogleEmail,
  safeReturnTo,
  STATE_COOKIE,
} from "@/lib/oauth";
import {
  SESSION_COOKIE,
  cookieOptions,
  encryptSession,
  newGoogleSession,
  readSession,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(origin: string, reason: string): NextResponse {
  const url = new URL("/", origin);
  url.searchParams.set("login_error", reason);
  const res = NextResponse.redirect(url);
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const origin = getOrigin(req);
  if (!googleConfigured()) return fail(origin, "not_configured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const stored = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !stored) return fail(origin, "missing_params");
  const [storedState, returnToRaw] = stored.split(":");
  if (state !== storedState) return fail(origin, "bad_state");
  const returnTo = safeReturnTo(returnToRaw);

  try {
    const accessToken = await exchangeGoogleCode(code, origin);
    const user = await fetchGoogleUser(accessToken);
    if (!user.email_verified) return fail(origin, "email_unverified");
    if (!isAllowedGoogleEmail(user.email)) return fail(origin, "not_allowed");

    const existing = await readSession();
    const session = newGoogleSession(user, existing);
    const encrypted = encryptSession(session);
    if (!encrypted) return fail(origin, "session_error");

    const res = NextResponse.redirect(new URL(returnTo, origin));
    res.cookies.set(SESSION_COOKIE, encrypted, cookieOptions);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch {
    return fail(origin, "exchange_failed");
  }
}
