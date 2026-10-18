import type { StateStore } from '@json-render/core';

// The handler for the catalog's `notify` action, shared by every spec that
// shows a short status message. A spec cannot schedule a state change, so the
// message is written here and cleared again after a few seconds.

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
