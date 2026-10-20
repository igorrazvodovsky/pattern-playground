import {
  deriveAttributeLabel,
  formatBoundValue,
  getValueAtPath,
  productBinding,
  resolveAttributeSelection,
  type AttributeBinding,
  type EntityBinding,
} from '@shared/data/bindings';
import type { Product } from '@shared/data/types';
import { toMapLocations } from '../../../templates/collection-view/data';

type Rung = 'mini' | 'mid' | 'maxi';

const read = (item: object, attribute: AttributeBinding) => getValueAtPath(item, attribute.path);
const present = (item: object, attributes: AttributeBinding[]) =>
  attributes.filter((attribute) => read(item, attribute) != null);
const format = (item: object, attribute: AttributeBinding) =>
  formatBoundValue(read(item, attribute), attribute);
const label = (attribute: AttributeBinding) =>
  attribute.label ?? deriveAttributeLabel(attribute.path);

export const cardAttributes = (paths: string[]) => {
  const selection = resolveAttributeSelection(productBinding, paths);
  return (item: Product) =>
    present(item, selection).map((attribute) => ({
      path: attribute.path,
      label: label(attribute),
      value: format(item, attribute),
    }));
};

// What a flag's slice shows of each item it flags.
export const sliceAttributes = cardAttributes(['category', 'pricing.msrp', 'listedAt']);

export const attributeLabel = (path: string) =>
  label(resolveAttributeSelection(productBinding, [path])[0]);

export const attributeValue = (path: string) => {
  const [attribute] = resolveAttributeSelection(productBinding, [path]);
  return (item: Product) => (read(item, attribute) == null ? '' : format(item, attribute));
};

// An attribute holding a record gives one row per key.
const rows = (item: object, attributes: AttributeBinding[]) =>
  present(item, attributes).flatMap((attribute) => {
    const value = read(item, attribute);
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      return Object.entries(value)
        .filter(([, entry]) => entry != null)
        .map(([key, entry]) => ({
          label: deriveAttributeLabel(key),
          value: formatBoundValue(entry, attribute),
        }));
    }
    return [{ label: label(attribute), value: format(item, attribute) }];
  });

// `omit` names what a view next to this one already shows.
export const itemView = (
  rung: Rung,
  binding: EntityBinding = productBinding,
  omit: string[] = [],
) => {
  const omitted = new Set(
    resolveAttributeSelection(binding, omit).map((attribute) => attribute.path),
  );
  const shown = resolveAttributeSelection(binding, binding.scopes[rung]).filter(
    (attribute) => !omitted.has(attribute.path),
  );
  const byRole = (role: AttributeBinding['role']) =>
    shown.filter((attribute) => attribute.role === role);
  return (item: object) => {
    const [price] = present(item, byRole('key-attribute'));
    const [description] = present(item, byRole('description'));
    const [listed] = present(item, byRole('footer'));
    const attributeRows = rows(item, [...byRole('spec'), ...byRole('link')]);
    return {
      badges: present(item, byRole('badge')).map((attribute) => ({
        text: format(item, attribute),
      })),
      price: price ? format(item, price) : '',
      description: description ? format(item, description) : '',
      rows: attributeRows,
      hasRows: attributeRows.length > 0,
      listed: listed ? `${label(listed)} ${format(item, listed)}` : '',
    };
  };
};

export const fullView = itemView('maxi');

export const mapLocations = (items: Product[]) =>
  toMapLocations(items, productBinding).map((location) => ({
    id: String(location.id),
    name: location.name,
    lat: location.lat,
    lng: location.lng,
    description: location.description ?? null,
  }));
