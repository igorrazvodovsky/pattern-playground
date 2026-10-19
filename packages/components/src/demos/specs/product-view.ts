import {
  deriveAttributeLabel,
  formatBoundValue,
  getValueAtPath,
  productBinding,
  resolveAttributeSelection,
  type AttributeBinding,
} from '@shared/data/bindings';
import type { Product } from '@shared/data/types';

// How the specs that show products read the product binding. A card shows a
// few attributes as labelled values; a view at one rung of the ladder is laid
// out by role, as the item view lays out that rung's scope. Both read and
// format values through the same binding helpers, so a value reads the same
// on the card and in every view.

type Rung = 'mini' | 'mid' | 'maxi';

const read = (item: Product, attribute: AttributeBinding) => getValueAtPath(item, attribute.path);
const present = (item: Product, attributes: AttributeBinding[]) =>
  attributes.filter(attribute => read(item, attribute) != null);
const format = (item: Product, attribute: AttributeBinding) => formatBoundValue(read(item, attribute), attribute);
const label = (attribute: AttributeBinding) => attribute.label ?? deriveAttributeLabel(attribute.path);

/** Reads the attributes at `paths` that an item has, labelled and formatted. */
export const cardAttributes = (paths: string[]) => {
  const selection = resolveAttributeSelection(productBinding, paths);
  return (item: Product) =>
    present(item, selection).map(attribute => ({ label: label(attribute), value: format(item, attribute) }));
};

/** Reads the attribute at `path`, formatted, or an empty string when the item lacks it. */
export const attributeValue = (path: string) => {
  const [attribute] = resolveAttributeSelection(productBinding, [path]);
  return (item: Product) => (read(item, attribute) == null ? '' : format(item, attribute));
};

// A spec attribute holding a record, such as a product's specifications,
// gives one row per key.
const rows = (item: Product, attributes: AttributeBinding[]) =>
  present(item, attributes).flatMap(attribute => {
    const value = read(item, attribute);
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      return Object.entries(value)
        .filter(([, entry]) => entry != null)
        .map(([key, entry]) => ({ label: deriveAttributeLabel(key), value: formatBoundValue(entry, attribute) }));
    }
    return [{ label: label(attribute), value: format(item, attribute) }];
  });

/**
 * The item at one rung, laid out by role: badges, price, description, rows,
 * and when it was listed. A part the rung's scope leaves out is empty.
 */
export const itemView = (rung: Rung) => {
  const shown = resolveAttributeSelection(productBinding, productBinding.scopes[rung]);
  const byRole = (role: AttributeBinding['role']) => shown.filter(attribute => attribute.role === role);
  return (item: Product) => {
    const [price] = present(item, byRole('key-attribute'));
    const [description] = present(item, byRole('description'));
    const [listed] = present(item, byRole('footer'));
    const attributeRows = rows(item, [...byRole('spec'), ...byRole('link')]);
    return {
      badges: present(item, byRole('badge')).map(attribute => ({ text: format(item, attribute) })),
      price: price ? format(item, price) : '',
      description: description ? format(item, description) : '',
      rows: attributeRows,
      hasRows: attributeRows.length > 0,
      listed: listed ? `${label(listed)} ${format(item, listed)}` : '',
    };
  };
};

/** The item's full view: every attribute the maxi scope carries. */
export const fullView = itemView('maxi');
