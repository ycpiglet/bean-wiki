// Canonical coffee vocabulary — the single entry point other code should import.
//
// The data lives in the sibling files (origins.ts, varieties.ts, …) as plain
// JSON array literals so scripts/check-vocabulary.mjs can validate them without
// a TypeScript toolchain. Rules: docs/VOCABULARY-IDS.md.

import { normalizeQuery, type EntityType, type VocabularyEntity } from "./types";
import { origins } from "./origins";
import { varieties } from "./varieties";
import { processes } from "./processes";
import { flavors } from "./flavors";
import { methods } from "./methods";
import { equipment } from "./equipment";
import { defects } from "./defects";

export { origins, varieties, processes, flavors, methods, equipment, defects };

/** Every canonical entity, in type order. */
export const vocabulary: VocabularyEntity[] = [
  ...origins,
  ...varieties,
  ...processes,
  ...flavors,
  ...methods,
  ...equipment,
  ...defects,
];

/** id → entity. ids are immutable, so this is a stable lookup for other apps. */
export const byId: Map<string, VocabularyEntity> = new Map(
  vocabulary.map((entity) => [entity.id, entity]),
);

/**
 * Normalised match key → entity, built from labels.ko, labels.en and every
 * alias. This is what /knowledge/v1/resolve looks up. A key may point at
 * exactly one entity; check-vocabulary.mjs fails the build on collisions, so
 * the first-write guard below should never actually skip anything.
 */
export const aliasIndex: Map<string, VocabularyEntity> = (() => {
  const index = new Map<string, VocabularyEntity>();
  for (const entity of vocabulary) {
    for (const raw of [entity.labels.ko, entity.labels.en, ...entity.aliases]) {
      const key = normalizeQuery(raw);
      if (!key || index.has(key)) continue;
      index.set(key, entity);
    }
  }
  return index;
})();

/** All entities of one type, e.g. entitiesOfType("origin"). */
export function entitiesOfType(type: EntityType): VocabularyEntity[] {
  return vocabulary.filter((entity) => entity.type === type);
}

/** Children of an entity, e.g. childrenOf("origin:et") → Ethiopian regions. */
export function childrenOf(id: string): VocabularyEntity[] {
  return vocabulary.filter((entity) => entity.parent === id);
}

/**
 * Resolve a free string (an app's raw value, a scanned tasting card) to a
 * canonical entity. Deprecated hits follow `replacedBy` so callers always get
 * the live entity. Returns undefined on a miss — callers should log it.
 */
export function resolveEntity(query: string): VocabularyEntity | undefined {
  const hit = aliasIndex.get(normalizeQuery(query));
  if (!hit) return undefined;
  if (hit.status === "deprecated" && hit.replacedBy) return byId.get(hit.replacedBy) ?? hit;
  return hit;
}
