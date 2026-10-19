import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import {
  deriveAttributeLabel,
  formatBoundValue,
  getValueAtPath,
  productBinding,
  resolveAttributeSelection,
  type AttributeBinding,
} from '@shared/data/bindings';
import type { Product } from '@shared/data/types';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './investigate.json' with { type: 'json' };

// The spec carries the drilldown: categories, then the items in one category,
// then one item's full view. Opening a card sets its `open` field and the rung
// flag (`/inCategory`, `/inItem`); Back clears both. Each category is repeated
// twice, as a card and as its list of items, and each item twice again, as a
// card and as its full view; a repeat cannot follow a path chosen while the
// demo runs, so each view shows only while its `open` is set. Focus follows
// the drill as in the problem checklist: Back takes it on the way in, and the
// card the actor opened takes it on the way out.
//
// What JSON cannot do is group the collection and read the product binding.
// Both happen here, once: each category arrives with its count and its items,
// and each item with its summary attributes and its full view already laid
// out by role, as the item view lays out its maxi scope. The summary and the
// full view read and format values through the same binding helpers, so a
// value reads the same on the card and in the full view.

const SUMMARY_ATTRIBUTES = ['condition', 'pricing.msrp'];

const shown = resolveAttributeSelection(productBinding, productBinding.scopes.maxi);
const byRole = (role: AttributeBinding['role']) => shown.filter(attribute => attribute.role === role);
const read = (item: Product, attribute: AttributeBinding) => getValueAtPath(item, attribute.path);
const present = (item: Product, attributes: AttributeBinding[]) =>
  attributes.filter(attribute => read(item, attribute) != null);
const format = (item: Product, attribute: AttributeBinding) => formatBoundValue(read(item, attribute), attribute);
const label = (attribute: AttributeBinding) => attribute.label ?? deriveAttributeLabel(attribute.path);
const summary = resolveAttributeSelection(productBinding, SUMMARY_ATTRIBUTES);

// A spec attribute holding a record, such as a product's specifications,
// gives one row per key.
const rows = (item: Product) =>
  present(item, [...byRole('spec'), ...byRole('link')]).flatMap(attribute => {
    const value = read(item, attribute);
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      return Object.entries(value)
        .filter(([, entry]) => entry != null)
        .map(([key, entry]) => ({ label: deriveAttributeLabel(key), value: formatBoundValue(entry, attribute) }));
    }
    return [{ label: label(attribute), value: format(item, attribute) }];
  });

const fullView = (item: Product) => {
  const [price] = present(item, byRole('key-attribute'));
  const [description] = present(item, byRole('description'));
  const [listed] = present(item, byRole('footer'));
  const attributeRows = rows(item);
  return {
    badges: present(item, byRole('badge')).map(attribute => ({ text: format(item, attribute) })),
    price: price ? format(item, price) : '',
    description: description ? format(item, description) : '',
    rows: attributeRows,
    hasRows: attributeRows.length > 0,
    listed: listed ? `${label(listed)} ${format(item, listed)}` : '',
  };
};

const categories = [...new Set(products.map(item => item.metadata.category))]
  .sort((a, b) => a.localeCompare(b))
  .map(category => {
    const items = products.filter(item => item.metadata.category === category);
    return {
      id: category,
      name: category,
      count: `${items.length} listing${items.length === 1 ? '' : 's'}`,
      open: false,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category,
        open: false,
        attributes: present(item, summary).map(attribute => ({
          label: label(attribute),
          value: format(item, attribute),
        })),
        ...fullView(item),
      })),
    };
  });

export default {
  spec: spec as Spec,
  setup: {
    initialState: { categories, inCategory: false, inItem: false },
  } satisfies SpecSetup,
};
