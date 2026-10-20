import type { StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition } from '../../../catalog/SpecDemo';
import { confirmationWindow } from '../../../catalog/catalog';
import { keyedTimers } from './timers';

// A spec cannot schedule a state change, so the `armed` flag is reverted here.
// An item in a list is found again by its id: its path is index-based, and a
// row deleted above it would shift it before the timer fires. Timers are keyed
// by the list and the id, since two lists can hold items with the same id.

export const arm: ActionDefinition = {
  params: z.object({ item: z.string() }),
  description:
    'Arm a confirmation on one item: sets its `armed` field and clears it again after a few seconds. `item` is the item\'s state path ({ "$item": "" } inside a repeat). Cancel and confirm need no custom action: setState on `armed`, removeState on the item.',
};

export const armHandler = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);

  const parentOf = (path: string) => path.slice(0, path.lastIndexOf('/'));

  const locate = (path: string, id: unknown) => {
    if (id === undefined) return path;
    const parent = parentOf(path);
    const list = store.get(parent);
    if (!Array.isArray(list)) return path;
    const index = list.findIndex((item) => (item as { id?: unknown } | null)?.id === id);
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
      const key = id === undefined ? path : `${parentOf(path)}#${String(id)}`;
      setArmed(path, id, true);
      schedule(key, confirmationWindow, () => setArmed(path, id, false));
    },
  };
};
