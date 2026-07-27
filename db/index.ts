import {
  getRuntimeBindings,
  type RuntimeD1Database,
} from "../platform/runtime-bindings";

export class D1UnavailableError extends Error {
  constructor() {
    super(
      "Cloudflare D1 binding `DB` is unavailable. Set d1 to DB in .openai/hosting.json.",
    );
    this.name = "D1UnavailableError";
  }
}

export function getD1(): RuntimeD1Database {
  const { DB } = getRuntimeBindings();
  if (!DB) {
    throw new D1UnavailableError();
  }
  return DB;
}
