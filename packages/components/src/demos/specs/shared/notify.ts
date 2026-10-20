import type { StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition } from '../../../catalog/SpecDemo';
import { keyedTimers } from './timers';

// A spec cannot schedule a state change, so the message is cleared here.

const NOTICE_TIMEOUT = 3000;

export const notify: ActionDefinition = {
  params: z.object({ statePath: z.string(), message: z.string() }),
  description:
    'Write a short message to `statePath` and clear it again after a few seconds. Pair with a Text that has `status` and reads that path.',
};

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
