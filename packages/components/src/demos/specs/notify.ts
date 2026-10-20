import type { StateStore } from '@json-render/core';

// A spec cannot schedule a state change, so the message is cleared here.

const NOTICE_TIMEOUT = 3000;

export const notifyHandler = (store: StateStore, connected: () => boolean) => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return {
    notify: ({ statePath, message }: Record<string, unknown>) => {
      const path = String(statePath);
      clearTimeout(timers.get(path));
      store.set(path, message);
      timers.set(path, setTimeout(() => {
        timers.delete(path);
        if (connected()) store.set(path, '');
      }, NOTICE_TIMEOUT));
    },
  };
};
