// GET /api/requests/v1/contributions/{id} — status of one submitted draft.
//
// Exists because POST /contributions returns a Location header pointing here; a
// Location that 404s is worse than none.
//
// The submitted `body_html` is deliberately NOT returned: it can be 200 KB, the
// caller already has it, and the review path fetches it separately.

import { ok, problem } from "@/lib/api/envelope";
import { requireClient } from "@/lib/api/auth";
import { SCOPES } from "@/lib/api/scopes";
import { getContribution } from "@/lib/contributions/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA = "contribution.v1";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireClient(request, SCOPES.contributionsRead);
  if (!auth.ok) return auth.response;
  const { client, requestId } = auth;
  const { id } = await context.params;

  try {
    const found = await getContribution(id);
    // Another client's submission reads as missing, so ids cannot be probed.
    if (!found || found.client_id !== client.id) {
      return problem("not_found", { requestId, detail: "No such contribution." });
    }
    return ok(SCHEMA, found, { requestId });
  } catch (error) {
    const name = (error as { name?: string } | null)?.name;
    if (name !== "D1UnavailableError") throw error;
    return problem("storage_unavailable", {
      requestId,
      detail: "Contribution storage is not bound in this environment.",
    });
  }
}
