// Access rules for the knowledge API.
//
// This direction of the integration carries public, CC-BY-4.0 encyclopedia
// content — not user records — so it is deliberately readable WITHOUT a
// credential. Applying the T1/T2/T3 machinery from the inbound Beanote contract
// here would add consent and approval ceremony to material that is already
// published on the open web.
//
// A credential is still honoured when presented: it raises the rate limit,
// attributes usage to a named client, and lets `resolve` misses be traced back
// to the app that needs the missing article.

import { requireClient, type ApiClient } from "@/lib/api/auth";
import { SCOPES } from "@/lib/api/scopes";
import { newRequestId } from "@/lib/api/envelope";

export type OptionalClient = {
  client: ApiClient | null;
  requestId: string;
};

/**
 * Resolves an optional client. An absent Authorization header is fine; a present
 * but invalid one is NOT silently downgraded to anonymous — a caller that
 * believes it is authenticated must be told its credential is broken, otherwise
 * it will look like a working integration until the rate limit bites.
 */
export async function optionalClient(
  request: Request,
): Promise<OptionalClient & { rejection?: Response }> {
  if (!request.headers.get("authorization")) {
    return { client: null, requestId: newRequestId() };
  }
  const auth = await requireClient(request, SCOPES.knowledgeRead);
  if (!auth.ok) {
    return { client: null, requestId: auth.requestId, rejection: auth.response };
  }
  return { client: auth.client, requestId: auth.requestId };
}

/**
 * Anonymous callers get a shared cache and a coarse cap; identified callers get
 * their per-client limit. Anonymous limiting is left to the edge/CDN because a
 * per-request D1 write on a cacheable public GET would cost more than it saves.
 */
export function knowledgeCacheControl(client: ApiClient | null): string {
  return client
    ? "private, max-age=60"
    : "public, max-age=300, stale-while-revalidate=86400";
}
