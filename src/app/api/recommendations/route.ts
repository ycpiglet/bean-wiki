import { listRecommendations } from "@/lib/platform-data";
import { storageUnavailableResponse } from "@/lib/platform-storage";

export async function GET() {
  try {
    return Response.json({ items: await listRecommendations() });
  } catch (error) {
    return storageUnavailableResponse(error, { items: [] }, 200);
  }
}
