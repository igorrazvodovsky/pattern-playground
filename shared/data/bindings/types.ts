/**
 * Attribute bindings, after Meridian (Min & Xia, UIST '25): each entity type
 * carries a declarative description of its attributes — what each one *is*
 * (role), what kind of value it holds (valueType), and what to call it — plus
 * a scope ladder saying which attributes each scope shows by default. Views
 * render any entity from its binding; knowledge like "status is a badge" or
 * "price is a currency" lives here as data, not in per-type render code.
 *
 * Naming follows the corpus first, Meridian where the corpus has no word —
 * the same rule `spec.ts` (collection-view) already applies on the
 * population side. The role set is Meridian's default twelve, verbatim.
 * Meridian leaves the union open (`| string`); ours stays closed so a typo
 * is a type error — widen it deliberately or not at all.
 */

/** Item-view ladder, item side: how much of one item a view carries. */
export type ItemScope = 'micro' | 'mini' | 'mid' | 'maxi';

/**
 * The minimal contract a bound entity satisfies. Everything else is reached
 * structurally through the binding's paths — an interface with an index
 * signature would force every domain type to declare one, so views take the
 * loosest shape that still guarantees identity.
 */
export interface BoundEntity {
  id: string;
}

/** What an attribute *is* — each view scope decides where a role lands. */
export type AttributeRole =
  | 'title'
  | 'subtitle'
  | 'description'
  | 'key-attribute' // the standout figure (a price, a headline stat)
  | 'thumbnail'
  | 'caption' // muted line accompanying media or description
  | 'badge' // categorical states rendered as badges (status, condition)
  | 'tag' // free labels, many per item
  | 'spec' // label: value rows in an attribute list
  | 'link' // navigational reference, rendered as an anchor row
  | 'action' // an operation on the item — behavioural, so valueType 'custom'
  | 'footer'; // provenance meta (created, updated, listed) in a muted end line

export type AttributeValueType =
  | 'string'
  | 'number'
  | 'currency'
  | 'date'
  | 'status'
  | 'image'
  | 'link'
  | 'progress'
  | 'custom'; // rendered by a registered component, never generically

export interface AttributeBinding {
  /** Dot-path into the entity, e.g. 'pricing.msrp'. Resolution descends
      into a `metadata` object transparently, so paths read domain-first. */
  path: string;
  /** Omitted → derived from the path leaf. */
  label?: string;
  role: AttributeRole;
  valueType: AttributeValueType;
  /** Static unit appended to the formatted value, e.g. 'kg CO2e'. */
  unit?: string;
  /** Facet presentation: the icon a filter UI shows for this attribute. */
  icon?: string;
  /** The value is a list (labels, certifications, regions); valueType
      describes the elements. Cardinality, not valueType, is what picks the
      include/exclude operator family. */
  many?: true;
}

/**
 * What a view's shown-attribute list may contain: attribute paths, role names
 * (every attribute carrying that role), or 'all'. Meridian's
 * AttributeSelectionScope, minus its `"item"` sentinel. A selection written
 * in roles is entity-generic — the same view spec renders any binding.
 */
export type AttributeSelection = (string | AttributeRole)[] | 'all';

export interface EntityBinding {
  entityType: string;
  attributes: AttributeBinding[];
  /** The scope ladder as data: which attributes each scope shows by default. */
  scopes: Record<ItemScope, string[]>;
  /**
   * Data a view needs but never displays, keyed by need — Meridian's
   * internalAttributes. A map reads `lat`/`lng`/`locationLabel` here; a
   * binding without them simply doesn't support map representation.
   */
  internalAttributes?: Record<string, string>;
}
