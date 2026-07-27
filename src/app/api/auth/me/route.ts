// Session status for client components (account menu, editor banner).
// Never exposes tokens — identity and provider availability only.
import { googleConfigured, oauthConfigured } from "@/lib/oauth";
import { readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  return Response.json({
    providers: { google: googleConfigured(), github: oauthConfigured() },
    user: session
      ? {
          provider: session.user.provider,
          name: session.user.name,
          email: session.user.email ?? null,
          avatar: session.user.avatar ?? null,
        }
      : null,
    github: session?.github
      ? { login: session.github.login, avatar: session.github.avatar ?? null }
      : null,
  });
}
