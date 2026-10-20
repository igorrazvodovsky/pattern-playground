// Build-time assembly of the sidebar tree that Nav.tsx renders.
import { getCollection, type CollectionEntry } from 'astro:content';
import { panePath } from './pane-path';
import { bySequenceOrder, humaniseSlug } from './sequence';
import { CONCEPTS_ENABLED } from './site';

export type NavLeaf = { label: string; href: string };
export type NavBranch = { label: string; children: NavTreeNode[] };
export type NavTreeNode = NavLeaf | NavBranch;
export type NavGroup = NavBranch;

export interface NavTree {
  // Role groups (foundations, qualities), listed above the patterns.
  shared: NavGroup[];
  patterns: NavGroup;
  sequences: NavGroup;
  // The concept catalogue. A parallel catalogue, not part of the language, so
  // it is rendered in its own corner of the site (Nav.tsx `corner`), never as
  // a group among the language's.
  concepts: NavGroup;
}

type PatternEntry = CollectionEntry<'patterns'>;

// The sidebar reads `role` and, for a few families, `group`. Foundations and
// qualities are lifted into their own groups; everything else is one
// alphabetical list, except the families named in BRANCH_GROUPS, which nest
// under one branch each in it. The other facets — activityLevel, lifecycle,
// domain, and the other `group` values — are lenses the graph and the
// sequences project over, not navigation structure. An Activity-Theory
// grouping used to be offered here as a switchable projection; it was removed
// because it was not carrying navigation, and because a switcher sitting at the
// root of the sidebar implied it reordered everything, not just the patterns.
function roleGroupOf(entry: PatternEntry): 'foundations' | 'qualities' | null {
  if (entry.data.role === 'foundation') return 'foundations';
  if (entry.data.role === 'quality') return 'qualities';
  return null;
}

// Families that nest under their own branch, keyed by the first segment of
// `group`. A second segment (`conversation/sequence-management`) becomes a
// sub-branch. A family's collection page opens its branch as the overview.
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

// Every page renders the same tree, so it is built once per state of the two
// collections; the key changes when an entry is edited under the dev server.
export async function buildNavTree(): Promise<NavTree> {
  const patterns = await getCollection('patterns');
  const sequences = await getCollection('sequences');
  const concepts = CONCEPTS_ENABLED ? await getCollection('concepts') : [];
  const key = [...patterns, ...sequences, ...concepts].map((e) => `${e.id}@${e.digest ?? ''}`).join(' ');
  if (navCache?.key !== key) navCache = { key, tree: assembleNavTree(patterns, sequences, concepts) };
  return navCache.tree;
}

function assembleNavTree(
  patterns: PatternEntry[],
  sequenceEntries: CollectionEntry<'sequences'>[],
  conceptEntries: CollectionEntry<'concepts'>[],
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

  const branchFor = (key: string): NavBranch => {
    const members = patterns.filter((p) => groupPath(p)[0] === key);
    const overview = leavesWhere((p) => members.includes(p) && p.data.role === 'collection')
      .map((leaf): NavLeaf => ({ ...leaf, label: 'Overview' }));
    const subgroups = [...new Set(members.map((p) => groupPath(p)[1]).filter(Boolean))];
    const rest: NavTreeNode[] = [
      ...leavesWhere((p) => members.includes(p) && p.data.role !== 'collection' && !groupPath(p)[1]),
      ...subgroups.map((sub): NavBranch => ({
        label: humaniseSlug(sub),
        children: leavesWhere((p) => members.includes(p) && groupPath(p)[1] === sub),
      })),
    ].sort(byLabel);
    return { label: BRANCH_GROUPS[key], children: [...overview, ...rest] };
  };

  const patternsGroup: NavGroup = {
    label: 'Patterns',
    children: [
      ...leavesWhere((p) => roleGroupOf(p) === null && !inBranch(p)),
      ...Object.keys(BRANCH_GROUPS).map(branchFor).filter((b) => b.children.length > 0),
    ].sort(byLabel),
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

  return { shared, patterns: patternsGroup, sequences: sequencesGroup, concepts: conceptsGroup };
}
