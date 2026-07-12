---
title: "Finish the Storybook catalogue re-bucketing"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-12"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Finish the Storybook catalogue re-bucketing

Completed 2026-07-12. The open decision resolved by collapsing
Primitives → Components: the catalogue is now a flat *Components* bucket plus
*Utilities*, *Foundations*, and *Data visualisation*, with composition scale
carried by `atomic:*` tags rather than a folder. The category set is recorded in
the *Catalogue categories* section of `.claude/rules/documentation.md`;
`scripts/check-story-buckets.mjs` enforces the closed set of title prefixes.
Eighteen Primitives titles and the four activity-level stragglers (Form, Card,
List, Callout, plus the Dual listbox / Messaging MDX metas) were retitled;
`ComponentRef`, `realised_by`, and inter-page Storybook links were swept across
both surfaces (including the already-stale `operations-combobox--docs` and
`actions-evaluation-list--docs`). Build and cross-reference validator green;
`index.json` carries no retired-prefix docs entries.

## Context

The Storybook catalogue moved off the activity-level tree (Operations / Actions
/ Activities folders) onto top-level buckets — currently Primitives,
Components, Utilities, Foundations, Data visualisation. The move landed
mid-flight: a handful of pages still carry old-style titles, and the taxonomy
itself is written down nowhere. The documentation rule's line naming the old
category set was deleted without a replacement, so the current category set
exists only in the page titles themselves.

Titles are load-bearing across surfaces: `ComponentRef` ids on pattern pages
encode Storybook title paths (`operations-callout--docs`), so every retitle
breaks cross-surface links until the referencing pages are swept. The
cross-reference validator checks `ComponentRef` ids against Storybook's
`index.json`, so breaks are catchable, not silent.

## Open decision: the category set

*Deliberately undecided; decide at implementation time, not before.* The
catalogue is moving away from Atomic Design as its primary dimension — the
Primitives/Components split reads as an atomic-composition scale, and
`docs/specs/pattern-role-model.md` holds that `atomic:*` is compositional
metadata, not a placement decision. The exact slicing is open. One candidate:
a flat list of components, plus Utilities and Foundations (no
Primitives/Components split at all). Whatever is chosen, the deliverable of
step 1 is the decision *written down*, not just applied.

## Steps

### 1. Decide and record the category set

Choose the top-level buckets. Record the convention where the next entry's
author will find it — `.claude/rules/documentation.md` is where the old
category line lived ("Each level has a role." currently stands in its place,
naming no levels). The record should say what the buckets are and what decides
placement, so future entries land by rule rather than by feel.

The old `scripts/check-taxonomy-sync.mjs` (directories ↔ retired taxonomy doc)
was deleted with the post-split residue sweep; if the recorded category set
wants automated enforcement, a successor check — story title prefixes against
the recorded set — attaches here.

### 2. Retitle the stragglers

Pages still under old activity-level titles:

| File | Current title |
|------|---------------|
| `stories/Form.stories.tsx` | `Actions/Application/Form` |
| `stories/Card/Card.stories.tsx` + `Card/Card.mdx` | `Actions/Sense-making/Card` |
| `stories/List.stories.tsx` | `Actions/Evaluation/List` |
| `stories/Callout.stories.tsx` | `Operations/Callout` |
| `stories/DualListbox.mdx` | `Actions/Coordination/Dual listbox` |
| `stories/Messaging.mdx` | `Actions/Coordination/Messaging` (Meta title only) |

Messaging is split-brained: its stories file already says
`Components/Messaging` and pattern pages already reference
`components-messaging--docs`, so the MDX Meta title is stale text — clean it
to match rather than treating it as a live retitle.

Meta *tags* on these pages (`activity-level:*`, `lifecycle:*`) are out of
scope: the tags question is a separate deferred revisit (split-project move
review, episode 06 moves 2 and 4).

### 3. Sweep the cross-surface references

Every retitle changes the docs id. Update `ComponentRef` ids in
`apps/patterns/src/content/patterns/` and inter-page Storybook links.
`realised_by:` frontmatter values are docs ids on the same seam — the
realised-by backfill (`2026-07-realised-by-backfill.md`) populates them on
~50 pages, so if it has landed, grep and sweep `realised_by` alongside
`ComponentRef`. The validator resolves both channels against `index.json`,
so a missed id fails the build loudly rather than silently. Current
referers of old-style ids (verify the list fresh with a grep for
`actions-…--docs` / `operations-…--docs` before sweeping):

- Pattern pages: activity-feed, agency, bounded-choice, data-view, density,
  form, item-view, modality, notification, prose, status-feedback,
  transient-feedback
- Storybook pages: ActionBar, BarChart, Form, ItemView, Overflow,
  PriorityPlus, Table, Toast

### 4. Verify

- Storybook builds; `index.json` contains no `actions-` / `operations-` /
  `activities-` prefixed docs entries (except any bucket legitimately named
  in step 1)
- Cross-reference validator green (ComponentRef → index.json seam)
- Grep for old-style ids across `apps/patterns/src/content/` and
  `packages/components/src/stories/` returns nothing

## Definition of done

The category set is recorded in the documentation rule; no page carries an
activity-level title; no `ComponentRef` or story link points at a retired id;
build and validator green.
