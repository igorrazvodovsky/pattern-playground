import type { Spec } from '@json-render/core';
import { formatNumber } from '@shared/format';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { rows, rowsArg, selectedCount, withAll } from './selection';
import spec from './select-all-affordance.json' with { type: 'json' };

// The watch on the rows rewrites `/selection` in one action, because a watch's
// later actions are dropped once the first one changes state. A spec can count
// a list but cannot filter it, so counting the ticked rows happens here.

const summary = (args: Record<string, unknown>) => {
  const count = selectedCount(args);
  const visible = rowsArg(args).length;
  const matching = formatNumber(Number(args.matching));
  // The watch resets `/selection` a render after the rows change, so the
  // escalation counts only while every row is still ticked; the live summary
  // never reads out the matching set for a page that has just lost a row.
  if (args.escalated && count === visible) return `All ${matching} matching items selected`;
  if (count > 0) return `${count} of ${visible} on this page selected`;
  return `Showing ${visible} of ${matching}`;
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { items: rows, matching: 1234, selection: { any: false, all: false, escalated: false } },
    functions: {
      selectAll: withAll(true),
      clearAll: withAll(false),
      selection: args => ({
        any: selectedCount(args) > 0,
        all: rowsArg(args).every(row => row.selected),
        escalated: false,
      }),
      summary,
    },
  } satisfies SpecSetup,
};
