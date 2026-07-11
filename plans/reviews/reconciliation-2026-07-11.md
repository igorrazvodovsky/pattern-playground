# Reconciliation — 2026-07-11 (post split-project composition pass)

Loop 2 per `plans/active/2026-07-review-practice.md`. Two blinded subagents
re-derived the operative image from the repository (working artifacts:
`reconciliation-2026-07-11-derived-project.md`, `-derived-language.md`, deleted
once this lands); the orchestrator diffed them against
`docs/project/operative-image.md`, `docs/language/operative-image.md`, and the
two visions, and consolidated the Loop 1 reframe residue
(`plans/reviews/split-project/`, composition moves 1, 3, 5).

## What holds (checked, no action)

- Garden constraint: nothing in the territory pulls toward audience features.
- Language op-image's core claim — typed-edge layer built but not operational —
  matches the territory (630 edges over 114 nodes, uneven coverage, situations
  at 17 files, decision trees at 4, `principles` the sole orphan).
- Role discipline is real in the data, not just declared (`enacts` strictly
  →quality, `surveys` strictly collection-sourced, `recommends` derived-only).
- Situations "populated for a small starting set", Nature of Order register
  "not yet reached" — both still accurate.
- Promise-beside-its-seam (composition M7) and the two To-do homes (M8) were
  accepted as-is in Loop 1; the territory shows nothing new against them.

## Divergences and decisions

Each decision is one of: vision changes / operative image catches up / gap
becomes a plan.

### 1. Bilingual entry — resolved by allocation, record still says "not yet"

Residue of composition M1 (reframe). The project op-image calls the
cross-surface reference scheme "not yet established … bilingual entries read
as two pages rather than one"; the branch landed typed validated references
(PatternRef/ComponentRef) and resolved the one-entry aspiration by
*allocation*: each concept has exactly one descriptive home (language entry
for interaction-design material, substrate-only for visual material;
workspace-layout.md §Bilingual entries).

*Decision: operative image catches up, and the vision records the resolution.*
- `docs/project/operative-image.md` — replace the "partly realised" bullet:
  realised by allocation; shared demos feed both surfaces; references are
  typed elements validated at build; no two-page state remains.
- `docs/project/vision.md` §Bilingual substrate maturity — the "one bilingual
  entry rather than two linked pages" clause becomes: resolved by allocation
  rather than fusion; the remaining direction is keeping the validated
  coupling tight as both surfaces grow.

### 2. Navigation-as-projection — an image-level commitment recorded nowhere in the image

Residue of composition M3 (fix). The AT collection pages were deleted in
favour of facet projections; the commitment ("navigation is a projection over
facets, one site-wide mode at a time") landed in pattern-site.md
§Classification facets and the retirement watch on `surveys` in the
vocabulary doc — but neither operative image mentions projections or facets,
though the derived pictures show projection is the load-bearing organising
convention.

*Decision: operative image catches up.*
- `docs/language/operative-image.md` — add an organisation paragraph: flat
  files, identity = filename stem, every navigation surface computed from
  classification facets; handwritten AT collections deleted; two collections
  remain (navigation-overview, data-visualization) with `surveys` on
  retirement watch.
- `docs/project/operative-image.md` §Navigation and reading — one sentence
  naming projection-over-facets alongside stacked notes and the graph view.

### 3. Mature move record — `status` adjudicated, `consequences` deferred

Residue of composition M5 (fix). The language vision still lists `problem`,
`forces`, `consequences`, `evidence`, `status` as unrealised. Loop 1
adjudicated: `status` is the next field the corpus is asking for (stub
authority, maturity legibility, the fun meter's register question); the
`consequences` / `situation.resulting` overlap is settled on a filled corpus
via the situation-backfill plan, not by declaration.

*Decision: vision changes (small).* `docs/language/vision.md` §Mature move
record — after the unrealised-fields paragraph, record `status` as the
nearest field and the `consequences`-vs-`situation.resulting` comparison as
an open question owned by the situation-backfill pass.

### 4. Dormant declared apparatus — territory fact the record lacks

Derived language picture: `domain` and `tags` facets have zero uses, the
`component` role zero instances, `umbrella` survives only as a deprecated
alias, `lifecycle` (25 files) flows into generated data with no consumer, and
the fully built inline `rel=` channel has exactly one use (frontmatter won as
the authoring surface). Component realisation (`realised_by`, node metadata
never an edge) is likewise absent from the op-image though its docs landed
elsewhere in-branch.

*Decision: operative image catches up.* `docs/language/operative-image.md` —
one dormant-apparatus sentence (with the frontmatter-won observation) and one
sentence placing `realised_by` in the current picture. Pruning any of it is
not adjudicated here; the health-check machinery and future sittings own that.

### 5. Post-split automation residue — broken gates the record doesn't know about

Derived project picture, verified by execution: `check-taxonomy-sync.mjs`
still reads root `src/stories` (gone post-split) and crashes, so the
docs-integrity job fails on every PR; `claude-code-review.yml` filters on
root `src/**` and never triggers; the build copies Storybook into
`apps/patterns/public/storybook` while Astro's `publicDir` points at root
`public/`, so the copy feeds only the validator fallback and `/storybook`
does not reach `dist/`. Adjacent: the hand-synced legacy graph-JSON mirror in
`packages/components/src/`, and `apps/server` CORS naming pre-split ports.

*Decision: gap becomes a plan.* Stub at
`plans/active/2026-07-post-split-residue.md`: problem statement as above;
first step is the taxonomy-sync root fix (coordinated with
storybook-rebucketing, which is reshaping the buckets the script checks) and
the review-workflow filter; then adjudicate whether `/storybook` is meant to
deploy at all.

### 6. plans/index.md stale in both directions

Verified: seven plans listed as Active have moved to `completed/` or
`archive/` (harness, assistance/delegation foundations, cognitive-forcing-
functions, combobox territory + extraction, shell-island); eight files in
`active/` are unlisted (heatmap-ngram-promotion, link-preview extraction,
pattern-demos migration, block-editing-followups, pane-island-hydration,
realised-by-backfill, related-residue-audit, situation-backfill,
storybook-rebucketing); Completed misses recent closures.

*Decision: record catches up.* Regenerate the index from the lifecycle
directories in this sitting; no plan needed.

### 7. Project op-image structural drift (light)

The op-image's "single npm workspace with one library package and two
runnable apps" omits the `shared/` fixtures workspace; `apps/server` is
parked (no root script, older dep generation); root `concepts/` and `todo/`
are pre-collection strata no build path reads.

*Decision: operative image catches up.* Two sentences in the current-picture
paragraph of `docs/project/operative-image.md`.

### Optional (from composition M2's verdict, author's call)

Link `docs/project/vision.md` to `docs/levels-of-scale.md` as the far horizon
where the address/identity distinction dissolves. Low stakes either way; not
counted as a divergence.

## Outcome record

All seven decisions (and the optional levels-of-scale link) accepted and
applied 2026-07-11:

1. Applied — `docs/project/operative-image.md` bilingual bullet rewritten as
   realised-by-allocation; `docs/project/vision.md` §Bilingual substrate
   maturity records the allocation resolution.
2. Applied, then reallocated in the same sitting — the language is a graph;
   projection is a rendering concern. The projection-over-facets picture
   (flat directory, stem identity, computed navigation surfaces, one
   site-wide mode) lives in the project op-image's navigation section; the
   language op-image keeps only the language-side facts (no curated
   hierarchy of its own; collections dissolved to two, `surveys` on
   retirement watch).
3. Applied — `docs/language/vision.md` §Mature move record: `status` recorded
   as the nearest field, `consequences`-vs-`situation.resulting` owned by the
   situation-backfill plan.
4. Applied — `realised_by` placement and dormant-apparatus paragraph added to
   `docs/language/operative-image.md`.
5. Applied — plan stub written:
   `plans/active/2026-07-post-split-residue.md`.
6. Applied — `plans/index.md` regenerated from the lifecycle directories
   (post-split-residue added; seven stale Active entries moved to their real
   sections; fifteen missing Completed and eight missing Archived entries
   added; ten missing Active entries added).
7. Applied — `shared/` workspace, parked `apps/server`, and the
   `concepts/`/`todo/` strata named in the project op-image's current
   picture.

Optional — project vision links `docs/levels-of-scale.md` as the far horizon
where address and identity dissolve (composition M2's option, taken).

Derived working artifacts deleted after folding.
