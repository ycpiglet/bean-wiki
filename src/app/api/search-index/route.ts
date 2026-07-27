import type { Locale } from "@/i18n/config";
import { getSearchIndex } from "@/lib/content";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en"
    ? "en"
    : "ko";
  return Response.json({
    items: getSearchIndex(locale as Locale),
  }, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
