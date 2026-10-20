import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { fullView, itemView } from './product-view';
import spec from './item-view-transitions.json' with { type: 'json' };

// `/preferred` is the rung pressing the reference opens. The summary is never
// preferred, since pointing at the reference already shows it.

const [product] = products;

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      product: {
        name: product.name,
        summary: itemView('mini')(product),
        detail: itemView('mid')(product),
        full: fullView(product),
      },
      preview: false,
      detailOpen: false,
      fullOpen: false,
      preferred: 'mid',
    },
  } satisfies SpecSetup,
};
