import type { StateStore } from '@json-render/core';
import { keyedTimers } from './timers';

// A spec cannot wait, so the value is held here until the actor pauses.

const PAUSE = 700;

export const settleHandler = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  return {
    settle: ({ statePath, value }: Record<string, unknown>) => {
      const path = String(statePath);
      schedule(path, PAUSE, () => store.set(path, value));
    },
  };
};
