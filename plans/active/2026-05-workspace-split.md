---
title: "Workspace split: components package and pattern site"
status: "in progress"
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
- Conduct the move/mechanism split audit (folded with the role-coverage survey) and execute the resulting splits for APG-style entries during Phase D.
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

A single walk of the corpus, three verdicts per entry. The walk produces the audit deliverable for both this plan and the role-metadata plan's Phase A survey.

- *Role.* Is every page in `src/stories/` either tagged with `role:*` or in a folder that folder-infers a role? Resolve any unset entries.
- *Move/mechanism split.* Does the page document an APG-style control whose interaction contract earns a move-level pattern? If yes, propose the move name (named by the move, not the widget) and identify which content goes to the move side (situation, forces, consequences, edges) versus the mechanism side (props, states, anatomy, keyboard, ARIA). Pure-move entries (Toast, Undo, Inline confirmation) and pure-mechanism entries (Input, basic Checkbox) skip this verdict.
- *AT altitude after split.* For entries currently in the Operations folder, confirm the altitude that survives the migration. Pure-move entries keep their Operations altitude in the pattern site. Pure-mechanism entries leave the AT cascade entirely (they become components, organised atomically). APG-style entries that split: the move portion's altitude is whatever fits its scope (often Operations or Actions); the mechanism portion leaves the cascade.

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

No code changes. Output: a Phase-A audit note at `plans/active/2026-05-workspace-split-audit.md` capturing role coverage, the move/mechanism split verdicts (with proposed move names per APG-style entry), AT-altitude verdicts, cross-cutting verdicts, extractor coupling list, and the Astro prototype outcome. The audit note doubles as the role-metadata plan's Phase A survey deliverable.

## Phase B — Workspace restructure

Only after Phase A closes cleanly. The mechanical move; no behavior change yet.

- Create `packages/components/`, `apps/patterns/`, and `apps/server/` skeletons.
- Move existing `src/components/`, `src/styles/`, `src/services/` (component-bound parts), `src/tokens/`, `.storybook/`, and Storybook stories that are `role:component` into `packages/components/`.
- Move `src/services/` parts that are pattern-bound, `src/types/`, `src/utility/`, `src/hooks/` to the package they primarily serve, or to a top-level `shared/` if used by both.
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

The bulk move. Every non-component page leaves `src/stories/` and lands in `packages/patterns/src/content/`. Mechanical for most entries, with three exceptions: APG-style splits, bilingual Foundations/Qualities, and pages that didn't have MDX.

- For each MDX page with `role:pattern`, `role:umbrella`:
  - Move file from `src/stories/<path>/<name>.mdx` to `apps/patterns/src/content/patterns/<path>/<name>.mdx` (or `.md` if no MDX features used).
  - Transform `<Meta of={...} tags={[...]} />` to YAML frontmatter. Keep all tag values; tags like `role:pattern`, `activity-level:action`, `atomic:pattern` map to typed frontmatter fields.
  - Rewrite inter-page links from `../?path=/docs/<id>--docs` to the chosen link format from Phase C.
  - Co-locate `.profile.ts` sidecars; keep the same filename relationship the extractor uses ([scripts/extract-graph-data.ts:162](../../scripts/extract-graph-data.ts#L162)).
  - Co-located `.stories.tsx` files: for pages that had no MDX (extracted-from-stories-only metadata), generate an `.md` shell that hosts the frontmatter. If the page's previews are essential, decide page-by-page whether to migrate them as MDX with React/Lit embeds, or leave a Storybook backreference.
- For each `role:quality` and `role:foundation` page (bilingual):
  - The language entry — what the quality or foundation *is* as a design concept, with edges to patterns that enact it — moves to `apps/patterns/src/content/`.
  - The implementation substrate (CSS tokens, type scale, modality CSS, quality-expressing classes, design-token JSON) stays in or moves to `packages/components/`. Where the current MDX page mixes both, split into a pattern-site page that links to the components-side Storybook documentation for the substrate.
  - The cross-reference from the language entry to the substrate uses the same scheme as pattern → component references.
- For each entry flagged by the Phase A audit for move/mechanism split:
  - The move portion is authored as a new pattern-site entry under the move-level name from the audit (e.g. "Constrained selection" rather than "Combobox"). Pull the situational, forces, consequences, and edge content from the original page.
  - The mechanism portion stays as a component in `packages/components/` under the existing widget name (e.g. "Combobox"). Keep the props, states, anatomy, keyboard model, ARIA content.
  - The original page becomes a stub or is removed; existing inter-page links that pointed to the original are rewritten to point at the move-level entry (the language graph's traversal target), with prose-level mentions of the widget linking to its component page via the cross-reference scheme.

Component-roled pages stay where they are in `packages/components/`, with whatever Storybook tooling they already use. Under stage 2 of the data model migration (combined data with filtered view), the components package continues to feed the extractor; no metadata manifest is needed yet.

### Files modified

- All `role:pattern` and `role:umbrella` MDX files (moved, frontmatter rewritten, links rewritten)
- `role:quality` and `role:foundation` MDX files (language entries moved to pattern site; substrate stays in or moves to components package)
- New pattern-site entries for moves extracted from APG-style split entries (e.g. `constrained-selection.mdx` for the combobox split); component pages for the corresponding mechanism portions stay in `packages/components/`
- All `.profile.ts` sidecars for the above (moved)
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

2. *Storybook folder cleanup.* `packages/components/src/stories/qualities/` and `packages/components/src/stories/foundations/` retain their `.mdx` files because component pages in `operations/`, `actions/`, and `activities/` contain inbound links (Storybook URL format) to those pages. Removing the pages before those links are rewritten would break Storybook cross-references. The cleanup depends on the cross-surface reference scheme being established and the inbound links being rewritten to pattern-site routes.

3. *Cross-surface reference scheme.* The scheme for component pages referencing pattern-site entries (qualities, foundations, patterns) — whether `pattern:` URLs, plain `/patterns/` routes, or another form — is not yet established. Establishing it is the gate for item 2 above.

## Open questions

1. *Where do `docs/language/`, `references/`, and `research/` live?* Default in this plan is *patterns package* (their primary consumer is pattern-language work), but they're cross-cutting enough that workspace-root is defensible. Phase A's cross-cutting decision is the gate.

2. *What happens to `plans/`?* This file is itself the dilemma — it describes a workspace-level change. Likely stays at workspace root.

3. *What happens to `server/`?* Resolved: it moves to `apps/server/`. The `apps/` + `packages/` convention makes the move natural — `server/` is a runtime, not a library, so it belongs alongside `apps/patterns/`.

4. *Plain markdown + directives vs MDX for new pattern authoring.* Astro supports both extensions side-by-side. The conservative default is "MDX where existing pages use it; markdown for new pages unless they need component embeds." A future tighter decision could mandate one shape — likely after pattern volume grows.

5. *Graph as homepage, separate page, or persistent overlay.* Phase C decides. Each has different JS-budget and routing implications. Persistent overlay is the most generative-feeling; separate `/graph` page is the cleanest.

6. *npm vs pnpm.* npm workspaces are workable but pnpm handles them better. The migration cost is small but real. Default: stay on npm; revisit if HMR or hoisting causes pain.

7. *Component-package public API.* Phase B has to decide which paths the components package exports. Today everything in `src/` is reachable by relative import; a workspace boundary forces a verdict. Start narrow (the registered custom elements, the `register-all` entry, the design tokens, the public services); widen as patterns demand.

8. *Cross-surface reference scheme.* Pattern pages reference components, and bilingual quality/foundation entries reference their substrate. Phase C picks the scheme: a typed external link (`@components/button` resolving to a Storybook URL), a plain URL, a wikilink with a component-namespaced prefix, or something else. The choice has to work for in-prose references *and* for the future linked-datasets cross-reference shape.

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
- *Move/mechanism split authoring debt.* APG-style splits aren't just file moves — they require pulling apart content that was authored as one page. Some pages will resist a clean split (the move and the mechanism may be intertwined in the prose). Mitigation: the Phase A audit proposes the split per entry; if any entry resists, escalate it to a separate authoring task rather than forcing a split mid-migration.
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

This plan has three prerequisites before Phase D begins (per the Prerequisites and coordination section): role coverage complete, move/mechanism split audit complete with proposed move names, and combobox territory landed. The plan does not block any current pattern work — patterns continue to be authored in `src/stories/` until Phase D moves them, and the extractor continues to operate against the existing tree until Phase E.
