import type {
  AttributeBinding,
  AttributeRole,
  AttributeSelection,
  AttributeValueType,
  EntityBinding,
} from './types';
import { formatCurrency, formatDate, formatPercent } from '../../format/index.js';

/**
 * Binding-driven attribute access: path walking and value formatting that
 * work on any bound entity. Formatting switches on the binding's valueType,
 * never on hardcoded paths.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Walk a dot-path into an entity. A path segment not found directly is
 * looked up under a `metadata` object when one is present, so paths read
 * domain-first ('pricing.msrp', 'status') regardless of whether the entity
 * nests its attributes under `metadata`.
 */
export function getValueAtPath(entity: unknown, path: string): unknown {
  let value: unknown = entity;
  for (const key of path.split('.')) {
    if (!isRecord(value)) return undefined;
    if (key in value) {
      value = value[key];
    } else if (isRecord(value.metadata) && key in value.metadata) {
      value = value.metadata[key];
    } else {
      return undefined;
    }
  }
  return value;
}

/** 'carbonFootprint' → 'Carbon footprint': the camelCase-leaf fallback for
    paths whose binding carries no curated label. */
export function deriveAttributeLabel(path: string): string {
  const leaf = path.split('.').pop() ?? path;
  const spaced = leaf.replace(/([A-Z])/g, (match) => ` ${match.toLowerCase()}`);
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function attributeLabelFromBinding(
  binding: EntityBinding | undefined,
  path: string
): string {
  const entry = binding?.attributes.find((attribute) => attribute.path === path);
  return entry?.label ?? deriveAttributeLabel(path);
}

export function findAttribute(
  binding: EntityBinding,
  path: string
): AttributeBinding | undefined {
  return binding.attributes.find((attribute) => attribute.path === path);
}

const ROLES: readonly AttributeRole[] = [
  'title',
  'subtitle',
  'description',
  'key-attribute',
  'thumbnail',
  'caption',
  'badge',
  'tag',
  'spec',
  'link',
  'action',
  'footer',
];

/**
 * Resolve a shown-attribute selection against a binding. Each entry names an
 * attribute path, or a role — every attribute carrying that role, in binding
 * order. 'all' is the whole binding. A path outside the binding (a dynamic
 * group's key, e.g. 'specifications.weight') resolves to a synthetic spec
 * entry so it still renders with a derived label and default formatting.
 */
export function resolveAttributeSelection(
  binding: EntityBinding,
  selection: AttributeSelection
): AttributeBinding[] {
  if (selection === 'all') return binding.attributes;
  const resolved: AttributeBinding[] = [];
  for (const entry of selection) {
    const byPath = findAttribute(binding, entry);
    if (byPath) {
      resolved.push(byPath);
    } else if ((ROLES as readonly string[]).includes(entry)) {
      resolved.push(
        ...binding.attributes.filter((attribute) => attribute.role === entry)
      );
    } else {
      resolved.push({ path: entry, role: 'spec', valueType: 'string' });
    }
  }
  return resolved.filter(
    (attribute, index) =>
      resolved.findIndex((candidate) => candidate.path === attribute.path) === index
  );
}

/** Roles with a dedicated identity slot in item layouts (heading, icon,
    body paragraph) rather than a generic badge/row/column placement. */
export const IDENTITY_ROLES: readonly AttributeRole[] = [
  'title',
  'thumbnail',
  'description',
];

export function isNumericValueType(valueType: AttributeValueType): boolean {
  return valueType === 'number' || valueType === 'currency' || valueType === 'progress';
}

const formatDateValue = (value: unknown): string => {
  // Pass the string through rather than a parsed Date, so a `YYYY-MM-DD` value
  // keeps its calendar day instead of shifting by the reader's UTC offset.
  const input = value instanceof Date || typeof value === 'number' ? value : String(value);
  if (Number.isNaN(new Date(input).getTime())) return String(value);
  return formatDate(input);
};

/** Format a resolved value by its binding's valueType. Nullish values are the
    caller's concern — a view skips them, a table prints a placeholder. */
export function formatBoundValue(value: unknown, attribute: AttributeBinding): string {
  switch (attribute.valueType) {
    case 'currency':
      return typeof value === 'number'
        ? formatCurrency(value, attribute.currency ?? 'GBP')
        : String(value);
    case 'date':
      return formatDateValue(value);
    case 'progress':
      // Stored 0–100; `style: 'percent'` takes the ratio and places the symbol.
      return typeof value === 'number'
        ? formatPercent(value / 100, { maximumFractionDigits: 0 })
        : String(value);
    default: {
      const text = Array.isArray(value) ? value.join(', ') : String(value);
      return attribute.unit ? `${text} ${attribute.unit}` : text;
    }
  }
}

/** The entity's title through its binding's `title` role — what a host names
    a modal or page after. Falls back to common identity fields. */
export function resolveEntityTitle(
  entity: unknown,
  binding: EntityBinding | undefined
): string {
  const titleAttribute = binding?.attributes.find(
    (attribute) => attribute.role === 'title'
  );
  if (titleAttribute) {
    const value = getValueAtPath(entity, titleAttribute.path);
    if (value != null) return String(value);
  }
  if (isRecord(entity)) {
    const fallback = entity.label ?? entity.name ?? entity.id;
    if (fallback != null) return String(fallback);
  }
  return '';
}
