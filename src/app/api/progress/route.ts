import { getChatGPTUser } from "@/lib/chatgpt-auth";
import {
  recordActivity,
  type ActivityKind,
} from "@/lib/platform-data";

const validKinds = new Set<ActivityKind>([
  "visit",
  "article_view",
  "quiz_correct",
  "quiz_complete",
]);

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const data = (await request.json().catch(() => null)) as {
    kind?: ActivityKind;
    entityKey?: string;
  } | null;
  if (
    !data?.kind ||
    !validKinds.has(data.kind) ||
    typeof data.entityKey !== "string" ||
    data.entityKey.length < 1 ||
    data.entityKey.length > 160
  ) {
    return Response.json({ error: "invalid_event" }, { status: 400 });
  }
  const awarded = await recordActivity(user, data.kind, data.entityKey);
  return Response.json({ awarded });
}
