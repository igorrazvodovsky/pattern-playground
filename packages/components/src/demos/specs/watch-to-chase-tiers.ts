import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { detectProblems } from '../problem-detection';
import { cardAttributes, fullView } from './product-view';
import spec from './watch-to-chase-tiers.json' with { type: 'json' };

// The spec carries the four tiers: a tag with one number, a wall of tiles, a
// flag's slice of the collection, and one item's full view. Each step inward
// sets the opened tile's or item's `open` field and the tier flag
// (`/atGlance`, `/inSlice`, `/inItem`); each Back clears the flag, then the
// field. Focus follows the drill as in the problem checklist: Back takes it
// on the way in, and what the actor opened takes it on the way out.
//
// The tiles are one list, so that a tile and its slice share an `open` field:
// the first tile counts the whole catalogue and opens nothing, and each other
// tile is a flag. What JSON cannot do is run the detection rules and read the
// product binding, so the flags, their items and each item's full view arrive
// here worked out (./product-view).

const SLICE_ATTRIBUTES = ['category', 'pricing.msrp', 'listedAt'];
const sliceOf = cardAttributes(SLICE_ATTRIBUTES);

const flags = detectProblems(products);
const flaggedCount = new Set(flags.flatMap(flag => flag.itemIds)).size;

const tiles = [
  {
    id: 'listings',
    title: 'Listings',
    value: String(products.length),
    detail: 'In the catalogue',
    alert: false,
    opens: false,
    open: false,
    reason: '',
    items: [],
  },
  ...flags.map(flag => ({
    id: flag.id,
    title: flag.title,
    value: String(flag.itemIds.length),
    detail: `flagged listing${flag.itemIds.length === 1 ? '' : 's'}`,
    alert: true,
    opens: true,
    open: false,
    reason: flag.reason,
    items: products
      .filter(item => flag.itemIds.includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
        open: false,
        attributes: sliceOf(item),
        ...fullView(item),
      })),
  })),
];

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      ambient: `Catalogue · ${flaggedCount} flagged`,
      tiles,
      atGlance: false,
      inSlice: false,
      inItem: false,
    },
  } satisfies SpecSetup,
};
