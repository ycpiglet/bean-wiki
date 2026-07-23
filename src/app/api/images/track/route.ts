// Unsplash requires triggering the photo's download endpoint when it is used
// (their API guidelines). The editor calls this when inserting an Unsplash
// image. No-op when the key is absent.
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return Response.json({ ok: false, reason: "not_configured" });

  let body: { downloadLocation?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const loc = body.downloadLocation;
  // Only accept genuine Unsplash API download endpoints.
  if (!loc || !/^https:\/\/api\.unsplash\.com\//.test(loc)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    await fetch(loc, { headers: { Authorization: `Client-ID ${key}` }, cache: "no-store" });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
