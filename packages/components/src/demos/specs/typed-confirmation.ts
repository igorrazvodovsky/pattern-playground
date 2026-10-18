import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './typed-confirmation.json' with { type: 'json' };

// The spec carries the whole demo: delete stays disabled until the typed text
// matches the workspace name, and the field is cleared whenever the dialog
// opens or closes. This module only supplies the workspace and what deleting
// it takes with it.

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      workspace: 'Oriental Aluminum Salad',
      removes: ['All projects and files', 'Team member access', 'Integration settings', 'Usage history and analytics'],
      exists: true,
      confirming: false,
      typed: '',
    },
  } satisfies SpecSetup,
};
