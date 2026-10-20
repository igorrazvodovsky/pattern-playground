import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './dialog-deletion.json' with { type: 'json' };

// All of the behaviour is in the spec: the row's delete button records which
// row it belongs to, writes the dialog's question and opens the dialog, and the
// dialog's delete removes that row. The question is written from the row's
// name when the dialog opens, so the text stays put while the dialog closes
// over a list that has already changed.

interface Listing { id: string; name: string }

const listings: Listing[] = reuseListings.map(({ id, name }) => ({ id, name }));

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings, items: listings, pending: null, question: '', confirming: false },
  } satisfies SpecSetup,
};
