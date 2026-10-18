import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './llm-assisted-filter.json' with { type: 'json' };

// A filter task still running beside one whose result is applied. Clearing the
// applied filter and putting it back are setState in the spec.
export default { spec: spec as Spec, setup: { initialState: { applied: true } } satisfies SpecSetup };
