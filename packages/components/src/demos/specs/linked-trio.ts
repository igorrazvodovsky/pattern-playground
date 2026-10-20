import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { cardAttributes, itemView, mapLocations } from './shared/product-view';
import spec from './linked-trio.json' with { type: 'json' };

// Focus never moves the map, since the actor is only passing over the item.
// Stacked in a column, picking an item would scroll the map it lit off the
// top, so the narrow layout moves the map above the list and opens the detail
// inside the item. The spec holds the map twice and shows the one the layout
// in force needs.

const LIST_ATTRIBUTES = ['name', 'category', 'pricing.msrp'];
const attributesOf = cardAttributes(LIST_ATTRIBUTES.filter(path => path !== 'name'));
const inPlaceOf = itemView('mid', undefined, LIST_ATTRIBUTES);
const detailOf = itemView('mid');

// The map keeps its 20rem height, so the list stays short enough that a pin
// lights where the actor is looking when the map sits above.
const TRIO = products.slice(0, 5);

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      products: TRIO.map(item => ({
        id: item.id,
        name: item.name,
        attributes: attributesOf(item),
        inPlace: inPlaceOf(item),
        detail: detailOf(item),
      })),
      locations: mapLocations(TRIO),
      selected: TRIO[0].id,
      focused: null,
      room: false,
    },
  } satisfies SpecSetup,
};
