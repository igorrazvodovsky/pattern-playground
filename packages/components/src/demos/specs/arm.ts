import type { StateStore } from '@json-render/core';
import { confirmationWindow } from '../../catalog/catalog';

// A spec cannot schedule a state change, so the `armed` flag is reverted here.
// An item in a list is found again by its id: its path is index-based, and a
// row deleted above it would shift it before the timer fires.

type Timer = ReturnType<typeof setTimeout>;

export const armHandler = (store: StateStore, connected: () => boolean) => {
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
      timers.set(key, setTimeout(() => {
        timers.delete(key);
        if (connected()) setArmed(path, id, false);
      }, confirmationWindow));
    },
  };
};
