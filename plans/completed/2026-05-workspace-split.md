---
title: "Workspace split: components package and pattern site"
status: "completed"
kind: "exec-spec"
created: "2026-05"
last_reviewed: "2026-05-15"
area: "architecture"
promoted_to: "docs/specs/workspace-layout.md, docs/specs/pattern-site.md, docs/specs/pattern-role-model.md, docs/specs/storybook-taxonomy.md"
superseded_by: ""
---
# Workspace split: components package and pattern site

A plan to split the repository into two npm workspaces — one for the component library and its Storybook surface, one for the pattern language (graph, markdown, language vocabulary) and its dedicated site. The cut is by `role:` metadata, not by folder. `role:component` material stays in Storybook; `role:pattern` and `role:umbrella` material, together with `docs/language/`, the graph extractor, and the pattern site, become a second workspace. `role:quality` and `role:foundation` are *bilingual*: their language entries live in the pattern site, their implementation substrate (CSS tokens, type scale, modality CSS, any quality-expressing classes) lives in the components package, and pattern pages reference the substrate through the same cross-surface mechanism used for pattern → component references.

## Context

[ARCHITECTURE.md](../../ARCHITECTURE.md) names a *dual-projection tension*: components organised compositionally, stories organised experientially. Today Storybook is the surface for both jobs, which pulls its taxonomy and tooling in opposite directions. [docs/language/pattern-definition.md](../../docs/language/pattern-definition.md) says most components are not patterns, and the role-metadata plan ([2026-05-role-metadata.md](2026-05-role-metadata.md)) makes that distinction legible in metadata. This plan makes it physical.

The split is *into two workspaces, not two repos*. Two repos would force every component change to publish or `npm link` before the pattern site could consume it, and the project's research-driven shape (per [AGENTS.md](../../AGENTS.md)'s "design research project first") wants the pattern–component co-evolution loop to stay one commit, not a release dance.

The pattern site is *its own runtime*, not a Storybook section. The graph is graph-first navigation, the authoring shape is markdown with selective MDX, and the metadata layer is content-collection-shaped rather than `<Meta>`-tag-shaped. The extractor's pattern-semantics core — typed links via `## Related patterns` headers, Mermaid decision-tree parsing, `.profile.ts` sidecars, role inference — carries over unchanged. Only the Storybook-specific assumptions in [scripts/extract-graph-data.ts](../../scripts/extract-graph-data.ts) (the `<Meta title=...>` regex, the `../?path=/docs/<id>--docs` URL format, the `.stories.tsx` fallback) get replaced.

## Two framings

Mirroring the framings that shape [2026-05-role-metadata.md](2026-05-role-metadata.md):

1. *Workspaces, not separate repos.* The boundary is an API boundary inside one repo. Patterns import only what the components package exports; deps split along package lines; co-evolution stays a one-commit loop. Two-repo separation is rejected, not deferred — the project loses too much research-environment integration for too little gain.

2. *Migrate, don't rewrite.* The extractor's pattern-semantics core is the canonical authoring engine and stays. The pattern-site runtime change is a swap of surfaces around that core, not a redesign of the data model. The graph keeps its edge types, role vocabulary, and decision-tree semantics; pages keep their MDX shape with frontmatter replacing `<Meta>` tags.

## Scope

In scope:

- Restructure the repo into npm workspaces: `packages/components/`, `apps/patterns/`, and `apps/server/`.
- Bootstrap a pattern-site runtime (Astro) in `apps/patterns/`.
- Migrate non-component MDX out of `src/stories/` into `apps/patterns/`.
- Conduct the move/mechanism split audit (folded with the role-coverage survey) and execute the resulting splits during Phase D.
- Establish Foundations and Qualities as bilingual: language entry in the pattern site, implementation substrate in the components package.
- Decide on a home for cross-cutting material (`docs/language/`, `references/`, `research/`, `plans/`) — likely the patterns package, possibly top-level shared.
- Update `extract-graph-data.ts` to read from the new source path with frontmatter rather than `<Meta>` tags, and to emit pattern-site routes rather than Storybook URLs.
- Update [AGENTS.md](../../AGENTS.md), [ARCHITECTURE.md](../../ARCHITECTURE.md), and `.claude/rules/*` to describe the new layout.

Out of scope:

- Publishing the components package to npm. The package boundary is workspace-internal; external publishing is a separate decision.
- Two-repo separation. Explicitly rejected.
- Replacing Storybook for components.
- Quartz, Obsidian-vault rendering, or any markdown-only pattern site. The existing `<MermaidDiagram>` embeddings and live component examples make MDX-or-equivalent a hard requirement.
- Changing the graph's edge vocabulary or role taxonomy. Those are the property of the role-metadata and typed-edges plans.
- Server-side concerns (`server/` Express app). Stays where it is unless a clear reason to move emerges.

## Mechanism: npm workspaces

The repo becomes a workspace root with one library package and two runnable apps, following the `packages/` (libraries) + `apps/` (runtimes) convention:

- `packages/components/` — current `src/components/`, `src/styles/`, the component-bound parts of `src/services/`, design tokens, Storybook config, and the components-only deps (Tldraw, Tiptap, the heavier d3 set if components want them). Owns the existing Storybook on port 6006. Exports a public API via its `package.json` `exports` field; consumers import only what's exported.

- `apps/patterns/` — pattern MDX, the Astro pattern-site app, the graph extractor, `docs/language/` (most likely), and pattern-site-only deps (Astro, Pagefind, remark/rehype plugins). Depends on `@pattern-plgrnd/components` as a workspace dependency for live examples.

- `apps/server/` — the existing Express backend, moved from its current root-level `server/` home. No behavioral change; the move makes the workspace layout symmetric and gives the server a formal package boundary.

The `packages/` vs `apps/` distinction encodes what's actually different: `packages/components` is a library you import from; `apps/patterns` and `apps/server` are runtimes you run. Root-level `workspaces: ["packages/*", "apps/*"]`.

Top-level shared material lives where it naturally belongs: `references/` and `research/` likely follow `docs/language/` into `apps/patterns/`, because their primary consumer is pattern-language work. `plans/` (this file included) is harder — it serves all workspaces and may stay at the repo root.

### Considered alternatives

- *Sibling top-level dirs (mechanism A from the discussion).* Cheaper migration, but no formal boundary; bumping a heavy component dep affects the pattern site even when it shouldn't. Viable as an *interim* step if the workspace restructure feels too heavy for one move — the migration order in Phase B can take it through the sibling-dir shape on the way to workspaces.
- *All workspaces under `packages/`.* Uniform but `packages/server/` is an awkward name for an Express backend; moves existing structure for naming reasons only.
- *Two repos (mechanism C from the discussion).* Rejected. Authoring-loop cost outweighs boundary strength for a single-author research project; cross-cutting material (docs, references, plans) doesn't split cleanly.

## Mechanism: Astro for the pattern site

The pattern site runs on Astro. Selected for:

- *Vite-native.* Matches the workspace's existing Vite tooling (Storybook 10 is Vite, components use Vite). One build-tool family across the workspace simplifies shared config.
- *MDX as first-class file type.* Existing `<MermaidDiagram chart={\`...\`}/>` and other in-page embeddings transfer with minor frontmatter changes.
- *Islands architecture.* Selective hydration of Lit and React on the same page; both renderers are officially supported. The existing [PatternGraph.tsx](../../src/components/PatternGraph.tsx) drops in as a React island.
- *Content collections with zod-validated schemas.* `zod` is already a dep. Pattern frontmatter can be schema-validated, replacing several regex-based metadata reads in the extractor with a typed source of truth.
- *Pagefind for search.* Static index, no server, one-line integration. Existing `fuse.js` remains available for any custom search needs (e.g. typed-link-aware search).

### Considered alternatives

- *Quartz / Obsidian-vault rendering.* Tempting for the built-in graph view, backlinks, and wikilinks. Rejected because Quartz is markdown-only (no MDX), uses esbuild rather than Vite, and would force `<MermaidDiagram>` and other in-page React/Lit embeddings to be rewritten as Quartz preact components. Tooling drift cost outweighs the digital-garden conveniences.
- *VitePress.* Vue-flavored. Adds a third frontend framework to a workspace that already has Lit and React. Rejected.
- *Next.js / Nextra.* Overweight for a small docs site. Brings React-only and server-component idioms that don't match the project's Lit-first stance. Rejected.
- *Hand-rolled Vite.* Maximum control, but rebuilds what Astro provides (MDX, content collections, routing, view transitions, search integration). Reserved as a fallback if Astro's Lit renderer turns out to be a poor fit during Phase A's prototype.

## Phase A — Pre-flight audit

Before touching any structure, answer the questions that decide what Phase B can be:

### Role coverage and move/mechanism split

> **Update (thinking moved on):** the component/pattern boundary framing has since evolved — [docs/language/pattern-and-form.md](../../docs/language/pattern-and-form.md) is now canonical for where the line falls. The move/mechanism verdicts below were the working model at audit time; read them as a snapshot. One concrete consequence: Toast, listed under "pure-move entries" below as a re-tag-in-place, is settled in [docs/specs/pattern-role-model.md](../../docs/specs/pattern-role-model.md) to migrate under the move-named slug `transient-feedback.mdx` — *not* as a re-tagged `Toast`. It stays `role:component` in Storybook until that migration happens.

A single walk of the corpus, three verdicts per entry. The walk produces the audit deliverable for both this plan and the role-metadata plan's Phase A survey.

- *Role.* Is every page in `src/stories/` either tagged with `role:*` or in a folder that folder-infers a role? Resolve any unset entries.
- *Move/mechanism split.* Does the page document a composite control whose interaction contract earns a move-level pattern? If yes, propose the move name (named by the move, not the widget) and identify which content goes to the move side (situation, forces, consequences, edges) versus the mechanism side (props, states, anatomy, keyboard, ARIA). Pure-move entries (Toast, Undo, Inline confirmation) and pure-mechanism entries (Input, basic Checkbox) skip this verdict.
- *AT altitude after split.* For entries currently in the Operations folder, confirm the altitude that survives the migration. Pure-move entries keep their Operations altitude in the pattern site. Pure-mechanism entries leave the AT cascade entirely (they become components, organised atomically). Entries that split: the move portion's altitude is whatever fits its scope (often Operations or Actions); the mechanism portion leaves the cascade.

Ambiguous entries that can't be classified after the audit are blockers — they must have a verdict before Phase D moves them.

### Cross-cutting material

For each of `docs/language/`, `docs/specs/`, `docs/research/`, `docs/quality/`, `docs/project/`, `references/`, `research/`, `plans/`, decide whether it belongs to the patterns package, the components package, or stays at the workspace root. The default is *patterns package* for anything whose primary consumer is pattern-language work, and *workspace root* for anything that serves both (build configs, this plan).

### Extractor coupling audit

Walk [scripts/extract-graph-data.ts](../../scripts/extract-graph-data.ts) and list every assumption that's Storybook-specific:

- `<Meta>` tag parsing ([scripts/extract-graph-data.ts:228](../../scripts/extract-graph-data.ts#L228))
- Storybook URL format ([scripts/extract-graph-data.ts:294](../../scripts/extract-graph-data.ts#L294))
- `.stories.tsx` fallback metadata extraction ([scripts/extract-graph-data.ts:892](../../scripts/extract-graph-data.ts#L892))
- The `Overview` skip rule for non-decision-tree pages ([scripts/extract-graph-data.ts:841](../../scripts/extract-graph-data.ts#L841))

For each, decide whether Phase E *replaces* (e.g. frontmatter for `<Meta>`) or *removes* (e.g. drop the `.stories.tsx` fallback once all metadata lives in MDX frontmatter).

### Data model migration path

The graph data model has a three-stage arc — not a binary choice. This plan lands at stage 2 and signposts stage 3 as future work:

1. *Combined data (today).* `pattern-graph.json` contains both `role:pattern` and `role:component` nodes, connected via `enables` and friends. The graph is one structure spanning the language and its implementation substrate.

2. *Combined data with filtered view (this plan's landing point).* The extractor's output shape stays the same: components remain nodes, the existing edge vocabulary is preserved, the typed-edges machinery is undisturbed. The pattern site renders only the pattern half by default. Components are *in the data* (so the information stays available when the project wants it — e.g. for cross-surface tooling, for resolving pattern → component references, for future linked-data extraction) and *out of the default view* (so the rendered pattern language reads as Alexander-shaped: configurational moves with materials referenced but not graphed). The conceptual stance is enforced at the rendering layer rather than the data model.

3. *Linked datasets (named end state, future work).* `pattern-graph.json` carries the language only (patterns, qualities, foundations as language entries, umbrellas, and edges between them). `component-manifest.json` (or similar) carries the catalogue — components, their props, states, anatomy, Storybook URLs. Pattern markdown references components through a typed cross-reference scheme (e.g. `@components/button`), resolved against the manifest. The typed-edges plan's Phase C question (split `enables` from `realised_by` / `implements_via`) is structurally cleaner under this model: both become cross-references between datasets rather than edges within one graph. Migration to linked datasets is *not* in this plan's scope — it's signposted so future work has a target shape.

The migration target is stage 2. The extractor implementation in Phase E reflects this: component nodes continue to be emitted; the pattern site is what knows to filter them out. Phase F's promotion to specs can establish the cross-surface reference scheme (used here for components referenced from pattern prose, and for bilingual Foundations/Qualities); that scheme is the bridge that eventually carries stage 3.

### Astro Lit-renderer prototype

A small Astro proof-of-concept that:

- Imports a Lit component from a sibling local package
- Renders it on a page using `<lit:render>` or the Lit integration
- Verifies that the registry pattern in [src/components/register-all.ts](../../src/components/register-all.ts) works inside Astro's island boundaries
- Verifies that view transitions don't break custom-element registration

If the prototype reveals serious friction with the registry pattern, Phase A loops back to mechanism selection. The fallback is hand-rolled Vite with manual MDX integration.

### Files modified

No code changes. Output: a Phase-A audit note at `plans/active/2026-05-workspace-split-audit.md` capturing role coverage, the move/mechanism split verdicts (with proposed move names per split entry), AT-altitude verdicts, cross-cutting verdicts, extractor coupling list, and the Astro prototype outcome. The audit note doubles as the role-metadata plan's Phase A survey deliverable.

## Phase B — Workspace restructure

Only after Phase A closes cleanly. The mechanical move; no behavior change yet.

- Create `packages/components/`, `apps/patterns/`, and `apps/server/` skeletons.
- Move existing `src/components/`, `src/styles/`, `src/services/` (component-bound parts), `src/tokens/`, `.storybook/`, and Storybook stories that are `role:component` into `packages/components/`.
- Move `src/services/` parts that are pattern-bound, `src/types/`, `src/utility/`, `src/hooks/` to the package they primarily serve, or to a top-level `shared/` if used by both.
- *Shared fixture data — resolved as a `shared/` workspace package.* The former `src/stories/data/` (generic sample domain: users, projects, documents, tasks, transactions, products, plus domain types and helpers) is genuinely *cross-surface*, not package-internal. It has three classes of consumer: ~24 component-runtime files under `components/`/`services/`; the pattern *demos* in `packages/components/src/demos/`, which are themselves dual-surface (backing both 4 Storybook stories and ~10 `apps/patterns` pattern pages via the `@pkg` alias); and a handful of stories directly. Because the demos render on the Astro site, the data reaches `apps/patterns` transitively — so it is "used by both" and was promoted to a top-level **`shared/`** workspace package (`@pattern-plgrnd/shared`, content under `shared/data/`). It could not move *into* `apps/patterns` (the 24 component-runtime consumers would invert the package boundary). Wiring follows the repo's established alias-to-raw-source convention rather than `exports`/node_modules: a `@shared/*` alias is registered in `packages/components/tsconfig.json`, the Storybook `viteFinal` block, `apps/patterns/tsconfig.json`, and `astro.config.mjs`; `shared` is added to the root `workspaces` array. Imports were normalized to `@shared/data` (barrel) and `@shared/data/<file>` (subpaths); the package's own internal imports stay relative so it is self-contained. Verified against the pre-move tree: components `tsc --noEmit` unchanged at the project baseline, zero new `TS2307`, and `apps/patterns` resolves `@shared` (its only `TS2307`s are the pre-existing `astro:content` and `pattern-profile` ones). *Open follow-on:* the demos themselves are dual-surface and still live in `packages/components/`; whether they should move to `apps/patterns` is a separate, larger question (it would also pull the demo-only slice of this data with it).
- Set up root `package.json` with workspaces configured for `packages/*`.
- Hoist shared dev deps (TypeScript, ESLint, Stylelint) to root; keep package-specific deps in their packages.
- Decide npm vs pnpm. Default: stay on npm unless workspace overhead is painful — switching is reversible.
- Update tsconfig to use project references between packages.
- Update Vite configs per package.
- Verify Storybook still runs on port 6006 from `packages/components/`.

### Files modified

- Root `package.json` (workspaces `["packages/*", "apps/*"]`, hoisted dev deps)
- `packages/components/package.json` (component deps, Storybook scripts)
- `apps/patterns/package.json` (placeholder, deps added in Phase C)
- `apps/server/package.json` (moved from `server/package.json`; scripts unchanged)
- `tsconfig.json` (root references, per-package project tsconfigs)
- `vite.config.ts` (split or per-package)
- `.storybook/` (move into `packages/components/`)
- All `src/**` → `packages/components/src/**` for component-roled files
- `.claude/rules/*` (path globs updated)

## Phase C — Pattern-site bootstrap

The pattern-site app gets its skeleton, but no pattern content has moved yet. This lets the Astro setup mature against a sample page or two without the migration's full weight.

- Astro app in `packages/patterns/`, default port (4321 unless conflict).
- Content collections schema for patterns: typed frontmatter with `role`, `activity-level`, `lifecycle-stage`, `atomic-category`, `mediation`, `tags`. Use `zod` schemas; mirror the field set the extractor currently reads.
- One or two pattern pages migrated by hand as the schema-driving examples (likely a `role:pattern` page and a `role:umbrella` page).
- [PatternGraph.tsx](../../src/components/PatternGraph.tsx) imported and rendered on a `/graph` page as a React island. Decide in this phase whether the graph also appears persistently (side panel) or only on its own page.
- Pagefind wired up against the early sample content.
- Mermaid rendering set up so existing decision-tree diagrams continue to display. Either keep the existing `<MermaidDiagram>` React component (Astro can render React islands), or replace with Astro's preferred Mermaid integration.
- Inter-page link format decided: wikilinks (`[[id]]`) processed by a remark plugin, or a `pattern:` URL scheme, or plain relative routes. Pick one; this is what Phase D's migration will use everywhere.

### Files modified

- `apps/patterns/astro.config.mjs`
- `apps/patterns/src/content/config.ts` (collection schemas)
- `apps/patterns/src/pages/` (initial routes)
- `apps/patterns/src/components/` (the React `PatternGraph` re-exported as an island)

## Phase D — Pattern MDX migration

The bulk move. Every non-component page leaves `src/stories/` and lands in `apps/patterns/src/content/patterns/`. Mechanical for most entries, with three exceptions: move/mechanism splits, bilingual Foundations/Qualities, and pages that didn't have MDX.

> **Update (thinking moved on):** the content directory is *flat* — every entry lives directly under `apps/patterns/src/content/patterns/` with no classification subfolders, and the filename stem *is* the slug, route, and graph node ID (commit c87c44b; see [docs/specs/pattern-site.md](../../docs/specs/pattern-site.md)). Classification moved into frontmatter *facets* (`group`, `activityLevel`, `domain`), not folders. Wherever this phase says `<path>/<name>.mdx`, read `<name>.mdx`.

- For each MDX page with `role:pattern`, `role:umbrella`:
  - Move file from `src/stories/<path>/<name>.mdx` to the flat `apps/patterns/src/content/patterns/<name>.mdx` (or `.md` if no MDX features used).
  - Transform `<Meta of={...} tags={[...]} />` to YAML frontmatter. Keep all tag values; tags like `role:pattern`, `activity-level:action`, `atomic:pattern` map to typed frontmatter fields.
  - Rewrite inter-page links from `../?path=/docs/<id>--docs` to the chosen link format from Phase C.
  - Co-locate `.profile.ts` sidecars; keep the same filename relationship the extractor uses ([scripts/extract-graph-data.ts:162](../../scripts/extract-graph-data.ts#L162)).
  - Co-located `.stories.tsx` files: for pages that had no MDX (extracted-from-stories-only metadata), generate an `.md` shell that hosts the frontmatter. If the page's previews are essential, decide page-by-page whether to migrate them as MDX with React/Lit embeds, or leave a Storybook backreference.
- For each `role:quality` and `role:foundation` page (bilingual):
  - The language entry — what the quality or foundation *is* as a design concept, with edges to patterns that enact it — moves to `apps/patterns/src/content/`.
  - The implementation substrate (CSS tokens, type scale, modality CSS, quality-expressing classes, design-token JSON) stays in or moves to `packages/components/`. Where the current MDX page mixes both, split into a pattern-site page that links to the components-side Storybook documentation for the substrate.
  - The cross-reference from the language entry to the substrate uses the same scheme as pattern → component references.
- For each entry flagged by the Phase A audit for move/mechanism split:
  - The move portion is authored as a new pattern-site entry under the move-level name from the audit (e.g. "Bounded choice" rather than "Combobox"). Pull the situational, forces, consequences, and edge content from the original page.
  - The mechanism portion stays as a component in `packages/components/` under the existing widget name (e.g. "Combobox"). Keep the props, states, anatomy, keyboard model, ARIA content.
  - The original page becomes a stub or is removed; existing inter-page links that pointed to the original are rewritten to point at the move-level entry (the language graph's traversal target), with prose-level mentions of the widget linking to its component page via the cross-reference scheme.

Component-roled pages stay where they are in `packages/components/`, with whatever Storybook tooling they already use. Under stage 2 of the data model migration (combined data with filtered view), the components package continues to feed the extractor; no metadata manifest is needed yet.

### Files modified

- All `role:pattern` and `role:umbrella` MDX files (moved, frontmatter rewritten, links rewritten)
- `role:quality` and `role:foundation` MDX files (language entries moved to pattern site; substrate stays in or moves to components package)
- New pattern-site entries for moves extracted from split entries (e.g. `bounded-choice.mdx` for the combobox split — done, commit b0f7052); component pages for the corresponding mechanism portions stay in `packages/components/`
- `.profile.ts` sidecars: moved with the page where the page moves wholesale; for a move/mechanism split the profile is *re-authored on the move side* and the mechanism's old sidecar removed (combobox: `Combobox.profile.ts` deleted, `bounded-choice.profile.ts` added)
- Storybook tree (entries for moved pages removed; component pages for split-mechanism portions kept)

## Phase E — Extractor migration

Point [scripts/extract-graph-data.ts](../../scripts/extract-graph-data.ts) at the new source. Replace Storybook-specific assumptions per the Phase A audit.

- New source path: walk `apps/patterns/src/content/patterns/` instead of `src/stories/`.
- Frontmatter reading replaces `<Meta>` regex. The metadata is already validated by the Astro content-collection schema; the extractor reads the same parsed frontmatter.
- New link format: replace the `LINK_PATTERN` regex ([scripts/extract-graph-data.ts:294](../../scripts/extract-graph-data.ts#L294)) with the format chosen in Phase C.
- New output path: `pattern-graph.json` lives wherever the pattern site reads it from. Probably `apps/patterns/src/data/pattern-graph.json`.
- Output URL format: links in the emitted graph nodes point at pattern-site routes, not Storybook docs URLs.
- Decision-tree extraction, typed-link parsing, role resolution, profile sidecars: unchanged.
- Component nodes: continue to be emitted under stage 2 of the data model migration. The pattern site filters them out of the default view; the data remains available for tooling and for the future linked-datasets stage.
- `scripts/` directory: stays at workspace root if used by both workspaces; moves into `apps/patterns/` if not. Default: root, since `extract-graph-data.ts` reads from both workspaces (patterns content for nodes, components package for the component portion of the combined dataset).

### Verification

- The new `pattern-graph.json` matches the old one in node count, edge count, and edge type breakdown, modulo the move/mechanism splits (each split entry contributes a new pattern-side node and renames/retires the old node; the mechanism-side node ID may or may not be retained depending on naming choices in Phase D).
- Spot-check ten edges across the pattern → pattern, pattern → quality, decision-tree, and umbrella-surveys cases. Labels and `extractedFrom` markers should be identical.
- The Astro pattern site renders pages correctly from the new content; all inter-page links resolve; cross-surface references to components resolve to Storybook URLs.
- A pattern that previously had a `recommends` edge to a now-split entry (e.g. Deletion's decision-tree recommending Inline confirmation, Modal confirmation) has its edge targets remapped to the new IDs.

### Files modified

- `scripts/extract-graph-data.ts`
- `apps/patterns/src/data/pattern-graph.json` (regenerated)
- `apps/patterns/src/data/activity-levels.json` (regenerated)

## Phase F — Cleanup and documentation

Once both surfaces work and the graph is stable:

- Remove the dead Storybook taxonomy folders that no longer hold any role-component content. ✅ *Partial — see Phase D tail note below.*
- Update [AGENTS.md](../../AGENTS.md), [ARCHITECTURE.md](../../ARCHITECTURE.md), [docs/specs/storybook-taxonomy.md](../../docs/specs/storybook-taxonomy.md), and `.claude/rules/*` to describe the workspace layout. ✅ *Done (`.claude/rules/*` path globs require manual edit or explicit permission grant).*
- Promote any settled decisions from this plan into `docs/specs/`. ✅ *Done: workspace-layout.md, pattern-site.md, pattern-role-model.md, storybook-taxonomy.md updated.*
- Mark this plan completed; set `promoted_to` to the new specs. ✅
- Update the role-metadata plan: its `role:control` open question is closed in the negative by this plan's resolution. Its Phase C (disentangle `enables`) becomes structurally easier once the data model migrates to linked datasets — but the migration to stage 3 is its own future plan, not this one's residue. ✅ *Role-metadata plan is already in plans/completed/.*

### Phase D tail (residue, not blocking)

Three items from Phase D remain unfinished and carry over as independent tasks:

1. *Unmigrated foundations.* `foundations/Data.mdx`, `foundations/Interaction.mdx`, `foundations/Localization.mdx`, and the entire `foundations/material/` subtree (Color, Iconography, Layout, Motion, Typography) have no counterparts in `apps/patterns/src/content/patterns/foundations/`. They remain in `packages/components/src/stories/foundations/` until authoring effort migrates them.

2. *Storybook folder cleanup.* `packages/components/src/stories/qualities/` and `packages/components/src/stories/foundations/` retain their `.mdx` files because component pages in `operations/`, `actions/`, and `activities/` contain inbound links to those pages. Removing the pages before those links are rewritten would break Storybook cross-references. **The gate (item 3) is now established**, so this is unblocked: what remains is rewriting the inbound links to use `PatternRef` and then removing the pages.

3. *Cross-surface reference scheme.* ✅ **Established.** The `PatternRef` React component ([packages/components/src/stories/utils/PatternRef.tsx](../../packages/components/src/stories/utils/PatternRef.tsx)) emits `{STORYBOOK_PATTERN_SITE_URL}/patterns/<slug>` links; 48 stories MDX files already use it. The gate for item 2 above is therefore open.
## Decomposition: worked examples and learnings

The move/mechanism boundary ([docs/language/pattern-and-form.md](../../docs/language/pattern-and-form.md); the decomposition rule and fission signals in [docs/specs/pattern-role-model.md](../../docs/specs/pattern-role-model.md)) is applied one page at a time. This section collects worked decompositions and the transferable lessons. When the lessons stabilise across more examples, promote the *rules* into `pattern-role-model.md` and keep the *narratives* here.

### Worked examples

- *Combobox → Bounded choice (move) + Combobox (mechanism)* — commit b0f7052. The move landed as *Bounded choice* ([`apps/patterns/src/content/patterns/bounded-choice.mdx`](../../apps/patterns/src/content/patterns/bounded-choice.mdx), `role:pattern`, `activityLevel:operation`) — not the speculative "Constrained selection". Combobox stayed a `role:component` page in `packages/components/src/stories/operations/`. Two details worth carrying to the next split: (1) the generative profile follows the move, not the mechanism — `Combobox.profile.ts` was deleted and a new `bounded-choice.profile.ts` authored on the move side (the substrate's profile didn't survive as a `.profile.ts`); (2) the mechanism page's outbound section flipped from "Applied in" to "Used by", with the lead link `[Bounded choice](/patterns/bounded-choice) — this control's job`. The split also clarified the move hierarchy: Selection (general designation) → Bounded choice (value must come from the set) → Combobox/Select/Radio (controls sized to set cardinality).
- *Form → Form (umbrella) + Form (component) + a new sibling move* — this plan; executed in the working tree, not yet committed. Form arrived as *two* near-duplicate `role:pattern` pages (a migration leftover beside a live `Form.stories.tsx`, plus the migrated twin) and *no* component page. The first territory walk read every generative chunk as already having a neighbour node (Data entry, Bounded choice, Sections, Progressive disclosure, Wizard, Step-by-step, Formality, Status feedback, Saving), so the verdict was a clean umbrella. A second pass corrected the residue test: the *conversational-forms* chunk had no honest neighbour. A form asked and answered turn by turn, each control rendered inline, is one instance of a broader move that also covers a card to confirm or a chart to read — so that residue earned its own `role:pattern` node, [Inline interface](../../apps/patterns/src/content/patterns/inline-interface.mdx) (`action` / `coordination` — a *sibling* to Form at the same altitude, not a parent), with form-as-conversation framed as its form instance. The split therefore landed as three things, not two: the pattern-side [Form](../../apps/patterns/src/content/patterns/form.mdx) became a `role:umbrella` survey of constituent moves; the mechanism-side became a new `role:component` page ([Form.mdx](../../packages/components/src/stories/actions/application/Form.mdx); `Form.profile.ts` deleted, none re-authored — rule 6); and the conversational seam spun off Inline interface. Four resolutions worth carrying:
  - *Residue can be a generative move, not only a gap.* Where the Combobox split's residue was the move itself and Form's first read found no residue at all, here the leftover chunk was a real move that earned an immediate node. This is the counterpoint to rule 8: a gap you document and defer; a generative move you author.
  - *A spectrum can absorb a would-be sibling.* Dual listbox was *demoted*, not merely linked — `role:pattern` → `role:component`, its standalone pattern page deleted, the control folded into Bounded choice's spectrum as the "lots / multiple" cell.
  - *The set-size spectrum landed as a concrete table* ("Choosing a control" on Bounded choice: binary / few / pack / lots-type-to-narrow × single / multiple), not prose. The Form pages link into it rather than hosting competing trees. The decision-tree second pass still holds (rule 4): the input tree was a *hybrid* (top fork move-routing, lower branches control-routing) and its "free text vs from a set" root drew a false binary across the one continuum `selection.mdx` already owns.
  - *Fieldset got a worked treatment, not just a note.* The component page now carries a *Grouping with fieldset* section (radio-group as the canonical case, composite field as the other, both distinguished from Sections and Grouping) in native markup, plus a deferred TODO to build it as the Form component's sub-mechanism; "composite field" stays a named force until it earns a node (rule 8). And rule 7's owner question is settled: Data entry owns the entry→verification trust loop, and Form's "Forms and AI" section links to it rather than restating it.

### Transferable signals and rules

1. *Signature of a decomposition waiting to happen.* A `role:pattern` page with a live `.stories.tsx`, whose prose is mostly craft (props, states, validation, layout) — especially with a near-duplicate twin across the two surfaces. The mechanism wants a `role:component` home it never received.
2. *Run the residue test before assuming a move exists.* Enumerate the territory's existing neighbour nodes; attribute every chunk of the page to one of them. The residue has three possible homes, not two: (a) this page's own generative core (Combobox → Bounded choice); (b) nothing, making the page an **umbrella** regardless of length; or (c) a move at a *different* node entirely — a sibling the page merely instances (Form's conversational chunk → Inline interface). Beware the false-clean-umbrella: a walk that eagerly matches every chunk to a neighbour misses (c). If a chunk only loosely fits its assigned neighbour, re-run the attribution — a near-match can hide a new move.
3. *Umbrella vs thin-pattern turns on residue, not page size.* A decision tree *inside* the page is a fission signal pointing at umbrella (a tree routes between children). A long page can be an umbrella; a short page can be a real move.
4. *Place decision trees by altitude, and don't fork a continuum.* The seam is altitude, not page. A tree routing between **moves** belongs on the umbrella; one routing between **controls** belongs with the move whose realisations it enumerates (Bounded choice), as a **set-size spectrum**, not a binary tree. Watch for two traps: (a) *hybrid trees* whose top fork is move-routing and whose lower branches are control-routing — split them at the altitude seam (the move fork stays up, the control spectrum goes down); (b) *forking a continuum* — "free text vs from a set" reads as a binary, but combobox and ⌘K straddle it, so a spectrum (scan→type, scaling with set size) represents it honestly where a fork lies. Check the hierarchy before forking: here Data entry *contains* Bounded choice, so they are not sibling branches. `selection.mdx` already owned the continuum — look for an existing home before authoring a new tree.
5. *Bilingual same-name vs rename.* Test: does the name transfer to any valid implementation? A widget name (Combobox) is renamed to the move (Bounded choice). A word that names both the human act and the artifact (Form) stays the same on both surfaces — bilingual like qualities and foundations.
6. *The generative profile follows the move.* Delete the mechanism's `.profile.ts`; author one on the move side. New nuance: when the move side is an **umbrella**, it carries no single generative profile, so the profile is simply deleted (Form), not re-authored (Combobox).
7. *De-duplicate across the seam, name one owner.* Content the split leaves duplicated (Form's "AI-augmented form" vs Data entry's "AI & verification") gets a single owner; the other links to it. Decide the owner explicitly.
8. *Decomposition reveals gaps; it does not oblige you to fill them.* A mechanism gap it surfaces (Fieldset) is documented at the altitude that already works (native markup) and only promoted to new API (a `pp-` element) on concrete need. A residual force (composite field) likewise stays a named force under the "coarsest node that doesn't lie" rule until evidence earns it a node.
9. *Residue can be a move, not only a gap.* The flip side of rule 8. Some residue is craft or substrate you document at the altitude that works and defer (Fieldset → native markup). Some is a configurational move that earns a node immediately (Inline interface). The discriminator is breadth: Fieldset is markup serving one container; Inline interface has its own forces and instances beyond the page that surfaced it (a card to confirm, a chart to read — not just a form). When the residue generalises past its origin, author it.

## Open questions

1. *Where do `docs/language/`, `references/`, and `research/` live?* **Resolved — opposite to the Phase A audit's default.** [docs/specs/workspace-layout.md](../../docs/specs/workspace-layout.md) keeps `docs/`, `plans/`, `references/`, and `scripts/` at the workspace root, *not* inside `apps/patterns/`. The audit defaulted to moving cross-cutting material into the patterns package; that default was overridden in the settled spec. Read the audit (now in `plans/completed/`) as a snapshot, not authority.

2. *What happens to `plans/`?* **Resolved:** stays at the workspace root (per [docs/specs/workspace-layout.md](../../docs/specs/workspace-layout.md), same resolution as question 1).

3. *What happens to `server/`?* Resolved: it moves to `apps/server/`. The `apps/` + `packages/` convention makes the move natural — `server/` is a runtime, not a library, so it belongs alongside `apps/patterns/`.

4. *Plain markdown + directives vs MDX for new pattern authoring.* Astro supports both extensions side-by-side. The conservative default is "MDX where existing pages use it; markdown for new pages unless they need component embeds." A future tighter decision could mandate one shape — likely after pattern volume grows.

5. *Graph as homepage, separate page, or persistent overlay.* Phase C decides. Each has different JS-budget and routing implications. Persistent overlay is the most generative-feeling; separate `/graph` page is the cleanest.

6. *npm vs pnpm.* npm workspaces are workable but pnpm handles them better. The migration cost is small but real. Default: stay on npm; revisit if HMR or hoisting causes pain.

7. *Component-package public API.* Phase B has to decide which paths the components package exports. Today everything in `src/` is reachable by relative import; a workspace boundary forces a verdict. Start narrow (the registered custom elements, the `register-all` entry, the design tokens, the public services); widen as patterns demand.

8. *Cross-surface reference scheme.* **Resolved** (see Phase D tail item 3): the `PatternRef` component resolves a `slug` to a `{STORYBOOK_PATTERN_SITE_URL}/patterns/<slug>` link for the Storybook→pattern-site direction; the pattern→component direction uses Storybook URLs. The original concern about the future linked-datasets cross-reference shape still stands as future work.

9. *Sibling-dirs interim step.* The migration order in Phase B could pass through a sibling-dirs shape (mechanism A) before promoting to workspaces. This is cheaper per step but adds a second restructure. Default: go straight to workspaces unless something during Phase A suggests otherwise.

10. *Bilingual rendering for Foundations and Qualities.* The language entry lives on the pattern site; the substrate lives in components. Phase C decides whether the pattern-site page embeds substrate previews (via the components-package import) or links out to Storybook for them. Embedding is the more integrated experience; linking out is lighter and clearer about the dual surface.

## Research

Before committing Phase B, two focused reads:

- *Astro content collections with Lit islands.* Astro's documentation on the Lit integration and on `client:*` hydration directives, focused on whether the registry pattern in [register-all.ts](../../src/components/register-all.ts) survives island boundaries. The Phase A prototype is the empirical answer; the documentation read is the prior.
- *Pattern-language tooling in adjacent communities.* A brief read of how other pattern libraries handle the catalogue-vs-language distinction structurally (Carbon, Material, OpenUI, plus academic HCI pattern-language tooling per [references/hci-pattern-languages.md](../../references/hci-pattern-languages.md)). The question: are there structural moves these communities made that pre-figure this split, and what did they learn?

The research happens between Phase A and Phase B, per the project's "research before locking in" stance.

## Risks

- *Migration fatigue.* The plan is multi-phase and high-volume in Phase D. Pattern work that lands during the migration window has to choose a side mid-flight. Mitigation: time-box Phase D, keep Phase C's pattern-site bootstrap working with a small sample before unleashing the bulk move.
- *Extractor regression.* Subtle MDX parsing changes (frontmatter vs `<Meta>`, new link format) can shift the graph silently. Mitigation: Phase E's verification step compares old and new graphs node-for-node and edge-for-edge before declaring done.
- *Cross-cutting material limbo.* `docs/language/` belongs to both surfaces conceptually. If Phase A's decision puts it in the patterns package, the components package loses a reference; if at workspace root, it sits outside both packages. Mitigation: pick consciously, document the rationale in the Phase A audit.
- *Move/mechanism split authoring debt.* These splits aren't just file moves — they require pulling apart content that was authored as one page. Some pages will resist a clean split (the move and the mechanism may be intertwined in the prose). Mitigation: the Phase A audit proposes the split per entry; if any entry resists, escalate it to a separate authoring task rather than forcing a split mid-migration.
- *Astro–Storybook Vite-version drift.* Both use Vite, but different majors. Mitigation: pin Vite at the workspace root if needed; accept that Storybook 10's Vite is the constraint.
- *Component public-API ergonomics.* A narrow `exports` field forces patterns to import only what the components package chooses to expose. Mitigation: start narrow but be willing to widen quickly — the boundary is workspace-internal, not semver-bound.
- *Reversal cost.* If Astro turns out wrong, the pattern site can be rebuilt on hand-rolled Vite while the workspace structure stays. If workspaces turn out wrong, the structure flattens back to a single package without the pattern-site work needing to be redone. The compounding risk is small.

## Phase ordering

```
Phase A (audit — gate)
    │
    ▼
research pass (Astro Lit integration, adjacent pattern-library tooling)
    │
    ▼
Phase B (workspace restructure, no behavior change)
    │
    ▼
Phase C (pattern-site bootstrap, sample content only)
    │
    ▼
Phase D (pattern MDX migration, bulk move)
    │
    ▼
Phase E (extractor migration)
    │
    ▼
Phase F (cleanup, doc updates, promotion)
```

Phase A is the only true gate. Phases B and C can interleave if the workspace restructure exposes a need for the pattern site sooner (e.g. to validate frontmatter shape). Phases D and E are sequential: the extractor can only point at the new source once content is there.

This plan has three prerequisites before Phase D begins (per the Prerequisites and coordination section): role coverage complete, move/mechanism split audit complete with proposed move names, and combobox territory landed (done — commit b0f7052 split Combobox into the Bounded choice move plus the retained Combobox component). The plan does not block any current pattern work — patterns continue to be authored in `src/stories/` until Phase D moves them, and the extractor continues to operate against the existing tree until Phase E.

---

_Completed 2026-07-02._ The split is executed in substance: workspaces exist, the Astro site carries the language, the extractor reads pattern content only, typed relationships are migrated. The residue — stale Storybook duplicates, per-territory dedup, the stage-2 → language-only graph departure, and the still-cosmetic dependency boundary — is owned by [2026-07-workspace-split-closure.md](../active/2026-07-workspace-split-closure.md). The "Decomposition: worked examples and learnings" section stays here; promotion of its rules into `pattern-role-model.md` waits for a third worked example.
