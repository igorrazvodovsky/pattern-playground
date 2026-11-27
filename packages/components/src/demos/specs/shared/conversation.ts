import type { StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition } from '../../../catalog/SpecDemo';

// Sending a message in a demo conversation: the prompt and its reply join
// `/turns`, which a Messages list repeats, and the Composer's `/draft` clears.
// A spec cannot append to a list from a typed value, so it happens here.

/** The `send` action; `effect` names what else sending does, as a clause after "clear `/draft`". */
export const send = (effect = ''): ActionDefinition => ({
  params: z.object({ prompt: z.unknown() }),
  description: `Send \`prompt\` as the actor’s message: add it and the reply to \`/turns\`, clear \`/draft\`${effect}. An empty prompt does nothing.`,
});

export const sendHandler = (
  store: StateStore,
  /** The reply to a non-empty prompt. */
  reply: (prompt: string) => string,
  /** What else sending does, after the turn is added. */
  after: (prompt: string) => void = () => {},
) => ({
  send: ({ prompt }: Record<string, unknown>) => {
    const text = typeof prompt === 'string' ? prompt.trim() : '';
    if (!text) return;
    const turns = (store.get('/turns') ?? []) as unknown[];
    store.set('/turns', [...turns, { id: String(turns.length), prompt: text, reply: reply(text) }]);
    store.set('/draft', '');
    after(text);
  },
});

// For demos that show how a conversation starts: the first message sets
// `/started`, which takes the starting points away, and gets a fixed reply.

export const startingSend = send(', and set `/started`, which takes the starting points away');

export const startingSendHandler = (store: StateStore) =>
  sendHandler(
    store,
    () => 'This demo stops at the first message: it shows how a conversation can start.',
    () => store.set('/started', true),
  );
