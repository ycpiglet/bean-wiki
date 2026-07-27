import { getChatGPTUser } from "@/lib/chatgpt-auth";
import { getProfile } from "@/lib/platform-data";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ user: null });
  try {
    return Response.json({ user, ...(await getProfile(user)) });
  } catch {
    return Response.json(
      { user, profile: null, stats: {}, storageReady: false },
      { status: 503 },
    );
  }
}
