import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import spec from './chat-checkpoints.json' with { type: 'json' };

// Checkpoints in an agent's conversation, as AI Elements shows them: a marker
// after each earlier turn that changed the work. Restoring one keeps that
// turn and removes the turns after it.

// `kept` is how many turns the conversation keeps; each turn, and the
// Restore button on the checkpoint before it, shows while `kept` reaches it.
const initialState = { kept: 3 };

const actions: Record<string, ActionDefinition> = {
  restore: {
    params: z.object({ checkpoint: z.number() }),
    description:
      'Restore `checkpoint` (1-based): keep the turns up to it and remove the turns after it.',
  },
};

const handlers = (store: StateStore) => ({
  restore: ({ checkpoint }: Record<string, unknown>) => {
    store.set('/kept', Number(checkpoint));
  },
});

export default {
  spec: spec as Spec,
  setup: { initialState, actions, handlers, replay: true } satisfies SpecSetup,
};
