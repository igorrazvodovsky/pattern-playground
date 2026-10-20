import type { Spec } from '@json-render/core';
import type { Product } from '@shared/data/types';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { attributeLabel, formatAttributeValue, getAttributeValue } from '../../templates/collection-view/AttributeUtils';
import { products } from '../../templates/collection-view/data';
import spec from './writable-board.json' with { type: 'json' };

// The write goes with the grouping, not the board, so it survives turning the
// groups from rows to columns. A refusal reports through the same toast as a
// write, so it is as visible. A watch rewrites `/derived` because a repeat
// reads a list from state and a spec cannot group one.

const PRICE_BAND = 'pricing.band';
const PRICE_BANDS = ['Under $100', '$100–1,000', 'Over $1,000'];

interface Grouping {
  /** Every group, in order, so an empty one stays on the board to drop into. */
  groups: string[];
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
    item: id,
    path,
    from: groupOf(path, item),
  };
};

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

// Rows, because the demo is as wide as the text, where four lanes never fit.
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
      derive,
      move,
      moveToast,
      undoMove,
    },
  } satisfies SpecSetup,
};
