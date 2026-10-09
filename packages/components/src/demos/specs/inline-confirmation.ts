import type { Spec, StateStore } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './inline-confirmation.json' with { type: 'json' };

// The spec carries the structure and most of the behaviour: which control shows
// in which state, cancel (setState) and confirm (removeState). What it cannot
// carry is time. The confirmation window lives here: `arm` sets the flag and
// schedules its own reversion.

const TIMEOUT = 4000;

interface Listing { id: string; name: string; armed: boolean }

const listings: Listing[] = reuseListings.map(({ id, name }) => ({ id, name, armed: false }));

const handlers = (store: StateStore) => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  // Rows are addressed by id once armed: the item path is index-based, and a
  // row deleted above this one would shift it before the timer fires.
  const setArmed = (id: string, armed: boolean) => {
    const items = (store.get('/items') as Listing[] | undefined) ?? [];
    store.set('/items', items.map(item => (item.id === id ? { ...item, armed } : item)));
  };

  return {
    arm: ({ item }: Record<string, unknown>) => {
      const id = String(store.get(`${item}/id`));
      clearTimeout(timers.get(id));
      setArmed(id, true);
      timers.set(id, setTimeout(() => { timers.delete(id); setArmed(id, false); }, TIMEOUT));
    },
  };
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings, items: listings },
    handlers,
  } satisfies SpecSetup,
};
