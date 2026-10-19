import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { cardAttributes, fullView } from './product-view';
import spec from './investigate.json' with { type: 'json' };

// The spec carries the drilldown: categories, then the items in one category,
// then one item's full view. Opening a card sets its `open` field and the rung
// flag (`/inCategory`, `/inItem`); Back clears both. Each category is repeated
// twice, as a card and as its list of items, and each item twice again, as a
// card and as its full view; a repeat cannot follow a path chosen while the
// demo runs, so each view shows only while its `open` is set. Focus follows
// the drill as in the problem checklist: Back takes it on the way in, and the
// card the actor opened takes it on the way out.
//
// What JSON cannot do is group the collection and read the product binding.
// Both happen here, once: each category arrives with its count and its items,
// and each item with its summary attributes and its full view already laid
// out (./product-view).

const SUMMARY_ATTRIBUTES = ['condition', 'pricing.msrp'];
const summaryOf = cardAttributes(SUMMARY_ATTRIBUTES);

const categories = [...new Set(products.map(item => item.metadata.category))]
  .sort((a, b) => a.localeCompare(b))
  .map(category => {
    const items = products.filter(item => item.metadata.category === category);
    return {
      id: category,
      name: category,
      count: `${items.length} listing${items.length === 1 ? '' : 's'}`,
      open: false,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category,
        open: false,
        attributes: summaryOf(item),
        ...fullView(item),
      })),
    };
  });

export default {
  spec: spec as Spec,
  setup: {
    initialState: { categories, inCategory: false, inItem: false },
  } satisfies SpecSetup,
};
