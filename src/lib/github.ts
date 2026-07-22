// Thin GitHub Contents API client used by the save/history routes. Plain fetch,
// no SDK. Commits are attributed to the logged-in user's token when present,
// otherwise to a server fine-grained PAT (GITHUB_CONTENT_TOKEN) if configured.
import type { Session } from "@/lib/session";

const API = "https://api.github.com";

export type RepoConfig = { owner: string; repo: string; branch: string };

export function getRepoConfig(): RepoConfig {
  const repo = process.env.GITHUB_REPO || "ycpiglet/bean-wiki";
  const [owner, name] = repo.split("/");
  return { owner, repo: name, branch: process.env.GITHUB_BRANCH || "main" };
}

// The token used to commit: the editor's own GitHub token (preferred, so the
// commit is attributed to them) or a server PAT fallback.
export function resolveCommitToken(session: Session | null): string | null {
  return session?.token || process.env.GITHUB_CONTENT_TOKEN || null;
}

export function commitEnabled(session: Session | null): boolean {
  return Boolean(resolveCommitToken(session));
}

function headers(token?: string | null): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "bean-wiki-editor",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

const contentsUrl = (path: string) => {
  const { owner, repo } = getRepoConfig();
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${API}/repos/${owner}/${repo}/contents/${encoded}`;
};

export type FileContent = { sha: string; text: string };

// GET a file's blob sha + decoded text. Returns null on 404. Works
// unauthenticated for public repos (rate-limited); pass a token to raise it.
export async function ghGetFile(
  path: string,
  token?: string | null,
): Promise<FileContent | null> {
  const { branch } = getRepoConfig();
  const res = await fetch(`${contentsUrl(path)}?ref=${encodeURIComponent(branch)}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const json = (await res.json()) as { sha: string; content: string; encoding: string };
  const text = Buffer.from(json.content, "base64").toString("utf8");
  return { sha: json.sha, text };
}

export type PutResult = { commitSha: string; htmlUrl: string; contentSha: string };

// Create or update a file. Pass `sha` to update (omit to create).
export async function ghPutFile(opts: {
  path: string;
  text: string;
  message: string;
  token: string;
  sha?: string;
}): Promise<PutResult> {
  const { branch } = getRepoConfig();
  const body: Record<string, unknown> = {
    message: opts.message,
    content: Buffer.from(opts.text, "utf8").toString("base64"),
    branch,
  };
  if (opts.sha) body.sha = opts.sha;

  const res = await fetch(contentsUrl(opts.path), {
    method: "PUT",
    headers: { ...headers(opts.token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub PUT ${opts.path} failed: ${res.status} ${detail}`);
  }
  const json = (await res.json()) as {
    commit: { sha: string; html_url: string };
    content: { sha: string };
  };
  return {
    commitSha: json.commit.sha,
    htmlUrl: json.commit.html_url,
    contentSha: json.content.sha,
  };
}
