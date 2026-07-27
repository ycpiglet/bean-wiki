import { getPlatformUser } from "@/lib/platform-auth";
import {
  createSuggestion,
  listSuggestions,
} from "@/lib/platform-data";
import { storageUnavailableResponse } from "@/lib/platform-storage";

const KINDS = new Set(["궁금한 내용", "새 글 제안", "내용 보완", "기능 제안"]);

export async function GET() {
  try {
    return Response.json({ suggestions: await listSuggestions() });
  } catch (error) {
    return storageUnavailableResponse(error, { suggestions: [] }, 200);
  }
}

export async function POST(request: Request) {
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const data = (await request.json().catch(() => null)) as {
    kind?: string;
    title?: string;
    body?: string;
  } | null;
  const kind = data?.kind ?? "";
  const title = data?.title?.trim() ?? "";
  const body = data?.body?.trim() ?? "";
  if (
    !KINDS.has(kind) ||
    title.length < 4 ||
    title.length > 100 ||
    body.length < 10 ||
    body.length > 2000
  ) {
    return Response.json({ error: "invalid_suggestion" }, { status: 400 });
  }
  try {
    return Response.json(await createSuggestion(user, kind, title, body));
  } catch (error) {
    return storageUnavailableResponse(error, {
      error: "storage_unavailable",
    });
  }
}
