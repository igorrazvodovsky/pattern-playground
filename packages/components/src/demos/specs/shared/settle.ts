import type { StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition } from '../../../catalog/SpecDemo';
import { keyedTimers } from './timers';

// A spec cannot wait, so the value is held here until the actor pauses.

const PAUSE = 700;

export const settle: ActionDefinition = {
  params: z.object({ statePath: z.string(), value: z.unknown() }),
  description:
    'Write `value` to `statePath` once the actor pauses: each dispatch for the same path restarts the wait. Dispatch it from a `watch` on what the actor is changing, to act on their input when they stop rather than on every keystroke.',
};

export const settleHandler = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  return {
    settle: ({ statePath, value }: Record<string, unknown>) => {
      const path = String(statePath);
      schedule(path, PAUSE, () => store.set(path, value));
    },
  };
};
