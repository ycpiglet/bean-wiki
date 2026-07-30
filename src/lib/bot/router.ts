// Message -> command routing.
//
// Order matters and is the point:
//   1. deterministic pattern match  — free, auditable, reproducible
//   2. optional classifier fallback — may ONLY return a catalogue id
//   3. no match                     — show the catalogue, run nothing
//
// A classifier is never allowed to produce a query, a table name, or a
// parameter value it invented; it picks from a closed list, and the parameters
// are extracted deterministically from the message by the code below.

import { BOT_COMMANDS, COMMAND_IDS, type BotCommand } from "@/lib/bot/catalog";

export type MatchSource = "pattern" | "classifier" | "explicit";

export type RouteResult =
  | {
      matched: true;
      command: BotCommand;
      source: MatchSource;
      params: Record<string, string | number>;
      /** Other plausible commands, for a disambiguation reply. */
      alternates: string[];
    }
  | { matched: false; reason: "no_match" | "ambiguous"; candidates: string[] };

export type ClassifyFn = (
  message: string,
  candidateIds: readonly string[],
) => Promise<string | null>;

export type RouteOptions = {
  /** Set when the caller names a command id directly (button, slash command). */
  explicitCommandId?: string;
  classify?: ClassifyFn;
};

const MAX_MESSAGE = 500;

export async function route(
  rawMessage: string,
  options: RouteOptions = {},
): Promise<RouteResult> {
  const message = rawMessage.slice(0, MAX_MESSAGE).trim();

  if (options.explicitCommandId) {
    const command = BOT_COMMANDS.find(
      (candidate) => candidate.id === options.explicitCommandId,
    );
    if (!command) {
      return { matched: false, reason: "no_match", candidates: [...COMMAND_IDS] };
    }
    return {
      matched: true,
      command,
      source: "explicit",
      params: extractParams(message, command),
      alternates: [],
    };
  }

  if (!message) {
    return { matched: false, reason: "no_match", candidates: [...COMMAND_IDS] };
  }

  const hits = BOT_COMMANDS.filter((command) =>
    command.patterns.some((pattern) => pattern.test(message)),
  );

  if (hits.length === 1) {
    return {
      matched: true,
      command: hits[0],
      source: "pattern",
      params: extractParams(message, hits[0]),
      alternates: [],
    };
  }

  if (hits.length > 1) {
    // Prefer a write command only when it is the sole match: an ambiguous
    // message must never resolve to something that mutates state.
    const reads = hits.filter((command) => command.mode === "read");
    if (reads.length === 1) {
      return {
        matched: true,
        command: reads[0],
        source: "pattern",
        params: extractParams(message, reads[0]),
        alternates: hits.filter((c) => c.id !== reads[0].id).map((c) => c.id),
      };
    }
    return {
      matched: false,
      reason: "ambiguous",
      candidates: hits.map((command) => command.id),
    };
  }

  if (options.classify) {
    // Read-only candidates only. A classifier guess must not be able to select
    // a state-changing command; those require an explicit id.
    const readIds = BOT_COMMANDS.filter((c) => c.mode === "read").map((c) => c.id);
    const guess = await options.classify(message, readIds);
    const command = guess
      ? BOT_COMMANDS.find((candidate) => candidate.id === guess)
      : undefined;
    if (command && command.mode === "read") {
      return {
        matched: true,
        command,
        source: "classifier",
        params: extractParams(message, command),
        alternates: [],
      };
    }
  }

  return { matched: false, reason: "no_match", candidates: [...COMMAND_IDS] };
}

/**
 * Pulls parameters out of the message with fixed patterns. Values are always
 * clamped by the metric layer afterwards; this only proposes them.
 */
export function extractParams(
  message: string,
  command: BotCommand,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  for (const spec of command.params) {
    if (spec.default !== undefined) params[spec.name] = spec.default;
  }

  for (const spec of command.params) {
    if (spec.kind === "window_days") {
      const days = readWindowDays(message);
      if (days !== null) params[spec.name] = days;
    }
    if (spec.kind === "limit") {
      const top = /(?:top|상위|상위권)\s*(\d{1,3})|(\d{1,3})\s*개/i.exec(message);
      const value = Number.parseInt(top?.[1] ?? top?.[2] ?? "", 10);
      if (Number.isInteger(value) && value > 0) params[spec.name] = value;
    }
    if (spec.kind === "day") {
      const iso = /(\d{4}-\d{2}-\d{2})/.exec(message);
      if (iso) params[spec.name] = iso[1];
      else if (/어제|yesterday/i.test(message)) params[spec.name] = "yesterday";
    }
    if (spec.kind === "status") {
      const status = readStatus(message);
      if (status) params[spec.name] = status;
    }
  }

  return params;
}

function readWindowDays(message: string): number | null {
  if (/오늘|today/i.test(message)) return 1;
  if (/어제|yesterday/i.test(message)) return 1;
  if (/이번\s*주|지난\s*주|주간|this week|last week|weekly/i.test(message)) return 7;
  if (/이번\s*달|지난\s*달|월간|this month|last month|monthly/i.test(message)) return 30;
  const explicit = /(?:최근|지난|last|past)\s*(\d{1,3})\s*(일|days?)/i.exec(message);
  const days = Number.parseInt(explicit?.[1] ?? "", 10);
  return Number.isInteger(days) && days > 0 ? days : null;
}

function readStatus(message: string): string | null {
  const map: Array<[RegExp, string]> = [
    [/승인|accept/i, "accepted"],
    [/거절|decline|reject/i, "declined"],
    [/중복|duplicate/i, "duplicate"],
    [/게시|발행|publish/i, "published"],
    [/검토|review/i, "in_review"],
    [/작성 중|drafting/i, "drafting"],
    [/분류|triage/i, "triaged"],
  ];
  for (const [pattern, status] of map) {
    if (pattern.test(message)) return status;
  }
  return null;
}
