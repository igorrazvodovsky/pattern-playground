import type { Spec, StateStore } from '@json-render/core';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import { send, sendHandler } from './shared/conversation';
import spec from './prompt-suggestions.json' with { type: 'json' };

// Suggested prompts above the message field. Before the first message they
// say what the assistant can do; after each reply they offer what could come
// next from it. Sending one is the same as typing it, and the field stays
// open for anything else.

interface Answer {
  reply: string;
  next: string[];
}

const opening = [
  'Summarise this week’s changes',
  'Which tasks are overdue?',
  'Draft a status update for the launch',
];

const answers: Record<string, Answer> = {
  'Summarise this week’s changes': {
    reply:
      'Fourteen tasks moved to done this week and three were reopened. The launch date stayed at 4 December.',
    next: ['Which ones were reopened?', 'Draft a status update for the launch'],
  },
  'Which tasks are overdue?': {
    reply:
      'Five tasks are overdue, four of them in Launch. The oldest is the pricing page copy, due 2 November.',
    next: ['Who owns them?', 'Move their due dates to Friday'],
  },
  'Draft a status update for the launch': {
    reply:
      'Here is a draft: “Launch is on track for 4 December. The pricing copy is late and Sam now owns it; everything else is in review.”',
    next: ['Make it shorter', 'Add the open risks'],
  },
  'Which ones were reopened?': {
    reply:
      'The pricing page copy, the changelog layout and the last step of the tour. All three came back from review with comments.',
    next: ['Who owns them?', 'Draft a status update for the launch'],
  },
  'Who owns them?': {
    reply: 'Sam owns three of them, Priya one and Dana one. Dana’s is the oldest.',
    next: ['Move their due dates to Friday', 'Summarise this week’s changes'],
  },
  'Move their due dates to Friday': {
    reply: 'Moved the five due dates to Friday 21 November and told their owners.',
    next: ['Summarise this week’s changes', 'Draft a status update for the launch'],
  },
  'Make it shorter': {
    reply: 'Shorter: “Launch is on track for 4 December; the pricing copy is late.”',
    next: ['Add the open risks', 'Which tasks are overdue?'],
  },
  'Add the open risks': {
    reply:
      'Added: “Open risks: the pricing copy may slip a week, and the tour has not been tested on phones.”',
    next: ['Make it shorter', 'Which tasks are overdue?'],
  },
};

const fallback: Answer = {
  reply: 'This demo only answers its suggestions. Pick one of them to see what comes next.',
  next: opening,
};

const asSuggestions = (labels: string[]) =>
  labels.map((label, index) => ({ id: `${label}-${index}`, label }));

const initialState = { turns: [], suggestions: asSuggestions(opening), draft: '' };

const actions: Record<string, ActionDefinition> = {
  send: send(', and replace `/suggestions` with the prompts that follow from the reply'),
};

const answerTo = (prompt: string) => answers[prompt] ?? fallback;

const handlers = (store: StateStore) =>
  sendHandler(
    store,
    (prompt) => answerTo(prompt).reply,
    (prompt) => store.set('/suggestions', asSuggestions(answerTo(prompt).next)),
  );

export default {
  spec: spec as Spec,
  setup: { initialState, actions, handlers } satisfies SpecSetup,
};
