// Provenance for machine-submitted content.
//
// The rule this exists to enforce: nothing an external caller submits is ever
// published without a record of who or what produced it. A reader looking at an
// article should be able to learn that an agent drafted it and a human cleared
// it, so `actor` is required on submission and travels into the commit trail.

export const ACTOR_TYPES = ["human", "agent"] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

export type Actor = {
  type: ActorType;
  /** Authenticated client that submitted; set by the server, not the caller. */
  client_id: string;
  /** Model identifier when type is "agent". Required for agents. */
  model?: string;
  /** Team or person accountable for this actor's output. Always required. */
  operator: string;
  /** Version of the prompt/harness that produced the draft. */
  harness_version?: string;
};

export type ActorResult =
  | { ok: true; actor: Actor }
  | { ok: false; detail: string };

/**
 * Validates caller-supplied provenance. An agent submission without a model id
 * is rejected: "an AI wrote this, we don't know which" is not an auditable
 * record, and it is the field most likely to be omitted by accident.
 */
export function readActor(
  value: unknown,
  clientId: string,
  clientType: "human_app" | "agent" | "internal",
): ActorResult {
  if (!value || typeof value !== "object") {
    return {
      ok: false,
      detail: "`actor` is required: { type, operator, model?, harness_version? }.",
    };
  }
  const input = value as Record<string, unknown>;
  const type = typeof input.type === "string" ? input.type : "";
  if (!(ACTOR_TYPES as readonly string[]).includes(type)) {
    return { ok: false, detail: "`actor.type` must be \"human\" or \"agent\"." };
  }
  const operator = str(input.operator);
  if (!operator) {
    return {
      ok: false,
      detail: "`actor.operator` is required — name the team or person accountable.",
    };
  }
  const model = str(input.model);
  if (type === "agent" && !model) {
    return {
      ok: false,
      detail: "`actor.model` is required when `actor.type` is \"agent\".",
    };
  }
  // A client registered as an agent cannot launder its output as human work.
  if (clientType === "agent" && type === "human") {
    return {
      ok: false,
      detail: "This client is registered as an agent and cannot submit as `human`.",
    };
  }

  return {
    ok: true,
    actor: {
      type: type as ActorType,
      client_id: clientId,
      ...(model ? { model: model.slice(0, 120) } : {}),
      operator: operator.slice(0, 120),
      ...(str(input.harness_version)
        ? { harness_version: str(input.harness_version)!.slice(0, 60) }
        : {}),
    },
  };
}

/** One-line provenance for a commit message or an edit summary. */
export function actorLabel(actor: Actor): string {
  const who =
    actor.type === "agent"
      ? `agent ${actor.model ?? "unknown-model"}`
      : "human contributor";
  const harness = actor.harness_version ? ` · ${actor.harness_version}` : "";
  return `${who} (operator: ${actor.operator}${harness})`;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
