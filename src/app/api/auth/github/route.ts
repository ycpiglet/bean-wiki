// Begin the GitHub OAuth flow: stash a CSRF state + returnTo in a short-lived
// cookie, then redirect to GitHub's authorize screen.
import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { authorizeUrl, getOrigin, oauthConfigured, safeReturnTo, STATE_COOKIE } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  if (!oauthConfigured()) {
    return Response.json(
      { error: "oauth_not_configured", message: "GitHub login is not configured." },
      { status: 501 },
    );
  }

  const origin = getOrigin(req);
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));
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
