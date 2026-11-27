import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import spec from './prompt-completions.json' with { type: 'json' };

// Starting points that work in the field itself. Beneath the empty field, a
// row of verbs; pressing one writes it into the field, and the field offers
// ways to continue it, with the verb set apart from what each adds. The actor
// can pick one, keep typing past them, or clear the field and start again.

const verbs = [
  { id: 'summarise', label: 'Summarise', icon: 'summary', start: 'Summarise ' },
  { id: 'explain', label: 'Explain', icon: 'guide', start: 'Explain ' },
  { id: 'draft', label: 'Draft', icon: 'edit', start: 'Draft ' },
  { id: 'plan', label: 'Plan', icon: 'plan', start: 'Plan ' },
];

const requests = [
  'Summarise this week’s changes across the project',
  'Summarise the pricing page discussion',
  'Summarise my open tasks and when each is due',
  'Explain why the pricing page copy is late',
  'Explain why we moved the launch to 4 December',
  'Explain what the launch is still waiting on',
  'Draft a status update on the launch',
  'Draft release notes for this cycle',
  'Draft a handover note for my open tasks',
  'Plan next week from what is open and due',
  'Plan what to move if the pricing copy slips',
  'Plan a review round for the launch pages',
];

// The requests that continue what is written, a few at a time. Nothing is
// offered for an empty field, once the conversation has begun, or once the
// field holds a whole request.
const continuations = (args: Record<string, unknown>) => {
  const draft = typeof args.draft === 'string' ? args.draft.toLowerCase() : '';
  if (args.started || !draft.trim()) return [];
  return requests
    .filter((request) => {
      const lower = request.toLowerCase();
      return lower.startsWith(draft) && lower !== draft;
    })
    .slice(0, 4);
};

const initialState = { verbs, draft: '', turns: [], started: false };

const actions: Record<string, ActionDefinition> = {
  send: {
    params: z.object({ prompt: z.unknown() }),
    description:
      'Send `prompt` as the actor’s message: add it and the reply to `/turns`, clear `/draft`, and set `/started`, which takes the starting points away. An empty prompt does nothing.',
  },
};

const handlers = (store: StateStore) => ({
  send: ({ prompt }: Record<string, unknown>) => {
    const text = typeof prompt === 'string' ? prompt.trim() : '';
    if (!text) return;
    const turns = (store.get('/turns') ?? []) as unknown[];
    store.set('/turns', [
      ...turns,
      {
        id: String(turns.length),
        prompt: text,
        reply: 'This demo stops at the first message: it shows how a conversation can start.',
      },
    ]);
    store.set('/draft', '');
    store.set('/started', true);
  },
});

export default {
  spec: spec as Spec,
  setup: {
    initialState,
    actions,
    handlers,
    functions: { continuations },
    replay: true,
  } satisfies SpecSetup,
};
