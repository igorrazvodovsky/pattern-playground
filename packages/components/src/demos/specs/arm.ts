import type { StateStore } from '@json-render/core';
import { confirmationWindow } from '../../catalog/catalog';

// The handler for the catalog's `arm` action, shared by every spec that uses
// inline confirmation. A spec cannot schedule a state change, so arming sets
// the item's `armed` flag here and reverts it after the confirmation window.
//
// An item in a list is found again by its id when the window ends: its path is
// index-based, and a row deleted above it would shift it before the timer
// fires. An item outside a list, or without an id, keeps its path.

type Timer = ReturnType<typeof setTimeout>;

export const armHandler = (store: StateStore) => {
  const timers = new Map<string, Timer>();

  const locate = (path: string, id: unknown) => {
    if (id === undefined) return path;
    const parent = path.slice(0, path.lastIndexOf('/'));
    const list = store.get(parent);
    if (!Array.isArray(list)) return path;
    const index = list.findIndex(item => (item as { id?: unknown } | null)?.id === id);
    return index < 0 ? undefined : `${parent}/${index}`;
  };

  const setArmed = (path: string, id: unknown, armed: boolean) => {
    const current = locate(path, id);
    if (current) store.set(`${current}/armed`, armed);
  };

  return {
    arm: ({ item }: Record<string, unknown>) => {
      const path = String(item);
      const id = store.get(`${path}/id`);
      const key = id === undefined ? path : String(id);
      clearTimeout(timers.get(key));
      setArmed(path, id, true);
      timers.set(key, setTimeout(() => { timers.delete(key); setArmed(path, id, false); }, confirmationWindow));
    },
  };
};
