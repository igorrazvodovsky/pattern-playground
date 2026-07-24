import { Product } from '@shared/data/types';
import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import { productBinding } from '@shared/data/bindings';
import { ProductFilter, ProductFilterType, ProductFilterOperator, isProductFilterType } from './FilterTypes';
import { getAttributeValue, formatAttributeValue } from './AttributeUtils';

/**
 * A filter keyed on a bare attribute path matches on the value as displayed —
 * the same string the actor clicked to make the filter. Several values on one
 * path read as alternatives. Path-keyed filters work on any bound entity;
 * the named ProductFilterType branch is product vocabulary and only fires
 * for filters written in it.
 */
function itemMatchesAttributeFilter(
  item: BoundEntity,
  filter: ProductFilter,
  binding: EntityBinding
): boolean {
  const path = filter.type;
  const shown = formatAttributeValue(getAttributeValue(item, path), path, binding);
  const matches = filter.value.includes(shown);
  return filter.operator === ProductFilterOperator.IS_NOT ? !matches : matches;
}

export function productMatchesFilter(
  item: BoundEntity,
  filter: ProductFilter,
  binding: EntityBinding = productBinding
): boolean {
  if (!isProductFilterType(filter.type)) {
    return itemMatchesAttributeFilter(item, filter, binding);
  }
  const product = item as Product;
  const filterType = filter.type;

  const getValue = (filterType: ProductFilterType): string | string[] => {
    switch (filterType) {
      case ProductFilterType.CATEGORY:
        return product.metadata.category;
      case ProductFilterType.AVAILABILITY_STATUS:
        return product.metadata.availability.status;
      case ProductFilterType.REPAIRABILITY:
        return product.metadata.lifecycle.repairability;
      case ProductFilterType.UPGRADEABILITY:
        return product.metadata.lifecycle.upgradeability;
      case ProductFilterType.CERTIFICATIONS:
        return product.metadata.sustainability.certifications;
      case ProductFilterType.REGIONS:
        return product.metadata.availability.regions;
      case ProductFilterType.CHANNELS:
        return product.metadata.availability.channels;
      case ProductFilterType.PRICE_RANGE:
        return product.metadata.pricing.msrp.toString();
      default:
        return '';
    }
  };

  const productValue = getValue(filterType);
  const filterValues = filter.value;

  if (Array.isArray(productValue)) {
    switch (filter.operator) {
      case ProductFilterOperator.IS:
        return filterValues.some(fv => productValue.includes(fv));
      case ProductFilterOperator.IS_NOT:
        return !filterValues.some(fv => productValue.includes(fv));
      case ProductFilterOperator.INCLUDE:
        return filterValues.some(fv => productValue.includes(fv));
      case ProductFilterOperator.DO_NOT_INCLUDE:
        return !filterValues.some(fv => productValue.includes(fv));
      default:
        return filterValues.some(fv => productValue.includes(fv));
    }
  } else {
    switch (filter.operator) {
      case ProductFilterOperator.IS:
        return filterValues.includes(productValue);
      case ProductFilterOperator.IS_NOT:
        return !filterValues.includes(productValue);
      case ProductFilterOperator.LESS_THAN:
        return parseFloat(productValue) < parseFloat(filterValues[0]);
      case ProductFilterOperator.GREATER_THAN:
        return parseFloat(productValue) > parseFloat(filterValues[0]);
      default:
        return filterValues.includes(productValue);
    }
  }
}

export function applyFilters<T extends BoundEntity>(
  items: T[],
  filters: ProductFilter[],
  binding: EntityBinding = productBinding
): T[] {
  if (filters.length === 0) {
    return items;
  }

  return items.filter(item =>
    filters.every(filter =>
      filter.value.length === 0 || productMatchesFilter(item, filter, binding)
    )
  );
}

/**
 * The values a bare attribute path takes across the collection, as displayed —
 * what a filter on that path can be widened to.
 */
export function getUniqueAttributeValues(
  items: BoundEntity[],
  path: string,
  binding: EntityBinding = productBinding
): string[] {
  const values = new Set<string>();
  for (const item of items) {
    const value = getAttributeValue(item, path);
    if (value === undefined || value === null) continue;
    values.add(formatAttributeValue(value, path, binding));
  }
  return Array.from(values).sort();
}

export function getUniqueFilterValues(products: Product[], filterType: ProductFilterType): string[] {
  const values = new Set<string>();

  products.forEach(product => {
    switch (filterType) {
      case ProductFilterType.CATEGORY:
        values.add(product.metadata.category);
        break;
      case ProductFilterType.AVAILABILITY_STATUS:
        values.add(product.metadata.availability.status);
        break;
      case ProductFilterType.REPAIRABILITY:
        values.add(product.metadata.lifecycle.repairability);
        break;
      case ProductFilterType.UPGRADEABILITY:
        values.add(product.metadata.lifecycle.upgradeability);
        break;
      case ProductFilterType.CERTIFICATIONS:
        product.metadata.sustainability.certifications.forEach(cert => values.add(cert));
        break;
      case ProductFilterType.REGIONS:
        product.metadata.availability.regions.forEach(region => values.add(region));
        break;
      case ProductFilterType.CHANNELS:
        product.metadata.availability.channels.forEach(channel => values.add(channel));
        break;
    }
  });

  return Array.from(values).sort();
}