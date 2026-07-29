import {
  ensureLocalSupabase,
  NETWORK_NAME,
  supabase,
} from "./local-supabase.mjs";

const command = process.argv[2] || "start";

function fail(error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function relay(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

try {
  if (command === "start") {
    const status = ensureLocalSupabase();
    process.stdout.write(
      `Bean Wiki 로컬 프로필 저장소가 준비되었습니다: ${status.API_URL}\n`,
    );
  } else if (command === "stop") {
    relay(supabase(["stop", "--project-id", "bean-wiki"]));
  } else if (command === "reset") {
    ensureLocalSupabase();
    relay(
      supabase(["db", "reset", "--local", "--network-id", NETWORK_NAME]),
    );
  } else if (command === "test") {
    ensureLocalSupabase();
    relay(
      supabase(["test", "db", "--local", "--network-id", NETWORK_NAME]),
    );
  } else {
    fail(`Unknown profile database command: ${command}`);
  }
} catch (error) {
  fail(error);
}
