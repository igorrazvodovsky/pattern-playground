import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { fullView, itemView } from './product-view';
import spec from './item-view-transitions.json' with { type: 'json' };

// The spec walks one entity, the first product of the collection, up and down
// the ladder from a reference in a sentence. Each rung has its own container:
// the summary is the reference's preview, the detail a drawer, the full view a
// dialog. Each container carries buttons for the other two, and every move
// sets the flags (`/preview`, `/detailOpen`, `/fullOpen`) directly.
//
// Pressing the reference opens the rung the actor last chose to work in,
// `/preferred`: Detail until they open Full, and back when they open Detail.
// The summary is never preferred, since it is what pointing at the reference
// shows. The preference lives in the demo's state, so it lasts while the demo
// does, not across pages.
//
// The views are laid out from the product binding's scope for each rung
// (./product-view), so the item reads the same here as at the page's other
// rungs.

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
