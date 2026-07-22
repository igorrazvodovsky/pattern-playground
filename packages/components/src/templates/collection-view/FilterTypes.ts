export enum ProductFilterType {
  CATEGORY = "Category",
  AVAILABILITY_STATUS = "Availability status",
  REPAIRABILITY = "Repairability",
  UPGRADEABILITY = "Upgradeability",
  PRICE_RANGE = "Price range",
  CERTIFICATIONS = "Certifications",
  REGIONS = "Regions",
  CHANNELS = "Channels"
}

/** Each facet's own icon, declared with the facet rather than guessed from it. */
export const PRODUCT_FILTER_TYPE_ICONS: Record<ProductFilterType, string> = {
  [ProductFilterType.CATEGORY]: 'ph:tag',
  [ProductFilterType.AVAILABILITY_STATUS]: 'ph:circle',
  [ProductFilterType.REPAIRABILITY]: 'ph:wrench',
  [ProductFilterType.UPGRADEABILITY]: 'ph:arrow-up',
  [ProductFilterType.PRICE_RANGE]: 'ph:currency-dollar',
  [ProductFilterType.CERTIFICATIONS]: 'ph:certificate',
  [ProductFilterType.REGIONS]: 'ph:globe',
  [ProductFilterType.CHANNELS]: 'ph:storefront',
};

export enum ProductFilterOperator {
  IS = "is",
  EQUALS = "=",
  IS_NOT = "is not",
  IS_ANY_OF = "is any of",
  INCLUDE = "include",
  DO_NOT_INCLUDE = "do not include",
  LESS_THAN = "less than",
  GREATER_THAN = "greater than",
  BETWEEN = "between"
}

/**
 * What a filter is keyed on: either a curated category — which carries an
 * icon, an operator set and a value list — or a bare attribute path, which
 * carries none of those and is matched on the value as displayed. Views that
 * let the actor surface arbitrary attributes can only filter the second way.
 */
export type ProductFilterField = ProductFilterType | (string & {});

const PRODUCT_FILTER_TYPES: ReadonlySet<string> = new Set(Object.values(ProductFilterType));

export const isProductFilterType = (field: ProductFilterField): field is ProductFilterType =>
  PRODUCT_FILTER_TYPES.has(field);

export type ProductFilter = {
  id: string;
  type: ProductFilterField;
  operator: ProductFilterOperator;
  value: string[];
};

/**
 * Icons are optional throughout: a filter facet carries one only when the data
 * behind it does. The UI never invents an icon for a value it happens to
 * recognise.
 */
export type ProductFilterCategory = {
  id: ProductFilterField;
  name: string;
  icon?: string;
  children?: ProductFilterValue[];
};

export type ProductFilterValue = {
  id: string;
  name: string;
  value: string;
  icon?: string;
  filterType: ProductFilterField;
};