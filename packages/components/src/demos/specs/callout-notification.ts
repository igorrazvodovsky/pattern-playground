import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './callout-notification.json' with { type: 'json' };

// Static: an information callout, with nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
