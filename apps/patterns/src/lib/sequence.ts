// Build-time helpers shared by every sequence render.
// Field meanings are in docs/specs/sequences.md, the schema in content.config.ts.
import { getCollection, type CollectionEntry } from 'astro:content';
import { panePath } from './pane-path';

type SequenceEntry = CollectionEntry<'sequences'>;
type SequenceData = SequenceEntry['data'];

export type SubSequence = SequenceData['sub-sequences'][number];
// A position is not a step: a cluster or choice point holds several.
export type Position = SubSequence['steps'][number];
export type Step = Extract<Position, { step: string }>;
export type Cluster = Extract<Position, { cluster: string }>;
export type Choice = Extract<Position, { choice: string }>;

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

// "Appears in" links to a numbered position as `<sub-sequence>-<n>`, `n`
// one-based within the sub-sequence. This numbering has to stay the numbering
// the renderer prints.
export const positionAnchor = (subId: string, index: number) => `${subId}-${index + 1}`;

// For a target with no page yet, so an unknown slug still reads as words.
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
  return title ? { label: title, href: panePath('pattern', slug) } : { label: humaniseSlug(slug) };
}

export type AppearanceKind = 'rule' | 'constituent';

export interface Appearance {
  sequenceId: string;
  sequenceTitle: string;
  subTitle: string;
  // One-based within the sub-sequence, as the page numbers it.
  stepNumber: number;
  anchor: string;
  kind: AppearanceKind;
  // The numbered step itself, or the cluster member or alternative naming the
  // pattern.
  step: string;
  note?: string;
}

// Reverse index: which sequences name this pattern, and where.
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

// Every pattern a sequence invokes: as a step's rule or a constituent. The same
// two kinds the appearance index records.
export function invokedPatterns(sequence: SequenceEntry): Set<string> {
  const slugs = new Set<string>();
  for (const sub of sequence.data['sub-sequences']) {
    for (const position of sub.steps) {
      for (const step of stepsOf(position)) {
        if (step.rule) slugs.add(step.rule);
        for (const constituent of constituentsOf(step)) slugs.add(constituent.slug);
      }
    }
  }
  return slugs;
}

// The order the nav lists sequences in.
export const bySequenceOrder = (a: SequenceEntry, b: SequenceEntry) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

let appearancesCache: { key: string; index: Map<string, Appearance[]> } | undefined;

// The appearance index over every sequence, in nav order. Every pattern page
// asks for it, so it is built once per state of the sequences collection; the
// key changes when a sequence file is edited under the dev server.
export async function sequenceAppearances(): Promise<Map<string, Appearance[]>> {
  const sequences = (await getCollection('sequences')).sort(bySequenceOrder);
  const key = sequences.map((s) => `${s.id}@${s.digest ?? ''}`).join(' ');
  if (appearancesCache?.key !== key)
    appearancesCache = { key, index: appearancesBySlug(sequences) };
  return appearancesCache.index;
}
