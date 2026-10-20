import type { Spec } from '@json-render/core';
import { reuseListings } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { notifyHandler } from './shared/notify';
import spec from './staged-deletion.json' with { type: 'json' };

// A spec cannot fold over a list, so the list-wide reads are functions here.

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
