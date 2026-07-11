---
title: "Cross-surface link cleanup: ComponentRef rewrite + stacked-notes guard"
status: "proposed"
kind: "exec-spec"
created: "2026-05"
area: "pattern-site"
follows: "plans/completed/2026-05-workspace-split.md"
---

# Cross-surface link cleanup

A follow-up to the workspace split. Migrated MDX in `apps/patterns/src/content/patterns/` still uses the old Storybook hyphenated-slug link format (`/patterns/primitives-badge`, `/patterns/actions-sensemaking-tag`). At runtime, the stacked-notes click handler intercepts any in-pane `/patterns/...` href without validating that the target exists, so these links silently route into a stacked-notes pane that then fails to fetch. The user-visible bug: `[Badge](/patterns/primitives-badge)` produces `…/tag?stackedNotes=primitives-badge` instead of the Storybook URL.

Two unrelated problems intersect here, and the fix has to address both:

1. *Authoring*: ~206 links across content use Storybook-style flat slugs that don't match the pattern site's directory routes, and some of them point at things that live in Storybook, not on the pattern site at all. Per `.claude/rules/pattern-content.md`, component references should be `<ComponentRef id="…">` and pattern-to-pattern links should be canonical paths like `/patterns/actions/sense-making/tag`.

2. *Runtime*: `stack-store.ts` intercepts all `/patterns/...` in-pane clicks unconditionally (`apps/patterns/src/lib/stack-store.ts:140`). It has no slug allowlist and no fallback on fetch failure beyond marking the pane `status: 'error'`. A typo silently becomes a broken stacked pane.

The goal is to fix the badge case the user reported, and prevent the entire class from recurring: misspelled or unmigrated slugs should fall through to normal navigation (or refuse to intercept) rather than landing in a broken stacked-notes state.

## Scope

- Full sweep of all ~206 broken hyphenated `/patterns/...` links in `apps/patterns/src/content/patterns/`. Split per-link into:
  - `<ComponentRef id="…">Name</ComponentRef>` when the target is a Storybook component
  - `[Name](/patterns/<dir>/<file>)` when the target is an existing pattern-site entry, with the slug derived from the actual content directory
  - removal or TODO comment when the target has no migration counterpart yet
- Defensive guard in the stacked-notes interceptor: only intercept links whose slug is in a build-time-generated manifest of valid pattern slugs. Misses fall through to normal navigation, where Astro produces a real 404 the author can see.
- Update `.claude/rules/pattern-content.md` only if the rewrite reveals a gap in the rule (e.g. a missing convention for absent-from-pattern-site targets).

Out of scope:

- Rewriting Storybook → pattern-site links (the other direction). Those are listed in `plans/completed/2026-05-workspace-split.md` Phase D tail as a separate task.
- Authoring missing pattern pages (foundations/material, etc.). Where a link's target has no counterpart, the plan records it but does not write the content.
- Changing the stacked-notes UX or routing.
- Migrating any further MDX out of Storybook.

## Mechanism

### Runtime guard (stack-store)

The pattern-site already has full knowledge of valid slugs at build time via `getCollection('patterns')`. The plan adds one more Astro endpoint or static JSON emit:

- `apps/patterns/src/pages/pattern-slugs.json.ts` (Astro static endpoint): emits `{ slugs: string[] }` from `getCollection('patterns')` mapped over `entry.id`.
- `apps/patterns/src/lib/stack-store.ts`: import the JSON at module load (Vite resolves it statically; no runtime fetch needed). The capture-phase click handler at line 140 checks the extracted `targetSlug` against the set. If not present, return without calling `preventDefault()` and without `useStackStore.push()` — the click then proceeds through Astro's `ClientRouter` and yields a normal 404 if the route truly doesn't exist.

This is the minimum mechanism that makes typos visible. It does not paper over content bugs; it just stops them from silently producing the wrong runtime behaviour.

Alternative considered: validate the slug on the server (e.g. only emit `<a data-pattern>` for known slugs in a remark/rehype plugin, intercept by data-attribute). Stronger guarantee, but it shifts the boundary into the MDX pipeline and complicates how authors write links. The runtime allowlist is the lighter change and is reversible.

### Authoring sweep (file-by-file)

No codemod. Each file is read in full, each broken link is resolved by a deliberate authoring decision. The slug map and the component allowlist are tools the author uses, not a script that rewrites silently.

Per the Phase A and Phase D learnings of the workspace-split plan, mechanical rewrites of pattern prose risk losing nuance — particularly where a link originally meant a Storybook component but the author intended the *language entry* of a quality or foundation. File-by-file lets these be caught.

Working procedure per file:

1. Open the file; locate all hyphenated `/patterns/...` links.
2. For each link, decide the target's surface:
   - Storybook component (anything currently in `packages/components/src/stories/`): rewrite to `<ComponentRef id="<existing-slug>">Name</ComponentRef>`. Confirm the Storybook docs URL resolves by opening it once per *unique component*, not per occurrence.
   - Pattern-site entry (already migrated to `apps/patterns/src/content/patterns/`): rewrite to the canonical path. Confirm the path against the file tree.
   - Neither (unmigrated foundations/materials, per workspace-split Phase D tail): leave a `{/* TODO: cross-surface ref to <X> once migrated */}` MDX comment and drop the link from prose, or convert to plain text. Do not invent a target.
3. While in the file, verify the surrounding prose still reads correctly after rewrites. A link that was load-bearing for a sentence may need rewording when the target changes surface.

The rewrite is also a chance to enforce the design-repertoire-voice rule from `.claude/rules/pattern-content.md` — but only where the link rewrite already requires touching the sentence. Don't broaden the edit.

### Ordering

1. Runtime guard first. With the guard live, the broken links surface as visible 404s in dev, which makes the authoring sweep self-checking (open the page, click each link, follow up on each failure).
2. Then the file-by-file sweep, in some sensible order (probably `actions/`, then `operations/`, then `activities/`, then `qualities/`, then `foundations/`, since that's roughly the order of inbound-link density).

## Critical files

- `apps/patterns/src/lib/stack-store.ts:122-150` — capture-phase click handler. Add the slug-set check on line 140.
- `apps/patterns/src/pages/pattern-slugs.json.ts` — new file; static endpoint emitting valid slugs.
- `apps/patterns/src/components/ComponentRef.tsx` — already implements the Storybook URL mapping; no change.
- `apps/patterns/src/pages/patterns/[...slug].astro:29` — `ComponentRef` is already globally injected into MDX via the `components` prop; no change.
- `apps/patterns/src/content/patterns/**/*.mdx` — the authoring sweep target. ~206 link occurrences across the tree per the audit.
- `packages/components/src/stories/**/*.stories.tsx` — read-only reference for confirming Storybook slugs (`primitives-badge`, etc.).
- `.claude/rules/pattern-content.md` — already states the conventions; revisit if the sweep reveals a missing rule.

## Verification

1. *Guard works without breaking valid stacked notes.*
   - Start the pattern site (`npm run dev` in `apps/patterns/`).
   - On a page with a stacked-notes-eligible link to an existing pattern (any canonical-path link), click it; confirm it stacks as before (URL gains `?stackedNotes=…`, pane renders).
   - On the same page, manually add a `[Broken](/patterns/does-not-exist)` link in dev; click it; confirm normal navigation occurs and Astro's 404 page renders, not a broken stacked pane.
2. *Original bug fixed.*
   - In `apps/patterns/src/content/patterns/actions/sense-making/tag.mdx`, the Badge link resolves to `http://localhost:6006/?path=/docs/primitives-badge--docs` and opens in a new tab.
3. *Sweep coverage.*
   - `rg '\[[^\]]+\]\(/patterns/[a-z]+-[a-z]+' apps/patterns/src/content/patterns/` returns zero matches when the sweep is complete (hyphenated old-style slugs gone).
   - The exception is any TODO-commented-out link, which doesn't match the regex.
4. *Storybook still resolves.*
   - With both surfaces running, click a sample of rewritten `<ComponentRef>` links across categories (primitive, atom, molecule if any) and confirm each opens the right Storybook page.
5. *Build clean.*
   - `npm run build` in `apps/patterns/` — no MDX or routing errors.
   - `npm run check` (if present) — no broken-link warnings.

## Risks

- *Hidden semantic shifts in the sweep.* The hyphenated slugs sometimes point at things that don't have a clean new-surface counterpart (e.g. a quality entry that's only partly migrated). The file-by-file approach catches these; the codemod alternative would have silently rewritten them. Risk is bounded by the procedure, not removed — the author has to actually look.
- *Slug-manifest staleness.* The static JSON endpoint emits at build time. If `npm run dev` doesn't re-emit on content changes, an author adding a new pattern file would see their link incorrectly fall through. Mitigation: confirm Astro re-evaluates the endpoint on content change during dev (it should, since `getCollection` is reactive in the dev server). If not, fall back to importing `getCollection` results at module level — same effect.
- *Stacked-notes interaction surface.* Adding the allowlist is the lightest possible defensive change, but it does mean the interceptor now has a dependency on the manifest. Keep the dependency one-way: stack-store imports from the manifest endpoint, not vice versa.

## After

This plan does not unblock or block the workspace-split plan's Phase D tail items (unmigrated foundations, Storybook → pattern-site link rewrites, cross-surface scheme establishment). Those are pursued independently. However, completing this sweep will surface in the broken-link manifest exactly which inbound prose references are still waiting on those items, which is useful input when prioritising them.

Once approved, copy this plan to `plans/active/2026-05-cross-surface-links.md` per the project's plans-location convention.
