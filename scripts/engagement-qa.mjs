#!/usr/bin/env node

const args = process.argv.slice(2);
const baseUrl = valueAfter("--base-url")?.replace(/\/+$/, "");
const slug = valueAfter("--slug");
const mode = valueAfter("--mode") === "public" ? "public" : "qa";
const dryRun = args.includes("--dry-run");
const credential = process.env.BEAN_WIKI_API_CREDENTIAL;

if (!baseUrl || !slug) {
  console.error("Usage: engagement-qa.mjs --base-url <url> --slug <slug> [--mode qa|public] [--dry-run]");
  process.exit(2);
}

const endpoint = `${baseUrl}/api/engagement/v1/articles/${encodeURIComponent(slug)}`;
const plan = [
  "read baseline",
  "create root comment",
  "create reply",
  "edit root comment",
  "like",
  "unlike",
  "delete reply",
  "delete root comment",
  "read final state",
];
if (dryRun) {
  console.log(JSON.stringify({ endpoint, mode, plan }, null, 2));
  process.exit(0);
}
if (!credential) {
  console.error("BEAN_WIKI_API_CREDENTIAL is required.");
  process.exit(2);
}

let rootId;
let replyId;
let liked = false;
let baseline;

try {
  baseline = await call("GET");
  const root = await call("POST", {
    action: "comment",
    mode,
    body: `QA thread ${new Date().toISOString()}`,
  });
  rootId = root.data.id;
  const reply = await call("POST", {
    action: "reply",
    mode,
    parentId: rootId,
    body: "QA reply: create and cleanup verification.",
  });
  replyId = reply.data.id;
  await call("PATCH", {
    action: "comment",
    mode,
    commentId: rootId,
    body: "QA thread edited successfully.",
  });
  await call("POST", { action: "like", mode, liked: true });
  liked = true;
  await call("DELETE", { action: "like", mode });
  liked = false;
  await call("DELETE", { action: "comment", mode, commentId: replyId });
  replyId = undefined;
  await call("DELETE", { action: "comment", mode, commentId: rootId });
  rootId = undefined;
  const final = await call("GET");
  if (mode === "qa") assertPublicCountsUnchanged(baseline.data, final.data);
  console.log(`Engagement QA passed for ${slug} (${mode}).`);
} catch (error) {
  console.error(`Engagement QA failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  // Best-effort cleanup; never print the credential or response body.
  if (liked) await call("DELETE", { action: "like", mode }).catch(() => undefined);
  if (replyId) {
    await call("DELETE", { action: "comment", mode, commentId: replyId }).catch(
      () => undefined,
    );
  }
  if (rootId) {
    await call("DELETE", { action: "comment", mode, commentId: rootId }).catch(
      () => undefined,
    );
  }
}

async function call(method, body) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${credential}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `${method} returned ${response.status} (${payload?.request_id ?? "no request id"})`,
    );
  }
  return payload;
}

function assertPublicCountsUnchanged(before, after) {
  const expected = {
    likes: before.likes.total,
    comments: before.comments.filter((item) => !item.deletedAt).length,
  };
  const actual = {
    likes: after.likes.total,
    comments: after.comments.filter((item) => !item.deletedAt).length,
  };
  if (expected.likes !== actual.likes || expected.comments !== actual.comments) {
    throw new Error(
      `QA data leaked into public metrics: before=${JSON.stringify(expected)} after=${JSON.stringify(actual)}`,
    );
  }
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}
