// Begin the GitHub OAuth flow: stash a CSRF state + returnTo in a short-lived
// cookie, then redirect to GitHub's authorize screen.
//
// GitHub is the edit-rights *link*, not an entry point: signing in starts with
// Google. Without an account session this redirects to Google first, so the
// GitHub token always attaches to an existing account. The one exception is a
// deployment with no Google credentials configured — there GitHub stays a
// standalone sign-in so the editor is still reachable.
import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import {
  authorizeUrl,
  getOrigin,
  googleConfigured,
  oauthConfigured,
  safeReturnTo,
  STATE_COOKIE,
} from "@/lib/oauth";
import { readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!oauthConfigured()) {
    return Response.json(
      { error: "oauth_not_configured", message: "GitHub login is not configured." },
      { status: 501 },
    );
  }

  const origin = getOrigin(req);
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));

  if (googleConfigured() && !(await readSession())) {
    const google = new URL("/api/auth/google", origin);
    google.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(google);
  }

  const state = randomBytes(16).toString("hex");

  const res = NextResponse.redirect(authorizeUrl(state, origin));
  res.cookies.set(STATE_COOKIE, `${state}:${returnTo}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });
  return res;
}
