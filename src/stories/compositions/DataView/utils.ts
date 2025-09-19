import { Product } from '../../data/types';
import { SortField, SortOrder } from './types';

// Field display name mappings for user-friendly labels
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  'name': 'Name',
  'category': 'Category',
  'pricing.msrp': 'Price',
  'availability.status': 'Availability',
  'sustainability.carbonFootprint': 'Carbon Footprint',
  'sustainability.recyclabilityScore': 'Recyclability',
  'lifecycle.designLife': 'Design Life',
  'lifecycle.repairability': 'Repairability',
  'availability.leadTime': 'Lead Time',
  'subcategory': 'Subcategory',
  'description': 'Description',
  'pricing.currency': 'Currency',
  'lifecycle.warrantyPeriod': 'Warranty Period',
  'lifecycle.upgradeability': 'Upgradeability',
  'sustainability.recyclabilityScore': 'Recyclability Score',
  'pricing.leaseOptions': 'Lease Options',
  'pricing.subscriptionModel': 'Subscription Model',
  'pricing.tradeInValue': 'Trade-in Value',
  'availability.leadTimeUnit': 'Lead Time Unit',
  'availability.regions': 'Regions',
  'availability.channels': 'Channels'
};

export const getFieldDisplayName = (field: string): string => {
  return FIELD_DISPLAY_NAMES[field] ||
    field.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || field;
};

// Static attributes that are always available
const STATIC_ATTRIBUTES = [
  'name',
  'description',
  'category',
  'subcategory',
  'sustainability.carbonFootprint',
  'sustainability.recyclabilityScore',
  'lifecycle.designLife',
  'lifecycle.repairability',
  'pricing.msrp',
  'pricing.currency',
  'availability.status',
  'availability.leadTime'
].sort();

// Cache for dynamic specification attributes
let cachedSpecificationKeys: string[] | null = null;
let lastProductsHash: string | null = null;

// Generate a simple hash of product specifications structure
const getProductsSpecificationHash = (products: Product[]): string => {
  const specKeys = new Set<string>();
  products.forEach(product => {
    Object.keys(product.metadata.specifications || {}).forEach(key => {
      specKeys.add(key);
    });
  });
  return Array.from(specKeys).sort().join('|');
};

export const getAvailableAttributes = (products: Product[]): string[] => {
  const currentHash = getProductsSpecificationHash(products);

  // Only recalculate specification attributes if products structure changed
  if (cachedSpecificationKeys === null || lastProductsHash !== currentHash) {
    const specKeys = new Set<string>();
    products.forEach(product => {
      Object.keys(product.metadata.specifications || {}).forEach(key => {
        specKeys.add(`specifications.${key}`);
      });
    });

    cachedSpecificationKeys = Array.from(specKeys).sort();
    lastProductsHash = currentHash;
  }

  // Merge static and dynamic attributes
  return [...STATIC_ATTRIBUTES, ...cachedSpecificationKeys].sort();
};

export const getAttributeValue = (product: Product, attributePath: string): unknown => {
  const keys = attributePath.split('.');
  let value: unknown = product;

  for (const key of keys) {
    if (key === 'metadata') continue;
    if (typeof value === 'object' && value !== null && 'metadata' in value && keys[0] !== 'name' && keys[0] !== 'description') {
      value = (value as { metadata: Record<string, unknown> }).metadata;
    }
    if (typeof value === 'object' && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      value = undefined;
      break;
    }
  }

  return value;
};

export const formatAttributeValue = (value: unknown, attributePath: string): string => {
  if (value === undefined || value === null) return 'N/A';

  if (attributePath.includes('msrp') && typeof value === 'number') {
    return `$${value.toFixed(2)}`;
  }

  if (attributePath.includes('carbonFootprint')) {
    return `${value} kg CO2e`;
  }

  if (attributePath.includes('leadTime')) {
    return `${value} days`;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
};

export const sortProducts = (
  products: Product[],
  sortField: SortField,
  sortOrder: SortOrder
): Product[] => {

  try {
    return [...products].sort((a, b) => {
      try {
        const valueA = getAttributeValue(a, sortField);
        const valueB = getAttributeValue(b, sortField);

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) {
          if (valueB === null || valueB === undefined) return 0;
          return sortOrder === 'asc' ? 1 : -1;
        }
        if (valueB === null || valueB === undefined) {
          return sortOrder === 'asc' ? -1 : 1;
        }

        // Convert to comparable values
        let compareA: string | number = valueA;
        let compareB: string | number = valueB;

        // Handle numeric fields
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          compareA = valueA;
          compareB = valueB;
        } else {
          // Convert to strings for comparison
          compareA = String(valueA).toLowerCase();
          compareB = String(valueB).toLowerCase();
        }

        let result: number;
        if (typeof compareA === 'number' && typeof compareB === 'number') {
          result = compareA - compareB;
        } else {
          result = compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        }

        return sortOrder === 'asc' ? result : -result;
      } catch (error) {
        // If individual comparison fails, maintain original order
        console.warn('Comparison failed for sorting:', error);
        return 0;
      }
    });
  } catch (error) {
    console.warn('Sorting failed, returning unsorted data:', error);
    return [...products];
  }
};