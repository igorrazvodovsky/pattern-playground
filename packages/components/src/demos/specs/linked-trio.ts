import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { cardAttributes, itemView, mapLocations } from './product-view';
import spec from './linked-trio.json' with { type: 'json' };

// A list, a map and a detail over one collection, coupled two ways. Focus is
// transient: while the pointer is over an item or a pin, or either has
// keyboard focus, the other view marks it lightly, and the mark goes when the
// focus does. Selection is staked: picking an item marks its pin and fills the
// detail, and pressing a pin marks its item and fills the detail too, until
// the actor picks another or presses the picked item again to release it. The
// map pans to a pin picked from the list, so the pin stays in view; focus
// never moves the map, since the actor is only passing over the item.
//
// Propagation is legible only while both populations are on screen when the
// actor picks something. Three panes side by side give that for free; stacked
// in a column they take it away, because picking an item scrolls the map it
// lit off the top. So the narrow layout is not the wide one reflowed: the map
// moves above the list, so the pin lights directly above the item that lit
// it, and the detail gives up its pane and opens inside the item it was picked
// from, leaving out what the row already shows. The detail is the one view
// that can go: it shows a single item, so propagating to it only ever means
// that it updates, while list and map are two populations marking each other.
// The spec holds the map twice, one above the list and one beside it, and
// shows the one the layout in force needs.

const LIST_ATTRIBUTES = ['name', 'category', 'pricing.msrp'];
const attributesOf = cardAttributes(LIST_ATTRIBUTES.filter(path => path !== 'name'));
const inPlaceOf = itemView('mid', undefined, LIST_ATTRIBUTES);
const detailOf = itemView('mid');

// Five items, not the whole collection. The map keeps its 20rem height, so
// the list is what has to stay short: with five items the last one is still
// close enough to the map, when it sits above, that its pin lights where the
// actor is looking.
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
    functions: {
      // An action's `$item` names the item's path; inside `$computed` it is the value.
      value: ({ value }) => value,
      toggle: ({ selected, id }) => (selected === id ? null : id),
    },
  } satisfies SpecSetup,
};
