import { Product } from '@shared/data/types';

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
  'availability.leadTime',
  'condition',
  'location.site',
  'listedAt'
].sort();

export const isIdentityAttribute = (attribute: string): boolean => {
  return IDENTITY_ATTRIBUTES.includes(attribute);
};

// Curated display names for paths whose derived label reads wrong — the
// fallback below spaces the camelCase leaf, which turns 'pricing.msrp' into
// "Msrp". Only divergent entries live here.
const ATTRIBUTE_LABELS: Record<string, string> = {
  'pricing.msrp': 'Price',
  // Not a stored attribute: the band a price falls into, computed on read.
  'pricing.band': 'Price band',
  'pricing.tradeInValue': 'Trade-in Value',
  'availability.status': 'Availability',
};

export function attributeLabel(path: string): string {
  const curated = ATTRIBUTE_LABELS[path];
  if (curated) return curated;
  const leaf = path.split('.').pop() ?? path;
  return leaf.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

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

  if (attributePath === 'listedAt' && typeof value === 'string') {
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
};