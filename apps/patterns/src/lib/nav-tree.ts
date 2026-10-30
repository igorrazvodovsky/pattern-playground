// Build-time assembly of the sidebar tree that Nav.tsx renders.
import { getCollection, type CollectionEntry } from 'astro:content';
import { panePath } from './pane-path';
import { bySequenceOrder, humaniseSlug } from './sequence';
import { CONCEPTS_ENABLED } from './site';

// `overview` marks a family's collection page, which opens its branch.
export type NavLeaf = { label: string; href: string; overview?: boolean };
export type NavBranch = { label: string; children: NavTreeNode[] };
export type NavTreeNode = NavLeaf | NavBranch;
export type NavGroup = NavBranch;

// One arrangement of the pattern list. The actor picks one in the sidebar; all
// are built here so the persisted Nav island can switch without a rebuild.
export interface NavGrouping {
  id: string;
  label: string;
  children: NavTreeNode[];
}

// A project language the actor can narrow the pattern list to. `members` holds
// the paths of its patterns; the island keeps only leaves whose path is a
// member, so every grouping narrows the same way.
export interface NavLanguage {
  id: string;
  label: string;
  href: string;
  members: string[];
}

export interface NavTree {
  // Role groups (foundations, qualities), listed above the patterns.
  shared: NavGroup[];
  // The first grouping is the default.
  patterns: { label: string; groupings: NavGrouping[] };
  sequences: NavGroup;
  // The concept catalogue. A parallel catalogue, not part of the language, so
  // it is rendered in its own corner of the site (Nav.tsx `corner`), never as
  // a group among the language's.
  concepts: NavGroup;
  languages: NavLanguage[];
}

type PatternEntry = CollectionEntry<'patterns'>;

// The sidebar reads `role` and, for a few families, `group`. Foundations and
// qualities are lifted into their own groups. The pattern list below them is
// arranged by a grouping the actor picks: A–Z, or the authored levels list
// (src/content/levels.yaml), which holds design patterns only. The remaining
// facets (activityLevel, lifecycle, domain, the other `group` values) are
// lenses the graph and the sequences project over, not navigation structure.
function roleGroupOf(entry: PatternEntry): 'foundations' | 'qualities' | null {
  if (entry.data.role === 'foundation') return 'foundations';
  if (entry.data.role === 'quality') return 'qualities';
  return null;
}

// Families that nest under their own branch, keyed by the first segment of
// `group`. A second segment (`conversation/sequence-management`) becomes a
// sub-branch. A family's collection page opens its branch as the overview. Only
// the A–Z grouping nests families; the levels grouping gathers them by its groups.
const BRANCH_GROUPS: Record<string, string> = {
  navigation: 'Navigation',
  conversation: 'Conversational primitives',
};

function groupPath(p: PatternEntry): string[] {
  return roleGroupOf(p) === null && p.data.group ? p.data.group.split('/') : [];
}

const inBranch = (p: PatternEntry) => groupPath(p)[0] in BRANCH_GROUPS;

const byLabel = (a: NavTreeNode, b: NavTreeNode) => a.label.localeCompare(b.label);

let navCache: { key: string; tree: NavTree } | undefined;

// Every page renders the same tree, so it is built once per state of the
// collections; the key changes when an entry is edited under the dev server.
export async function buildNavTree(): Promise<NavTree> {
  const patterns = await getCollection('patterns');
  const sequences = await getCollection('sequences');
  const concepts = CONCEPTS_ENABLED ? await getCollection('concepts') : [];
  const languages = await getCollection('languages');
  const levels = await getCollection('levels');
  const key = [...patterns, ...sequences, ...concepts, ...languages, ...levels]
    .map((e) => `${e.id}@${e.digest ?? ''}`)
    .join(' ');
  if (navCache?.key !== key)
    navCache = { key, tree: assembleNavTree(patterns, sequences, concepts, languages, levels) };
  return navCache.tree;
}

function assembleNavTree(
  patterns: PatternEntry[],
  sequenceEntries: CollectionEntry<'sequences'>[],
  conceptEntries: CollectionEntry<'concepts'>[],
  languageEntries: CollectionEntry<'languages'>[],
  levelEntries: CollectionEntry<'levels'>[],
): NavTree {
  const leavesWhere = (test: (p: PatternEntry) => boolean): NavLeaf[] =>
    patterns
      .filter(test)
      .map((p): NavLeaf => ({ label: p.data.title, href: panePath('pattern', p.id) }))
      .sort(byLabel);

  // Roles read as their own kind of entry, so they stay above the alphabetical
  // list rather than dissolving into it.
  const shared: NavGroup[] = (
    [
      { label: 'Foundations', children: leavesWhere((p) => roleGroupOf(p) === 'foundations') },
      { label: 'Qualities', children: leavesWhere((p) => roleGroupOf(p) === 'qualities') },
    ] satisfies NavGroup[]
  ).filter((g) => g.children.length > 0);

  // The patterns that pass `test`, with family members nested in their branches.
  const listOf = (test: (p: PatternEntry) => boolean): NavTreeNode[] =>
    [
      ...leavesWhere((p) => test(p) && !inBranch(p)),
      ...Object.keys(BRANCH_GROUPS)
        .map((key) => branchFor(key, test))
        .filter((b) => b.children.length > 0),
    ].sort(byLabel);

  const branchFor = (key: string, test: (p: PatternEntry) => boolean): NavBranch => {
    const members = patterns.filter((p) => test(p) && groupPath(p)[0] === key);
    const overview = leavesWhere((p) => members.includes(p) && p.data.role === 'collection').map(
      (leaf): NavLeaf => ({ ...leaf, label: 'Overview', overview: true }),
    );
    const subgroups = [...new Set(members.map((p) => groupPath(p)[1]).filter(Boolean))];
    const rest: NavTreeNode[] = [
      ...leavesWhere(
        (p) => members.includes(p) && p.data.role !== 'collection' && !groupPath(p)[1],
      ),
      ...subgroups.map((sub): NavBranch => ({
        label: humaniseSlug(sub),
        children: leavesWhere((p) => members.includes(p) && groupPath(p)[1] === sub),
      })),
    ].sort(byLabel);
    return { label: BRANCH_GROUPS[key], children: [...overview, ...rest] };
  };

  const isDesignPattern = (p: PatternEntry) => p.data.role === 'pattern';

  // Parts and their groups from the authored levels list. A group keeps the
  // list's order, wholes before the parts that complete them, rather than the
  // alphabet, and families do not nest, since the groups already gather them.
  // A pattern the list places twice is listed once, at its first place; the
  // validator fails the build on it.
  const designPatterns = new Map(patterns.filter(isDesignPattern).map((p) => [p.id, p]));
  const placed = new Set<string>();
  const parts = [...levelEntries]
    .sort((a, b) => a.data.order - b.data.order)
    .map((part): NavBranch => ({
      label: part.data.title,
      children: part.data.groups
        .map((group): NavBranch => ({
          label: group.title,
          children: group.patterns.flatMap((slug): NavLeaf[] => {
            const p = designPatterns.get(slug);
            if (!p || placed.has(slug)) return [];
            placed.add(slug);
            return [{ label: p.data.title, href: panePath('pattern', p.id) }];
          }),
        }))
        .filter((g) => g.children.length > 0),
    }));
  // Design patterns the list does not place yet, so the gap shows.
  const byLevels: NavTreeNode[] = [
    ...parts,
    { label: 'Not placed', children: listOf((p) => isDesignPattern(p) && !placed.has(p.id)) },
  ].filter((g) => g.children.length > 0);

  const patternsGroup = {
    label: 'Patterns',
    groupings: [
      { id: 'a-z', label: 'A–Z', children: listOf((p) => roleGroupOf(p) === null) },
      { id: 'levels', label: 'Levels', children: byLevels },
    ],
  };

  // A sequence is an authored walk over the patterns rather than another way of
  // arranging them, so sequences get their own group above the list.
  const sequencesGroup: NavGroup = {
    label: 'Sequences',
    children: [...sequenceEntries]
      .sort(bySequenceOrder)
      .map((s): NavLeaf => ({ label: s.data.title, href: panePath('sequence', s.id) })),
  };

  const conceptsGroup: NavGroup = {
    label: 'Concepts',
    children: conceptEntries
      .map((c): NavLeaf => ({ label: c.data.title, href: panePath('concept', c.id) }))
      .sort(byLabel),
  };

  const languages: NavLanguage[] = [...languageEntries]
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .map((l) => ({
      id: l.id,
      label: l.data.title,
      href: panePath('language', l.id),
      members: l.data.patterns.map((slug) => panePath('pattern', slug)),
    }));

  return {
    shared,
    patterns: patternsGroup,
    sequences: sequencesGroup,
    concepts: conceptsGroup,
    languages,
  };
}
