import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { attributeLabel, formatAttributeValue, getAttributeValue } from '../../templates/collection-view/AttributeUtils';
import { detectProblems } from '../problem-detection';
import spec from './problem-checklist.json' with { type: 'json' };

// The spec carries the checklist and the drill: opening a flag sets its `open`
// field and `/inSlice`, Back clears both, and dismissing removes the flag and
// adds a note to `/muted`. Each flag is repeated twice, once as a card in the
// checklist and once as its slice, which shows only while the flag is open;
// a repeat cannot follow a path chosen while the demo runs. Focus moves with
// the drill through `focusOnShow`: Back takes it when the slice appears, and
// the opened card's title when the checklist comes back. The actions run in
// turn, so each press shows the view it leads to before it hides the one it
// was pressed in, while the opened flag's `open` still marks its card.
//
// What JSON cannot do is run the detection rules and format the slice. Both
// happen here, once: each flag arrives with its count and its items' attributes
// already formatted, and `mutedNote` counts the muted rules.

const SLICE_ATTRIBUTES = ['category', 'pricing.msrp', 'listedAt'];

const flags = detectProblems(products).map(flag => ({
  id: flag.id,
  title: flag.title,
  reason: flag.reason,
  count: String(flag.itemIds.length),
  open: false,
  items: products
    .filter(item => flag.itemIds.includes(item.id))
    .map(item => ({
      id: item.id,
      name: item.name,
      attributes: SLICE_ATTRIBUTES.map(path => ({
        label: attributeLabel(path),
        value: formatAttributeValue(getAttributeValue(item, path), path),
      })),
    })),
}));

const mutedNote = ({ muted }: Record<string, unknown>) => {
  const count = (muted as unknown[]).length;
  return `${count} rule${count > 1 ? 's' : ''} muted. Feedback recorded.`;
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { flags, inSlice: false, muted: [] },
    functions: { mutedNote },
  } satisfies SpecSetup,
};
