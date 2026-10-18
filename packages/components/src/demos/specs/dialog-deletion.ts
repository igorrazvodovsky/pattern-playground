import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './dialog-deletion.json' with { type: 'json' };

// All of the behaviour is in the spec: the row's delete button records which
// row it belongs to, writes the dialog's question and opens the dialog, and the
// dialog's delete removes that row. What JSON cannot do is turn the row into a
// sentence: action params resolve a bare `$item` to the row's state path, not
// its value. Inside `$computed` arguments it resolves to the value, so
// `deletionQuestion` builds the question when the dialog opens, and the text
// stays put while the dialog closes over a list that has already changed.

interface Listing { id: string; name: string }

const listings: Listing[] = reuseListings.map(({ id, name }) => ({ id, name }));

const deletionQuestion = ({ item }: Record<string, unknown>) =>
  `Are you sure you want to delete ${(item as Listing).name}? This action cannot be undone.`;

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings, items: listings, pending: null, question: '', confirming: false },
    functions: { deletionQuestion },
  } satisfies SpecSetup,
};
