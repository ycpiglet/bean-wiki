import { spawn } from "node:child_process";
import { ensureLocalSupabase } from "./local-supabase.mjs";

const DEV_EMAIL = process.env.BEAN_WIKI_DEV_EMAIL || "developer@bean.wiki";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

let status;
try {
  process.stdout.write("로컬 Supabase 프로필 저장소를 시작합니다…\n");
  status = ensureLocalSupabase();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

if (!status?.API_URL || !status?.SERVICE_ROLE_KEY) {
  process.stderr.write(
    "로컬 Supabase 연결 정보를 읽지 못했습니다. `npm run profile-db:reset` 후 다시 시도하세요.\n",
  );
  process.exit(1);
}

const health = await fetch(
  `${status.API_URL}/rest/v1/profiles?select=account_key&limit=0`,
  {
    headers: {
      apikey: status.SERVICE_ROLE_KEY,
      Authorization: `Bearer ${status.SERVICE_ROLE_KEY}`,
    },
  },
).catch(() => null);

if (!health?.ok) {
  process.stderr.write(
    "로컬 프로필 스키마가 준비되지 않았습니다. `npm run profile-db:reset` 후 다시 시도하세요.\n",
  );
  process.exit(1);
}

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);
adminEmails.add(DEV_EMAIL.toLowerCase());

process.stdout.write(
  [
    `로컬 프로필 저장소 준비 완료: ${status.API_URL}`,
    `개발 계정: ${DEV_EMAIL}`,
    "계정 화면에서 ‘개발 계정으로 로그인’을 선택하세요.",
    "",
  ].join("\n"),
);

const child = spawn(
  npmCommand,
  ["run", "dev:vercel", "--", "--webpack"],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      // Polling avoids exhausting Linux inotify watches when several agent
      // worktrees and development servers are active at once.
      WATCHPACK_POLLING: process.env.WATCHPACK_POLLING || "true",
      CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING || "true",
      PROFILE_STORE_MODE: "supabase",
      SUPABASE_URL: status.API_URL,
      SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
      BEAN_WIKI_DEV_AUTH: "1",
      BEAN_WIKI_DEV_EMAIL: DEV_EMAIL,
      BEAN_WIKI_DEV_NAME:
        process.env.BEAN_WIKI_DEV_NAME || "Bean Wiki Developer",
      AUTH_SECRET:
        process.env.AUTH_SECRET ||
        "bean-wiki-local-development-only-session-secret-v1",
      ADMIN_EMAILS: [...adminEmails].join(","),
    },
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
