# Episode 03: Workspace split arc — walkthrough

*Scope.* Merge-base `ef66e6a852ff04cc9de2f64b8734fa4fe97c1d7c` (verified via `git merge-base main split-project`); endpoint diff read with `git diff --stat <merge-base>...split-project` (983 files, +46,871/−28,449), trajectory with `git log --oneline --reverse <merge-base>..split-project`. Territory: the structural split into workspaces and the boundaries between them — not component redesigns, not pattern prose. Judged against plans/completed/2026-05-workspace-split.md, its audit, plans/completed/2026-07-workspace-split-closure.md, docs/specs/workspace-layout.md, docs/project/vision.md, docs/project/operative-image.md, docs/project/core-beliefs.md, docs/language/pattern-and-form.md.

The episode takes the repository from a single Storybook-centred package to a workspace root with `packages/components` (form language, Storybook :6006), `apps/patterns` (pattern language, Astro :4321), `apps/server`, and a `shared/` fixture-data package. Roughly 150 commits run the arc: early reorganisation, per-file MDX migration, six territory closures (T1–T6), a build-time cross-reference validator, a dependency-ownership pass with an explicit enforcement stance, a root tsconfig re-scope, and a data-viz corpus verdict. Both plans it answers to are closed; the graph ended language-only with Storybook's `index.json` as the catalogue dataset.

## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | The two-language split as physical structure | fix |
| 2 | The graph goes language-only; index.json becomes the catalogue | fix |
| 3 | Territory-shaped closure | fix |
| 4 | The validator as the boundary's enforcement | fix |
| 5 | Dependency boundary: declared, not enforced | fix |
| 6 | Cross-surface substrate: `shared/` and `demos/` | fix |
| 7 | Data-viz corpus: split, not merged | fix |

## Move 1: The two-language split as physical structure

*The move.* The repository becomes an npm workspace root: `packages/components/` (Lit + React components, Storybook, tokens, substrate), `apps/patterns/` (pattern MDX, Astro site, graph data), `apps/server/` (moved from root `server/`). The cut is by `role:` metadata, not folder: `role:component` stays in Storybook; `role:pattern`/`role:umbrella` content moves to a flat `apps/patterns/src/content/patterns/` where filename stem = slug = route = graph node ID (commit c87c44b). Cross-cutting material (`docs/`, `plans/`, `references/`, `scripts/`) stays at the workspace root — opposite to the Phase-A audit's default of moving it into the patterns package (plan, open question 1). Two-repo separation was rejected, not deferred.

*Answers to.* docs/language/pattern-and-form.md ("two languages whose jobs are different enough that they must not share a vocabulary… It lives in `apps/patterns/`… It lives in `packages/components/`"); vision.md §Bilingual substrate maturity; the whole of plans/completed/2026-05-workspace-split.md.

*Backtalk.* The strongest signal is what the split did *not* carry with it: the closure plan's residue inventory records "the split moved files, not dependencies" and "~40 stale Storybook duplicates" — the physical boundary existed for weeks as directory structure plus aliases while both surfaces kept a copy of the language. T1's closure log reads the split's thesis back approvingly ("these pages' only Storybook function was outbound linking to components"), but the bilingual promise contracted in one corner: workspace-layout.md §Bilingual entries gives every `role:foundation` a language foot and a substrate foot, yet the closure resolved Color/Iconography/Layout/Motion/Typography as Storybook-only `role:component` pages ("they need explicit role tags, not migration" — workstream 1). The flat-directory / stem=slug=node-ID identity, minted here, immediately produced its own strain: T1 records that hybrid-patterns and behaviour anchors both need sub-page graph addressability and "the filename-stem = slug = graph-ID identity is the blocker."

*Question.* The material foundations ended up with only a substrate foot — is that a deliberate refinement of the bilingual contract (only foundations that carry a design *concept* get a language entry) or a quiet contraction that workspace-layout.md §Bilingual entries should now state, so the next foundation doesn't inherit an ambiguous promise?

*Verdict:* fix — a deliberate refinement, enacted but unstated: interaction-design material earns the language foot, visual material is substrate-only. Now stated in §Bilingual entries; the five material pages' dead "Concept:" links (pointing at never-built entries, invisible to the validator) removed; the stale retained-until-rewritten bullet dropped with them. (2026-07-11)

## Move 2: The graph goes language-only; index.json becomes the catalogue

*The move.* The split plan's landing point was stage 2: component nodes kept in `pattern-graph.json`, filtered from the rendered view. What shipped was a language-only graph (closure plan framing 2: "111 nodes… zero components"). The closure promoted the accident into the named end state — stage 3 — and, after a research gate sank the custom-elements-manifest strawman (2026-07-07: zero tagName associations, ~14 of 40 entries custom-element-backed), designated Storybook's own `index.json` as the catalogue dataset. Component realisation became a cross-dataset reference (ComponentRef prose), not an edge (commit 3a86389).

*Answers to.* The original plan's §Data model migration path names stage 3 as "the named end state, future work"; closure framing 2 makes the promotion explicit. The research-gate sequencing answers the "research before locking in" stance recorded in the plan's §Research.

*Backtalk.* Two kinds. First, the departure was silent when made: the closure's process note names it directly — "the stage-2 → language-only extractor change is exactly the kind of move that should have left a written decision behind" — and graph-relationship-model.md carried the stale stage-2 claim until workstream 1 fixed it. Second, the promotion stranded a rationale: workspace-layout.md §Scripts still says the extractor "stays at the workspace root because it reads from both workspaces: pattern content… and (in the stage-2 combined data model) component metadata from `packages/components/`", and that moving it into `apps/patterns/` "would be correct under stage 3." Stage 3 is now the settled model, and `scripts/extract-graph-data.ts` reads only `apps/patterns/src/content/patterns` (line 8; the only `packages/components` paths left are legacy output copies, lines 10–12). The spec's stated reason for the extractor's root residency no longer holds; the spec itself says where it should then live.

*Question.* Now that the graph is language-only by decision rather than accident, does the extractor follow the spec's own stage-3 clause into `apps/patterns/` — and if it deliberately stays at root (e.g. because `scripts/` hosts other workspace-level checks), what replaces the dead stage-2 rationale in workspace-layout.md §Scripts?

*Verdict:* fix — the extractor stays at root, but for the true reason: it is cross-workspace by *outputs*, not inputs (Storybook's PatternGraph consumes the legacy graph copy). §Scripts rewritten to say so; the dead stage-2 rationale and the stranded stage-3 relocation clause are gone. (2026-07-11)

## Move 3: Territory-shaped closure

*The move.* Dedup of the ~40 stale Storybook twins was re-unitised from per-file to per-territory: six territories (T1 Navigation … T6 Root composites), each one session against a five-step definition of done (verdicts on every story, demos moved per verdict, inbound links rewritten to PatternRef, twins deleted, builds + grep + graph-diff verified). Reflective verdicts run first and unhurried; mechanical steps finish in the same pass (closure §Process note).

*Answers to.* Closure framing 1 ("Closure is territory-shaped, not file-shaped. The stalled per-file dedup (4 of ~44 pages closed in May, then nothing) shows the wrong unit"); core-beliefs.md's relational stance — a territory is a cluster of related pages, so parity is checked where the edges are.

*Backtalk.* The method self-amended under load, and every amendment came from a failure: the dev-server sweep joined step 5 after T2's `client:only` islands 500ed under `astro dev` while `astro build` stayed green; borrowed embeds entered step-1 scope after item-view's Reference @mention was dropped "repeatedly"; the verdict-class vocabulary grew mid-flight (*already-ported* at T5, *host-composition* held at T2, the *latent artifact* reading at T6's Nav-bar reversal, which rewrote spec rule 6 to "a CSS-first artifact counts; deletion is the reserved case"). The method also kept producing the same empirical lesson four times over — T1's stale sidebar TODO, T2's inert filter and the `dropdown.ts` announce bug, T3's link to a never-existing concepts page: "demos embedded on pages people read get corrected; demos in an unlinked Storybook corner do not." That regularity is an argument the structure itself made for Move 4.

*Question.* The definition of done, the verdict classes, and the reflective-serial / mechanical-batched operating rule now live only inside a completed plan — given the docs-orient stance (reference material lives where a fresh reader navigates from), where does this method get a durable home before the next migration-shaped arc has to re-derive it from git archaeology?

*Verdict:* fix — the method now has a section in docs/project/plan-drafting.md ("Migration-shaped arcs: territory closure"): orientation and the operating rules in the doc, the worked detail pointed at in the completed plan. (2026-07-11)

## Move 4: The validator as the boundary's enforcement

*The move.* A build-time Astro integration (`apps/patterns/integrations/validate-cross-references.ts`, commits 7b17735 + c42c154) gates three reference seams: site→Storybook (`<ComponentRef id>` must resolve to a docs entry in `index.json`, primary `storybook-static` with a stale-fallback to `public/storybook`), Storybook→site (`<PatternRef slug>` must match a content stem), and site→site (`/patterns/<slug>` links). Failures aggregate, report once, and carry Levenshtein near-miss suggestions. All three checks run in the *site* build; the coupling is documented in the integration header: "a PatternRef slug typo in Storybook MDX fails the site build… the unified build is the single gate."

*Answers to.* Closure workstream 2's revised deliverable; vision.md §Bilingual substrate maturity ("the cross-surface reference scheme resolving so a quality or foundation reads as one bilingual entry rather than two linked pages"); empirically, the four sightings of the dead-reference species logged across T1–T3.

*Backtalk.* It earned its keep before its break-test: contra the workstream's "tree is clean" premise it caught `bounded-choice.mdx:55` still pointing into the Selection twin T4 had deleted — a ref the T4 log recorded as already fixed. That is the structure catching the *process log* being wrong, not just the content. The asymmetry of the gate is the residue: a bare `build-storybook` runs no check, so the form-language surface can drift whenever it is built alone; only the canonical root build (`build:storybook-into-patterns` then site, root package.json) closes the loop. And the third seam was discovered mid-workstream — site→site links were unvalidated until a sweep found eight stale nested links, spun out and then folded back in (2026-07-intra-site-link-validation).

*Question.* pattern-and-form.md presents the two languages as peers with different jobs, yet the enforcement topology is one-directional — the pattern site's build vouches for both surfaces and Storybook vouches for nothing. Is that hierarchy a deliberate claim (the site is the product, per core-beliefs §Synthesis outputs, so it owns integrity) worth stating in workspace-layout.md, or an accident of where the integration was cheapest to write?

*Verdict:* fix — deliberate: the site is the synthesis surface, so its build owns cross-surface integrity. Stated in a new §Cross-surface integrity section of workspace-layout.md, including the bare-Storybook-build drift caveat and the root build as the single gate. (2026-07-11)

## Move 5: Dependency boundary: declared, not enforced

*The move.* Workstream 4 in four steps (commits ff935f4, fa45e09; decisions 2026-07-10). Step 1: every runtime dep moved to the workspace that imports it (tldraw, Tiptap, the d3 set, lit, Storybook + addons into `packages/components`; root keeps only shared tooling); phantom deps declared (`classnames`, `nanoid`); workspace edges declared (`@pattern-plgrnd/components`, `@pattern-plgrnd/shared` in `apps/patterns`); versions aligned upward; server renamed into scope. Step 2 decided: keep alias-to-raw-source consumption; an `exports` field is *inert* under path aliases, so "add exports to enforce" was a category error — the real fork is aliases vs a ~30-import-site rewire. Step 3 (pnpm) parked, gated on the split deploying on npm first, with `depcheck`/`knip` named as the cheaper phantom-dep lever. Step 4: root tsconfig re-scoped to `["utils", "scripts"]` with a header stating both roles and that project references are deliberately not adopted.

*Answers to.* The original plan's promise "deps split along package lines; patterns import only what the components package exports" (§Two framings), and closure workstream 4, which names the pre-move state "cosmetic."

*Backtalk.* Making the move falsified the plan twice. The workstream's "component-only" list was wrong for five deps (react, react-dom, zustand, `@base-ui/react`, `@floating-ui/dom`, `@iconify/react` are imported directly by `apps/patterns/src` — step-1 log), and the plan's convention-vs-`exports` framing dissolved on re-grounding (step-2 entry). The residue is a live spec contradiction: workspace-layout.md:103–104 still states "The components package exports a public API via its `package.json` `exports` field" and that pattern pages "import only what the components package exports" — but `packages/components/package.json` has no `exports` field, and the settled decision is that under aliases one would enforce nothing. The spec asserts the rejected branch as current fact.

*Question.* The settled boundary is *documented edge + convention, pnpm as the future enforcement lever* — should workspace-layout.md §Workspace dependency direction now say exactly that (including the observed public surface recorded in closure open question 5), or is the `exports` sentence being kept as an aspiration, in which case what distinguishes it from the stage-2 rationale Move 2 left stranded?

*Verdict:* fix — §Workspace dependency direction rewritten to the settled truth: documented edge + alias convention, no `exports` field (inert under aliases), the observed public surface recorded in place, pnpm named as the future lever. The `shared` edge added to the direction list. (2026-07-11)

## Move 6: Cross-surface substrate: `shared/` and `demos/`

*The move.* Two placements for material both languages consume. Fixture data (`src/stories/data/`) became a third workspace, `shared/` (`@pattern-plgrnd/shared`, root `workspaces: ["apps/*", "packages/*", "shared"]`), because moving it into either package would invert a boundary (plan Phase B, shared-fixture bullet). Runnable demos landed in `packages/components/src/demos/`, superseding the pattern-site-local home two earlier plans assumed; one demo feeds both surfaces (Storybook by relative path, site MDX via `@pkg/demos/*`), with a may/may-not-hold contract and a trigger-gated promotion register (workspace-layout.md §Shared demos). Ownership was re-keyed mid-arc from provenance to move: "the pattern that names the move owns its demo file; referencing pages borrow" (T5 addendum) — visible in the tree as `demos/inline-confirmation.tsx`, `transient-feedback.tsx`, `filtering.tsx`.

*Answers to.* vision.md §Bilingual substrate maturity ("shared demos feeding both surfaces from one source"); workspace-layout.md §Shared demos; the closure's two-way-substrate verdicts (ItemView, SemanticZoom, MorphingControls).

*Backtalk.* The demos contract is the episode's most-exercised boundary and it held — the grey zone and promotion register absorbed the ngram/heatmap case, and territory closures repeatedly resolved *into* it rather than against it. But the placement carries a structural oddity the arc created and never named: demo files keyed by pattern-language move names live inside the form-language package, and `shared/`'s own manifest declares no deps while importing `mdast`/`unist-util-visit` (step-1 findings, "honest declaration is a follow-up"). Meanwhile workspace-layout.md's package-structure diagram and dependency-direction section never mention `shared/` at all — a whole workspace, added to the root `workspaces` array and declared as an edge by two packages, absent from the spec that owns the layout (grep: the only "shared" in the spec is the demos section).

*Question.* `demos/` is move-named, dual-consumed, and explicitly "a parking lot for un-promoted mechanism" — conceptually it is a third place, like `shared/`, that happens to rent a room in `packages/components`; is co-location with the components it wires the load-bearing reason it stays there (in which case the spec should also finally draw `shared/` into the layout diagram), or is the honest end-state a substrate tier the two-language frame currently has no word for?

*Verdict:* fix — no substrate tier minted; the trigger is recorded instead. `shared/` drawn into the layout diagram and prose; §Shared demos now states the tenancy as deliberate (co-location with imported component source is the reason) and names the condition under which the placement question reopens. (2026-07-11)

## Move 7: Data-viz corpus: split, not merged

*The move.* Closure open question 2 (the `role:umbrella` tag on `Elements.mdx` disagreeing with the parallel-corpus stance) resolved by splitting the corpus (commit d50cb69): Bar chart stays a component doc; Elements retags to the visual-foundations shape (`role:component`, substrate); the Charts overview reframes into the language — first as `charts.mdx` (`role:pattern`, framework voice), corrected the same day to `data-visualization.mdx` with `role: collection`, slug matching the machine token so the dormant `domain: data-visualization` nav group populates as a parallel section rather than merging into the AT groups.

*Answers to.* The overlapping-vocabulary stance (parallel corpora linked, not merged by label match — closure log: "the overlapping-vocabulary stance, held"); core-beliefs.md §Multiple projections; the closure's own T1 precedent (hybrid-patterns' "artifact-plural title betrays a catalogue").

*Backtalk.* The same-day correction is the interesting part: the first landing (`charts.mdx` as a pattern) violated a signal the arc itself had articulated at T1, and the plural-catalogue test caught it within hours — the vocabulary the closure built was sharp enough to cut its own fresh work. The settled shape carries an acknowledged strain, in the plan's words: routing knowledge lives on the collection "until chart families earn entries — an acknowledged strain on 'a collection is never the authoritative source for any move'," and this third prose decision selector "cannot emit `recommends` edges until chart families are graph nodes." The long-term clause ("data visualisation may need its own home") is recorded but ungated.

*Question.* The collection is authoritative-for-now by explicit exception — what is the trigger that forces the first chart family to become a node (a research run? a referencing pattern? the graph-situation work landing), and if no trigger ever fires, does the exception harden into a second corpus-level rule for parallel domains that the language should state rather than tolerate?

*Verdict:* fix — handled by the author directly on data-visualization.mdx: catalogue list tidied and a page-local TODO marks the open end, per the To-do lifecycle settled in episode 02 (checked when the page is edited). (2026-07-11)
