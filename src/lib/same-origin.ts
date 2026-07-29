// CSRF defence for cookie-authenticated mutations.
//
// The session cookie is SameSite=Lax, which already stops the classic
// cross-site form POST, and every mutation here requires a JSON body — so this
// is defence in depth rather than the only barrier. It closes the cases Lax
// does not: a same-site-but-different-subdomain page, and any future relaxation
// of the cookie policy.
//
// Browsers send `Origin` on every POST/PATCH/DELETE, including same-origin
// ones, so requiring it to match is safe for the in-app fetch calls. A request
// with no Origin at all is not a browser form post; it is allowed through so
// scripted/API use of the editing endpoints keeps working, and those endpoints
// still require a real session or token of their own.
import type { NextRequest } from "next/server";

// The origin the deployment is actually served on. AUTH_ORIGIN already exists
// for the OAuth redirect_uri and takes precedence in proxied deployments.
function expectedOrigin(req: NextRequest): string {
  return process.env.AUTH_ORIGIN || req.nextUrl.origin;
}

export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // not a browser-initiated cross-site post
  try {
    return new URL(origin).origin === new URL(expectedOrigin(req)).origin;
  } catch {
    return false;
  }
}

// Returns a 403 Response to return early, or null when the request may proceed.
export function crossOriginBlocked(req: NextRequest): Response | null {
  if (isSameOrigin(req)) return null;
  return Response.json(
    {
      error: "cross_origin",
      message: "요청 출처가 올바르지 않습니다.",
    },
    { status: 403 },
  );
}
