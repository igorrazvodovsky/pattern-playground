import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { fullView } from './product-view';
import spec from './item-view-full.json' with { type: 'json' };

// The spec lays out the full rung: the first product of the collection, the
// same entity the page's other rungs show, with every attribute its full view
// carries. The layout is the full view the investigate and watch-to-chase
// specs open into, and the values are read and formatted through the product
// binding (./product-view), so the item reads the same at every rung.

const [product] = products;

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      product: { name: product.name, ...fullView(product) },
    },
  } satisfies SpecSetup,
};
