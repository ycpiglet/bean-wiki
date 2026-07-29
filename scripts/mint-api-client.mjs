#!/usr/bin/env node
// Mints an api_clients credential and prints the INSERT to run against D1.
//
// The plaintext credential is shown exactly once, here, and is never stored:
// only its SHA-256 goes into the database. Re-running this for the same client
// rotates the secret.
//
//   node scripts/mint-api-client.mjs --name "Beanote" --org "Beanote" \
//     --scopes knowledge:read,content-requests:write --type human_app
//
// Then apply it:
//   npx wrangler d1 execute bean-wiki --remote --command "<sql>"

import { webcrypto } from "node:crypto";

const KNOWN_SCOPES = [
  "knowledge:read",
  "content-requests:read",
  "content-requests:write",
  "content-requests:triage",
  "contributions:write",
  "metrics:read",
  "bot:command",
  "recommendations:write",
];
const CLIENT_TYPES = ["human_app", "agent", "internal"];
const TIERS = ["T0", "T1", "T2", "T3"];

const args = parseArgs(process.argv.slice(2));

if (!args.name) {
  fail("--name is required");
}

const scopes = (args.scopes ?? "knowledge:read")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const unknown = scopes.filter((scope) => !KNOWN_SCOPES.includes(stripTier(scope)));
if (unknown.length > 0) {
  fail(
    `unknown scope(s): ${unknown.join(", ")}\n  known: ${KNOWN_SCOPES.join(", ")}`,
  );
}

const clientType = args.type ?? "human_app";
if (!CLIENT_TYPES.includes(clientType)) {
  fail(`--type must be one of ${CLIENT_TYPES.join(", ")}`);
}

const maxTier = args.tier ?? "T1";
if (!TIERS.includes(maxTier)) {
  fail(`--tier must be one of ${TIERS.join(", ")}`);
}

const rateLimit = Number.parseInt(args.rate ?? "60", 10);
if (!Number.isInteger(rateLimit) || rateLimit < 1) {
  fail("--rate must be a positive integer");
}

// Alphanumeric only: `_` / `-` from base64url would make `bwk_<prefix>_<secret>`
// ambiguous to split, which the runtime parser in src/lib/api/auth.ts relies on.
const prefix = randomAlnum(12);
const secret = randomAlnum(43);
const credential = `bwk_${prefix}_${secret}`;
const hash = await sha256Hex(secret);
const id = `cl_${randomAlnum(16)}`;

const sql = [
  "INSERT INTO api_clients",
  "(id, name, org, client_type, secret_prefix, secret_hash, scopes_json,",
  " max_tier, status, rate_limit_per_min, quota_period, ip_allowlist_json)",
  "VALUES (",
  `  '${id}', ${quote(args.name)}, ${quote(args.org ?? "")}, '${clientType}',`,
  `  '${prefix}', '${hash}', ${quote(JSON.stringify(scopes))},`,
  `  '${maxTier}', 'active', ${rateLimit}, 'month', '[]'`,
  ");",
].join("\n");

console.log(`
Client
  id            ${id}
  name          ${args.name}
  org           ${args.org ?? "(none)"}
  type          ${clientType}
  scopes        ${scopes.join(", ")}
  max tier      ${maxTier}
  rate limit    ${rateLimit}/min

Credential — shown once, store it in the caller's secret manager now:

  ${credential}

SQL to apply:

${sql}

Reminder: the credential above is not recoverable. Rotate by re-running this
script and updating secret_prefix + secret_hash for the same client id.
`);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = "true";
    }
  }
  return out;
}

function stripTier(scope) {
  const parts = scope.split(":");
  return parts.length === 3 && TIERS.includes(parts[2])
    ? `${parts[0]}:${parts[1]}`
    : scope;
}

function quote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const ALNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomAlnum(length) {
  const buffer = new Uint8Array(length);
  webcrypto.getRandomValues(buffer);
  let out = "";
  for (const byte of buffer) out += ALNUM[byte % ALNUM.length];
  return out;
}

async function sha256Hex(value) {
  const digest = await webcrypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Buffer.from(digest).toString("hex");
}

function fail(message) {
  console.error(`mint-api-client: ${message}`);
  process.exit(1);
}
