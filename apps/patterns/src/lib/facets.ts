// Scale facets: ordered series of levels a design pattern takes one value on
// (plans/active/2026-10-pattern-facets.md, docs/specs/pattern-site.md
// §Classification facets).

export const SCOPE_LEVELS = [
  'element',
  'part',
  'view',
  'area',
  'application',
  'ecosystem',
] as const;

export type ScopeLevel = (typeof SCOPE_LEVELS)[number];
