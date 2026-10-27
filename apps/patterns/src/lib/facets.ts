// Scale facets: ordered series of levels a design pattern takes a value on
// (plans/active/2026-10-pattern-facets.md, docs/specs/pattern-site.md
// §Classification facets). A value is one level or a from–to pair, low to high;
// the pair covers every level between its ends.

export const SCOPE_LEVELS = [
  'element',
  'component',
  'view',
  'area',
  'product',
  'ecosystem',
] as const;

export type ScopeLevel = (typeof SCOPE_LEVELS)[number];

export type Ranged<L extends string> = L | readonly [L, L];

// A pair must run from the lower level to the higher. Equal ends are rejected:
// a single level is written as a single value.
export function isAscendingRange<L extends string>(
  value: Ranged<L>,
  levels: readonly L[],
): boolean {
  if (typeof value === 'string') return true;
  return levels.indexOf(value[0]) < levels.indexOf(value[1]);
}

export function levelsSpanned<L extends string>(value: Ranged<L>, levels: readonly L[]): L[] {
  if (typeof value === 'string') return [value];
  return levels.slice(levels.indexOf(value[0]), levels.indexOf(value[1]) + 1);
}
