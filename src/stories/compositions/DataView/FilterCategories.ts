import { Product } from '../../data/types';
import { ProductFilterType, ProductFilterCategory } from './FilterTypes';
import { getUniqueFilterValues } from './FilterOperations';

function getIconForFilterType(type: ProductFilterType): string {
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
}

function getIconForValue(type: ProductFilterType, value: string): string {
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
}

export function generateProductFilterCategories(products: Product[]): ProductFilterCategory[] {
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