import { getChatGPTUser } from "@/lib/chatgpt-auth";
import {
  createSuggestion,
  listSuggestions,
} from "@/lib/platform-data";

const KINDS = new Set(["궁금한 내용", "새 글 제안", "내용 보완", "기능 제안"]);

export async function GET() {
  return Response.json({ suggestions: await listSuggestions() });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
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
  return Response.json(await createSuggestion(user, kind, title, body));
}
