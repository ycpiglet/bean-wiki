import { env } from "cloudflare:workers";
import {
  importRecommendations,
  type ImportedRecommendation,
} from "@/lib/platform-data";

const KINDS = new Set(["store", "menu", "bean", "recipe"]);

export async function POST(request: Request) {
  const expected = (
    env as unknown as { COFFEE_CHERRY_IMPORT_TOKEN?: string }
  ).COFFEE_CHERRY_IMPORT_TOKEN;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
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
    return Response.json({ error: "invalid_payload" }, { status: 400 });
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
    return Response.json({ error: "invalid_item" }, { status: 400 });
  }
  const imported = await importRecommendations(data.sourceName, data.items);
  return Response.json({ imported });
}
