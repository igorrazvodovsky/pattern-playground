import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import spec from './prompt-starters.json' with { type: 'json' };

// Starting points beneath an empty message field, narrowed in two steps. The
// row names kinds of request, each a verb that would start one; nothing is
// open at first, so no concrete request is shown before the actor has picked
// a direction. Opening a kind shows a few requests of that kind, and pressing
// one puts it in the field to edit or send. The starting points go once the
// conversation has begun.

interface Starter {
  id: string;
  title: string;
  detail: string;
  prompt: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  starters: Starter[];
}

const categories: Category[] = [
  {
    id: 'draft',
    label: 'Draft',
    icon: 'edit',
    starters: [
      {
        id: 'status-update',
        title: 'A status update',
        detail: 'Where the launch stands, for the team channel',
        prompt: 'Draft a status update on the launch for the team channel',
      },
      {
        id: 'release-notes',
        title: 'Release notes',
        detail: 'What changed this cycle, for customers',
        prompt: 'Draft release notes for this cycle’s changes, written for customers',
      },
      {
        id: 'handover',
        title: 'A handover note',
        detail: 'Open work and its context, for whoever picks it up',
        prompt: 'Draft a handover note for my open tasks',
      },
      {
        id: 'reply',
        title: 'A reply to a comment',
        detail: 'An answer to the latest review comment',
        prompt: 'Draft a reply to the latest comment on the pricing page',
      },
    ],
  },
  {
    id: 'summarise',
    label: 'Summarise',
    icon: 'summary',
    starters: [
      {
        id: 'week',
        title: 'This week’s changes',
        detail: 'What moved, what was reopened, what slipped',
        prompt: 'Summarise this week’s changes across the project',
      },
      {
        id: 'thread',
        title: 'A long discussion',
        detail: 'The decisions and open questions in a thread',
        prompt: 'Summarise the pricing page discussion: decisions and open questions',
      },
      {
        id: 'feedback',
        title: 'Review feedback',
        detail: 'The comments that came back, grouped by theme',
        prompt: 'Summarise the review comments on the tour, grouped by theme',
      },
      {
        id: 'mine',
        title: 'My open work',
        detail: 'What is assigned to me and when it is due',
        prompt: 'Summarise my open tasks and when each is due',
      },
    ],
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: 'guide',
    starters: [
      {
        id: 'delay',
        title: 'Why something is late',
        detail: 'What held it up, from its history',
        prompt: 'Explain why the pricing page copy is late',
      },
      {
        id: 'decision',
        title: 'A past decision',
        detail: 'What was decided, by whom, and on what grounds',
        prompt: 'Explain why we moved the launch to 4 December',
      },
      {
        id: 'dependency',
        title: 'What depends on what',
        detail: 'The tasks a piece of work is waiting on',
        prompt: 'Explain what the launch is still waiting on',
      },
      {
        id: 'metric',
        title: 'A change in a figure',
        detail: 'Why a count went up or down',
        prompt: 'Explain why the number of reopened tasks went up this week',
      },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'plan',
    starters: [
      {
        id: 'next-week',
        title: 'Next week',
        detail: 'What to take on, given what is open and due',
        prompt: 'Plan next week for me from what is open and due',
      },
      {
        id: 'slip',
        title: 'A slipped deadline',
        detail: 'What moves if one task is late',
        prompt: 'Plan what to move if the pricing copy slips a week',
      },
      {
        id: 'review',
        title: 'A review round',
        detail: 'Who reviews what, and by when',
        prompt: 'Plan a review round for the launch pages',
      },
      {
        id: 'split',
        title: 'Splitting a large task',
        detail: 'Smaller tasks that can be done and checked one at a time',
        prompt: 'Plan how to split the tour rework into smaller tasks',
      },
    ],
  },
];

const initialState = {
  categories: categories.map(({ id, label, icon }) => ({ id, label, icon })),
  open: null,
  starters: [],
  draft: '',
  turns: [],
  started: false,
};

const actions: Record<string, ActionDefinition> = {
  toggleCategory: {
    params: z.object({ id: z.unknown() }),
    description:
      'Open the kind of request `id`, showing its starting points in `/starters`; if it is already open, close it and clear `/starters`.',
  },
  send: {
    params: z.object({ prompt: z.unknown() }),
    description:
      'Send `prompt` as the actor’s message: add it and the reply to `/turns`, clear `/draft`, and set `/started`, which takes the starting points away. An empty prompt does nothing.',
  },
};

const handlers = (store: StateStore) => ({
  toggleCategory: ({ id }: Record<string, unknown>) => {
    const next = store.get('/open') === id ? null : id;
    store.set('/open', next);
    store.set('/starters', categories.find((category) => category.id === next)?.starters ?? []);
  },
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
  setup: { initialState, actions, handlers, replay: true } satisfies SpecSetup,
};
