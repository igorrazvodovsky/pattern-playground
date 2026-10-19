import type { Spec } from '@json-render/core';
import { formatNumber } from '@shared/format';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { rows, rowsArg, selectedCount, withAll } from './selection';
import spec from './select-all-affordance.json' with { type: 'json' };

// The page shows a few of the many items that match. The spec ticks every row
// on the page or clears them, and once every row on the page is ticked it
// offers the larger step: select every matching item (`/selection/escalated`). Any
// change to the rows takes that step back, so unticking one row after
// escalating leaves the rows on the page that are still ticked, not the whole
// matching set. A watch on the rows rewrites `/selection` in one action:
// whether any or all rows are ticked, and the escalation reset to false. One
// action, because a watch's later actions are dropped once the first one
// changes state. The counts and the wording that names them are functions
// here, because a spec can read one value but cannot fold over a list.

const MATCHING = 1234;

const summary = (args: Record<string, unknown>) => {
  const count = selectedCount(args);
  const visible = rowsArg(args).length;
  // The watch resets `/selection` a render after the rows change, so the
  // escalation counts only while every row is still ticked; the live summary
  // never reads out the matching set for a page that has just lost a row.
  if (args.escalated && count === visible) return `All ${formatNumber(MATCHING)} matching items selected`;
  if (count > 0) return `${count} of ${visible} on this page selected`;
  return `Showing ${visible} of ${formatNumber(MATCHING)}`;
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { items: rows, selection: { any: false, all: false, escalated: false } },
    functions: {
      selectAll: withAll(true),
      clearAll: withAll(false),
      selection: args => ({
        any: selectedCount(args) > 0,
        all: rowsArg(args).every(row => row.selected),
        escalated: false,
      }),
      summary,
      pageNote: args => `All ${rowsArg(args).length} items on this page are selected.`,
      escalateLabel: () => `Select all ${formatNumber(MATCHING)} matching items`,
    },
  } satisfies SpecSetup,
};
