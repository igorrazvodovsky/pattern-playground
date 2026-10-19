import type { Spec } from '@json-render/core';
import type { Product } from '@shared/data/types';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { attributeLabel, formatAttributeValue, getAttributeValue } from '../../templates/collection-view/AttributeUtils';
import { products } from '../../templates/collection-view/data';
import spec from './writable-board.json' with { type: 'json' };

// A board taken apart: cards grouped by one attribute, the groups laid along
// either axis. Dropping a card on another group writes the grouping attribute
// through the projection. The write goes with the grouping, not the board, so
// it survives turning the groups from rows to columns and the choice of which
// attribute groups. Grouped by price band, which is computed from the price,
// the same gesture is refused, and the refusal is reported as plainly as a
// write. Every drop has a way without a pointer: the card's menu names every
// other group and makes the same write.
//
// A write and its refusal report through the same channel, a toast: they are
// the same gesture answered two ways, so the refusal has to be as visible as
// the write. A write's toast offers Undo, which puts back that card's value
// alone, so undoing an older toast leaves later moves alone.
//
// `/items` holds the products as the writes leave them. A watch on it and on
// the grouping rewrites `/derived`, the groups in order with their cards,
// because a repeat reads a list from state and a spec cannot group one.

const PRICE_BAND = 'pricing.band';
const PRICE_BANDS = ['Under $100', '$100–1,000', 'Over $1,000'];

interface Grouping {
  /** Every group, in order, so an empty one stays on the board to drop into. */
  groups: string[];
  /** The group an item is in; by default its value as the card shows it. */
  groupOf?: (item: Product) => string;
  /** Absent when the grouping is computed, so it can only refuse a write. */
  write?: (item: Product, group: string) => Product;
}

const GROUPINGS: Record<string, Grouping> = {
  'availability.status': {
    groups: ['In Development', 'Pilot', 'In Production', 'Discontinued'],
    write: (item, status) => ({
      ...item,
      metadata: { ...item.metadata, availability: { ...item.metadata.availability, status } },
    }),
  },
  condition: {
    groups: ['New', 'Refurbished', 'Remanufactured'],
    write: (item, condition) => ({ ...item, metadata: { ...item.metadata, condition } }),
  },
  [PRICE_BAND]: {
    groups: PRICE_BANDS,
    groupOf: item => {
      const price = item.metadata.pricing.msrp;
      if (price < 100) return PRICE_BANDS[0];
      if (price <= 1000) return PRICE_BANDS[1];
      return PRICE_BANDS[2];
    },
  },
};

const show = (item: Product, path: string) => formatAttributeValue(getAttributeValue(item, path), path);
const groupOf = (path: string, item: Product) => GROUPINGS[path]?.groupOf?.(item) ?? show(item, path);

/** A card shows its name, the attribute it is grouped by unless that is computed, and its price. */
const cardOf = (path: string, groups: string[]) => (item: Product) => {
  const current = path ? groupOf(path, item) : '';
  return {
    id: item.id,
    name: item.name,
    moveLabel: `Move ${item.name} to…`,
    attributes: [...(path && path !== PRICE_BAND ? [path] : []), 'pricing.msrp'].map(each => ({
      label: attributeLabel(each),
      value: show(item, each),
    })),
    movable: groups.length > 0,
    destinations: groups.filter(group => group !== current).map(group => ({ id: item.id, group })),
  };
};

/** The groups in order, with their cards, or every card when nothing groups them. */
const derive = ({ items, groupBy }: Record<string, unknown>) => {
  const all = items as Product[];
  const path = typeof groupBy === 'string' ? groupBy : '';
  const grouping = GROUPINGS[path];
  const groups = grouping?.groups ?? [];
  const card = cardOf(path, groups);
  return {
    grouped: Boolean(grouping),
    cards: all.map(card),
    groups: groups.map(group => {
      const members = all.filter(item => groupOf(path, item) === group);
      return { key: group, count: String(members.length), cards: members.map(card) };
    }),
  };
};

let toastCount = 0;

/** What a move to `group` says: that it was made, with Undo, or why it was refused. */
const moveToast = ({ items, id, group, groupBy }: Record<string, unknown>) => {
  const item = (items as Product[]).find(each => each.id === id);
  const path = String(groupBy);
  const toastId = `move-${++toastCount}`;
  if (!item) return { id: toastId, message: 'Not moved.', actionLabel: null };
  if (!GROUPINGS[path]?.write) {
    return {
      id: toastId,
      message: `Not moved: “${group}” is worked out from the price, so it can't be written. Edit the price and the card follows.`,
      actionLabel: null,
    };
  }
  return {
    id: toastId,
    message: `Moved “${item.name}”: its ${attributeLabel(path).toLowerCase()} is now ${group}.`,
    actionLabel: 'Undo',
    // Undo puts back this card's value alone.
    item: id,
    path,
    from: groupOf(path, item),
  };
};

/** The items with the one at `id` written into `group`, unless the grouping is computed. */
const move = ({ items, id, group, groupBy }: Record<string, unknown>) => {
  const write = GROUPINGS[String(groupBy)]?.write;
  const all = items as Product[];
  if (!write) return all;
  return all.map(item => (item.id === id ? write(item, String(group)) : item));
};

const undoMove = ({ items, toast }: Record<string, unknown>) => {
  const { item, path, from } = (toast ?? {}) as { item?: string; path?: string; from?: string };
  const write = path ? GROUPINGS[path]?.write : undefined;
  const all = items as Product[];
  if (!write || !item || from == null) return all;
  return all.map(each => (each.id === item ? write(each, from) : each));
};

// Rows to start with: the demo is as wide as the text, where four lanes never
// fit. Columns are a choice away, and the point of the demo is that the write
// survives the turn either way.
const groupBy = 'availability.status';

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      items: products,
      groupBy,
      axis: 'sections',
      derived: derive({ items: products, groupBy }),
      groupings: [
        { path: '', label: 'No grouping' },
        ...Object.keys(GROUPINGS).map(path => ({ path, label: attributeLabel(path) })),
      ],
      closed: [],
      dropped: null,
      toasts: [],
      pressed: null,
    },
    functions: {
      // An action's `$item` names the item's path; inside `$computed` it is the value.
      value: ({ value }) => value,
      excludes: ({ list, value }) => !(Array.isArray(list) && list.includes(value)),
      toggleIn: ({ list, value }) => {
        const current = Array.isArray(list) ? (list as string[]) : [];
        return current.includes(String(value)) ? current.filter(each => each !== value) : [...current, String(value)];
      },
      derive,
      move,
      moveToast,
      undoMove,
    },
  } satisfies SpecSetup,
};
