import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { armHandler } from './shared/arm';
import spec from './inline-confirmation.json' with { type: 'json' };

// A spec cannot carry time, so `arm` sets the flag and schedules its reversion.

interface Listing { id: string; name: string; armed: boolean }

const listings: Listing[] = reuseListings.map(({ id, name }) => ({ id, name, armed: false }));

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings, items: listings },
    handlers: armHandler,
  } satisfies SpecSetup,
};
