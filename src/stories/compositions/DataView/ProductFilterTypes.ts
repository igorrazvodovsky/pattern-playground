import { Product } from '../../data/types';

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

// Helper function to get unique values from product data
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

// Helper function to generate filter categories from product data
export function generateProductFilterCategories(products: Product[]): ProductFilterCategory[] {
  const getIconForFilterType = (type: ProductFilterType): string => {
    switch (type) {
      case ProductFilterType.CATEGORY:
        return "ph:tag";
      case ProductFilterType.AVAILABILITY_STATUS:
        return "ph:circle";
      case ProductFilterType.REPAIRABILITY:
        return "ph:wrench";
      case ProductFilterType.UPGRADEABILITY:
        return "ph:arrow-up";
      case ProductFilterType.PRICE_RANGE:
        return "ph:currency-dollar";
      case ProductFilterType.CERTIFICATIONS:
        return "ph:certificate";
      case ProductFilterType.REGIONS:
        return "ph:globe";
      case ProductFilterType.CHANNELS:
        return "ph:storefront";
      default:
        return "ph:funnel";
    }
  };

  const getIconForValue = (type: ProductFilterType, value: string): string => {
    switch (type) {
      case ProductFilterType.CATEGORY:
        return value === "transportation" ? "ph:car" :
               value === "electronics" ? "ph:device-mobile" :
               value === "furniture" ? "ph:chair" :
               value === "packaging" ? "ph:package" :
               value === "apparel" ? "ph:t-shirt" : "ph:tag";
      case ProductFilterType.AVAILABILITY_STATUS:
        return value === "in_production" ? "ph:check-circle" :
               value === "pre_order" ? "ph:clock" :
               value === "discontinued" ? "ph:x-circle" : "ph:circle";
      case ProductFilterType.REPAIRABILITY:
      case ProductFilterType.UPGRADEABILITY:
        return value === "high" ? "ph:arrow-up" :
               value === "medium" ? "ph:minus" :
               value === "low" ? "ph:arrow-down" : "ph:question";
      default:
        return "ph:dot";
    }
  };

  return Object.values(ProductFilterType).map(type => {
    const uniqueValues = getUniqueFilterValues(products, type);

    return {
      id: type,
      name: type,
      icon: getIconForFilterType(type),
      children: uniqueValues.map(value => ({
        id: `${type}_${value}`,
        name: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value,
        icon: getIconForValue(type, value),
        filterType: type
      }))
    };
  });
}

// Helper function to check if a product matches a filter
export function productMatchesFilter(product: Product, filter: ProductFilter): boolean {
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

  const productValue = getValue(filter.type);
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

// Helper function to apply all filters to products
export function applyFiltersToProducts(products: Product[], filters: ProductFilter[]): Product[] {
  if (filters.length === 0) {
    return products;
  }

  return products.filter(product =>
    filters.every(filter =>
      filter.value.length === 0 || productMatchesFilter(product, filter)
    )
  );
}