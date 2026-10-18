import type { Spec } from '@json-render/core';
import { nameOf } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './disruptive-notification.json' with { type: 'json' };

// All of the behaviour is in the spec: the button opens the dialog, and it
// stays until the actor answers or dismisses it. The demo shows the delivery,
// so either answer only closes the dialog. The document's name is a fixture,
// so the question enters through state.

const question = `Deleting “${nameOf('doc-1')}” removes it for everyone and cannot be undone. Delete it anyway?`;

export default {
  spec: spec as Spec,
  setup: {
    initialState: { question, confirming: false },
  } satisfies SpecSetup,
};
