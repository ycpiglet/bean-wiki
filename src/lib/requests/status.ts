// Content request lifecycle.
//
// Modelled as an explicit transition table rather than free-form status writes,
// so "published without ever being accepted" is impossible to represent and a
// triage mistake fails loudly instead of silently corrupting the queue.

export const REQUEST_STATUSES = [
  "received",
  "triaged",
  "accepted",
  "drafting",
  "in_review",
  "published",
  "declined",
  "duplicate",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Terminal states never transition again. */
export const TERMINAL_STATUSES: readonly RequestStatus[] = [
  "published",
  "declined",
  "duplicate",
];

const TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  received: ["triaged", "declined", "duplicate"],
  triaged: ["accepted", "declined", "duplicate"],
  accepted: ["drafting", "declined"],
  drafting: ["in_review", "accepted", "declined"],
  in_review: ["published", "drafting", "declined"],
  published: [],
  declined: [],
  duplicate: [],
};

export function isRequestStatus(value: string): value is RequestStatus {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function allowedNext(from: RequestStatus): readonly RequestStatus[] {
  return TRANSITIONS[from];
}

/** Statuses that still need editorial attention; drives the open-queue metric. */
export function isOpen(status: RequestStatus): boolean {
  return !TERMINAL_STATUSES.includes(status);
}

export type TransitionRequirement = {
  /** Field that must be present on the row after this transition. */
  requires?: "resolutionArticleSlug" | "declinedReason" | "duplicateOf";
};

/**
 * A terminal state must explain itself: "published" without a resolved article
 * is useless to the client that asked, and "declined"/"duplicate" without a
 * reason or a pointer gives them nothing to act on.
 */
export const TRANSITION_REQUIREMENTS: Partial<
  Record<RequestStatus, TransitionRequirement>
> = {
  published: { requires: "resolutionArticleSlug" },
  declined: { requires: "declinedReason" },
  duplicate: { requires: "duplicateOf" },
};

export const REQUEST_KINDS = [
  "new_article",
  "expand_article",
  "correct_article",
  "new_glossary_term",
  "new_vocabulary_entity",
  "question",
] as const;

export type RequestKind = (typeof REQUEST_KINDS)[number];

export function isRequestKind(value: string): value is RequestKind {
  return (REQUEST_KINDS as readonly string[]).includes(value);
}

export const PRIORITY_HINTS = ["low", "normal", "high"] as const;
export type PriorityHint = (typeof PRIORITY_HINTS)[number];

export function isPriorityHint(value: string): value is PriorityHint {
  return (PRIORITY_HINTS as readonly string[]).includes(value);
}

/**
 * Maps the Korean `suggestions.kind` values the human web form already writes
 * onto the machine-facing kinds, so one triage queue can show both intakes.
 */
export const SUGGESTION_KIND_MAP: Record<string, RequestKind> = {
  "새 글 제안": "new_article",
  "내용 보완": "expand_article",
  "궁금한 내용": "question",
  "기능 제안": "question",
};
