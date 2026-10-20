import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './typed-confirmation.json' with { type: 'json' };

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      workspace: 'Oriental Aluminum Salad',
      removes: ['All projects and files', 'Team member access', 'Integration settings', 'Usage history and analytics'],
      exists: true,
      confirming: false,
      confirmation: { typed: '', attempted: false },
    },
  } satisfies SpecSetup,
};
