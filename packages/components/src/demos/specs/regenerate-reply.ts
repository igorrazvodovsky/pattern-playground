import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import { keyedTimers } from './shared/timers';
import spec from './regenerate-reply.json' with { type: 'json' };

// A reply kept as one draw among several. Asking again adds a version and
// shows it; the earlier ones stay a step back, so a better first draw is not
// lost to a worse second. A spec cannot carry time, so the draw's wait and the
// copy notice's timeout are kept here.

const draws = [
  'Launch brings the new pricing, the onboarding tour and the public changelog to customers on 4 December. Ask in #launch for anything that touches your team’s work.',
  'The Launch project ships pricing, onboarding and the changelog together on 4 December. It is run from #launch, where each team posts what it still owes.',
  'Everything customers see change on 4 December, from pricing to the first-run tour, is planned and tracked here. Questions go to #launch.',
  'Launch: new pricing, a guided first run and a public changelog, live on 4 December. Owners and open work are listed in the project; talk to us in #launch.',
];

const DRAW = 900;
const NOTICE = 2000;

const shown = (versions: number, index: number) => ({
  current: draws[index],
  position: String(index + 1),
  count: String(versions),
  first: index === 0,
  last: index === versions - 1,
  exhausted: versions === draws.length,
});

const initialState = { versions: 1, index: 0, drawing: false, copied: '', ...shown(1, 0) };

const actions: Record<string, ActionDefinition> = {
  regenerate: {
    params: z.object({}),
    description:
      'Write another version of the reply: set `/drawing` for a moment, then add the version and show it, keeping the earlier ones.',
  },
  step: {
    params: z.object({ by: z.number() }),
    description: 'Show the version `by` places before (negative) or after the one shown.',
  },
  copy: {
    params: z.object({}),
    description:
      'Copy the version shown to the clipboard, and say in `/copied` for a moment whether it worked.',
  },
};

const handlers = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  const show = (versions: number, index: number) => {
    store.set('/versions', versions);
    store.set('/index', index);
    for (const [key, value] of Object.entries(shown(versions, index))) store.set(`/${key}`, value);
  };
  return {
    regenerate: () => {
      const versions = Number(store.get('/versions'));
      if (versions >= draws.length) return;
      store.set('/drawing', true);
      schedule('draw', DRAW, () => {
        store.set('/drawing', false);
        show(versions + 1, versions);
      });
    },
    step: ({ by }: Record<string, unknown>) => {
      const versions = Number(store.get('/versions'));
      const index = Number(store.get('/index')) + Number(by);
      if (index >= 0 && index < versions) show(versions, index);
    },
    copy: () => {
      const notice = (text: string) => {
        store.set('/copied', text);
        schedule('copied', NOTICE, () => store.set('/copied', ''));
      };
      // Say what happened: the clipboard can be missing or refuse the write.
      if (!navigator.clipboard) return notice('Could not copy');
      navigator.clipboard.writeText(String(store.get('/current'))).then(
        () => notice('Copied'),
        () => notice('Could not copy'),
      );
    },
  };
};

export default {
  spec: spec as Spec,
  setup: { initialState, actions, handlers } satisfies SpecSetup,
};
