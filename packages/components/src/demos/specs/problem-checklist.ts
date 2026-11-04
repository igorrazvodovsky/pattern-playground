import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { detectProblems } from '../problem-detection';
import { sliceAttributes } from './shared/product';
import spec from './problem-checklist.json' with { type: 'json' };

// A repeat cannot follow a path chosen while the demo runs, so each flag is
// repeated as a row and as its slice. A spec cannot run the detection rules
// or format the slice, so both happen here.

const flags = detectProblems(products).map((flag) => ({
  id: flag.id,
  title: flag.title,
  reason: flag.reason,
  count: String(flag.itemIds.length),
  open: false,
  items: products
    .filter((item) => flag.itemIds.includes(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      attributes: sliceAttributes(item),
    })),
}));

export default {
  spec: spec as Spec,
  setup: {
    initialState: { flags, inSlice: false, muted: [] },
  } satisfies SpecSetup,
};
