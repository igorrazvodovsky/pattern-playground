import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './llm-assisted-filter.json' with { type: 'json' };

export default { spec: spec as Spec, setup: { initialState: { applied: true } } satisfies SpecSetup };
