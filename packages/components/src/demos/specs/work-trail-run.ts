import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './work-trail-run.json' with { type: 'json' };

// A research run in a view of its own, part way through: the trail stays in
// view, grouped by what the agent set out to find, each group holding its
// stated thinking and the searches and reading it did.

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      open: { ontologies: false, ontologiesRead: false, shaping: true, shapingRead: true },
    },
  } satisfies SpecSetup,
};
