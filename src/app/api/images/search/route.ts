// Image search for the editor. Wikimedia Commons works with no credentials;
// Unsplash requires UNSPLASH_ACCESS_KEY. Every result carries author + license
// + source so the figure can attribute it (license compliance).
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ImageResult = {
  thumb: string;
  full: string;
  author: string;
  license: string;
  sourceUrl: string;
  title: string;
  downloadLocation?: string; // Unsplash only
};

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function searchCommons(q: string): Promise<ImageResult[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${q}`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "400",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": "bean-wiki-editor" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Commons search failed: ${res.status}`);
  const json = (await res.json()) as {
    query?: { pages?: Record<string, {
      title: string;
      imageinfo?: {
        url: string;
        thumburl?: string;
        descriptionurl?: string;
        extmetadata?: Record<string, { value: string }>;
      }[];
    }> };
  };
  const pages = json.query?.pages ? Object.values(json.query.pages) : [];
  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        thumb: info.thumburl || info.url,
        full: info.url,
        author: stripTags(meta.Artist?.value || "Unknown"),
        license: stripTags(meta.LicenseShortName?.value || "see source"),
        sourceUrl: info.descriptionurl || info.url,
        title: page.title.replace(/^File:/, ""),
      } as ImageResult;
    })
    .filter((r): r is ImageResult => r !== null);
}

async function searchUnsplash(q: string): Promise<ImageResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12`,
    { headers: { Authorization: `Client-ID ${key}` }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Unsplash search failed: ${res.status}`);
  const json = (await res.json()) as {
    results: {
      urls: { regular: string; small: string };
      user: { name: string; links: { html: string } };
      links: { html: string; download_location: string };
    }[];
  };
  return json.results.map((p) => ({
    thumb: p.urls.small,
    full: p.urls.regular,
    author: p.user.name,
    license: "Unsplash License",
    sourceUrl: p.links.html,
    title: p.user.name,
    downloadLocation: p.links.download_location,
  }));
}

export async function GET(req: NextRequest) {
  // Require a session so search isn't an open proxy.
  const session = await readSession();
  if (!session) {
    return Response.json({ error: "auth_required" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const source = req.nextUrl.searchParams.get("source") || "commons";
  if (!q) return Response.json({ results: [] });

  try {
    const results =
      source === "unsplash" ? await searchUnsplash(q) : await searchCommons(q);
    return Response.json({
      source,
      results,
      unsplashConfigured: Boolean(process.env.UNSPLASH_ACCESS_KEY),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "search failed";
    return Response.json({ error: "search_failed", message }, { status: 502 });
  }
}
