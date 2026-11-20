import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import { keyedTimers } from './shared/timers';
import spec from './prompt-editing.json' with { type: 'json' };

// A sent prompt edited in place and run again. Sending the edit starts a new
// version of the conversation from that message: the reply is drawn from the
// edited prompt, and the turns that followed the old one stay with the old
// version, a step back on the message's switcher. A spec cannot carry time,
// so the reply's wait is kept here.

interface Version {
  prompt: string;
  reply: string;
  // Whether the turns after this one belong to this version: only the first
  // went on past its reply.
  later: boolean;
}

const first: Version = {
  prompt: 'Write a two-line description of the Launch project for the team page.',
  reply:
    'Launch brings the new pricing, the onboarding tour and the public changelog to customers on 4 December. Ask in #launch for anything that touches your team’s work.',
  later: true,
};

// What the edited prompts draw, in turn.
const redraws = [
  'Launch is the 4 December release of new pricing, a guided first run and a public changelog, planned and tracked as one project.',
  'On 4 December, Launch brings new pricing, a first-run tour and a changelog anyone can follow.',
];

const WRITE = 900;

const shown = (versions: Version[], index: number) => ({
  prompt: versions[index].prompt,
  reply: versions[index].reply,
  hasLater: versions[index].later,
  position: String(index + 1),
  count: String(versions.length),
  first: index === 0,
  last: index === versions.length - 1,
});

const initialState = {
  versions: [first],
  index: 0,
  editing: false,
  writing: false,
  draft: '',
  ...shown([first], 0),
};

const actions: Record<string, ActionDefinition> = {
  edit: {
    params: z.object({}),
    description:
      'Open the shown prompt for editing: copy it to `/draft` and set `/editing`. Does nothing while a reply is being written.',
  },
  cancel: {
    params: z.object({}),
    description: 'Close the editor and leave the conversation as it was.',
  },
  send: {
    params: z.object({ text: z.unknown() }),
    description:
      'Save the edited prompt `text` as a new version of the message and send it: drop the later turns from view, write a reply for a moment, then show it. An empty or unchanged prompt only closes the editor.',
  },
  step: {
    params: z.object({ by: z.number() }),
    description: 'Show the version `by` places before (negative) or after the one shown.',
  },
};

const handlers = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  const versionsOf = () => (store.get('/versions') ?? [first]) as Version[];
  const show = (versions: Version[], index: number) => {
    store.set('/versions', versions);
    store.set('/index', index);
    for (const [key, value] of Object.entries(shown(versions, index))) store.set(`/${key}`, value);
  };
  return {
    edit: () => {
      if (store.get('/writing')) return;
      store.set('/draft', store.get('/prompt'));
      store.set('/editing', true);
    },
    cancel: () => store.set('/editing', false),
    send: ({ text }: Record<string, unknown>) => {
      const prompt = typeof text === 'string' ? text.trim() : '';
      store.set('/editing', false);
      // One edit at a time: a reply still being written belongs to the last.
      if (store.get('/writing') || !prompt || prompt === store.get('/prompt')) return;
      const versions = versionsOf();
      const reply = redraws[(versions.length - 1) % redraws.length];
      const next = [...versions, { prompt, reply, later: false }];
      store.set('/prompt', prompt);
      store.set('/hasLater', false);
      store.set('/writing', true);
      schedule('write', WRITE, () => {
        store.set('/writing', false);
        show(next, next.length - 1);
      });
    },
    step: ({ by }: Record<string, unknown>) => {
      if (store.get('/writing')) return;
      const versions = versionsOf();
      const index = Number(store.get('/index')) + Number(by);
      if (index >= 0 && index < versions.length) show(versions, index);
    },
  };
};

export default {
  spec: spec as Spec,
  setup: {
    initialState,
    actions,
    handlers,
    functions: {
      // Save stays unavailable until the prompt says something new.
      unchanged: ({ draft, prompt }) =>
        typeof draft !== 'string' || !draft.trim() || draft.trim() === prompt,
    },
  } satisfies SpecSetup,
};
