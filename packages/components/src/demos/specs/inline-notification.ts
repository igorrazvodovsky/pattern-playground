import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './inline-notification.json' with { type: 'json' };

// Static: a success message in place, with nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
