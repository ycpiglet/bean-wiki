import { NextResponse, type NextRequest } from "next/server";
import { devAuthConfigured, devAuthIdentity } from "@/lib/dev-auth";
import { getOrigin, safeReturnTo } from "@/lib/oauth";
import {
  SESSION_COOKIE,
  cookieOptions,
  encryptSession,
  newGoogleSession,
  readSession,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!devAuthConfigured()) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const origin = getOrigin(req);
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));
  const identity = devAuthIdentity();
  const session = newGoogleSession(
    {
      sub: `local:${identity.email}`,
      email: identity.email,
      name: identity.name,
    },
    await readSession(),
  );
  const encrypted = encryptSession(session);
  if (!encrypted) {
    return Response.json(
      {
        error: "dev_session_not_configured",
        message: "로컬 개발 세션에 AUTH_SECRET이 필요합니다.",
      },
      { status: 501 },
    );
  }

  const response = NextResponse.redirect(new URL(returnTo, origin));
  response.cookies.set(SESSION_COOKIE, encrypted, cookieOptions);
  return response;
}
