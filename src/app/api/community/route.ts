import { getChatGPTUser } from "@/lib/chatgpt-auth";
import {
  createCommunityPost,
  listCommunityPosts,
} from "@/lib/platform-data";

export async function GET() {
  return Response.json({ posts: await listCommunityPosts() });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const data = (await request.json().catch(() => null)) as {
    board?: string;
    title?: string;
    body?: string;
  } | null;
  const board = data?.board === "notice" ? "notice" : "free";
  const title = data?.title?.trim() ?? "";
  const body = data?.body?.trim() ?? "";
  if (
    title.length < 4 ||
    title.length > 100 ||
    body.length < 10 ||
    body.length > 3000
  ) {
    return Response.json({ error: "invalid_post" }, { status: 400 });
  }
  return Response.json(await createCommunityPost(user, board, title, body));
}
