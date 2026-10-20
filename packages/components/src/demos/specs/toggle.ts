import type { StateStore } from '@json-render/core';

// A spec cannot write to an item's siblings, so closing the others happens
// here. Closing an item also closes everything inside it, so it reopens at its
// summary.

const closeAll = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(closeAll);
  if (value === null || typeof value !== 'object') return value;
  const copy = Object.fromEntries(Object.entries(value).map(([key, field]) => [key, closeAll(field)]));
  return 'open' in copy ? { ...copy, open: false } : copy;
};

export const toggleHandler = (store: StateStore) => ({
  toggle: ({ item }: Record<string, unknown>) => {
    const path = String(item);
    const parent = path.slice(0, path.lastIndexOf('/'));
    const index = Number(path.slice(path.lastIndexOf('/') + 1));
    const list = store.get(parent);
    if (!Array.isArray(list)) return;
    store.set(parent, list.map((node: { open?: boolean }, i) => {
      if (i === index && !node.open) return { ...node, open: true };
      return node.open ? closeAll(node) : node;
    }));
  },
});
