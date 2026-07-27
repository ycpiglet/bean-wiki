// Session status for client components (account menu, editor banner).
// Never exposes tokens — identity and provider availability only.
import { googleConfigured, oauthConfigured } from "@/lib/oauth";
import { getPlatformUser } from "@/lib/platform-auth";
import { readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  const platformUser = await getPlatformUser(session);
  return Response.json({
    providers: { google: googleConfigured(), github: oauthConfigured() },
    user: platformUser
      ? {
          provider: platformUser.provider,
          name: platformUser.displayName,
          email: platformUser.email,
          avatar: platformUser.avatar,
        }
      : null,
    github: session?.github
      ? { login: session.github.login, avatar: session.github.avatar ?? null }
      : null,
  });
}
