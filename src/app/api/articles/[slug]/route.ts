// Save API: validate editor input, serialize to a canonical HTML source, and
// commit to GitHub (which triggers a Vercel rebuild). Editing requires a
// linked GitHub identity (Google sign-in alone is read-only): the commit is
// made with the linked user's token so history is attributed to them. When
// that token lacks push access, the save is staged as a PR proposal via the
// server PAT (GITHUB_CONTENT_TOKEN) instead of a direct commit.
import type { NextRequest } from "next/server";
import { readSession, type Session } from "@/lib/session";
import {
  GhError,
  ghCommitFiles,
  ghCreateBranch,
  ghGetFile,
  ghOpenPullRequest,
  ghPutFile,
  proposalToken,
  resolveCommitToken,
  commitEnabled,
} from "@/lib/github";
import { googleConfigured, oauthConfigured } from "@/lib/oauth";
import { getArticle } from "@/lib/content";
import {
  sourcePath,
  validateSave,
  buildUpdatedSource,
  buildNewSource,
  type SaveInput,
} from "@/lib/editing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_PATH = "src/content/articles/order.json";

function localeOf(value: string | null): "ko" | "en" {
  return value === "en" ? "en" : "ko";
}

// Report the current source-file sha (for optimistic-concurrency / conflict
// detection) and whether committing is possible. The editor calls this on load.
export async function GET(req: NextRequest, ctx: RouteContext<"/api/articles/[slug]">) {
  const { slug } = await ctx.params;
  const locale = localeOf(req.nextUrl.searchParams.get("locale"));
  const session = await readSession();
  let sha: string | null = null;
  try {
    const file = await ghGetFile(sourcePath(slug, locale), resolveCommitToken(session));
    sha = file?.sha ?? null;
  } catch {
    // Network / rate-limit failures leave sha null: conflict detection simply
    // won't fire; the save still validates server-side.
  }
  // ko/en sync hint: section-id parity is the structural contract check-content
  // enforces. Ids only diverge when a real, diverging en translation exists
  // (a missing en file falls back to ko, so ids match).
  const koArt = getArticle(slug, "ko");
  const enArt = getArticle(slug, "en");
  const enOutOfSync =
    !!koArt &&
    !!enArt &&
    koArt.sections.map((s) => s.id).join(",") !== enArt.sections.map((s) => s.id).join(",");

  return Response.json({
    loggedIn: Boolean(session),
    user: session
      ? { name: session.user.name, provider: session.user.provider, avatar: session.user.avatar ?? null }
      : null,
    login: session?.github?.login ?? null,
    githubLinked: Boolean(session?.github),
    commitEnabled: commitEnabled(session),
    oauthEnabled: oauthConfigured(),
    googleEnabled: googleConfigured(),
    enOutOfSync,
    sha,
  });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/articles/[slug]">) {
  const { slug } = await ctx.params;
  const session = await readSession();
  if (!session) {
    return Response.json(
      { error: "auth_required", message: "Sign in to publish." },
      { status: 401 },
    );
  }
  const token = resolveCommitToken(session);
  if (!token) {
    return Response.json(
      {
        error: "github_link_required",
        message: "Publishing requires a linked GitHub account (commits and PR proposals run under your GitHub identity).",
      },
      { status: 403 },
    );
  }

  let raw: Partial<SaveInput>;
  try {
    raw = (await req.json()) as Partial<SaveInput>;
  } catch {
    return Response.json({ error: "bad_request", message: "invalid JSON body" }, { status: 400 });
  }

  const locale = localeOf(raw.locale ?? null);
  const input: SaveInput = {
    slug,
    locale,
    title: raw.title ?? "",
    summary: raw.summary ?? "",
    fact: raw.fact,
    bodyHtml: raw.bodyHtml ?? "",
    editSummary: raw.editSummary ?? "",
    baseSha: raw.baseSha,
    category: raw.category,
    level: raw.level,
    accent: raw.accent,
    tags: raw.tags,
    related: raw.related,
    contributor: session.github
      ? {
          id: `github:${session.github.login.toLowerCase()}`,
          name:
            session.github.name ||
            session.user.name ||
            session.github.login,
          handle: `@${session.github.login}`,
          avatar: session.github.avatar || session.user.avatar,
          kind: "human",
          role: "Community Contributor",
        }
      : undefined,
  };

  try {
    const path = sourcePath(slug, locale);
    const existing = await ghGetFile(path, token);
    const creating = !existing;

    const errors = validateSave(input, creating);
    if (errors.length) {
      return Response.json({ error: "invalid", errors }, { status: 422 });
    }

    if (!creating && input.baseSha && existing!.sha !== input.baseSha) {
      return Response.json(
        {
          error: "conflict",
          message:
            "This article changed since you started editing. Reload to get the latest version, then re-apply your changes.",
          currentSha: existing!.sha,
        },
        { status: 409 },
      );
    }

    const source = creating ? buildNewSource(input) : buildUpdatedSource(existing!.text, input);
    const verb = creating ? "create" : "edit";
    const tag = locale === "en" ? " en" : "";
    const message = `content: ${verb}(${slug}${tag}): ${input.editSummary.trim()}`;

    let put;
    try {
      put = await ghPutFile({ path, text: source, message, token, sha: existing?.sha });
    } catch (error) {
      // 403/404 on write = the linked user has no push access. Stage the same
      // change as a PR proposal via the server PAT instead.
      if (error instanceof GhError && (error.status === 403 || error.status === 404)) {
        return proposeAsPullRequest({ session, slug, path, source, message, creating, locale });
      }
      throw error;
    }

    // A brand-new Korean article must also be registered in order.json.
    if (creating && locale === "ko") {
      const orderFile = await ghGetFile(ORDER_PATH, token);
      if (orderFile) {
        const order = JSON.parse(orderFile.text) as string[];
        if (!order.includes(slug)) {
          order.push(slug);
          await ghPutFile({
            path: ORDER_PATH,
            text: JSON.stringify(order, null, 2) + "\n",
            message: `content: register(${slug})`,
            token,
            sha: orderFile.sha,
          });
        }
      }
    }

    return Response.json({
      committed: true,
      creating,
      commit: { sha: put.commitSha, url: put.htmlUrl, contentSha: put.contentSha },
      publishing: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "commit failed";
    return Response.json({ error: "commit_failed", message }, { status: 502 });
  }
}

// PR-proposal path for linked users without push access: branch off main with
// the server PAT, commit the change there (atomically, including order.json
// for new articles), and open a PR crediting the proposer's GitHub login.
async function proposeAsPullRequest(opts: {
  session: Session;
  slug: string;
  path: string;
  source: string;
  message: string;
  creating: boolean;
  locale: "ko" | "en";
}): Promise<Response> {
  const pat = proposalToken();
  const login = opts.session.github!.login;
  if (!pat) {
    return Response.json(
      {
        error: "no_push_access",
        message:
          "Your GitHub account has no push access to this repo, and PR proposals are not configured (GITHUB_CONTENT_TOKEN). Ask a maintainer for write access.",
      },
      { status: 403 },
    );
  }

  try {
    const branch = `proposal/${opts.slug}-${Date.now().toString(36)}`;
    await ghCreateBranch(branch, pat);

    const changes = [{ path: opts.path, content: opts.source }];
    if (opts.creating && opts.locale === "ko") {
      const orderFile = await ghGetFile(ORDER_PATH, pat);
      if (orderFile) {
        const order = JSON.parse(orderFile.text) as string[];
        if (!order.includes(opts.slug)) {
          order.push(opts.slug);
          changes.push({ path: ORDER_PATH, content: JSON.stringify(order, null, 2) + "\n" });
        }
      }
    }

    await ghCommitFiles({ changes, message: opts.message, token: pat, branch });
    const pr = await ghOpenPullRequest({
      head: branch,
      title: opts.message.split("\n")[0],
      body: `Proposed from the Bean Wiki editor by @${login}.`,
      token: pat,
    });

    return Response.json({
      committed: false,
      proposed: true,
      creating: opts.creating,
      pr: { number: pr.number, url: pr.htmlUrl },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "proposal failed";
    return Response.json({ error: "proposal_failed", message }, { status: 502 });
  }
}
