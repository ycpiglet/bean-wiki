// Detach the GitHub link (edit rights) while keeping the account signed in.
// If the account *is* the GitHub identity, this is a full logout.
import { NextResponse, type NextRequest } from "next/server";
import { getOrigin, safeReturnTo } from "@/lib/oauth";
import { SESSION_COOKIE, cookieOptions, encryptSession, readSession, unlinkGitHub } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function unlink(req: NextRequest): Promise<NextResponse> {
  const origin = getOrigin(req);
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));
  const res = NextResponse.redirect(new URL(returnTo, origin));

  const session = await readSession();
  if (!session) return res;

  const next = session.github ? unlinkGitHub(session) : session;
  if (!next) {
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  const encrypted = encryptSession(next);
  if (encrypted) res.cookies.set(SESSION_COOKIE, encrypted, cookieOptions);
  else res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const GET = unlink;
export const POST = unlink;
