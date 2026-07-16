# Workspace boundary after the view-system reshape

The 2026-07 view-system reshape (`2026-07-view-system.md`) sharpened the
view family — coordinated-views minted, overview-detail reframed as coupled
projections, navigation-overview restratified by the shape of what is
navigated. `workspace.mdx` was untouched: it sits at `activityLevel:
activity`, above the family's action-level pages, and its core concerns
(ownership, privacy, persistence of work contexts) don't overlap the
family's. But the reshape created a seam the corpus now carves in prose on
three pages without a typed edge, and left pre-reshape wording on
workspace's own edges colliding with the new vocabulary.

The seam is screen composition — multiple panes open at once:

- coupled projections of *one model* → coordinated-views (its scope says
  so, but not where the other case goes)
- heterogeneous contexts side by side → workspace (navigation-overview's
  restratified survey routes there in prose; the dashboard placeholder
  makes the same carve as "composition on glass")

This is the overview-detail ↔ hub-and-spoke carve one level up: same
screen shape, the boundary is what sits beneath.

## Work items

1. *Boundary edge.* Author `alternative: coordinated-views` on
   workspace.mdx (or the reverse; pick the side with more to say), note
   shaped like overview-detail ↔ hub-and-spoke's: the boundary is what
   sits beneath — coordinated views couple projections of one model;
   workspace composes heterogeneous contexts with no shared model.
   Coordinated-views' Scope prose gains the outbound half so the reader
   arriving there learns where the uncoupled case lives.

2. *Receiving material.* Workspace's "By structure" variants (tabbed /
   panelled / windowed / multi-device) are a commented-out TODO block —
   yet the panelled variant is exactly what navigation-overview now
   routes readers to. Rewrite and reinstate the block (the old comment
   suggests links to components/compositions; the boundary edge from
   item 1 supplies the coordinated-views cross-link the panelled variant
   needs). Until this lands, the survey points at one sentence of live
   prose.

3. *Re-voice the focus-and-context note.* Workspace's `complements:
   focus-and-context` note says "focus and context manages detail and
   overview within a single context" — "detail and overview" is now a
   page title meaning something specific. Keep the edge (the
   within-one-context / across-contexts contrast is real); re-voice
   without borrowing the title's words. The family-wide version of the
   contrast is carried by item 1's edge.

4. *Stale anchor.* navigation-overview's Malleable Routing section links
   to `/patterns/malleability#3-composition-topology`; the rewritten
   malleability has no such heading (its sections: Scope of change,
   Authorship, Gentle slope). Repoint to the heading that now carries
   composition scope, or drop the fragment. The build's cross-reference
   validator does not check anchors, so this fails silently.

5. *Word residue.* Workspace's `composed-of: hub-and-spoke` note says "a
   workspace switcher or dashboard (hub)" — "dashboard" now names the
   data-viz artefact. Reword ("switcher or home surface").

6. *Inbound sweep.* settings.mdx and localization.mdx carry edges to
   workspace about scoping — verify their notes still read correctly
   against whatever items 1–2 change; expected no-op.

Verify: `npm run extract-graph` (no new voicing advisories), site build.

## Deferred, with triggers

- *A `hosts` claim* (workspace hosts data-view / coordinated-views — the
  locative "where the composition lives"): only if a family page needs to
  point at its surface; the boundary edge is not that claim and shouldn't
  be stretched into it.
- *Anchor validation*: extend the intra-site link validator to check
  `#fragment` targets; item 4 is the motivating case. Tooling, separate
  sitting.
