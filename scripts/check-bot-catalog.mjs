#!/usr/bin/env node
// Bot catalogue gate.
//
// The bot's safety property is "it can only run a reviewed, parameterised query
// from a closed list". That property lives in convention, not in the type system,
// so it is asserted here:
//
//   - every command declares requiredRole, requiredScope, and mode
//   - write commands exist only behind the confirmation flow
//   - handlers named in the catalogue are actually implemented
//   - no handler interpolates caller input into SQL
//   - aggregate handlers go through the k-anonymity suppression helper
//   - nothing selects a column that carries personal data
//   - every command is documented and has Korean + English triggers

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const botDir = join(root, "src", "lib", "bot");

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const catalogPath = join(botDir, "catalog.ts");
if (!existsSync(catalogPath)) {
  console.error("✗ check-bot-catalog: src/lib/bot/catalog.ts is missing.");
  process.exit(1);
}
const catalog = readFileSync(catalogPath, "utf8");
const execute = existsSync(join(botDir, "execute.ts"))
  ? readFileSync(join(botDir, "execute.ts"), "utf8")
  : "";
const routerSource = existsSync(join(botDir, "router.ts"))
  ? readFileSync(join(botDir, "router.ts"), "utf8")
  : "";

const scopeSource = readFileSync(join(root, "src", "lib", "api", "scopes.ts"), "utf8");
const rolesSource = readFileSync(join(root, "src", "lib", "roles.ts"), "utf8");
const knownRoles = new Set(
  (/export const ROLES = \[([^\]]+)\]/.exec(rolesSource)?.[1] ?? "")
    .split(",")
    .map((value) => value.trim().replace(/['"]/g, ""))
    .filter(Boolean),
);

// Split the catalogue array into per-command blocks on the `id:` boundary.
const blocks = catalog.split(/\n  \{\n/).slice(1);
if (blocks.length === 0) {
  err("catalog.ts: could not parse any command blocks.");
}

const seenIds = new Set();
const handlers = new Set();
let writeCommands = 0;

for (const block of blocks) {
  const id = /id:\s*"([^"]+)"/.exec(block)?.[1];
  if (!id) {
    err("catalog.ts: a command block has no `id`.");
    continue;
  }
  if (seenIds.has(id)) err(`catalog.ts: duplicate command id "${id}".`);
  seenIds.add(id);

  const role = /requiredRole:\s*"([^"]+)"/.exec(block)?.[1];
  const scope = /requiredScope:\s*SCOPES\.(\w+)/.exec(block)?.[1];
  const mode = /mode:\s*"([^"]+)"/.exec(block)?.[1];
  const handler = /handler:\s*"([^"]+)"/.exec(block)?.[1];

  if (!role) err(`${id}: missing requiredRole.`);
  else if (!knownRoles.has(role)) {
    err(`${id}: requiredRole "${role}" is not in ROLES in src/lib/roles.ts.`);
  }
  if (!scope) err(`${id}: missing requiredScope (must reference a SCOPES constant).`);
  else if (!new RegExp(`\\b${scope}:`).test(scopeSource)) {
    err(`${id}: SCOPES.${scope} is not defined in src/lib/api/scopes.ts.`);
  }
  if (!mode) err(`${id}: missing mode.`);
  else if (mode !== "read" && mode !== "write") {
    err(`${id}: mode must be "read" or "write", got "${mode}".`);
  }
  if (mode === "write") writeCommands += 1;

  if (!handler) err(`${id}: missing handler name.`);
  else handlers.add(handler);

  // Both languages, or an operator typing in the other one silently gets the
  // catalogue instead of an answer.
  const patternBlock = /patterns:\s*\[([\s\S]*?)\n    \]/.exec(block)?.[1] ?? "";
  if (!patternBlock.trim()) {
    err(`${id}: has no trigger patterns.`);
  } else {
    if (!/[가-힣]/.test(patternBlock)) warn(`${id}: has no Korean trigger pattern.`);
    if (!/[A-Za-z]{3,}/.test(patternBlock)) warn(`${id}: has no English trigger pattern.`);
  }

  const exampleBlock = /examples:\s*\[([\s\S]*?)\]/.exec(block)?.[1] ?? "";
  if ((exampleBlock.match(/"/g) ?? []).length < 2) {
    err(`${id}: needs at least one example utterance.`);
  }

  const metricId = /metricId:\s*(?:"([^"]+)"|null)/.exec(block);
  if (!metricId) err(`${id}: must set metricId to a metric id or null.`);
}

// Handlers must exist, or a matched command dies at runtime.
if (execute) {
  for (const handler of handlers) {
    if (!new RegExp(`case\\s+"${handler}"`).test(execute)) {
      err(`execute.ts: no case for handler "${handler}".`);
    }
  }
} else {
  err("src/lib/bot/execute.ts is missing.");
}

// The core invariant: no dynamic SQL.
if (execute) {
  // Template literals containing ${...} inside a SQL-looking string are the
  // shape we forbid. Whitelisted: a placeholder list built from a known-length
  // constant array (`open.map(() => "?")`), which contains no caller input.
  const sqlTemplates = [...execute.matchAll(/`[^`]*(?:SELECT|INSERT|UPDATE|DELETE)[^`]*`/gis)];
  for (const [snippet] of sqlTemplates) {
    for (const [, expr] of snippet.matchAll(/\$\{([^}]+)\}/g)) {
      const safe = /^\s*placeholders\s*$/.test(expr);
      if (!safe) {
        err(
          `execute.ts: SQL template interpolates \`${expr.trim()}\`. ` +
            `Bind parameters instead — the bot must never assemble SQL from values.`,
        );
      }
    }
  }

  // Aggregates must pass the k-anonymity floor.
  //
  // Checking that the FILE mentions the helper is far too weak: it passed while
  // runContentGaps() returned raw single-hit rows with `suppressed: 0`. So assert
  // it per handler — every handler that returns rows must either suppress or
  // hard-code `suppressed: 0` alongside a documented exemption.
  if (!/applySuppression|suppressSmall/.test(execute)) {
    err(
      "execute.ts: never calls applySuppression()/suppressSmall(). " +
        "Aggregates must respect K_ANONYMITY_FLOOR (docs/TELEMETRY-AND-PRIVACY.md).",
    );
  }
  for (const handler of handlers) {
    const body = handlerBody(execute, handler);
    if (!body) continue;
    const returnsRows = /rowCount:\s*(?!null)/.test(body);
    if (!returnsRows) continue;
    const suppresses = /applySuppression|suppressSmall/.test(body);
    const exempt = /suppression-exempt:/.test(body);
    if (!suppresses && !exempt) {
      err(
        `execute.ts: handler "${handler}" returns rows without calling ` +
          `applySuppression()/suppressSmall(). Add the floor, or justify it with a ` +
          `\`// suppression-exempt: <reason>\` comment inside the handler.`,
      );
    }
  }

  // Personal data must not be selected at all.
  const forbiddenColumns = ["email", "display_name", "session_hash", "secret_hash", "body_html"];
  for (const column of forbiddenColumns) {
    if (new RegExp(`SELECT[^;\`]*\\b${column}\\b`, "is").test(execute)) {
      err(
        `execute.ts: selects \`${column}\`, which must never reach a bot reply ` +
          `(docs/BOT-COMMAND-CATALOG.md guardrails).`,
      );
    }
  }
}

// Write commands require the confirmation flow to exist.
if (writeCommands > 0) {
  const auditPath = join(botDir, "audit.ts");
  const audit = existsSync(auditPath) ? readFileSync(auditPath, "utf8") : "";
  if (!/issueConfirmation/.test(audit) || !/consumeConfirmation/.test(audit)) {
    err(
      `catalog.ts declares ${writeCommands} write command(s) but src/lib/bot/audit.ts ` +
        `does not implement the confirmation flow.`,
    );
  }
  if (!/consumed_at IS NULL/.test(audit)) {
    err("audit.ts: confirmation consumption must be conditional on `consumed_at IS NULL` (single use).");
  }
}

// An ambiguous message must never resolve to a write command.
if (routerSource && !/mode === "read"/.test(routerSource)) {
  err(
    "router.ts: does not restrict ambiguous or classifier-selected matches to read-mode commands.",
  );
}

// Every command documented.
const docPath = join(root, "docs", "BOT-COMMAND-CATALOG.md");
if (existsSync(docPath)) {
  const doc = readFileSync(docPath, "utf8");
  for (const id of seenIds) {
    if (!doc.includes(id)) warn(`${id} is not documented in docs/BOT-COMMAND-CATALOG.md.`);
  }
} else {
  warn("docs/BOT-COMMAND-CATALOG.md does not exist yet.");
}

/** Body of `async function run<Handler>(...)`, up to the next top-level function. */
function handlerBody(source, handler) {
  const name = `run${handler.charAt(0).toUpperCase()}${handler.slice(1)}`;
  const start = source.search(new RegExp(`(?:async\\s+)?function\\s+${name}\\b`));
  if (start < 0) return null;
  const rest = source.slice(start + 1);
  const next = rest.search(/\n(?:async\s+)?function\s/);
  return next < 0 ? rest : rest.slice(0, next);
}

for (const warning of warnings) console.warn(`  warn  ${warning}`);

if (errors.length > 0) {
  console.error(`\n✗ check-bot-catalog: ${errors.length} error(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ check-bot-catalog: ${seenIds.size} commands (${writeCommands} write), ` +
    `${handlers.size} handlers, no dynamic SQL` +
    (warnings.length ? `, ${warnings.length} warning(s)` : ""),
);
