import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './empty-state-guiding.json' with { type: 'json' };

// Static: an empty state that offers templates, with nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
