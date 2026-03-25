---
name: pattern-migrator
description: Systematic approach for migrating patterns between directories in Storybook-based pattern libraries while maintaining cross-references and documentation integrity. Use this skill when reorganizing Storybook structure, moving patterns to new categories, refactoring documentation hierarchy, or performing bulk pattern migrations that require careful tracking of Meta titles, URLs, and cross-references.
disable-model-invocation: true
argument-hint: "[source-dir] [target-dir]"
---

# Pattern Migrator

Systematic workflow for migrating patterns between Storybook directories. Follow these five phases sequentially. See `references/pattern-migration-guide.md` for detailed procedures, command examples, and checklists.

## Phase 1: Analysis and planning

1. Inventory all files in source and target directories (simple `.mdx`, `.mdx` + `.stories.tsx`, complex directories)
2. Extract Meta titles from all `.mdx` files — record explicit titles and story references
3. Map all cross-references: incoming links (other patterns → this one) and outgoing links
4. Draft a migration plan listing: source → destination paths, old → new Meta titles, old → new URLs, cross-references to update

## Phase 2: File structure migration

1. Move files/directories — use `git mv` to preserve history
2. Update Meta titles to reflect new category structure
3. Update import paths in TypeScript files
4. Update internal cross-references within moved files

Handle simple files (`.mdx` only) and complex patterns (with stories/components) per the reference guide.

## Phase 3: URL reference updates

Storybook URL rules: `<Meta title="Category/Name" />` → `../?path=/docs/category-name--docs` (spaces→hyphens, uppercase→lowercase, asterisks removed, slashes→hyphens).

1. Global search for old URL patterns across the entire codebase
2. Pattern-specific search for each moved pattern
3. Update all found references to new URLs
4. Update import paths in TypeScript files

## Phase 4: Documentation updates

1. Update overview/index files that list patterns
2. Update CLAUDE.md if it references old structure
3. Update README files mentioning affected patterns
4. Verify British spelling and sentence-case headings throughout

## Phase 5: Validation

1. `npm run build-storybook` — must succeed
2. Navigate Storybook to verify all links work and patterns appear in correct categories
3. `npm run typecheck` — must succeed (if applicable)
4. Cross-reference audit: no references point to old locations
