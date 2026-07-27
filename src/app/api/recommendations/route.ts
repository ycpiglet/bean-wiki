import { listRecommendations } from "@/lib/platform-data";

export async function GET() {
  return Response.json({ items: await listRecommendations() });
}
