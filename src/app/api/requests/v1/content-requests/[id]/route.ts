// GET   /api/requests/v1/content-requests/{id}  — status + audit timeline
// PATCH /api/requests/v1/content-requests/{id}  — triage transition
//
// Contract: docs/CONTENT-REQUEST-API-V1.md

import { ok, problem } from "@/lib/api/envelope";
import { requireClient, auditOk } from "@/lib/api/auth";
import { SCOPES } from "@/lib/api/scopes";
import {
  getRequest,
  listEvents,
  transitionRequest,
} from "@/lib/requests/store";
import { allowedNext, isRequestStatus } from "@/lib/requests/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA = "content_request.v1";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireClient(request, SCOPES.contentRequestsRead);
  if (!auth.ok) return auth.response;
  const { client, requestId } = auth;
  const { id } = await context.params;

  try {
    const found = await getRequest(id);
    // A client sees only its OWN requests. Anything else — another client's row,
    // or a human web-form submission with a null client_id — reads as missing, so
    // an id cannot be probed for existence. (Previously a null client_id row was
    // readable by any credential holder.)
    if (!found || found.client_id !== client.id) {
      return problem("not_found", { requestId, detail: "No such request." });
    }
    const events = await listEvents(id);
    return ok(
      SCHEMA,
      { ...found, timeline: events, allowed_next: allowedNext(found.status) },
      { requestId },
    );
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireClient(request, SCOPES.contentRequestsTriage);
  if (!auth.ok) return auth.response;
  const { client, requestId } = auth;
  const { id } = await context.params;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const to = typeof body?.status === "string" ? body.status : "";
  if (!isRequestStatus(to)) {
    return problem("invalid_request", {
      requestId,
      detail: "`status` must be a known request status.",
    });
  }

  try {
    const result = await transitionRequest({
      id,
      to,
      actorType: client.clientType === "agent" ? "agent" : "human",
      actorRef: client.id,
      note: strOrEmpty(body?.note).slice(0, 400),
      resolutionArticleSlug: strOrUndefined(body?.resolution_article_slug),
      resolutionUrl: strOrUndefined(body?.resolution_url),
      declinedReason: strOrUndefined(body?.declined_reason),
      duplicateOf: strOrUndefined(body?.duplicate_of),
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        return problem("not_found", { requestId, detail: "No such request." });
      }
      if (result.reason === "concurrent_change") {
        const current = await getRequest(id);
        return problem("state_conflict", {
          requestId,
          detail: result.detail,
          extra: current
            ? {
                current_status: current.status,
                current_revision: current.revision,
                allowed_next: allowedNext(current.status),
              }
            : undefined,
        });
      }
      if (result.reason === "illegal_transition") {
        const current = await getRequest(id);
        return problem("state_conflict", {
          requestId,
          detail: `Transition ${result.detail} is not allowed.`,
          extra: current
            ? { current_status: current.status, allowed_next: allowedNext(current.status) }
            : undefined,
        });
      }
      return problem("unprocessable", { requestId, detail: result.detail });
    }

    await auditOk({
      clientId: client.id,
      requestId,
      action: "content_request.transition",
      resource: `/api/requests/v1/content-requests/${id}`,
      scope: SCOPES.contentRequestsTriage,
      rowCount: 1,
      detail: `to_${to}`,
    });

    return ok(SCHEMA, result.request, { requestId });
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

function strOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function strOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function storageProblem(error: unknown, requestId: string): Response {
  const name = (error as { name?: string } | null)?.name;
  if (name !== "D1UnavailableError") throw error;
  return problem("storage_unavailable", {
    requestId,
    detail: "Request storage is not bound in this environment.",
  });
}
