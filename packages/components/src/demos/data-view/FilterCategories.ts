import { Product } from '@shared/data/types';
import {
  ProductFilterType,
  ProductFilterCategory,
  PRODUCT_FILTER_TYPE_ICONS,
} from '../../templates/collection-view/FilterTypes';
import { getUniqueFilterValues, getUniqueAttributeValues } from '../../templates/collection-view/FilterOperations';
import { attributeLabel } from '../../templates/collection-view/AttributeUtils';

/**
 * The same category shape for bare attribute paths: a view that lets the actor
 * surface arbitrary attributes can filter on any of them, so each surfaced path
 * becomes a category whose values are the ones the collection actually shows.
 */
export function generateAttributeFilterCategories(
  products: Product[],
  paths: string[]
): ProductFilterCategory[] {
  return paths.map((path) => ({
    id: path,
    name: attributeLabel(path),
    children: getUniqueAttributeValues(products, path).map((value) => ({
      id: `${path}_${value}`,
      name: value,
      value,
      filterType: path,
    })),
  }));
}

export function generateProductFilterCategories(products: Product[]): ProductFilterCategory[] {
  return Object.values(ProductFilterType).map(type => {
    const uniqueValues = getUniqueFilterValues(products, type);

    return {
      id: type,
      name: type,
      icon: PRODUCT_FILTER_TYPE_ICONS[type],
      children: uniqueValues.map(value => ({
        id: `${type}_${value}`,
        name: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value,
        filterType: type
      }))
    };
  });
}