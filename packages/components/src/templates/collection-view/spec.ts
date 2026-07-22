import type { Product } from '@shared/data/types';
import type { ProductFilter } from './FilterTypes';
import { applyFiltersToProducts } from './FilterOperations';
import { sortProducts } from './SortingUtils';
import { getAttributeValue, formatAttributeValue } from './AttributeUtils';

/**
 * ViewSpec — the framing of a view as one portable object: which items
 * (query), how each is rendered (representation), how the population is
 * ordered and clustered (arrangement), how the detail side opens (detail),
 * and which of those axes the actor may touch (malleability, on by default
 * and selectively disabled). Every view over the collection is a (model,
 * spec) pair; the view-family patterns differ only in what varies. Field
 * names follow Meridian
 * (Min & Xia, UIST '25) where the corpus doesn't already have a word.
 */

export type AttributePath = string;

export type RepresentationType = 'list' | 'card' | 'table' | 'map' | 'plot';

/** Item-view ladder, population side: how much of each item a view carries. */
export type RepresentationRung = 'glyph' | 'summary' | 'detail';

export type FilterClause = ProductFilter;

export interface SortClause {
  field: AttributePath;
  order: 'asc' | 'desc';
}

export interface Representation {
  type: RepresentationType;
  rung: RepresentationRung;
  shownAttributes: AttributePath[];
}

export interface Arrangement {
  sortBy?: SortClause;
  groupBy?: AttributePath;
  /** Groups on the block axis (sections) or the inline axis (board lanes). */
  groupLayout?: 'sections' | 'lanes';
}

export interface DetailInvocation {
  openIn: 'side-by-side' | 'popover' | 'new-page';
  openFrom: 'item' | AttributePath;
  openBy: 'click' | 'hover';
  shownAttributes: AttributePath[] | 'all';
}

export type MalleabilityAxis = 'query' | 'representation' | 'arrangement' | 'content';

/** Absent = fully malleable. */
export type MalleabilityBlock = Partial<Record<MalleabilityAxis, { disabled: true }>>;

export interface ViewSpec {
  id: string;
  label?: string;
  query: FilterClause[];
  representation: Representation;
  arrangement: Arrangement;
  detail?: DetailInvocation;
  malleability?: MalleabilityBlock;
}

/**
 * Section-wise patch. Representation and arrangement merge shallowly into
 * the existing section; query, detail, and malleability replace whole
 * (null clears detail/malleability).
 */
export interface ViewSpecPatch {
  label?: string;
  query?: FilterClause[];
  representation?: Partial<Representation>;
  arrangement?: Partial<Arrangement>;
  detail?: DetailInvocation | null;
  malleability?: MalleabilityBlock | null;
}

export function applySpecPatch(spec: ViewSpec, patch: ViewSpecPatch): ViewSpec {
  const next: ViewSpec = {
    ...spec,
    query: patch.query ?? spec.query,
    representation: patch.representation
      ? { ...spec.representation, ...patch.representation }
      : spec.representation,
    arrangement: patch.arrangement
      ? { ...spec.arrangement, ...patch.arrangement }
      : spec.arrangement,
  };
  if ('label' in patch) next.label = patch.label;
  if ('detail' in patch) {
    if (patch.detail === null) delete next.detail;
    else next.detail = patch.detail;
  }
  if ('malleability' in patch) {
    if (patch.malleability === null) delete next.malleability;
    else next.malleability = patch.malleability;
  }
  return next;
}

export function isAxisMalleable(spec: ViewSpec, axis: MalleabilityAxis): boolean {
  return !spec.malleability?.[axis]?.disabled;
}

export interface MakeSpecOptions {
  id: string;
  label?: string;
  query?: FilterClause[];
  representation?: Partial<Representation>;
  arrangement?: Arrangement;
  detail?: DetailInvocation;
  malleability?: MalleabilityBlock;
}

export function makeSpec(options: MakeSpecOptions): ViewSpec {
  const { id, label, query = [], representation, arrangement = {}, detail, malleability } = options;
  const spec: ViewSpec = {
    id,
    query,
    representation: {
      type: 'card',
      rung: 'summary',
      shownAttributes: ['name', 'description', 'category', 'pricing.msrp', 'availability.status'],
      ...representation,
    },
    arrangement,
  };
  if (label !== undefined) spec.label = label;
  if (detail) spec.detail = detail;
  if (malleability) spec.malleability = malleability;
  return spec;
}

/** Query then arrangement: the population a spec frames, in its order. */
export function runSpec(items: Product[], spec: ViewSpec): Product[] {
  const queried = applyFiltersToProducts(items, spec.query);
  const { sortBy } = spec.arrangement;
  return sortBy ? sortProducts(queried, sortBy.field, sortBy.order) : queried;
}

/** Cluster items by an attribute path; group labels are display-formatted. */
export function groupItems(items: Product[], groupBy: AttributePath): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  for (const item of items) {
    const label = formatAttributeValue(getAttributeValue(item, groupBy), groupBy);
    const group = groups.get(label);
    if (group) group.push(item);
    else groups.set(label, [item]);
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}
