import { Product } from '../../data/types';
import { ProductFilter, ProductFilterType, ProductFilterOperator } from './FilterTypes';

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