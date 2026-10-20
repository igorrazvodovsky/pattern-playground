import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { attributeValue } from './shared/product-view';
import spec from './item-view-row.json' with { type: 'json' };

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
