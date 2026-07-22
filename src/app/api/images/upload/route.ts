// Image upload: commit a base64 image into public/uploads/ via the GitHub
// Contents API (no extra service, reuses the editor's commit token). Returns a
// site-relative URL to embed. Auth-gated, like the save API.
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";
import { ghPutFileBase64, resolveCommitToken } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXT_RE = /\.(png|jpe?g|webp|gif)$/i;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function safeName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "image";
}

export async function POST(req: NextRequest) {
  const session = await readSession();
  const token = resolveCommitToken(session);
  if (!token) {
    return Response.json(
      { error: "auth_required", message: "Sign in with GitHub to upload images." },
      { status: 401 },
    );
  }

  let body: { filename?: string; dataBase64?: string; slug?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const filename = body.filename ?? "";
  const dataBase64 = (body.dataBase64 ?? "").replace(/^data:[^;]+;base64,/, "");
  if (!EXT_RE.test(filename)) {
    return Response.json(
      { error: "invalid", message: "Only png, jpg, webp, and gif are allowed." },
      { status: 422 },
    );
  }
  if (!dataBase64) {
    return Response.json({ error: "invalid", message: "empty file" }, { status: 422 });
  }
  if (Buffer.byteLength(dataBase64, "base64") > MAX_BYTES) {
    return Response.json({ error: "too_large", message: "Max 5 MB." }, { status: 413 });
  }

  const folder = body.slug && /^[a-z0-9-]+$/.test(body.slug) ? body.slug : "misc";
  const name = `${Date.now()}-${safeName(filename)}`;
  const path = `public/uploads/${folder}/${name}`;

  try {
    const put = await ghPutFileBase64({
      path,
      base64: dataBase64,
      message: `content: upload image ${folder}/${name}`,
      token,
    });
    return Response.json({
      url: `/uploads/${folder}/${name}`,
      commit: { sha: put.commitSha, url: put.htmlUrl },
      publishing: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload failed";
    return Response.json({ error: "upload_failed", message }, { status: 502 });
  }
}
