import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { notifyHandler } from './notify';
import spec from './staged-deletion.json' with { type: 'json' };

// The spec stages and restores rows (setState on the row's `deleted` field),
// saves, cancels back to the last save, and resets an emptied list. Two kinds of thing stay here. The
// list-wide reads, whether any row is staged and the list without the staged
// rows, are `$computed` functions: a spec can read one value at a path but
// cannot fold over a list. And the saved message clears itself, which needs a
// timer (./notify.ts).

interface StagedItem { id: string; name: string; deleted: boolean }

const items: StagedItem[] = reuseListings.map(({ id, name }) => ({ id, name, deleted: false }));

const staged = (args: Record<string, unknown>) => (args.items as StagedItem[] | undefined) ?? [];

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings: items, items, saved: items, changed: false, notice: '' },
    handlers: notifyHandler,
    functions: {
      anyStaged: args => staged(args).some(item => item.deleted),
      withoutStaged: args => staged(args).filter(item => !item.deleted),
    },
  } satisfies SpecSetup,
};
