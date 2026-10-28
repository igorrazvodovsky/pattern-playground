// Build-time helpers shared by the language page and the sidebar.
// Field meanings are in docs/specs/pattern-site.md §Project languages.
import type { CollectionEntry } from 'astro:content';
import { bySequenceOrder, invokedPatterns } from './sequence';

type LanguageEntry = CollectionEntry<'languages'>;
type SequenceEntry = CollectionEntry<'sequences'>;

export interface LanguageSequence {
  sequence: SequenceEntry;
  // How many of the patterns the sequence invokes the language holds.
  held: number;
  invoked: number;
}

// The sequences that invoke at least one of the language's patterns, in
// reading order.
export function sequencesFor(
  language: LanguageEntry,
  sequences: SequenceEntry[],
): LanguageSequence[] {
  const members = new Set(language.data.patterns);
  return [...sequences]
    .sort(bySequenceOrder)
    .map((sequence) => {
      const invoked = invokedPatterns(sequence);
      const held = [...invoked].filter((slug) => members.has(slug)).length;
      return { sequence, held, invoked: invoked.size };
    })
    .filter(({ held }) => held > 0);
}
