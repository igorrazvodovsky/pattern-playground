import type { Spec, StateStore } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { keyedTimers } from './shared/timers';
import spec from './work-trail-in-chat.json' with { type: 'json' };

// An agent's turn in a chat, with its trail above the reply: what it said it
// was thinking, as muted narration, between the tool calls it made, each
// titled by what it ran and, behind the line, what it returned. The trail is open while the agent works,
// its steps arriving one by one, and folds to a summary once the reply
// arrives; the actor can open it, and any tool call in it, again. A spec
// cannot carry time, so the turn is advanced here, starting when the demo is
// first in view; the frame's replay starts it again.

interface Step {
  id: string;
  title: string;
  detail: string | null;
  icon: string;
  status: 'running' | 'done';
  expandable: boolean;
  open: boolean;
  narration: string | null;
  result: string | null;
}

// A tool call's title says what it is doing while it runs and what it did
// once it returns; what it returned shows behind the line only then.
interface Scripted {
  id: string;
  running: string;
  ran: string;
  detail: string | null;
  icon: string;
  narration: string | null;
  result: string | null;
}

const STEP = 2000;

const thought = (id: string, narration: string): Scripted => ({
  id,
  running: 'Thinking',
  ran: 'Thought',
  detail: null,
  icon: 'reasoning',
  narration,
  result: null,
});

const tool = (
  id: string,
  icon: string,
  [running, ran]: [string, string],
  detail: string,
  result: unknown,
): Scripted => ({
  id,
  running,
  ran,
  detail,
  icon,
  narration: null,
  result: JSON.stringify(result, null, 2),
});

const script: Scripted[] = [
  thought(
    's0',
    'A task is at risk if it is due soon and its owner has more due than they can do, or if it waits on a task that is. I need the due dates, the owners and what waits on what.',
  ),
  tool(
    's1',
    'search',
    [
      'Searching Launch for tasks due by 30 September',
      'Searched Launch for tasks due by 30 September',
    ],
    '38 tasks',
    { count: 38, by_assignee: { Sam: 11, Priya: 6, others: 21 } },
  ),
  tool(
    's2',
    'person',
    ['Reading Sam’s tasks due this week', 'Read Sam’s tasks due this week'],
    '11 tasks',
    {
      count: 11,
      reassigned_from: { Dana: 6 },
      blocking: [
        { task: 'Final mock-ups', blocks: 'Design review' },
        { task: 'Brand assets', blocks: 'Design review' },
      ],
    },
  ),
  thought(
    's3',
    'Sam can’t finish 11 tasks by Friday, so whatever waits on those two is at risk too.',
  ),
  tool(
    's4',
    'project',
    ['Reading what waits on the design review', 'Read what waits on the design review'],
    '2 tasks',
    { dependents: [{ task: 'Pricing page copy', dependents: ['Press kit'] }] },
  ),
];

const begin = (step: Scripted): Step => ({
  id: step.id,
  title: step.running,
  detail: step.result ? null : step.detail,
  icon: step.icon,
  status: 'running',
  expandable: false,
  open: false,
  narration: step.narration,
  result: null,
});

const finish = (step: Step): Step => {
  const scripted = script.find((entry) => entry.id === step.id);
  if (!scripted) return step;
  return {
    ...step,
    title: scripted.ran,
    detail: scripted.detail,
    status: 'done',
    expandable: Boolean(scripted.result),
    result: scripted.result,
  };
};

const toolCount = script.filter((step) => step.result).length;

const initialState = {
  phase: 'working',
  open: true,
  seconds: 0,
  toolCount,
  steps: [begin(script[0])],
};

const start = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  const began = Date.now();

  const advance = () => {
    const steps = ((store.get('/steps') ?? []) as Step[]).map(finish);
    const next = script[steps.length];
    if (!next) {
      store.set('/steps', steps);
      store.set('/seconds', Math.round((Date.now() - began) / 1000));
      store.set('/open', false);
      store.set('/phase', 'done');
      return;
    }
    store.set('/steps', [...steps, begin(next)]);
    schedule('step', STEP, advance);
  };

  schedule('step', STEP, advance);
};

export default {
  spec: spec as Spec,
  setup: { initialState, start } satisfies SpecSetup,
};
