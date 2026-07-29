// Canonical coffee vocabulary — the interop spine.
//
// Every company app that names a coffee concept should reference one of these
// ids instead of a free string. Without that, "에티오피아" / "Ethiopia" /
// "ETHIOPIA" stay three unrelated values and cross-app linking never works.
//
// Rules (normative: docs/VOCABULARY-IDS.md)
//   1. `id` is `<type>:<kebab-ascii>` and is IMMUTABLE. Renames change `labels`.
//   2. Nothing is ever deleted. Retire with status "deprecated" + `replacedBy`,
//      the same contract src/content/redirects.json uses for article slugs.
//   3. `aliases` are lowercase match keys for /knowledge/v1/resolve. An alias
//      may belong to exactly one canonical entity.
//   4. `articleSlug` must name a real article; check-vocabulary.mjs enforces it.

export const ENTITY_TYPES = [
  "origin",
  "variety",
  "process",
  "flavor",
  "method",
  "equipment",
  "defect",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export type EntityStatus = "canonical" | "deprecated";

export type VocabularyEntity = {
  /** `<type>:<kebab-ascii>`, immutable once published. */
  id: string;
  type: EntityType;
  labels: { ko: string; en: string };
  /** Lowercased match keys, including OCR-style variants and legacy spellings. */
  aliases: string[];
  /** Broader entity id, e.g. origin:et for origin:et-yirgacheffe. */
  parent?: string;
  /** Slug of the article that explains this entity, when one exists. */
  articleSlug?: string;
  /** `term` value from src/content/glossary.ts, when one exists. */
  glossaryTerm?: string;
  /** One line, safe to show in another app's UI. */
  note?: string;
  status: EntityStatus;
  /** Required when status is "deprecated". */
  replacedBy?: string;
  /**
   * Where this entity came from in the repo. Keeps the vocabulary auditable and
   * blocks invented entries: every row must point at real existing content.
   */
  source: { kind: "article" | "glossary" | "category" | "tag"; ref: string };
};

export function entityIdFor(type: EntityType, key: string): string {
  return `${type}:${key}`;
}

/** Normalisation used for both alias keys and resolve() queries. */
export function normalizeQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\s_]+/g, " ")
    .replace(/[.,;:!?'"()[\]{}]/g, "");
}
