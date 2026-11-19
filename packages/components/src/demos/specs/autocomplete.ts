import type { Spec } from '@json-render/core';
import { documents, recentItems, tasks } from '@shared/data';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './autocomplete.json' with { type: 'json' };

// Recent entries are few, so they narrow from the first character; the full
// index waits for a second, since one character matches too much of it.
const minQueryLength = 2;
const maxMatches = 8;

const asOptions = (names: string[]) => names.map((name) => ({ value: name, label: name }));

const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];

function matches(query: string, names: string[]) {
  const q = query.toLocaleLowerCase();
  const found = names.filter((name) => name.toLocaleLowerCase().includes(q));
  const starts = found.filter((name) => name.toLocaleLowerCase().startsWith(q));
  return [...starts, ...found.filter((name) => !starts.includes(name))];
}

function candidates(query: string, recent: string[], known: string[]) {
  if (!query) return { recent, other: [], searched: false };
  const fromRecent = matches(query, recent).slice(0, maxMatches);
  const searched = query.length >= minQueryLength;
  const other = searched
    ? matches(
        query,
        known.filter((name) => !recent.includes(name)),
      ).slice(0, maxMatches - fromRecent.length)
    : [];
  return { recent: fromRecent, other, searched };
}

const known = [...new Set([...documents.map((d) => d.name), ...tasks.map((t) => t.title)])];
const recent = recentItems.map((item) => item.name);

export default {
  spec: spec as Spec,
  setup: {
    initialState: { query: '', recent, known },
    functions: {
      candidates: (args) => {
        const query = typeof args.query === 'string' ? args.query.trim() : '';
        const found = candidates(query, strings(args.recent), strings(args.known));
        return [
          { heading: 'Recent', options: asOptions(found.recent) },
          { heading: found.recent.length ? 'Other' : null, options: asOptions(found.other) },
        ];
      },
      // Said only once the index has been searched, so one character says nothing.
      noMatches: (args) => {
        const query = typeof args.query === 'string' ? args.query.trim() : '';
        const found = candidates(query, strings(args.recent), strings(args.known));
        return found.searched && found.recent.length + found.other.length === 0 ? 'No matches' : '';
      },
    },
  } satisfies SpecSetup,
};
