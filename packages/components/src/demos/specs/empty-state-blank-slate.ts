import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './empty-state-blank-slate.json' with { type: 'json' };

export default { spec: spec as Spec, setup: {} satisfies SpecSetup };
