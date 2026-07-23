// Clear the editor session and return to where the user was.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getOrigin, safeReturnTo } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function logout(req: NextRequest): NextResponse {
  const origin = getOrigin(req);
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));
  const res = NextResponse.redirect(new URL(returnTo, origin));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const GET = logout;
export const POST = logout;
