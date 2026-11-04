import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { mapLocations } from './shared/product';
import spec from './item-view-glyph.json' with { type: 'json' };

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      locations: mapLocations(products),
      selected: products[0].id,
    },
  } satisfies SpecSetup,
};
