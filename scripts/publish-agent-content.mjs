#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

function has(flag) {
  return args.includes(flag);
}

function valueOf(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 || !args[index + 1] ? fallback : args[index + 1];
}

const push = has("--push") || process.env.AGENT_PUBLISH_PUSH === "1";
const dryRun = has("--dry-run");
const remote = valueOf("--remote", "origin");
const message =
  valueOf("--message") ??
  valueOf("-m") ??
  "docs(content): publish agent article updates";

const allowedSpecs = [
  "src/content/articles",
  "src/content/media",
  "src/content/resources.ts",
  "src/content/recommendations.ts",
  "src/content/redirects.json",
  "public/article-media",
];

function run(command, commandArgs, options = {}) {
  const label = [command, ...commandArgs].join(" ");
  console.log(`\n$ ${label}`);
  if (dryRun && options.mutatesGit) {
    console.log("[dry-run] skipped");
    return "";
  }

  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.status !== 0) {
    if (options.capture) {
      process.stdout.write(result.stdout ?? "");
      process.stderr.write(result.stderr ?? "");
    }
    process.exit(result.status ?? 1);
  }

  return options.capture ? result.stdout : "";
}

function changedPaths(specs = []) {
  const output = run(
    "git",
    ["status", "--porcelain", "--", ...specs],
    { capture: true },
  );

  return output
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const path = line.slice(3);
      const renameTarget = path.split(" -> ").at(-1);
      return renameTarget ?? path;
    });
}

function currentBranch() {
  const branch = run("git", ["branch", "--show-current"], { capture: true }).trim();
  if (!branch) {
    console.error("Cannot publish from a detached HEAD.");
    process.exit(1);
  }
  return branch;
}

console.log("Publishing agent-authored Bean Wiki content");
console.log(`Mode: ${dryRun ? "dry-run" : push ? "commit + push" : "commit only"}`);
console.log(`Commit message: ${message}`);

run("npm", ["run", "build:content"]);
run("npm", ["run", "check-content"]);
run("npm", ["run", "check:editorial"]);
run("git", ["diff", "--check"]);

const files = changedPaths(allowedSpecs);
if (files.length === 0) {
  console.log("\nNo publishable content changes found.");
  process.exit(0);
}

console.log("\nContent paths to stage:");
for (const file of files) console.log(`- ${file}`);

if (dryRun) {
  console.log("\nDry run complete. No files were staged, committed, or pushed.");
  process.exit(0);
}

run("git", ["add", "--", ...allowedSpecs], { mutatesGit: true });

const staged = run("git", ["diff", "--cached", "--name-only"], { capture: true })
  .split("\n")
  .filter(Boolean);

if (staged.length === 0) {
  console.log("\nNo staged changes after applying allowed path filter.");
  process.exit(0);
}

console.log("\nStaged paths:");
for (const file of staged) console.log(`- ${file}`);

run("git", ["commit", "-m", message], { mutatesGit: true });

if (push) {
  const branch = currentBranch();
  run("git", ["push", remote, `HEAD:${branch}`], { mutatesGit: true });
  console.log(`\nPushed ${branch} to ${remote}. Vercel should start its connected deployment.`);
} else {
  console.log("\nCommitted locally. Re-run with --push to trigger the connected deployment.");
}
