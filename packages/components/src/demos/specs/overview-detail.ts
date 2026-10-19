import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { cardAttributes, fullView, itemView } from './product-view';
import spec from './overview-detail.json' with { type: 'json' };

// One overview and one detail, run through the four places the detail can
// open: in place, side by side, in a popover, and on a page of its own. The
// layout is chosen from a menu on the detail itself, so it is re-chosen from
// the thing being laid out. Picking a card always shows its detail; closing a
// popover belongs to the popover, so a card never toggles it.
//
// `/layout` is what the actor chose, and the menu ticks the layout in force.
// The two differ when side by side was chosen and the Split has no room
// (`/room`, written by the Split): the detail opens in place, which needs no
// width, and side by side is offered again once there is room.
//
// The new page is the list-page to item-page round trip. Back takes focus on
// the way in, and the selected card takes it on the way out, so the actor's
// place is kept.
//
// Each product arrives with every view the spec shows of it, laid out from
// the product binding (./product-view). In place, the detail opens right
// under the card, so it leaves out what the card already shows; the other
// layouts set the two views apart and keep the full readout.

const OVERVIEW_ATTRIBUTES = ['name', 'category', 'pricing.msrp'];
const overviewOf = cardAttributes(OVERVIEW_ATTRIBUTES.filter(path => path !== 'name'));
const inPlaceOf = itemView('mid', undefined, OVERVIEW_ATTRIBUTES);
const detailOf = itemView('mid');

const ids = products.map(item => item.id);

/** The id `by` places from `selected`, wrapping at either end. */
const step = ({ selected, by }: Record<string, unknown>) => {
  const index = ids.indexOf(String(selected));
  return ids[(index + Number(by) + ids.length) % ids.length];
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      products: products.map(item => ({
        id: item.id,
        name: item.name,
        attributes: overviewOf(item),
        inPlace: inPlaceOf(item),
        detail: detailOf(item),
        full: fullView(item),
      })),
      selected: ids[0],
      layout: 'in-place',
      room: true,
      popoverOpen: false,
      pageOpen: false,
    },
    functions: {
      // An action's `$item` names the item's path; inside `$computed` it is the value.
      value: ({ value }) => value,
      step,
    },
  } satisfies SpecSetup,
};
