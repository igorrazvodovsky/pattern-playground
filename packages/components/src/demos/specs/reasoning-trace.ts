import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './reasoning-trace.json' with { type: 'json' };

// Static: a research request, the reasoning steps it set off with the searches
// and reading under each, and the step still under way. The second step starts
// open; the state holds only which steps are open.
export default {
  spec: spec as Spec,
  setup: { initialState: { open: { ontologies: false, shaping: true } } } satisfies SpecSetup,
};
