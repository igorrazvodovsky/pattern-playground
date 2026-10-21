import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { cardAttributes } from './shared/product';
import spec from './investigate.json' with { type: 'json' };

// A repeat cannot follow a path chosen while the demo runs, so each category
// and item is repeated once per view, shown only while its `open` is set. A
// spec cannot group the collection, and a row's labelled badges are not an
// item view's summary, so both are worked out here.

const SUMMARY_ATTRIBUTES = ['condition', 'pricing.msrp'];
const summaryOf = cardAttributes(SUMMARY_ATTRIBUTES);

const categories = [...new Set(products.map((item) => item.metadata.category))]
  .sort((a, b) => a.localeCompare(b))
  .map((category) => {
    const items = products.filter((item) => item.metadata.category === category);
    return {
      id: category,
      name: category,
      count: `${items.length} listing${items.length === 1 ? '' : 's'}`,
      open: false,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        category,
        open: false,
        attributes: summaryOf(item),
        product: item,
      })),
    };
  });

export default {
  spec: spec as Spec,
  setup: {
    initialState: { categories, inCategory: false, inItem: false },
  } satisfies SpecSetup,
};
