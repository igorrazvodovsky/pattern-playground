import type { StateStore } from '@json-render/core';

// The handler for the catalog's `settle` action. A spec cannot wait, so the
// value is held here and written once the actor has paused; a later dispatch
// for the same path starts the wait again.

const PAUSE = 700;

export const settleHandler = (store: StateStore, connected: () => boolean) => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return {
    settle: ({ statePath, value }: Record<string, unknown>) => {
      const path = String(statePath);
      clearTimeout(timers.get(path));
      timers.set(path, setTimeout(() => {
        timers.delete(path);
        if (connected()) store.set(path, value);
      }, PAUSE));
    },
  };
};
