import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { fullView } from './product-view';
import spec from './item-view-full.json' with { type: 'json' };

const [product] = products;

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      product: { name: product.name, ...fullView(product) },
    },
  } satisfies SpecSetup,
};
