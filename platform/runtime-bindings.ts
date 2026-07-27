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
  COFFEE_CHERRY_IMPORT_TOKEN?: string;
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
