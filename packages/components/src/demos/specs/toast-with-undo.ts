import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './toast-with-undo.json' with { type: 'json' };

// The spec deletes the row at once and adds a toast that carries the row; the
// toast's action puts it back. Undo restores only that row, so undoing an
// older toast leaves later deletions alone. Two things stay here, because
// action params resolve `$item` to the row's state path rather than its value:
// building the toast from the row, and putting the row back in its place.
// How long the toast stays, and with it the window for undo, is the catalog's
// rule, not the spec's.

interface Listing { id: string; name: string }
interface DeletionToast { id: string; message: string; actionLabel: string; item: Listing }

const listings: Listing[] = reuseListings.map(({ id, name }) => ({ id, name }));

let toastCount = 0;

const deletionToast = ({ item }: Record<string, unknown>): DeletionToast => {
  const listing = item as Listing;
  return { id: `deletion-${++toastCount}`, message: `${listing.name} deleted`, actionLabel: 'Undo', item: listing };
};

// Rows are only ever removed, so the list keeps the order of the original
// listings. The row goes back in that order, whichever toasts were undone
// before it.
const undoDeletion = ({ items, listings, toast }: Record<string, unknown>) => {
  const kept = new Set(((items as Listing[] | undefined) ?? []).map(listing => listing.id));
  kept.add((toast as DeletionToast).item.id);
  return ((listings as Listing[] | undefined) ?? []).filter(listing => kept.has(listing.id));
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings, items: listings, toasts: [], pressed: null },
    functions: { deletionToast, undoDeletion },
  } satisfies SpecSetup,
};
