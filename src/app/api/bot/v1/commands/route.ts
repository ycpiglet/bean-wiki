// POST /api/bot/v1/commands
//
// Transport-agnostic bot core. A chat adapter, the admin console, and an MCP
// tool all post the same body here, so the command catalogue, the role checks,
// and the audit trail exist exactly once.
//
// Contract: docs/BOT-COMMAND-CATALOG.md

import { ok, problem, newRequestId } from "@/lib/api/envelope";
import { requireClient } from "@/lib/api/auth";
import { SCOPES, grantsScope } from "@/lib/api/scopes";
import { getPlatformUser } from "@/lib/platform-auth";
import { resolveRole, roleAtLeast, type Role } from "@/lib/roles";
import { route } from "@/lib/bot/router";
import { execute } from "@/lib/bot/execute";
import { BOT_COMMANDS } from "@/lib/bot/catalog";
import { recordCommand, issueConfirmation, consumeConfirmation } from "@/lib/bot/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA = "bot_command_result.v1";
const MAX_MESSAGE = 500;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  // Two ways in, one authorisation model: a signed-in operator (browser/console)
  // or a registered client holding bot:command (chat adapter, MCP bridge). In
  // both cases the *human* role is what gates the command.
  const actor = await resolveActor(request, body);
  if (!actor.ok) return actor.response;
  const { role, actorRef, surface, requestId } = actor;

  const message = typeof body?.message === "string" ? body.message : "";
  const explicitCommandId =
    typeof body?.command_id === "string" ? body.command_id : undefined;

  if (!message.trim() && !explicitCommandId) {
    return ok(SCHEMA, helpPayload(role), { requestId });
  }
  if (message.length > MAX_MESSAGE) {
    return problem("invalid_request", {
      requestId,
      detail: `\`message\`는 ${MAX_MESSAGE}자 이하여야 합니다.`,
    });
  }

  // No classifier is wired in: routing is deterministic until a reviewed
  // classifier lands. Absent one, an unmatched message shows the catalogue
  // rather than guessing.
  const routed = await route(message, { explicitCommandId });

  if (!routed.matched) {
    await recordCommand({
      requestId,
      actorRef,
      actorRole: role,
      surface,
      commandId: null,
      params: {},
      mode: "read",
      outcome: routed.reason,
      rowCount: null,
      suppressed: 0,
    });
    return ok(
      SCHEMA,
      {
        matched: false,
        reason: routed.reason,
        candidates: routed.candidates,
        ...helpPayload(role),
      },
      { requestId },
    );
  }

  const { command, params, source } = routed;

  // The catalogue declares a per-command scope, and until now that declaration
  // did nothing at runtime: the endpoint checked only `bot:command` plus the
  // operator's role. An adapter granted `bot:command` could therefore reach
  // `requests.triage`, which declares `content-requests:triage`, without ever
  // holding it. Client-authenticated callers must satisfy both.
  if (actor.clientScopes && !grantsScope(actor.clientScopes, command.requiredScope)) {
    await recordCommand({
      requestId,
      actorRef,
      actorRole: role,
      surface,
      commandId: command.id,
      params,
      mode: command.mode,
      outcome: "forbidden_scope",
      rowCount: null,
      suppressed: 0,
    });
    return problem("forbidden_scope", {
      requestId,
      detail: `\`${command.id}\`에는 \`${command.requiredScope}\` 스코프가 필요합니다.`,
    });
  }

  if (!roleAtLeast(role, command.requiredRole)) {
    await recordCommand({
      requestId,
      actorRef,
      actorRole: role,
      surface,
      commandId: command.id,
      params,
      mode: command.mode,
      outcome: "forbidden_role",
      rowCount: null,
      suppressed: 0,
    });
    return problem("forbidden_scope", {
      requestId,
      detail: `\`${command.id}\`는 ${command.requiredRole} 이상이 필요합니다.`,
    });
  }

  // Write commands are never executed off a single message. The first call
  // returns a confirmation token describing exactly what will happen; only a
  // second call carrying that token runs.
  if (command.mode === "write") {
    const token = typeof body?.confirmation_token === "string" ? body.confirmation_token : null;
    if (!token) {
      const issued = await issueConfirmation({
        actorRef,
        commandId: command.id,
        params,
      });
      await recordCommand({
        requestId,
        actorRef,
        actorRole: role,
        surface,
        commandId: command.id,
        params,
        mode: "write",
        outcome: "confirmation_required",
        rowCount: null,
        suppressed: 0,
      });
      return ok(
        SCHEMA,
        {
          matched: true,
          command_id: command.id,
          requires_confirmation: true,
          confirmation_token: issued.token,
          expires_at: issued.expiresAt,
          will_do: `${command.title} — ${JSON.stringify(params)}`,
        },
        { requestId },
      );
    }
    const consumed = await consumeConfirmation(token, actorRef, command.id);
    if (!consumed.ok) {
      await recordCommand({
        requestId,
        actorRef,
        actorRole: role,
        surface,
        commandId: command.id,
        params,
        mode: "write",
        outcome: `confirmation_${consumed.reason}`,
        rowCount: null,
        suppressed: 0,
      });
      return problem("state_conflict", {
        requestId,
        detail: `확인 토큰이 유효하지 않습니다 (${consumed.reason}).`,
      });
    }
  }

  try {
    const result = await execute({ command, params });
    await recordCommand({
      requestId,
      actorRef,
      actorRole: role,
      surface,
      commandId: command.id,
      params,
      mode: command.mode,
      outcome: result.ok ? "ok" : "handler_error",
      rowCount: result.ok ? result.rowCount : null,
      suppressed: result.ok ? result.suppressed : 0,
    });

    if (!result.ok) {
      return problem("unprocessable", { requestId, detail: result.detail });
    }

    return ok(
      SCHEMA,
      {
        matched: true,
        command_id: command.id,
        match_source: source,
        params,
        text: result.text,
        result: result.data,
        suppressed: result.suppressed,
      },
      { requestId },
    );
  } catch (error) {
    const name = (error as { name?: string } | null)?.name;
    if (name !== "D1UnavailableError") throw error;
    return problem("storage_unavailable", {
      requestId,
      detail: "지표 저장소가 연결되지 않았습니다.",
    });
  }
}

type ActorResolution =
  | {
      ok: true;
      role: Role;
      actorRef: string;
      surface: string;
      requestId: string;
      /**
       * Scopes of the authenticated adapter, or undefined for a browser-session
       * operator (who holds no client credential and is governed by role alone).
       */
      clientScopes?: string[];
    }
  | { ok: false; response: Response };

async function resolveActor(
  request: Request,
  body: Record<string, unknown> | null,
): Promise<ActorResolution> {
  if (request.headers.get("authorization")) {
    const auth = await requireClient(request, SCOPES.botCommand);
    if (!auth.ok) return { ok: false, response: auth.response };

    // A client credential authenticates the *adapter*, not a person. The adapter
    // must name the operator it is acting for, and that operator's stored role
    // decides what runs — otherwise anyone in a chat channel inherits the
    // adapter's authority.
    const onBehalfOf =
      typeof body?.on_behalf_of === "string" ? body.on_behalf_of.trim() : "";
    if (!onBehalfOf) {
      return {
        ok: false,
        response: problem("invalid_request", {
          requestId: auth.requestId,
          detail:
            "`on_behalf_of`에 명령을 요청한 운영자 계정을 넣어야 합니다. 클라이언트 자격증명만으로는 실행하지 않습니다.",
        }),
      };
    }
    const role = await resolveRole(onBehalfOf);
    if (role === "reader") {
      return {
        ok: false,
        response: problem("forbidden_scope", {
          requestId: auth.requestId,
          detail: "해당 운영자에게 봇 명령 권한이 없습니다.",
        }),
      };
    }
    return {
      ok: true,
      role,
      actorRef: onBehalfOf.toLowerCase(),
      surface: typeof body?.surface === "string" ? body.surface.slice(0, 40) : "client",
      requestId: auth.requestId,
      clientScopes: auth.client.scopes,
    };
  }

  const requestId = newRequestId();
  const user = await getPlatformUser();
  if (!user) {
    return {
      ok: false,
      response: problem("unauthorized", {
        requestId,
        detail: "로그인 세션 또는 bot:command 스코프를 가진 클라이언트 자격증명이 필요합니다.",
      }),
    };
  }
  const role = await resolveRole(user.accountKey);
  if (role === "reader") {
    return {
      ok: false,
      response: problem("forbidden_scope", {
        requestId,
        detail: "봇 명령 권한이 없습니다.",
      }),
    };
  }
  return { ok: true, role, actorRef: user.accountKey, surface: "console", requestId };
}

function helpPayload(role: Role) {
  const available = BOT_COMMANDS.filter((command) =>
    roleAtLeast(role, command.requiredRole),
  );
  return {
    role,
    commands: available.map((command) => ({
      id: command.id,
      title: command.title,
      description: command.description,
      mode: command.mode,
      examples: command.examples,
    })),
    hidden_count: BOT_COMMANDS.length - available.length,
  };
}

export async function GET(request: Request) {
  // Catalogue introspection: same authorisation, no execution.
  const actor = await resolveActor(request, null);
  if (!actor.ok) return actor.response;
  return ok(SCHEMA, helpPayload(actor.role), { requestId: actor.requestId });
}
