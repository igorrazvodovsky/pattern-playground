import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { mapLocations } from './product-view';
import spec from './item-view-glyph.json' with { type: 'json' };

// The spec places the glyph rung on a map: every product as a pin among its
// population, with the first one selected: the entity the other rungs
// render. Coordinates and the site name come from the product binding's
// internal attributes, data a view needs but never displays.

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      locations: mapLocations(products),
      selected: products[0].id,
    },
  } satisfies SpecSetup,
};
