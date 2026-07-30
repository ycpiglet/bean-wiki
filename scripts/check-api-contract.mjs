#!/usr/bin/env node
// Platform contract gate for versioned API routes.
//
// Type-checking cannot tell us that a route answered with the shared envelope,
// declared a real scope, or mapped its storage failure to 503. This does, by
// reading every route file under src/app/api/**/v1/** and asserting the
// conventions in docs/PLATFORM-CONTRACT-V1.md.
//
// Scope is deliberately narrow: only `/v1/` routes are governed. Pre-contract
// endpoints (notably /api/integrations/coffee-cherry, whose response shape an
// external app already depends on) are exempt and listed below.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiRoot = join(root, "src", "app", "api");
const libApi = join(root, "src", "lib", "api");

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// Scopes are the source of truth for what a route may declare.
const scopeSource = readFileSync(join(libApi, "scopes.ts"), "utf8");
const knownScopes = new Set(
  [...scopeSource.matchAll(/^\s+\w+:\s*"([a-z-]+:[a-z-]+)"/gm)].map((m) => m[1]),
);
if (knownScopes.size === 0) {
  err("scopes.ts: could not extract any scope constants — the gate cannot verify routes.");
}

// Problem codes are the source of truth for error responses.
const envelopeSource = readFileSync(join(libApi, "envelope.ts"), "utf8");
const problemsBlock = /export const PROBLEMS = \{([\s\S]*?)\n\} as const;/.exec(
  envelopeSource,
);
const knownProblems = new Set(
  problemsBlock
    ? [...problemsBlock[1].matchAll(/^\s+(\w+):\s*\{/gm)].map((m) => m[1])
    : [],
);
if (knownProblems.size === 0) {
  err("envelope.ts: could not extract the PROBLEMS catalogue.");
}

const HTTP_METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS", "HEAD"];

const routeFiles = existsSync(apiRoot) ? collectRoutes(apiRoot) : [];
const v1Routes = routeFiles.filter((file) => file.includes("/v1/"));

if (v1Routes.length === 0) {
  warn("no /v1/ route files found — nothing to check.");
}

// Endpoints documented in the contract docs, so an undocumented route is caught.
const documented = new Set();
for (const doc of [
  "KNOWLEDGE-API-V1.md",
  "CONTENT-REQUEST-API-V1.md",
  "TELEMETRY-AND-PRIVACY.md",
  "BOT-COMMAND-CATALOG.md",
  "PLATFORM-CONTRACT-V1.md",
]) {
  const path = join(root, "docs", doc);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, "utf8");
  for (const match of text.matchAll(/\/api\/[a-z0-9\-/{}[\]:.]+/gi)) {
    documented.add(normalizeApiPath(match[0]));
  }
}

for (const file of v1Routes) {
  const rel = relative(root, file);
  const source = readFileSync(file, "utf8");
  const methods = HTTP_METHODS.filter((method) =>
    new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`).test(source),
  );

  if (methods.length === 0) {
    err(`${rel}: exports no HTTP handler.`);
    continue;
  }

  // 1. Only the shared envelope may produce a body.
  if (/Response\.json\s*\(/.test(source)) {
    err(
      `${rel}: uses Response.json(). Versioned routes must respond via ok()/problem() ` +
        `from src/lib/api/envelope.ts (contract §3, §4).`,
    );
  }
  if (/new Response\s*\(/.test(source) && !/preflight\s*\(/.test(source)) {
    err(
      `${rel}: constructs a bare Response. Use ok()/problem(), or preflight() for OPTIONS (contract §3).`,
    );
  }
  const usesEnvelope = /\bok\s*\(/.test(source) || /\bproblem\s*\(/.test(source);
  const onlyOptions = methods.length === 1 && methods[0] === "OPTIONS";
  if (!usesEnvelope && !onlyOptions) {
    err(`${rel}: never calls ok() or problem() (contract §3).`);
  }

  // 2. Every problem code must exist in the catalogue.
  for (const match of source.matchAll(/problem\(\s*"([a-z_]+)"/g)) {
    if (!knownProblems.has(match[1])) {
      err(
        `${rel}: problem("${match[1]}") is not in the PROBLEMS catalogue in src/lib/api/envelope.ts (contract §4).`,
      );
    }
  }

  // 3. A route must declare authorisation explicitly — either a required scope
  //    or the documented optional-auth helper. Silence is the failure mode we
  //    care about: an unauthenticated write is invisible in review.
  const declaresScope =
    /requireClient\s*\([^)]*SCOPES\.\w+/s.test(source) ||
    /SCOPES\.\w+/.test(source);
  const optionalAuth = /optionalClient\s*\(/.test(source);
  const writes = methods.some((m) => m !== "GET" && m !== "OPTIONS" && m !== "HEAD");

  // A deliberately public endpoint (e.g. a browser beacon) must SAY so. An
  // explicit marker keeps the decision visible in review; silence does not.
  //
  // The marker is a comment, not an export: Next.js route modules may only export
  // handlers and route config, so an `export const CONTRACT_AUTH` would itself be
  // a build error.
  const publicMarker = /^\s*\/\/\s*contract-auth:\s*public\b/m.test(source);
  if (publicMarker && !/contract-exempt:/.test(source)) {
    err(
      `${rel}: is marked \`// contract-auth: public\` without a \`// contract-exempt: <reason>\` ` +
        `comment explaining why no credential is required (contract §8).`,
    );
  }
  if (/export const CONTRACT_AUTH/.test(source)) {
    err(
      `${rel}: exports CONTRACT_AUTH. Next.js route modules may only export handlers ` +
        `and route config — use the \`// contract-auth: public\` comment instead.`,
    );
  }

  if (!declaresScope && !optionalAuth && !publicMarker) {
    err(
      `${rel}: declares no scope, does not use optionalClient(), and is not marked ` +
        `CONTRACT_AUTH = "public". Versioned routes must state their authorisation (contract §8).`,
    );
  }
  if (writes && optionalAuth && !/requireClient\s*\(/.test(source)) {
    err(
      `${rel}: has a write method but only optional auth. Writes require requireClient() (contract §8).`,
    );
  }
  for (const match of source.matchAll(/SCOPES\.(\w+)/g)) {
    if (!new RegExp(`\\b${match[1]}:`).test(scopeSource)) {
      err(`${rel}: SCOPES.${match[1]} is not defined in src/lib/api/scopes.ts.`);
    }
  }

  // 4. Storage failures are 503; everything else must keep bubbling up so a real
  //    bug is not disguised as downtime.
  if (/D1UnavailableError/.test(source) && !/throw error/.test(source)) {
    err(
      `${rel}: inspects D1UnavailableError but never rethrows other errors. ` +
        `A genuine fault must surface as 500, not 503 (contract §4).`,
    );
  }

  // 5. List endpoints need a deterministic cursor, not offset paging.
  if (/searchParams\.get\("(?:offset|page)"\)/.test(source)) {
    err(`${rel}: uses offset/page paging. The contract requires cursors (contract §6).`);
  }

  // 6. Secrets must never reach a URL or a log.
  if (/console\.(log|info|warn|error)\s*\(/.test(source)) {
    warn(`${rel}: logs to console. Ensure no credential, token, or personal data is logged (contract §13).`);
  }
  if (/searchParams\.get\("(?:token|secret|credential|api_key|apikey)"\)/i.test(source)) {
    err(`${rel}: reads a credential from the query string, which the contract forbids (contract §7.1).`);
  }

  // 7. Dynamic routes must declare a runtime, matching sibling conventions.
  if (!/export const runtime\s*=/.test(source)) {
    warn(`${rel}: does not pin \`export const runtime\`.`);
  }

  // 8. The route must appear in a contract document.
  const apiPath = routeToApiPath(file);
  if (apiPath && !documented.has(apiPath)) {
    warn(
      `${apiPath} (${rel}) is not mentioned in any docs/*-V1.md or BOT-COMMAND-CATALOG.md. ` +
        `Undocumented endpoints drift.`,
    );
  }
}

// --- report ---------------------------------------------------------------

for (const warning of warnings) console.warn(`  warn  ${warning}`);

if (errors.length > 0) {
  console.error(`\n✗ check-api-contract: ${errors.length} error(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ check-api-contract: ${v1Routes.length} v1 route file(s), ` +
    `${knownScopes.size} scopes, ${knownProblems.size} problem codes` +
    (warnings.length ? `, ${warnings.length} warning(s)` : ""),
);

// --- helpers --------------------------------------------------------------

function collectRoutes(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectRoutes(full));
    } else if (entry === "route.ts" || entry === "route.tsx") {
      out.push(full.split("\\").join("/"));
    }
  }
  return out;
}

/** src/app/api/knowledge/v1/resolve/route.ts -> /api/knowledge/v1/resolve */
function routeToApiPath(file) {
  const rel = relative(join(root, "src", "app"), file).split("\\").join("/");
  const withoutFile = rel.replace(/\/route\.tsx?$/, "");
  if (!withoutFile.startsWith("api/")) return null;
  return normalizeApiPath(`/${withoutFile}`);
}

/** Collapses [param] and {param} so docs and filenames compare equal. */
function normalizeApiPath(value) {
  return value
    .replace(/\[([^\]]+)\]/g, "{param}")
    .replace(/\{[^}]+\}/g, "{param}")
    .replace(/\/+$/, "");
}
