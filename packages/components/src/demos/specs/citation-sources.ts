import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './citation-sources.json' with { type: 'json' };

// The same answer as citation-chips, with its sources listed after it rather
// than placed at the claims: the actor can see what was read, not which
// claim rests on which source.

export default {
  spec: spec as Spec,
  setup: { initialState: { open: true } } satisfies SpecSetup,
};
