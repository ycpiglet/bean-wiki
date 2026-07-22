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
  ref?: string,
): Promise<FileContent | null> {
  const { branch } = getRepoConfig();
  const res = await fetch(`${contentsUrl(path)}?ref=${encodeURIComponent(ref || branch)}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const json = (await res.json()) as { sha: string; content: string; encoding: string };
  const text = Buffer.from(json.content, "base64").toString("utf8");
  return { sha: json.sha, text };
}

export type CommitInfo = {
  sha: string;
  message: string;
  date: string;
  author: string;
  htmlUrl: string;
};

// List the commit history for a single path (newest first). Works
// unauthenticated for public repos.
export async function ghListCommits(
  path: string,
  token?: string | null,
  limit = 30,
): Promise<CommitInfo[]> {
  const { owner, repo, branch } = getRepoConfig();
  const url = `${API}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(branch)}&per_page=${limit}`;
  const res = await fetch(url, { headers: headers(token), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub commits failed: ${res.status}`);
  const json = (await res.json()) as {
    sha: string;
    html_url: string;
    commit: { message: string; author?: { name?: string; date?: string } };
    author?: { login?: string } | null;
  }[];
  return json.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    date: c.commit.author?.date ?? "",
    author: c.author?.login || c.commit.author?.name || "unknown",
    htmlUrl: c.html_url,
  }));
}

export type PutResult = { commitSha: string; htmlUrl: string; contentSha: string };

// Create or update a file from already-base64-encoded content (e.g. an image
// upload). Pass `sha` to update.
export async function ghPutFileBase64(opts: {
  path: string;
  base64: string;
  message: string;
  token: string;
  sha?: string;
}): Promise<PutResult> {
  return putRaw(opts.path, opts.base64, opts.message, opts.token, opts.sha);
}

// Create or update a text file. Pass `sha` to update (omit to create).
export async function ghPutFile(opts: {
  path: string;
  text: string;
  message: string;
  token: string;
  sha?: string;
}): Promise<PutResult> {
  return putRaw(
    opts.path,
    Buffer.from(opts.text, "utf8").toString("base64"),
    opts.message,
    opts.token,
    opts.sha,
  );
}

// Commit several file changes atomically via the Git Data API (create blobs ->
// tree -> commit -> move ref). `content: null` deletes a path. Used by rename,
// which must touch multiple files in one commit to keep references consistent.
export type FileChange = { path: string; content: string | null };

export async function ghCommitFiles(opts: {
  changes: FileChange[];
  message: string;
  token: string;
}): Promise<{ commitSha: string }> {
  const { owner, repo, branch } = getRepoConfig();
  const base = `${API}/repos/${owner}/${repo}`;
  const h = { ...headers(opts.token), "Content-Type": "application/json" };

  const api = async (path: string, init?: RequestInit) => {
    const res = await fetch(`${base}${path}`, { ...init, headers: h, cache: "no-store" });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`GitHub ${init?.method ?? "GET"} ${path} failed: ${res.status} ${detail}`);
    }
    return res.json();
  };

  const ref = (await api(`/git/ref/heads/${branch}`)) as { object: { sha: string } };
  const baseSha = ref.object.sha;
  const baseCommit = (await api(`/git/commits/${baseSha}`)) as { tree: { sha: string } };

  const tree = await Promise.all(
    opts.changes.map(async (c) => {
      if (c.content === null) {
        return { path: c.path, mode: "100644", type: "blob", sha: null };
      }
      const blob = (await api(`/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: c.content, encoding: "utf-8" }),
      })) as { sha: string };
      return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );

  const newTree = (await api(`/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }),
  })) as { sha: string };

  const commit = (await api(`/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message: opts.message, tree: newTree.sha, parents: [baseSha] }),
  })) as { sha: string };

  await api(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return { commitSha: commit.sha };
}

async function putRaw(
  path: string,
  contentBase64: string,
  message: string,
  token: string,
  sha?: string,
): Promise<PutResult> {
  const { branch } = getRepoConfig();
  const body: Record<string, unknown> = { message, content: contentBase64, branch };
  if (sha) body.sha = sha;

  const res = await fetch(contentsUrl(path), {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${detail}`);
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
