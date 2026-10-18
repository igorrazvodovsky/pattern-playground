import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './sections.json' with { type: 'json' };

// Static: three named parts of one document behind a tab bar, with nothing to set up.
export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
