---
title: "Flatten pattern content: facets over folders"
status: "completed"
kind: "exec-spec"
created: "2026-06"
area: "architecture"
follows: "plans/active/2026-05-workspace-split.md"
promoted_to: "docs/specs/pattern-site.md"
---
# Flatten pattern content: facets over folders

## Outcome (executed 2026-06-05)

Done and verified. 115 pattern files flattened to `content/patterns/`; identity
is the filename stem (slug = route = graph ID = link target). Classification
moved to frontmatter facets (`activityLevel`, `lifecycle`, `group`, `domain`);
the extractor and nav derive from facets, not folders.

Key deviation from the draft below: the `lifecycle` facet does _not_ mirror the
action subfolders (e.g. `actions/navigation/*` files were authored
`lifecycle: seeking`). Resolving that divergence is a human classification call,
so `lifecycle` was left untouched; the subfolder grouping was captured verbatim
into a new neutral `group` facet (confirmed with the user) and the nav projection
rebuilds the identical sidebar from it. Collisions were resolved on the
quality/foundation side (`conversation-quality`, `collaboration-foundation`) per
user preference — the reverse of the draft's note below.

Verification: graph _strictly improved_ — 0 edges lost, 0 nodes lost, 0
activity-level/lifecycle/mediation mismatches under the id remap; +106 edges and
+2 nodes (`a11y`, `state-empty`) gained by healing a latent title-vs-filename id
mismatch (links resolved against title-derived node IDs while routes were
filename-derived; unifying on the stem fixed it). Junk `.mdx` categories cleaned
to `Cross-cutting`. `astro build` → 116 flat routes; schema validates; sidebar
reproduces all groups + subgroups; content links: 1052 resolve, 29 unresolved ==
pre-existing debt baseline (no new breakage).

## Context

`apps/patterns/src/content/patterns/` is organised as an Activity Theory tree
(`operations/`, `actions/<lifecycle>/`, `activities/`, plus `foundations/`,
`qualities/`, `data-visualization/`). That tree currently does triple duty: it
is the filesystem layout, the source of route slugs and graph node IDs, *and*
the thing the sidebar navigation is built from.

The problem: AT level is only **one** of many categorisations we want to apply,
yet it is the one carved into the filesystem — so it silently outranks every
other lens. [`references/semilattice.md`](../../Development/pattern-plgrnd/references/semilattice.md)
already names this: the tree is a *lossy projection*, the link graph is the
truth, and the goal is to make multiple projections first-class rather than
enshrine one. The user wants room to add further lenses — a UI-generation
pipeline axis (domain / task / dialog / presentation / layout), a design-process
phase axis, and an abstraction-stack axis — none of which should require moving
files.

Looking closely, the top folder is actually **three different axes fused into
one**: AT level (`operations`/`actions`/`activities`), `role`
(`foundations`/`qualities`), and *domain* (`data-visualization` — which is
already an instance of the "domain" lens the user wants to add, jammed into the
AT tree). This is the strongest evidence that the filesystem is the wrong place
to carry classification.

Intended outcome: a **flat** content directory where each file's identity is its
filename stem, every classification lives in frontmatter as an independent
*facet*, and navigation is a *projection* computed from facets. Adding a future
lens then becomes "add a frontmatter field + add a projection," never "reshuffle
files."

This is a follow-up to the completed workspace-split work
([`plans/active/2026-05-workspace-split.md`](../../Development/pattern-plgrnd/plans/active/2026-05-workspace-split.md)),
which already isolated the pattern content into `apps/patterns/`.

## What the folders currently encode (must be disentangled, not just AT)

| Folder signal | Carries | Frontmatter home after flatten |
|---|---|---|
| top: `operations`/`actions`/`activities` | AT `activityLevel` | `activityLevel` (exists, optional) — becomes authoritative |
| top: `foundations`/`qualities` | `role` | `role` (exists, required) |
| top: `data-visualization` | a *domain* facet | new `domain` facet (signpost; vocabulary via research) |
| 2nd level under `actions/` | lifecycle stage (`seeking`, `navigation`, …) | `lifecycle` (read by extractor already; only 27/115 set) |
| `operations/conversation/<sub>/` | a conversation grouping with no frontmatter home | fold into `tags` or a dedicated facet (decide in Phase 1) |
| `node.category` via `folderToCategory` | display category | recompose from `role` + `activityLevel` |

Coverage today (of 115 MDX files): `activityLevel` 89, `atomic` 88, `mediation`
85, `lifecycle` 27. The gaps are exactly what the extractor backfills from
folders (`?? derived`, `scripts/extract-graph-data.ts:920-924`). **Flattening
before backfilling those gaps destroys the only source of truth for those
files** — hence the sequencing gate below.

## Blast radius (everything keyed off the folder path)

- **Route slug** — `[...slug].astro` uses `entry.id` (path-minus-extension);
  `apps/patterns/src/pages/patterns/[...slug].astro:11`.
- **Graph node ID** — `pathBasedId()` joins dir parts + title with `-`
  (`operations/undo.mdx` → `operations-undo`);
  `scripts/extract-graph-data.ts:329`.
- **Activity / lifecycle / category derivation** —
  `deriveActivityLevelFromFolder()` and `folderToCategory()`;
  `scripts/extract-graph-data.ts:308,341,890-924`.
- **Navigation tree** — built by splitting `p.id` into parts in
  `apps/patterns/src/layouts/Base.astro:36-108` (with `GROUP_ORDER`,
  `DIR_LABELS`).
- **`DECISION_TREES`** — hardcoded map keyed by folder-prefixed pattern IDs with
  leaf values mixing pattern IDs (`operations-undo`) and *component* IDs
  (`primitives-toast`, `components-tabs`); `scripts/extract-graph-data.ts:643-690`.
  Pattern keys/leaves must be remapped to flat stems; **component-side IDs stay
  unchanged** (those nodes live in `packages/components/src/stories/` and keep
  their `titleToId`-derived IDs).
- **`validSlugs` / stacked-notes** — `import.meta.glob` of the content dir,
  slug = path-minus-`.mdx`; `apps/patterns/src/lib/stack-store.ts:124-129`,
  link-click interception at `:154`, and `link-preview.ts:33-39`.
- **Inter-page links** — ~1083 `/patterns/<at-path>/<name>` occurrences across
  the MDX corpus, all to be rewritten to `/patterns/<stem>`.
- **`PatternGraph`** navigates via `node.path` (not node ID), so the *graph
  consumer* is insulated as long as the extractor keeps emitting a correct
  `path`; `packages/components/src/components/PatternGraph.tsx:150,218,257`.

## Key decisions (recommended; not blocking)

1. **On-disk layout: fully flat.** All MDX directly under
   `content/patterns/` — no role or AT subfolders. The directory already carries
   an `.obsidian/` config (it is an Obsidian vault); a flat vault + frontmatter +
   graph view is exactly the digital-garden shape the semilattice doc points at.
   *Alternative considered:* role-folders-on-disk (tidier authoring). Rejected as
   the default because it re-privileges `role` as a tree and the `generateId`
   step (below) makes on-disk layout cosmetic anyway — reversible later if a flat
   115-file directory proves unwieldy.

2. **Identity: slug = filename stem, decoupled from path via the loader.** Use
   the glob loader's `generateId` in `content.config.ts` so the ID is the stem
   regardless of any subfolder, making future reshuffles free. Stems are *almost*
   globally unique — two cross-role collisions exist:
   - `conversation` → `qualities/conversation.mdx` (role quality) **+**
     `activities/conversation.mdx` (role pattern)
   - `collaboration` → `foundations/collaboration.mdx` (role foundation) **+**
     `activities/collaboration.mdx` (role pattern)

   **Resolve by renaming the quality/foundation-side files** — the bare stem
   stays with the `role:pattern` entry; the non-pattern entry takes a role
   suffix: `qualities/conversation.mdx` → `conversation-quality`,
   `foundations/collaboration.mdx` → `collaboration-foundation`. Keeps
   stem-as-id, and the rename is captured in the link codemod. *Alternative:* an
   explicit `slug`/`id` frontmatter field on every file (more general, survives
   more collisions as domains grow). Recommend rename now; revisit explicit-id if
   collision pressure increases.

3. **Navigation = projection over facets, AT as the default lens.** Rebuild the
   `Base.astro` tree from `activityLevel` + `lifecycle` (+ `role`) frontmatter
   instead of path parts. Structure it so a second projection (by domain, by
   phase, by abstraction-stack) is "add a grouping function," not a rewrite. A
   projection *switcher UI* is out of scope here — signpost only.

4. **Scope excludes new taxonomy vocabularies.** This plan delivers the
   flatten + facet + projection *mechanism*. The UI-pipeline / phase /
   abstraction-stack vocabularies are not defined here — per the project's
   "research before locking in" stance they each get a strawman + external
   research pass before being added as facets.

## Phased execution (extractor as oracle at every step)

The extractor's `pattern-graph.json` output is a free regression oracle. Each
phase asserts graph equivalence before proceeding.

### Phase 0 — Baseline
Regenerate `pattern-graph.json` + `activity-levels.json` → snapshot as **G0**.

### Phase 1 — Backfill frontmatter (folders untouched)
Write the folder-encoded values into every file's frontmatter so frontmatter
alone reproduces what folders yield:
- `activityLevel` for all operations/actions/activities files missing it.
- `lifecycle` for all `actions/<stage>/` files (raise 27 → full action coverage).
- a `domain` value for the `data-visualization/` files (and fold the
  `operations/conversation/*` grouping into `tags` or a decided facet).
Regenerate → **G1**. **Gate: G1 must equal G0 byte-for-byte.** This isolates
"did the backfill capture everything the folders encoded" from the risky
mechanics. Files modified: the 115 MDX frontmatter blocks; no code yet.

### Phase 2 — Flatten + switch derivation to frontmatter
- Move all MDX (and co-located `.profile.ts` sidecars, and the one
  `cognitive-forcing-functions/index.mdx` → `cognitive-forcing-functions.mdx`)
  to the flat root. Rename the two colliding pattern files (decision 2).
- `content.config.ts`: add `generateId` returning the stem; add `lifecycle` and
  `domain` to the zod schema; keep existing fields.
- `extract-graph-data.ts`:
  - `pathBasedId()` → stem-based ID (no dir parts).
  - drop `deriveActivityLevelFromFolder()` / `folderToCategory()` folder logic;
    read `activityLevel`/`lifecycle`/`domain` from frontmatter; recompose
    `category` from `role` + `activityLevel`.
  - emit `path: /patterns/<stem>`.
  - remap `DECISION_TREES` keys + pattern leaf IDs to flat stems; leave
    component IDs (`primitives-*`, `components-*`) untouched.
- `Base.astro`: rebuild the nav tree from frontmatter facets (AT projection).
- `stack-store.ts` / `link-preview.ts`: `validSlugs` glob now yields flat stems —
  verify the slug-resolution paths still hold (they key on
  `pathname - /patterns/`, which is now the stem).
- **Link codemod:** rewrite the ~1083 `/patterns/<old-path>` occurrences to
  `/patterns/<stem>` using the old-path→stem map derived from the move (the two
  renamed files get their new stems). One scripted pass over `**/*.mdx`.
Regenerate → **G2**. **Gate: G2 equals G1 under the known ID remap**
(`operations-undo` → `undo`, etc.) and the route change. Spot-check ten edges
across pattern→pattern, pattern→quality, decision-tree, and umbrella cases.

### Phase 3 — Docs + framing sweep
Reframe AT from "the organising tree / folder structure" to "one projection
among several" everywhere it is described as the layout:
- `docs/specs/pattern-site.md` — rewrite "File layout" (§33-49), "Placement"
  (§84-94), and the AT-levels section (§68-82) to describe flat files + facets +
  projection.
- `.claude/rules/pattern-content.md`, `AGENTS.md`, and any
  `pattern-classifier` / `pattern-migrator` skill guidance that instructs
  "put the file in the AT folder."
- Cross-link `references/semilattice.md` (this *is* its "further projections"
  section made real).
- Note: `plans/completed/2026-03-activity-theory-reorg.md` and
  `2026-03-at-framing-audit.md` are history — leave them, but this plan
  supersedes their filesystem conclusion.

## Verification

- **Graph equivalence:** G0 == G1 (byte-for-byte); G2 == G1 modulo the
  documented ID remap + route format. Compare node count, edge count, and edge
  type breakdown; diff `activity-levels.json`.
- **No broken inter-page links:** after the codemod, assert zero remaining
  `/patterns/<segment>/<segment>` (two-segment) paths in the corpus, and that
  every `/patterns/<stem>` resolves to an existing flat file.
- **Run the site** (`apps/patterns` dev server): sidebar renders the AT
  projection with the same groupings/order; a pattern page loads; stacked-notes
  push works (click an in-page pattern link → new pane); link-preview hover
  works; `/graph` navigates via `node.path` to the new flat routes.
- **Search:** Pagefind still indexes pages (routes changed, content didn't).
- **Known acceptable breakage:** previously-shared `stackedNotes` URLs that
  encoded old multi-segment slugs will 404. Single-author research project —
  acceptable; a stem-redirect map is an optional add-on if desired.

## Risks

- *Backfill omission* — if Phase 1's G1≠G0 gate is skipped, files relying on
  folder derivation silently lose their AT level. The gate is the mitigation;
  do not proceed past it on a non-empty diff.
- *DECISION_TREES drift* — the hand-edited remap mixes flattening (pattern IDs)
  and non-flattening (component IDs); a wrong leaf silently drops a decision-tree
  recommendation. Spot-check all four trees in the G2 diff.
- *Collision creep* — adding a `domain` lens with many entries raises future stem
  collisions; if it bites, promote decision 2 to explicit-`id` frontmatter.
