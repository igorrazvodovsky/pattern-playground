import type { Spec } from '@json-render/core';
import { nameOf, users } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { armHandler } from './arm';
import spec from './consequence-ladder.json' with { type: 'json' };

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      project: nameOf('PRJ-4'),
      member: { name: nameOf('user-11'), armed: false },
      draft: nameOf('doc-3'),
      workspace: 'Acme',
      workspaceSize: users.length,
      newOwner: nameOf('user-19'),
      archived: false,
      removed: false,
      published: false,
      transferred: false,
      publishing: false,
      transferring: false,
      confirmation: { typed: '', attempted: false },
      toasts: [],
      pressed: null,
    },
    handlers: armHandler,
  } satisfies SpecSetup,
};
