import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './reasoning-trace.json' with { type: 'json' };

export default {
  spec: spec as Spec,
  setup: { initialState: { open: { ontologies: false, shaping: true } } } satisfies SpecSetup,
};
