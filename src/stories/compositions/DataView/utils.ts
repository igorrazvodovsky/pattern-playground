import { Product } from '../../data/types';

export const getAvailableAttributes = (products: Product[]): string[] => {
  const attributes = new Set<string>();

  attributes.add('name');
  attributes.add('description');
  attributes.add('category');
  attributes.add('subcategory');

  products.forEach(product => {
    Object.keys(product.metadata.specifications || {}).forEach(key => {
      attributes.add(`specifications.${key}`);
    });
  });

  attributes.add('sustainability.carbonFootprint');
  attributes.add('sustainability.recyclabilityScore');
  attributes.add('lifecycle.designLife');
  attributes.add('lifecycle.repairability');
  attributes.add('pricing.msrp');
  attributes.add('pricing.currency');
  attributes.add('availability.status');
  attributes.add('availability.leadTime');

  return Array.from(attributes).sort();
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