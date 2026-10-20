import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { rows, rowsArg, selectedCount, withAll } from './shared/selection';
import spec from './mode-based-reveal.json' with { type: 'json' };

export default {
  spec: spec as Spec,
  setup: {
    initialState: { items: rows, editing: false },
    functions: {
      clearAll: withAll(false),
      modeSummary: args =>
        args.editing ? `${selectedCount(args)} selected` : `${rowsArg(args).length} projects`,
    },
  } satisfies SpecSetup,
};
