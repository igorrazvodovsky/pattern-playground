import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { rows, rowsArg, selectedCount, withAll } from './selection';
import spec from './mode-based-reveal.json' with { type: 'json' };

// The spec turns selection mode on and off (setState on `/editing`), and the
// rows become checkboxes while it is on. Leaving the mode clears the
// selection, and the count beside the toggle says how many rows there are or
// how many are ticked. Both fold over the list, so they are functions here.

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
