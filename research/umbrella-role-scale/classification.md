# Classification draft: retiring the conflated `umbrella` role — 2026-06-22

Working draft from `pattern-classifier`, grounded in `2026-06-22.md` (research) and the
existing `docs/language/relationship-vocabulary.md`. Not committed to the spec yet — the
user expects iteration on both this and the skill.

## Headline

`surveys` (173 edges) and `role: umbrella` (12 pages) are each masking **three** distinct
relations, two of which the vocabulary already types:

| Winston (1987) relation | What it means here | Edge | Node outcome |
| --- | --- | --- | --- |
| component–integral | children *make up* the thing | `composed-of` (NEW) | composite **pattern** (`atomic: composition`) |
| genus–species | children are *kinds of* the thing | `instantiates` (EXISTS) | general **pattern** with variants |
| member–collection | children are *filed under* the thing | `surveys`/`indexes` (= `skos:member`) | **index** (grouping, not a move) |

Only the third is a genuine "survey, not source." The first two are *mis-roled patterns* —
they ARE the authoritative source for their move; their children just relate by a typed edge
that already exists (`instantiates`) or is a natural peer of `enables` (`composed-of`).

## Bucketing the 12

Sorting test (Winston): *do the children make up this thing (part), are they kinds of it
(species), or are they merely grouped under it for browsing (member)?*

### A — Composite moves (component–integral → `composed-of`; `role: pattern` + composition)
- **form** — filling it is one act; fields *make up* the form. (Already `atomic: composition`.)
- **block-based-editor** — the editor *is* its composed blocks; emergent editing surface.
- **bot** — composite agent surface (agency, memory, modes). *Flag:* named as a noun, not a
  move; may instead be a `foundation`/`quality` (conversation, agency). Needs its own pass.

### B — General moves with variants (genus–species → `instantiates`; `role: pattern`)
- **assisted-task-completion** — autocomplete / autofill / AI completion / next-best action
  *instantiate* the general "system offers to do part of the work." (This is the vocabulary's
  own headline `surveys` example — and it is actually `instantiates`.)
- **cognitive-forcing-functions** — its interventions are *kinds of* friction-at-acceptance;
  it has its own forces (a real move) plus taxonomic children. Standalone move, not a survey.
- **status-feedback** — indication / validation / notification are *kinds of* status reporting.
  *Flag:* leans toward `role: quality` (legibility of system state) more than a single move;
  weakest member of this bucket.

### C — Structural groupings / indexes (member–collection → `surveys`; `role: index`)
- **qualities** — index over the `role: quality` pages.
- **navigation-overview** — groups the navigation models (the skill's own canonical structural
  umbrella).
- **elements** — groups visual elements/tokens (colour, type, iconography). *Flag:* may be
  `foundation`/material rather than an index of moves.

### D — Altitude strata (member–collection by `activityLevel` facet → generated nav candidate)
- **actions**, **activities**, **operations** — pure AT-altitude indexes. Their membership is
  already computable from the `activityLevel` facet, so these are the strongest candidates for
  *implicit* umbrellas (generated nav, no authored node). Keep as `role: index` short-term to
  minimise churn; flag for generation.

## Revised role definition (draft, replacing the single `umbrella`)

- **`pattern`** — a generative move and *the authoritative source for that move*, whether or
  not it has narrower patterns. Explicitly absorbs the former "standalone umbrella": a
  composite move (`atomic: composition`) or a general move with variants is still a pattern.
  Scale is carried by `activityLevel` and by edges, never by the role.
- **`index`** (replaces structural `umbrella`) — a SKOS-`Collection`-style labelled grouping
  of members for orientation/navigation. *Not* the source for any move, and — per SKOS — sits
  **outside** the `composed-of`/`instantiates` hierarchy (a collection cannot be broader or
  narrower of a concept). Carries the shared `group` facet of its members.
- The clause "not the authoritative source for one move" attaches **only** to `index`. It was
  false for buckets A and B, which is the `form` contradiction (role-model.md:13–14).

## Edge proposal (as implemented)

> *Revision (2026-06-22).* The original draft proposed a **new `composed-of` edge**. Reading
> the extractor disproved the need: `enables` *already* carries component–integral composition
> (`Composed from`/`Used by` headers map to it, inverse), and the vocabulary explicitly stores
> no "composed of". So Winston's three relations map onto **existing** edges; no new edge type.
> The real bug was narrower: `role: umbrella` short-circuits *all* outgoing links to `surveys`
> (`extract-graph-data.ts:427`), overriding header types — that's why Form's constituents
> became `surveys` instead of `enables`.

1. **Component–integral → `enables`** (existing). Map the `Constituent moves` header to
   `enables` (inverse), alongside the existing `Composed from`. Re-roling a composite page to
   `pattern` removes the surveys short-circuit, so its constituents type as `enables`
   automatically. *Verified*: bounded-choice / sections / progressive-disclosure / wizard /
   step-by-step now `enables` Form.
2. **Genus–species → `instantiates`** (existing). Bucket-B variant pages should point up via a
   `Foundation`/`Applied in` header. *Staged*: until each variant page is edited, these links
   fall back to `related` (the intended interim state).
3. **Member–collection → `surveys`** (existing), now mapped to `skos:member` and triggered by
   `role: collection` instead of `role: umbrella`. Doc corrected (the "no exact equivalent"
   note was wrong).
4. **Winston non-transitivity** documented: never traverse `surveys` → `enables` →
   `instantiates` as one path.

No new edge type was added. `umbrella` retained as a deprecated extractor alias of `collection`.

## Skill changes this surfaces (for iteration)

- **Rename "standalone umbrella" → "composite pattern"** in Phase 2 step 5; stop classing
  composite moves as umbrellas. Reserve umbrella/index for *structural* + *implicit* only.
  This resolves the `form` contradiction inside the skill, not just the spec.
- **Adopt the Winston three-way test** (part / kind / member) as the explicit sorting
  instrument in step 5, mapped to `composed-of` / `instantiates` / `surveys`.
- **Add SKOS `Collection` + Winston 1987 to Conceptual foundations** (promote from research)
  so the distinction is canon, not buried in a research note.

## Spec / vocab changes this surfaces

- `pattern-role-model.md` — rewrite the `umbrella` definition (13–14), add the `index` role,
  fold composite moves into `pattern`.
- `relationship-vocabulary.md` — correct the `surveys`/SKOS claim, add `composed-of`, document
  the three-way disambiguation and non-transitivity.
- `graph-relationship-model.md` — register `composed-of`; note `surveys` = `skos:member`.

## Open questions for the user

1. `index` vs `collection` vs `guide` as the role name — `index` reads cleanest in nav; SKOS
   purists would say `collection`.
2. `bot`, `elements`, `status-feedback` each have a second plausible home (foundation/quality)
   — separate passes, or fold into this one?
3. Strata (actions/activities/operations): reclassify to `index` now, or commit to generating
   them and delete the authored nodes?
4. Do we want `composed-of` as a stored edge at all, or derive composition from `atomic` +
   prose headings the way `enables` is derived? (Affects extractor scope.)
