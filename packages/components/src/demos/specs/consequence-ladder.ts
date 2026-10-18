import type { Spec } from '@json-render/core';
import { nameOf, users } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { armHandler } from './arm';
import spec from './consequence-ladder.json' with { type: 'json' };

// Four actions, each guarded in proportion to what it costs to undo. The
// spec borrows the moves it climbs through rather than redefining them:
// archive is undone from a toast, removing a member asks for an inline
// confirmation (and is then undone from a toast), publishing opens a dialog
// that names who it reaches, and the ownership transfer asks for the
// workspace name typed out. Each toast names the state it puts back, so one
// undo serves both. The confirmation window is the shared `arm` handler; what
// stays here is the names, which are fixtures.

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
