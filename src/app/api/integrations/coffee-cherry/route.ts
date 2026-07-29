import { getRuntimeBindings } from "../../../../../platform/runtime-bindings";
import {
  importRecommendations,
  type ImportedRecommendation,
} from "@/lib/platform-data";
import { storageUnavailableResponse } from "@/lib/platform-storage";
import { requireClient, auditOk } from "@/lib/api/auth";
import { SCOPES } from "@/lib/api/scopes";
import { newRequestId } from "@/lib/api/envelope";

const KINDS = new Set(["store", "menu", "bean", "recipe"]);

// This endpoint predates the platform contract and an external app already
// integrates against its `{ error }` / `{ imported }` bodies, so the response
// shape is intentionally NOT migrated to the v1 envelope — only authentication
// is. New endpoints live under /api/*/v1 and use ok()/problem().
//
// Auth precedence:
//   1. `bwk_…` client credential with `recommendations:write` (preferred)
//   2. COFFEE_CHERRY_IMPORT_TOKEN (deprecated; remove once the caller migrates)
export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const presented = authorization?.replace(/^Bearer\s+/i, "").trim() ?? "";

  let clientId: string | null = null;
  let requestId = newRequestId();

  if (presented.startsWith("bwk_")) {
    const auth = await requireClient(request, SCOPES.recommendationsWrite);
    if (!auth.ok) return auth.response;
    clientId = auth.client.id;
    requestId = auth.requestId;
  } else {
    const legacy =
      getRuntimeBindings().COFFEE_CHERRY_IMPORT_TOKEN ??
      process.env.COFFEE_CHERRY_IMPORT_TOKEN;
    if (!legacy || presented !== legacy) {
      return Response.json(
        { error: "unauthorized" },
        { status: 401, headers: { "x-request-id": requestId } },
      );
    }
  }

  const data = (await request.json().catch(() => null)) as {
    sourceName?: string;
    items?: ImportedRecommendation[];
  } | null;
  if (
    !data?.sourceName ||
    data.sourceName.length > 80 ||
    !Array.isArray(data.items) ||
    data.items.length > 500
  ) {
    return Response.json(
      { error: "invalid_payload" },
      { status: 400, headers: { "x-request-id": requestId } },
    );
  }
  const valid = data.items.every(
    (item) =>
      item &&
      typeof item.externalId === "string" &&
      item.externalId.length <= 160 &&
      KINDS.has(item.kind) &&
      typeof item.name === "string" &&
      item.name.length > 0 &&
      item.name.length <= 160 &&
      typeof item.summary === "string" &&
      item.summary.length <= 1200 &&
      (item.rating === undefined ||
        (item.rating >= 0 && item.rating <= 5)) &&
      (item.reviewCount === undefined ||
        (Number.isInteger(item.reviewCount) && item.reviewCount >= 0)),
  );
  if (!valid) {
    return Response.json(
      { error: "invalid_item" },
      { status: 400, headers: { "x-request-id": requestId } },
    );
  }
  try {
    const imported = await importRecommendations(data.sourceName, data.items);
    await auditOk({
      clientId,
      requestId,
      action: "recommendations.import",
      resource: "/api/integrations/coffee-cherry",
      scope: SCOPES.recommendationsWrite,
      rowCount: imported,
      detail: clientId ? "" : "legacy_token",
    });
    return Response.json(
      { imported },
      { headers: { "x-request-id": requestId } },
    );
  } catch (error) {
    return storageUnavailableResponse(error, {
      error: "storage_unavailable",
    });
  }
}
