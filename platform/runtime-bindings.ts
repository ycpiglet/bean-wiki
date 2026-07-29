export type RuntimeD1Result<T = Record<string, unknown>> = {
  results: T[];
  meta: { changes?: number };
};

export type RuntimeD1Statement = {
  bind(...values: unknown[]): RuntimeD1Statement;
  run(): Promise<RuntimeD1Result>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<RuntimeD1Result<T>>;
};

export type RuntimeD1Database = {
  prepare(query: string): RuntimeD1Statement;
  batch(statements: RuntimeD1Statement[]): Promise<RuntimeD1Result[]>;
};

export type RuntimeBindings = {
  DB?: RuntimeD1Database;
  /** Legacy single-token import credential. Superseded by `api_clients`. */
  COFFEE_CHERRY_IMPORT_TOKEN?: string;
  /** Proves a request arrived via the platform gateway; see platform-auth.ts. */
  PLATFORM_GATEWAY_SECRET?: string;
  /** Comma-separated origins allowed to read the public knowledge API. */
  KNOWLEDGE_API_CORS_ORIGINS?: string;
  /** Comma-separated emails bootstrapped to the `owner` role; see src/lib/roles.ts. */
  PLATFORM_OWNER_EMAILS?: string;
  /** Daily-rotating salt base for page_views.session_hash. */
  TELEMETRY_SALT?: string;
};

const runtime = globalThis as typeof globalThis & {
  __BEAN_WIKI_BINDINGS__?: RuntimeBindings;
};

export function setRuntimeBindings(bindings: RuntimeBindings): void {
  runtime.__BEAN_WIKI_BINDINGS__ = bindings;
}

export function getRuntimeBindings(): RuntimeBindings {
  return runtime.__BEAN_WIKI_BINDINGS__ ?? {};
}
