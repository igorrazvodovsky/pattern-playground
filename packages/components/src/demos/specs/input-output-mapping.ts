import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './input-output-mapping.json' with { type: 'json' };

// Static: a prompt and its summary whose marked runs share links, so tracing
// one shows where it came from or went, with nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
