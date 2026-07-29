// CORS for the public knowledge API only.
//
// Allowlist, never `*` with credentials. Company apps are named explicitly so a
// third party embedding the API in a browser is a deliberate act, not a default.

import { getRuntimeBindings } from "../../../platform/runtime-bindings";

const DEFAULT_ORIGINS = ["https://bean-wiki.vercel.app"];

export function allowedOrigins(): string[] {
  const configured =
    getRuntimeBindings().KNOWLEDGE_API_CORS_ORIGINS ??
    process.env.KNOWLEDGE_API_CORS_ORIGINS ??
    "";
  const extra = configured
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

/**
 * Echoes the request origin when allowlisted. Returns no CORS headers for
 * non-browser callers (no Origin header), which is the common integration case.
 */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) return {};
  if (!allowedOrigins().includes(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-max-age": "600",
    vary: "origin",
  };
}

export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
