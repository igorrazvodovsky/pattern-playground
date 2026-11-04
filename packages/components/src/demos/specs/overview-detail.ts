import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { inPlaceAttributes, overviewAttributes } from './shared/product';
import spec from './overview-detail.json' with { type: 'json' };

// Closing a popover belongs to the popover, so picking an item never toggles it.
// `/layout` is what the actor chose; it differs from the layout in force when
// side by side was chosen and the Split has no room (`/room`). In place, the
// detail opens under the item's row, so it leaves out what the row shows.

const ids = products.map((item) => item.id);

const step = ({ selected, by }: Record<string, unknown>) => {
  const index = ids.indexOf(String(selected));
  return ids[(index + Number(by) + ids.length) % ids.length];
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      inPlaceAttributes,
      products: products.map((item) => ({
        id: item.id,
        name: item.name,
        attributes: overviewAttributes(item),
        product: item,
      })),
      selected: ids[0],
      layout: 'in-place',
      room: false,
      popoverOpen: false,
      pageOpen: false,
    },
    functions: {
      step,
    },
  } satisfies SpecSetup,
};
