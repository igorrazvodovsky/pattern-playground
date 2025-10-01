import { Product } from '../../data/types';

// Identity attributes - define what the item is (have dedicated UI slots)
const IDENTITY_ATTRIBUTES = ['name', 'description'];

// Metadata attributes - provide context about the item (rendered as badges/columns)
const METADATA_ATTRIBUTES = [
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

export const isIdentityAttribute = (attribute: string): boolean => {
  return IDENTITY_ATTRIBUTES.includes(attribute);
};

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

  // Merge identity, metadata, and dynamic specification attributes
  return [...IDENTITY_ATTRIBUTES, ...METADATA_ATTRIBUTES, ...cachedSpecificationKeys].sort();
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