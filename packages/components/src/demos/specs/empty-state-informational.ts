import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './empty-state-informational.json' with { type: 'json' };

// Static: an access-denied empty state, with nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
