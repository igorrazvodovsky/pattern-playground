import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import { keyedTimers } from './shared/timers';
import spec from './working-plan.json' with { type: 'json' };

// The agent's to-do list during its turn, split into what is left and what
// is done. The agent keeps it current as it works: it ticks steps off and
// adds one it finds it needs. The conversation stays open meanwhile; what
// happens to a message sent during the run belongs to the conversation, so
// the list does not take it in. A spec cannot carry time, so the turn is
// advanced here, starting when the demo is first in view; the frame's replay
// starts it again.

interface Step {
  id: string;
  title: string;
  status: 'running' | 'pending' | 'done';
}

interface FollowUp {
  id: string;
  text: string;
}

const STEP = 2500;

const planned = [
  'Find the tasks tagged Q3 launch',
  'Move them to the Launch project',
  'Give Dana’s open tasks to Sam',
  'Tell Dana which tasks moved',
];

// Found once the tasks are in hand, and done straight after the step under way.
const found = 'Merge the 2 duplicate tasks in the search';

const initialLeft = (): Step[] =>
  planned.map((title, index) => ({
    id: `p${index}`,
    title,
    status: index === 0 ? 'running' : 'pending',
  }));

const initialState = {
  phase: 'working',
  left: initialLeft(),
  done: [] as Step[],
  leftCount: planned.length,
  doneCount: 0,
  leftOpen: true,
  doneOpen: false,
  followUps: [] as FollowUp[],
  draft: '',
};

const actions: Record<string, ActionDefinition> = {
  send: {
    params: z.object({ text: z.unknown() }),
    description:
      'Send `text` as the actor’s message while the agent works: add it to `/followUps` and clear `/draft`. Empty text does nothing.',
  },
};

const handlers = (store: StateStore) => ({
  send: ({ text }: Record<string, unknown>) => {
    const message = typeof text === 'string' ? text.trim() : '';
    if (!message || store.get('/phase') !== 'working') return;
    const followUps = (store.get('/followUps') ?? []) as FollowUp[];
    store.set('/followUps', [...followUps, { id: String(followUps.length), text: message }]);
    store.set('/draft', '');
  },
});

// The agent's turn, under way when the conversation is shown.
const start = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  let addedFound = false;

  const write = (left: Step[], done: Step[]) => {
    store.set('/left', left);
    store.set('/done', done);
    store.set('/leftCount', left.length);
    store.set('/doneCount', done.length);
  };

  const advance = () => {
    const left = ((store.get('/left') ?? []) as Step[]).map((step) => ({ ...step }));
    const done = (store.get('/done') ?? []) as Step[];
    const finished = left.shift();
    const nowDone = finished ? [...done, { ...finished, status: 'done' as const }] : done;

    if (!addedFound && finished?.id === 'p0') {
      addedFound = true;
      left.unshift({ id: 'found', title: found, status: 'pending' });
    }
    if (left.length === 0) {
      write(left, nowDone);
      store.set('/phase', 'done');
      return;
    }
    left[0].status = 'running';
    write(left, nowDone);
    schedule('step', STEP, advance);
  };

  schedule('step', STEP, advance);
};

export default {
  spec: spec as Spec,
  setup: { initialState, actions, handlers, start } satisfies SpecSetup,
};
