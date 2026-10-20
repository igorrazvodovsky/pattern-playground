import type { StateStore } from '@json-render/core';

// A spec cannot wait, so the value is held here until the actor pauses.

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
