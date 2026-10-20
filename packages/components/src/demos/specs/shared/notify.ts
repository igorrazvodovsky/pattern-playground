import type { StateStore } from '@json-render/core';
import { keyedTimers } from './timers';

// A spec cannot schedule a state change, so the message is cleared here.

const NOTICE_TIMEOUT = 3000;

export const notifyHandler = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  return {
    notify: ({ statePath, message }: Record<string, unknown>) => {
      const path = String(statePath);
      store.set(path, message);
      schedule(path, NOTICE_TIMEOUT, () => store.set(path, ''));
    },
  };
};
