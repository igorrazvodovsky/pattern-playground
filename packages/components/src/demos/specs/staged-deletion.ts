import type { Spec, StateStore } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './staged-deletion.json' with { type: 'json' };

// The spec stages and restores rows (setState on the row's `deleted` field),
// saves, cancels back to the last save, and resets an emptied list. Two kinds of thing stay here. The
// list-wide reads, whether any row is staged and the list without the staged
// rows, are `$computed` functions: a spec can read one value at a path but
// cannot fold over a list. And the saved message clears itself, which needs a
// timer.

const NOTICE_TIMEOUT = 3000;

interface StagedItem { id: string; name: string; deleted: boolean }

const items: StagedItem[] = reuseListings.map(({ id, name }) => ({ id, name, deleted: false }));

const staged = (args: Record<string, unknown>) => (args.items as StagedItem[] | undefined) ?? [];

const handlers = (store: StateStore) => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return {
    notify: ({ statePath, message }: Record<string, unknown>) => {
      const path = String(statePath);
      clearTimeout(timers.get(path));
      store.set(path, message);
      timers.set(path, setTimeout(() => { timers.delete(path); store.set(path, ''); }, NOTICE_TIMEOUT));
    },
  };
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { listings: items, items, saved: items, changed: false, notice: '' },
    handlers,
    functions: {
      anyStaged: args => staged(args).some(item => item.deleted),
      withoutStaged: args => staged(args).filter(item => !item.deleted),
    },
  } satisfies SpecSetup,
};
