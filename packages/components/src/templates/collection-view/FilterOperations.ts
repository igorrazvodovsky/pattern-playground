import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import { productBinding, findAttribute } from '@shared/data/bindings';
import { getAttributeValue, formatAttributeValue } from './AttributeUtils';

/**
 * Filtering itself is binding vocabulary and lives with the bindings
 * (shared/data/bindings/filtering): one clause shape, one operator table,
 * one matcher, for any bound entity. This module re-exports it for the
 * template ring and keeps the collection-side value mining.
 */
export { matchesFilter, applyFilters } from '@shared/data/bindings';
export type { AttributeFilter, FilterOperator } from '@shared/data/bindings';

/**
 * The values an attribute path takes across the collection — what a filter
 * on that path can be widened to. List-valued attributes (`many` in the
 * binding) enumerate their elements; everything else appears as displayed.
 */
export function getUniqueAttributeValues(
  items: BoundEntity[],
  path: string,
  binding: EntityBinding = productBinding
): string[] {
  const attribute = findAttribute(binding, path);
  const values = new Set<string>();
  for (const item of items) {
    const value = getAttributeValue(item, path);
    if (value === undefined || value === null) continue;
    if (attribute?.many && Array.isArray(value)) {
      for (const element of value) values.add(String(element));
    } else {
      values.add(formatAttributeValue(value, path, binding));
    }
  }
  return Array.from(values).sort();
}
