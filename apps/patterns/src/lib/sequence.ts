// Build-time helpers shared by every sequence render.
// Field meanings are in docs/specs/sequences.md, the schema in content.config.ts.
import type { CollectionEntry } from 'astro:content';

type SequenceEntry = CollectionEntry<'sequences'>;
type SequenceData = SequenceEntry['data'];

export type SubSequence = SequenceData['sub-sequences'][number];
// A position is not a step: a cluster or choice point holds several.
export type Position = SubSequence['steps'][number];
export type Step = Extract<Position, { step: string }>;
export type Cluster = Extract<Position, { cluster: string }>;
export type Choice = Extract<Position, { choice: string }>;
export type Connection = NonNullable<SequenceData['connections']>[number];

export const isCluster = (position: Position): position is Cluster => 'cluster' in position;
export const isChoice = (position: Position): position is Choice => 'choice' in position;

export function stepsOf(position: Position): Step[] {
  if (isCluster(position)) return position.steps;
  if (isChoice(position)) return position.alternatives;
  return [position];
}

export type Constituent = { slug: string; note?: string };

export function constituentsOf(step: Step): Constituent[] {
  return (step.constituents ?? []).map((c) => (typeof c === 'string' ? { slug: c } : c));
}

// `connections.at` addresses a position as `<sub-sequence>/<n>`, `n` one-based
// within the sub-sequence, so the anchor is that with the slash hyphenated. This
// numbering has to stay the numbering the renderer prints.
export const positionAnchor = (subId: string, index: number) => `${subId}-${index + 1}`;

// `acting-on-material/form/2` → head `acting-on-material`, rest [`form`, `2`].
export function splitRef(ref: string): { head: string; rest: string[] } {
  const [head, ...rest] = ref.split('/').filter(Boolean);
  return { head, rest };
}

// For a target with no page yet. Forward references are deliberate, so an
// unauthored slug still has to read as words.
export function humaniseSlug(slug: string): string {
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type Ref = { label: string; href?: string };

export type PatternTitles = Map<string, string>;

// A slug resolving to no pattern degrades to plain text; the cross-reference
// validator gates these at build time, so seeing one means the build was skipped.
export function patternRef(titles: PatternTitles, slug: string): Ref {
  const title = titles.get(slug);
  return title ? { label: title, href: `/patterns/${slug}` } : { label: humaniseSlug(slug) };
}

// A sub-sequence, or `<sub-sequence>/<n>`, within one sequence. Everything past
// the sub-sequence resolves only when it names a numbered position; a reference
// past the end falls back to the sub-sequence itself.
export function subSequenceRef(sequence: SequenceEntry, rest: string[]): Ref | undefined {
  const [subId, n] = rest;
  const sub = sequence.data['sub-sequences'].find((s) => s.id === subId);
  if (!sub) return undefined;
  const page = `/sequences/${sequence.id}`;
  const index = n === undefined ? -1 : Number(n) - 1;
  if (!(index >= 0 && index < sub.steps.length)) return { label: sub.title, href: `${page}#${subId}` };
  return { label: `${sub.title}, step ${index + 1}`, href: `${page}#${positionAnchor(subId, index)}` };
}

// A `to`/`from` target: `<sequence>[/<sub-sequence>[/<step>]]`. The sequence may
// not be authored yet, in which case the whole path reads as words.
export function farRef(sequences: SequenceEntry[], ref: string): Ref {
  const { head, rest } = splitRef(ref);
  const sequence = sequences.find((s) => s.id === head);
  if (!sequence) {
    const tail = rest.length > 0 ? ` (${rest.join(' / ')})` : '';
    return { label: humaniseSlug(head) + tail };
  }
  const title = sequence.data.title;
  if (rest.length === 0) return { label: title, href: `/sequences/${head}` };
  const within = subSequenceRef(sequence, rest);
  return within
    ? { label: `${title}, ${within.label.charAt(0).toLowerCase()}${within.label.slice(1)}`, href: within.href }
    : { label: `${title} (${rest.join(' / ')})`, href: `/sequences/${head}` };
}

export type AppearanceKind = 'rule' | 'constituent' | 'tree';

export interface Appearance {
  sequenceId: string;
  sequenceTitle: string;
  subTitle: string;
  // One-based within the sub-sequence, matching `connections.at`.
  stepNumber: number;
  anchor: string;
  kind: AppearanceKind;
  // The numbered step itself, or the cluster member or alternative naming the
  // pattern.
  step: string;
  note?: string;
}

// Reverse index: which sequences name this pattern, and where. A connection's
// `via` is deliberately not an appearance — it marks where a link between two
// sequences lands, not a step of either.
export function appearancesBySlug(sequences: SequenceEntry[]): Map<string, Appearance[]> {
  const index = new Map<string, Appearance[]>();

  const add = (slug: string, appearance: Appearance) => {
    const list = index.get(slug);
    if (list) list.push(appearance);
    else index.set(slug, [appearance]);
  };

  for (const sequence of sequences) {
    for (const sub of sequence.data['sub-sequences']) {
      sub.steps.forEach((position, i) => {
        const site = {
          sequenceId: sequence.id,
          sequenceTitle: sequence.data.title,
          subTitle: sub.title,
          stepNumber: i + 1,
          anchor: positionAnchor(sub.id, i),
        };

        if (isChoice(position) && position.tree) {
          add(position.tree, { ...site, kind: 'tree', step: position.choice });
        }

        for (const step of stepsOf(position)) {
          if (step.rule) add(step.rule, { ...site, kind: 'rule', step: step.step });
          for (const constituent of constituentsOf(step)) {
            add(constituent.slug, {
              ...site,
              kind: 'constituent',
              step: step.step,
              note: constituent.note,
            });
          }
        }
      });
    }
  }

  return index;
}
