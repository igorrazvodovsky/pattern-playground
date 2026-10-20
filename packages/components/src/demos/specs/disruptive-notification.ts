import type { Spec } from '@json-render/core';
import { nameOf } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './disruptive-notification.json' with { type: 'json' };

const question = `Deleting “${nameOf('doc-1')}” removes it for everyone and cannot be undone. Delete it anyway?`;

export default {
  spec: spec as Spec,
  setup: {
    initialState: { question, confirming: false },
  } satisfies SpecSetup,
};
