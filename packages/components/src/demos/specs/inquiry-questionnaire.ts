import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import spec from './inquiry-questionnaire.json' with { type: 'json' };

// The agent stops a booking to ask the two things it cannot settle: which of
// the candidate rooms, and who to invite. The second can be skipped, and its
// description says what skipping leaves in place. The answers come back as the
// actor's turn, and the agent's next message confirms what it did with them.

type Answers = Record<string, string | string[] | null>;

const rooms: Record<string, string> = { atrium: 'Atrium', harbour: 'Harbour', loft: 'Loft' };
const invitees: Record<string, string> = {
  reviewers: 'the four reviewers',
  team: 'the whole design team',
};

const noParams = z.object({});

const actions: Record<string, ActionDefinition> = {
  book: {
    params: noParams,
    description:
      'Read `/answers`, write the actor’s reply to `/answerText` and the agent’s confirmation to `/confirmation`, and set `/answered`.',
  },
  reset: {
    params: noParams,
    description: 'Ask the questions again, with the earlier answers filled in.',
  },
};

const handlers = (store: StateStore) => ({
  book: () => {
    const answers = (store.get('/answers') ?? {}) as Answers;
    const room = String(answers.room ?? '');
    const roomName = rooms[room] ?? `“${room}”`;
    const invite = typeof answers.invite === 'string' ? answers.invite : null;
    store.set(
      '/answerText',
      invite
        ? `${roomName}, and invite ${invitees[invite]}.`
        : `${roomName}. Skipped who to invite.`,
    );
    store.set(
      '/confirmation',
      `Booked ${roomName} for Thursday, 14:00 to 15:30, and sent the invite to ${
        invite ? invitees[invite] : 'the four reviewers on the card'
      }.`,
    );
    store.set('/answered', true);
  },
  // `/answers` stays, so the form comes back with the earlier answers in it.
  reset: () => {
    store.set('/answered', false);
  },
});

export default {
  spec: spec as Spec,
  setup: {
    initialState: { answers: null, answerText: '', confirmation: '', answered: false },
    actions,
    handlers,
  } satisfies SpecSetup,
};
