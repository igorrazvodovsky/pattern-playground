import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './tool-approval.json' with { type: 'json' };

// The agent stops before an action that reaches past the request and asks
// for that one action, scoped to the files it names. The answer turns the
// question into a line of the agent's work, run or refused.

export default {
  spec: spec as Spec,
  setup: {
    initialState: { answer: 'asked', thoughtOpen: false },
    replay: true,
  } satisfies SpecSetup,
};
