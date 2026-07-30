import { spawnSync } from "node:child_process";

export const CLI_VERSION = "2.110.0";
export const NETWORK_NAME = "bean-wiki-loopback";

const dockerCommand = process.platform === "win32" ? "docker.exe" : "docker";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const loopbackOption = "com.docker.network.bridge.host_binding_ipv4";

function run(command, args) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });
}

export function supabase(args) {
  return run(npxCommand, ["--yes", `supabase@${CLI_VERSION}`, ...args]);
}

export function readStatus() {
  const result = supabase(["status", "-o", "json"]);
  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

export function ensureLoopbackNetwork() {
  const inspected = run(dockerCommand, [
    "network",
    "inspect",
    "--format",
    `{{ index .Options "${loopbackOption}" }}`,
    NETWORK_NAME,
  ]);

  if (inspected.status === 0) {
    if (inspected.stdout.trim() !== "127.0.0.1") {
      throw new Error(
        `Docker network ${NETWORK_NAME} exists without loopback-only binding.`,
      );
    }
    return;
  }

  const created = run(dockerCommand, [
    "network",
    "create",
    "--driver",
    "bridge",
    "--opt",
    `${loopbackOption}=127.0.0.1`,
    NETWORK_NAME,
  ]);
  if (created.status !== 0) {
    throw new Error(
      created.stderr.trim() || "Could not create the local Supabase network.",
    );
  }
}

export function ensureLocalSupabase() {
  const existing = readStatus();
  if (existing) return existing;

  ensureLoopbackNetwork();
  const started = supabase(["start", "--network-id", NETWORK_NAME]);
  if (started.status !== 0) {
    throw new Error(
      started.stderr.trim() || "Could not start the local Supabase stack.",
    );
  }

  const status = readStatus();
  if (!status) {
    throw new Error("Could not read the local Supabase connection status.");
  }
  return status;
}
