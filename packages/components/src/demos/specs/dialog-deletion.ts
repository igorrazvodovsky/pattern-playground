import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './dialog-deletion.json' with { type: 'json' };

// The question is written when the dialog opens, so its text stays put while
// the dialog closes over a list that has already changed.

interface Listing {
  id: string;
  name: string;
}

const listings: Listing[] = reuseListings.map(({ id, name }) => ({ id, name }));

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings, items: listings, pending: null, question: '', confirming: false },
  } satisfies SpecSetup,
};
