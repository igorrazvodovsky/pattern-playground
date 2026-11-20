import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import { keyedTimers } from './shared/timers';
import spec from './plan-preview.json' with { type: 'json' };

// The agent states its plan before a bulk change and waits. Started, the run
// works through the same steps the actor read, one at a time, so what was
// previewed is what happens. A spec cannot carry time, so the steps are
// advanced here.

type Status = 'done' | 'running' | 'pending';

const titles = [
  'Find the 23 tasks tagged Q3 launch',
  'Move them to the Launch project',
  'Give Dana’s 6 open tasks to Sam',
  'Tell Dana which tasks moved',
];

const STEP = 1100;

const stepsAt = (current: number) =>
  titles.map((title, index) => ({
    id: String(index),
    title,
    status: (index < current ? 'done' : index === current ? 'running' : 'pending') as Status,
  }));

const initialState = {
  phase: 'proposed',
  open: true,
  done: 0,
  steps: stepsAt(-1),
};

const noParams = z.object({});

const actions: Record<string, ActionDefinition> = {
  start: {
    params: noParams,
    description:
      'Run the plan: set `/phase` to running, then mark each of `/steps` running and done in turn, counting `/done`, and set `/phase` to done after the last.',
  },
};

const handlers = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  const advance = (current: number) => {
    if (current >= titles.length) {
      store.set('/steps', stepsAt(titles.length));
      store.set('/done', titles.length);
      store.set('/phase', 'done');
      return;
    }
    store.set('/steps', stepsAt(current));
    store.set('/done', current);
    schedule('step', STEP, () => advance(current + 1));
  };

  return {
    start: () => {
      store.set('/phase', 'running');
      advance(0);
    },
  };
};

export default {
  spec: spec as Spec,
  setup: { initialState, actions, handlers, replay: true } satisfies SpecSetup,
};
