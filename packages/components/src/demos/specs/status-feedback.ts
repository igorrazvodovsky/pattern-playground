import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './status-feedback.json' with { type: 'json' };

// Static composition: the spec carries everything, so there is nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
