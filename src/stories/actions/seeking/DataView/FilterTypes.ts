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

export enum ProductFilterOperator {
  IS = "is",
  IS_NOT = "is not",
  IS_ANY_OF = "is any of",
  INCLUDE = "include",
  DO_NOT_INCLUDE = "do not include",
  LESS_THAN = "less than",
  GREATER_THAN = "greater than",
  BETWEEN = "between"
}

export type ProductFilter = {
  id: string;
  type: ProductFilterType;
  operator: ProductFilterOperator;
  value: string[];
};

export type ProductFilterCategory = {
  id: ProductFilterType;
  name: string;
  icon: string;
  children?: ProductFilterValue[];
};

export type ProductFilterValue = {
  id: string;
  name: string;
  value: string;
  icon: string;
  filterType: ProductFilterType;
};