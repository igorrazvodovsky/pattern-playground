import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './toast-with-undo.json' with { type: 'json' };

// Action params resolve `$item` to the row's state path rather than its value,
// so building the toast from the row and putting the row back happen here.

interface Listing {
  id: string;
  name: string;
}
interface DeletionToast {
  id: string;
  message: string;
  actionLabel: string;
  focusNext: string;
  item: Listing;
}

const listings: Listing[] = reuseListings.map(({ id, name }) => ({ id, name }));

let toastCount = 0;

const deletionToast = ({ item }: Record<string, unknown>): DeletionToast => {
  const listing = item as Listing;
  return {
    id: `deletion-${++toastCount}`,
    message: `${listing.name} deleted`,
    actionLabel: 'Undo',
    focusNext: listing.id,
    item: listing,
  };
};

// Rows are only ever removed, so the original listings give the order to
// restore into, whichever toasts were undone first.
const undoDeletion = ({ items, listings, toast }: Record<string, unknown>) => {
  const kept = new Set(((items as Listing[] | undefined) ?? []).map((listing) => listing.id));
  kept.add((toast as DeletionToast).item.id);
  return ((listings as Listing[] | undefined) ?? []).filter((listing) => kept.has(listing.id));
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings, items: listings, toasts: [], pressed: null },
    functions: { deletionToast, undoDeletion },
  } satisfies SpecSetup,
};
