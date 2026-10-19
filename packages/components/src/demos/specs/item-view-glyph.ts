import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import { productBinding } from '@shared/data/bindings';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { toMapLocations } from '../../templates/collection-view/data';
import spec from './item-view-glyph.json' with { type: 'json' };

// The spec places the glyph rung on a map: every product as a pin among its
// population, with the first one selected: the entity the other rungs
// render. Coordinates and the site name come from the product binding's
// internal attributes, data a view needs but never displays.

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      locations: toMapLocations(products, productBinding).map(location => ({
        id: String(location.id),
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        description: location.description ?? null,
      })),
      selected: products[0].id,
    },
  } satisfies SpecSetup,
};
