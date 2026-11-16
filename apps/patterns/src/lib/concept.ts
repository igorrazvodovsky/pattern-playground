// Build-time helpers shared by every render that touches the concept
// catalogue. Field meanings are in docs/language/patterns-and-concepts.md, the
// schema in content.config.ts.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import actionTypes from '@shared/world/action-types.json' with { type: 'json' };
import { humaniseSlug } from './sequence';

export type ActsOnRef = { concept: string; note?: string };
export type TitledActsOnRef = ActsOnRef & { title: string };

type ActsOn = CollectionEntry<'patterns'>['data']['acts_on'];

// Normalise the two authoring forms (bare id, or {concept, note}) to one.
export function actsOnOf(actsOn: ActsOn): ActsOnRef[] {
  return (actsOn ?? []).map((ref) => (typeof ref === 'string' ? { concept: ref } : ref));
}

// A concept's title. The validator gates dangling ids at build time, so the
// slug fallback only shows when that check was skipped.
export function conceptTitle(id: string, concepts: CollectionEntry<'concepts'>[]): string {
  return concepts.find((c) => c.id === id)?.data.title ?? humaniseSlug(id);
}

// A pattern's `acts_on` with each concept's title resolved.
export async function actsOnRefs(slug: string): Promise<TitledActsOnRef[]> {
  const entry = await getEntry('patterns', slug);
  const refs = actsOnOf(entry?.data.acts_on);
  if (refs.length === 0) return [];
  const concepts = await getCollection('concepts');
  return refs.map((ref) => ({
    ...ref,
    title: conceptTitle(ref.concept, concepts),
  }));
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
