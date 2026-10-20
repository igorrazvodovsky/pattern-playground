// Build-time helpers shared by every render that touches the concept
// catalogue. Field meanings are in docs/language/patterns-and-concepts.md, the
// schema in content.config.ts.
import type { CollectionEntry } from 'astro:content';
import actionTypes from '@shared/world/action-types.json' with { type: 'json' };

export type ActsOnRef = { concept: string; note?: string };

type ActsOn = CollectionEntry<'patterns'>['data']['acts_on'];

// Normalise the two authoring forms (bare id, or {concept, note}) to one.
export function actsOnOf(actsOn: ActsOn): ActsOnRef[] {
  return (actsOn ?? []).map((ref) => (typeof ref === 'string' ? { concept: ref } : ref));
}

interface ActionType {
  description: string;
  adds: string[];
  removes: string[];
  // The concept the action belongs to: the world's partition of its action
  // vocabulary (docs/specs/world-ontology.md).
  concept?: string;
}

let byConcept: Map<string, Set<string>> | undefined;

// Which world action names each concept id holds. The world is static per
// build, so this is computed once.
export function worldActionsByConcept(): Map<string, Set<string>> {
  if (byConcept) return byConcept;
  byConcept = new Map();
  for (const [name, type] of Object.entries(actionTypes as Record<string, ActionType>)) {
    if (!type.concept) continue;
    const set = byConcept.get(type.concept) ?? new Set<string>();
    set.add(name);
    byConcept.set(type.concept, set);
  }
  return byConcept;
}
