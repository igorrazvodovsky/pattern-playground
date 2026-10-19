import type { StateStore } from '@json-render/core';

// The handler for the catalog's `toggle` action. A spec cannot write to an
// item's siblings, so opening one item and closing the others in its list
// happens here. An item that closes also closes everything open inside it, so
// opening it again starts from its summary, as it did the first time.

/** A copy of `value` with every `open` field inside it cleared. */
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
