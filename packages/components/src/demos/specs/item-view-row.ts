import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { attributeValue } from './product-view';
import spec from './item-view-row.json' with { type: 'json' };

// The spec lays out the summary rung as a row among its peers: one row per
// product, the status as a badge. The values are read and formatted through
// the product binding (./product-view), so a price reads the same here as on
// the item's card and in its full view.

const category = attributeValue('category');
const condition = attributeValue('condition');
const price = attributeValue('pricing.msrp');
const status = attributeValue('availability.status');

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      products: products.map(item => ({
        id: item.id,
        name: item.name,
        category: category(item),
        condition: condition(item),
        price: price(item),
        status: status(item),
      })),
    },
  } satisfies SpecSetup,
};
