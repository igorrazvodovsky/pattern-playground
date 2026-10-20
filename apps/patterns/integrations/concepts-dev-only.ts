import type { Plugin } from 'vite';
import { CONCEPTS_PUBLISHED } from '../src/lib/concepts-published.ts';

// Build-only, until the catalogue is published (lib/concepts-published.ts):
// replaces lib/concept-files.ts with an empty map, so the concept content
// never reaches the production client bundle. The pages themselves opt out
// through CONCEPTS_ENABLED (lib/site.ts); this covers the one glob that would
// ship the files anyway, since a glob emits a chunk per file even when the
// code reading it is dead.
export default function conceptsDevOnly(): Plugin {
  return {
    name: 'pattern-playground:concepts-dev-only',
    apply: (_config, { command }) => command === 'build' && !CONCEPTS_PUBLISHED,
    enforce: 'pre',
    load(id) {
      if (id.split('?')[0].endsWith('/src/lib/concept-files.ts')) {
        return 'export const conceptFiles = {};';
      }
    },
  };
}
