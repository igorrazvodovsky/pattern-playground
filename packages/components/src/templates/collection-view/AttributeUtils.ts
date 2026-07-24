import { Product } from '@shared/data/types';
import type { EntityBinding } from '@shared/data/bindings';
import {
  productBinding,
  findAttribute,
  attributeLabelFromBinding,
  formatBoundValue,
  getValueAtPath,
  IDENTITY_ROLES,
} from '@shared/data/bindings';

/**
 * Binding-driven attribute access for the collection template. Every function
 * takes the entity binding as its last parameter; it defaults to the product
 * binding because products are the canonical demo population, so demo code
 * over products reads unqualified while the template itself stays generic.
 */

/** Identity attributes have dedicated UI slots (heading, icon, body text)
    rather than generic badge/row/column placement — a role property, not a
    name list. Paths outside the binding (dynamic spec keys) are never
    identity. */
export const isIdentityAttribute = (
  attribute: string,
  binding: EntityBinding = productBinding
): boolean => {
  const entry = findAttribute(binding, attribute);
  return entry !== undefined && IDENTITY_ROLES.includes(entry.role);
};

// Label curation lives in each entity binding (shared/data/bindings): a
// curated `label` where the derived one reads wrong, the camelCase-leaf
// fallback everywhere else.
export function attributeLabel(
  path: string,
  binding: EntityBinding = productBinding
): string {
  return attributeLabelFromBinding(binding, path);
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

/** Product-side data mining: the binding's paths plus the dynamic
    specification keys present in the collection. */
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

  const identity = productBinding.attributes
    .filter((attribute) => IDENTITY_ROLES.includes(attribute.role) && attribute.path !== 'icon')
    .map((attribute) => attribute.path);
  const metadata = productBinding.attributes
    .filter(
      (attribute) =>
        !IDENTITY_ROLES.includes(attribute.role) &&
        attribute.valueType !== 'custom' &&
        attribute.path !== 'specifications' &&
        attribute.path !== 'pricing.band'
    )
    .map((attribute) => attribute.path);
  return [...identity, ...metadata, ...cachedSpecificationKeys].sort();
};

// Thin wrappers over the binding-driven access module: path walking is
// generic, and formatting switches on the binding entry's valueType (with a
// join/String fallback for paths outside the binding, e.g. dynamic
// specification keys).
export const getAttributeValue = (item: unknown, attributePath: string): unknown =>
  getValueAtPath(item, attributePath);

export const formatAttributeValue = (
  value: unknown,
  attributePath: string,
  binding: EntityBinding = productBinding
): string => {
  if (value === undefined || value === null) return 'N/A';
  const entry = findAttribute(binding, attributePath);
  if (entry) return formatBoundValue(value, entry);
  return Array.isArray(value) ? value.join(', ') : String(value);
};
