import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import { productBinding, findAttribute } from '@shared/data/bindings';
import { getUniqueAttributeValues } from '../../templates/collection-view/FilterOperations';
import { attributeLabel } from '../../templates/collection-view/AttributeUtils';

/**
 * Icons are optional throughout: a filter facet carries one only when the
 * binding behind it does. The UI never invents an icon for a value it
 * happens to recognise.
 */
export type FilterCategory = {
  id: string;
  name: string;
  icon?: string;
  children?: FilterValue[];
};

export type FilterValue = {
  id: string;
  name: string;
  value: string;
  icon?: string;
  path: string;
};

/**
 * Which facets a filter UI offers is a view decision — a plain list of
 * paths, not a binding field. These are the facets the data-view demo
 * curates over products.
 */
export const PRODUCT_FILTER_PATHS: string[] = [
  'category',
  'availability.status',
  'lifecycle.repairability',
  'lifecycle.upgradeability',
  'pricing.msrp',
  'sustainability.certifications',
  'availability.regions',
  'availability.channels',
];

/**
 * One category per offered path — curated facet or surfaced attribute alike.
 * The binding supplies the label and icon; the collection supplies the value
 * list, which is what a clause on that path can be widened to.
 */
export function generateFilterCategories(
  items: BoundEntity[],
  paths: string[],
  binding: EntityBinding = productBinding
): FilterCategory[] {
  return paths.map((path) => ({
    id: path,
    name: attributeLabel(path, binding),
    icon: findAttribute(binding, path)?.icon,
    children: getUniqueAttributeValues(items, path, binding).map((value) => ({
      id: `${path}_${value}`,
      name: value,
      value,
      path,
    })),
  }));
}
