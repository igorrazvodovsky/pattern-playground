import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './communicating-uncertainty.json' with { type: 'json' };

// Static: a conversation whose answers hedge in words and mark the claims they
// are unsure of, with nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
