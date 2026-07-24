import type {
  AttributeBinding,
  BoundEntity,
  EntityBinding,
} from './types';
import {
  findAttribute,
  formatBoundValue,
  getValueAtPath,
  isNumericValueType,
} from './access';

/**
 * Binding-driven filtering: the Meridian principle extended to the query
 * axis. A filter clause names an attribute path, never an entity type; the
 * binding supplies what the clause needs — which operators the attribute's
 * valueType and cardinality admit, and how its raw value compares. Paths
 * outside the binding stay legal and are matched on the value as displayed —
 * the same string the actor clicked to make the filter.
 */

export type FilterOperator =
  | 'is'
  | 'is not'
  | 'is any of'
  | 'include'
  | 'do not include'
  | 'include all of'
  | 'include any of'
  | 'exclude all of'
  | 'exclude if any of'
  | 'before'
  | 'after'
  | 'less than'
  | 'greater than'
  | 'between';

export interface AttributeFilter {
  id: string;
  /** Attribute path resolved against the entity binding. */
  path: string;
  operator: FilterOperator;
  values: string[];
}

/** Operators that hold when the comparison does NOT match. */
const NEGATING: ReadonlySet<FilterOperator> = new Set([
  'is not',
  'do not include',
  'exclude all of',
  'exclude if any of',
]);

/**
 * The operator table: which operators a filter UI offers for an attribute,
 * keyed on the binding entry's valueType and cardinality. Behaviour, not
 * per-type code — every operator dropdown reads this one copy. The selected
 * values feed in because cardinality of the *selection* also matters: one
 * value states equality, several state alternatives, and the "in the past"
 * date phrase is its own predicate rather than a boundary.
 */
export function filterOperatorsFor(
  attribute: AttributeBinding | undefined,
  selectedValues: string[] = []
): FilterOperator[] {
  const multiple = selectedValues.length > 1;
  if (!attribute) {
    return multiple ? ['is any of', 'is not'] : ['is', 'is not'];
  }
  if (attribute.many) {
    return multiple
      ? ['include any of', 'include all of', 'exclude all of', 'exclude if any of']
      : ['include', 'do not include'];
  }
  if (isNumericValueType(attribute.valueType)) {
    return ['less than', 'greater than', 'between'];
  }
  if (attribute.valueType === 'date') {
    return selectedValues.includes('in the past')
      ? ['is', 'is not']
      : ['before', 'after'];
  }
  return multiple ? ['is any of', 'is not'] : ['is', 'is not'];
}

/** The operator a freshly created clause starts with. */
export function defaultFilterOperator(
  attribute: AttributeBinding | undefined,
  value: string
): FilterOperator {
  return filterOperatorsFor(attribute, [value])[0] ?? 'is';
}

/**
 * Resolve a curated relative-date phrase ("1 week from now") to a timestamp,
 * so `before` / `after` compare actual dates. Anything that isn't a known
 * phrase is tried as a literal date.
 */
export function resolveDatePhrase(phrase: string, now: Date = new Date()): Date | undefined {
  if (phrase === 'in the past') return now;
  const relative = phrase.match(/^(\d+)\s+(hour|day|week|month)s?\s+from now$/);
  if (relative) {
    const amount = Number(relative[1]);
    const resolved = new Date(now);
    switch (relative[2]) {
      case 'hour':
        resolved.setHours(resolved.getHours() + amount);
        break;
      case 'day':
        resolved.setDate(resolved.getDate() + amount);
        break;
      case 'week':
        resolved.setDate(resolved.getDate() + amount * 7);
        break;
      case 'month':
        resolved.setMonth(resolved.getMonth() + amount);
        break;
    }
    return resolved;
  }
  const literal = new Date(phrase);
  return Number.isNaN(literal.getTime()) ? undefined : literal;
}

/** Filter values arrive as displayed ('$4,500.00'); compare on the digits. */
const parseFilterNumber = (value: string): number =>
  Number(String(value).replace(/[^0-9.eE+-]/g, ''));

/** Returns undefined for operators that aren't numeric comparisons, so a
    membership clause on a numeric attribute falls through to the displayed
    value ('$799.00' clicked in a card matches the card's own formatting). */
function matchesNumeric(raw: unknown, filter: AttributeFilter): boolean | undefined {
  const value = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isNaN(value)) return false;
  const bounds = filter.values.map(parseFilterNumber);
  switch (filter.operator) {
    case 'less than':
      return value < bounds[0];
    case 'greater than':
      return value > bounds[0];
    case 'between': {
      if (bounds.length < 2) return false;
      const low = Math.min(bounds[0], bounds[1]);
      const high = Math.max(bounds[0], bounds[1]);
      return value >= low && value <= high;
    }
    default:
      return undefined;
  }
}

/** "is in the past" holds when the date has passed; "is <future phrase>"
    reads as due within that window. */
function withinPhrase(value: Date, phrase: string, now: Date): boolean {
  if (phrase === 'in the past') return value.getTime() < now.getTime();
  const bound = resolveDatePhrase(phrase, now);
  if (!bound) return false;
  return value.getTime() >= now.getTime() && value.getTime() <= bound.getTime();
}

function matchesDate(raw: unknown, filter: AttributeFilter): boolean {
  const value = raw instanceof Date ? raw : new Date(String(raw));
  if (Number.isNaN(value.getTime())) return false;
  const now = new Date();
  switch (filter.operator) {
    case 'is':
      return filter.values.some((phrase) => withinPhrase(value, phrase, now));
    case 'is not':
      return !filter.values.some((phrase) => withinPhrase(value, phrase, now));
    case 'before': {
      const bound = resolveDatePhrase(filter.values[0], now);
      return bound ? value.getTime() < bound.getTime() : false;
    }
    case 'after': {
      const bound = resolveDatePhrase(filter.values[0], now);
      return bound ? value.getTime() > bound.getTime() : false;
    }
    default:
      return false;
  }
}

function matchesList(
  raw: unknown[],
  filter: AttributeFilter,
  attribute: AttributeBinding
): boolean {
  const elements = raw.map((element) => String(element));
  // A value clicked in a view is the whole list as displayed; honour it too.
  const joined = formatBoundValue(raw, attribute);
  const has = (candidate: string) =>
    elements.includes(candidate) || candidate === joined;
  switch (filter.operator) {
    case 'include all of':
      return filter.values.every(has);
    case 'exclude all of':
      return !filter.values.every(has);
    case 'is not':
    case 'do not include':
    case 'exclude if any of':
      return !filter.values.some(has);
    default:
      // include / include any of / is / is any of
      return filter.values.some(has);
  }
}

function matchesScalar(
  raw: unknown,
  filter: AttributeFilter,
  attribute: AttributeBinding
): boolean {
  const matches = filter.values.includes(formatBoundValue(raw, attribute));
  return NEGATING.has(filter.operator) ? !matches : matches;
}

/**
 * One matcher for every bound entity: typed comparison on the raw value from
 * `getValueAtPath` — numeric compare for number/currency/progress, date
 * compare for date, membership otherwise. Paths outside the binding fall
 * back to formatted-string equality.
 */
export function matchesFilter(
  entity: BoundEntity,
  filter: AttributeFilter,
  binding: EntityBinding
): boolean {
  const attribute = findAttribute(binding, filter.path);
  const raw = getValueAtPath(entity, filter.path);
  if (!attribute) {
    const shown =
      raw === undefined || raw === null
        ? ''
        : Array.isArray(raw)
          ? raw.join(', ')
          : String(raw);
    const matches = filter.values.includes(shown);
    return NEGATING.has(filter.operator) ? !matches : matches;
  }
  if (raw === undefined || raw === null) return NEGATING.has(filter.operator);
  if (isNumericValueType(attribute.valueType)) {
    const numeric = matchesNumeric(raw, filter);
    if (numeric !== undefined) return numeric;
  }
  if (attribute.valueType === 'date') return matchesDate(raw, filter);
  if (attribute.many || Array.isArray(raw)) {
    return matchesList(Array.isArray(raw) ? raw : [raw], filter, attribute);
  }
  return matchesScalar(raw, filter, attribute);
}

/** Conjunction over clauses; a clause with no values is still being built
    and constrains nothing. */
export function applyFilters<T extends BoundEntity>(
  items: T[],
  filters: AttributeFilter[],
  binding: EntityBinding
): T[] {
  if (filters.length === 0) return items;
  return items.filter((item) =>
    filters.every(
      (filter) => filter.values.length === 0 || matchesFilter(item, filter, binding)
    )
  );
}
