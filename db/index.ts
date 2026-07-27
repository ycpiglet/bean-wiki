import { env } from "cloudflare:workers";

export function getD1(): D1Database {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set d1 to DB in .openai/hosting.json.",
    );
  }
  return env.DB;
}
