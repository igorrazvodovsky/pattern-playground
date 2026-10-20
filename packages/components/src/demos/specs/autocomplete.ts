import type { Spec } from '@json-render/core';
import { documents, recentItems, tasks } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './autocomplete.json' with { type: 'json' };

// A single character is too little to narrow on, so the list stays closed.
const minQueryLength = 2;
const maxMatches = 8;

const asOptions = (names: string[]) => names.map((name) => ({ value: name, label: name }));

const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];

function matches(query: string, names: string[]) {
  const q = query.toLocaleLowerCase();
  const found = names.filter((name) => name.toLocaleLowerCase().includes(q));
  const starts = found.filter((name) => name.toLocaleLowerCase().startsWith(q));
  return [...starts, ...found.filter((name) => !starts.includes(name))].slice(0, maxMatches);
}

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      query: '',
      recent: recentItems.map((item) => item.name),
      known: [...new Set([...documents.map((d) => d.name), ...tasks.map((t) => t.title)])],
    },
    functions: {
      candidates: (args) => {
        const query = typeof args.query === 'string' ? args.query.trim() : '';
        if (!query) return [{ heading: 'Recent', options: asOptions(strings(args.recent)) }];
        if (query.length < minQueryLength) return [];
        return [{ heading: null, options: asOptions(matches(query, strings(args.known))) }];
      },
    },
  } satisfies SpecSetup,
};
