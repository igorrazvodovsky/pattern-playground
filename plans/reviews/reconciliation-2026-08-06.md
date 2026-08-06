# Reconciliation — 2026-08-06 (post light-DOM refactor)

Loop 2 per `plans/completed/2026-07-review-practice.md`, project scope only.
One blinded subagent re-derived the project picture from the repository
(working artifact: `reconciliation-2026-08-06-derived-project.md`, deleted
once this lands); the orchestrator diffed it against
`docs/project/operative-image.md` and `docs/project/vision.md`. No Loop 1
verdict directory exists for the refactor branch, so there is no reframe
residue to consolidate — the refactor was executed against its plan, whose
outcomes sections carry the discoveries.

## What holds (checked, no action)

- Garden constraint: the refactor is pure substrate hygiene; nothing in the
  territory pulls toward audience features.
- Bilingual allocation, projection-over-facets navigation, and the
  agent-layer-in-outline assessment all still match the territory.
- The refactor's forward edges already have plans: the authoring-library
  question is a decision record (`active/2026-08-component-library-decision.md`,
  research gate run) and the React residue an exec-spec
  (`active/2026-08-react-to-platform.md`). No decision-3 gaps left behind.
- The `umbrella` alias the derived picture flags was adjudicated 2026-07-11
  (dormant apparatus, recorded in the language op-image); still not this
  loop's business.
- Dev-server workarounds in `astro.config.mjs` (optimizeDeps front-load,
  watchdog, MDX invalidation) are standing pressure on the gated ClientRouter
  retirement — already held by the pane-stack refit plan's phase 4 gate. The
  derived picture sharpens the gate input; no new decision.

## Divergences and decisions

Each decision is one of: vision changes / operative image catches up / gap
becomes a plan.

### 1. Substrate description predates the refactor

`docs/project/operative-image.md` describes the component library as
"Lit + React". The territory: platform-first light-DOM components — zero
shadow roots, composition through real children and `data-slot` attributes,
styling through the layered cascade — with the decision ladder settled in
`docs/specs/component-authoring.md`, Lit reduced to reactive machinery behind
the contract (open decision record), and the React subsystems behind an
explicitly recorded boundary.

*Decision: operative image catches up.* The vision does not change:
platform-first landed as a settled spec plus two active plans, and neither
of the vision's directions is disturbed by it.

- Current-picture paragraph: "Lit + React" becomes "platform-first light-DOM
  components plus React subsystems".
- New short paragraph after the two-surfaces paragraph naming the authoring
  contract, the settled spec, the open library decision, and the recorded
  React boundary.
- Detail sources: add `../specs/component-authoring.md`.
- §Where the picture meets the vision, bilingual-substrate bullet: one clause
  noting the substrate side matured in form as well (components cut to the
  platform's grain).

### 2. Workspace-layout spec's components line predates the authoring spec

`docs/specs/workspace-layout.md` §`packages/components/` still opens "Web
Components (Lit, `pp-` prefix) and React compositions" with no pointer to the
authoring contract. Adjacent spec edit, not a three-way item in itself.

*Decision: record catches up.* Reword the bullet to "Light-DOM Web Components
(`pp-` prefix; authoring contract in component-authoring.md) and React
compositions".

### 3. Tooling character absent from the image

The derived picture names a load-bearing convention the record nowhere
states: corpus and substrate hygiene run through a shelf of guard scripts
(graph mirror, style boundary, story buckets, seed staleness, classification
health) that warn loudly rather than block. Optional — one sentence.

*Decision: operative image catches up (optional).* One sentence in the
current-picture section.

### 4. Branch residue after the merge

Nine local branches are fully merged into main and still exist, including
the refactor's own (`web-component-refactor-light-dom…`, `astro-7-upgrade`,
`split-project`, `style-boundary`, `saving-editing-form`,
`related-residue-verdicts`, two worktree branches, `opencode/hidden-circuit`).
Unmerged: `mock-data-world`, `t2-batched-backup`, and the `entire/*`
checkpoint refs (tool-owned, left alone). The index flagged two active plans
(`realised_by` backfill, pane-stack refit) as living only on unmerged
branches; checked against every ref, that note was stale — both files are on
main, mis-shelved in `plans/archive/`. The backfill plan's own frontmatter
says `status: "completed"` (its work landed in `a8793a64`); the pane-stack
plan is active (phase 4 gated) and main's copy is the fullest version
anywhere.

*Decision: housekeeping in this sitting, no plan.* Re-shelve both files to
their lifecycle directories, repair the index, delete the merged branches
not held by worktrees.

## Outcome record

All four decisions accepted and applied 2026-08-06:

1. Applied — `docs/project/operative-image.md`: current-picture clause
   rewritten (platform-first light-DOM + React subsystems), new substrate
   paragraph (zero shadow roots, `data-slot` composition, layered cascade,
   settled authoring spec, open library decision, recorded React boundary),
   bilingual-substrate bullet gains the matured-in-form clause,
   `component-authoring.md` added to Detail sources.
2. Applied — `docs/specs/workspace-layout.md`: components bullet and the
   directory-diagram label reworded to light-DOM with a pointer to
   `component-authoring.md`.
3. Applied — the tooling sentence (guard-script shelf, warn-loudly
   convention) folded into the new substrate paragraph.
4. Applied — `2026-07-realised-by-backfill.md` moved `archive/` →
   `completed/`; `2026-07-pane-stack-astro-fit.md` moved `archive/` →
   `active/` and given contract frontmatter; both index entries repaired
   (stale unmerged-branch notes dropped, backfill listed under Completed).
   Merged branches deleted: `astro-7-upgrade`, `related-residue-verdicts`,
   `saving-editing-form`, `split-project`, `style-boundary`. Left in place:
   four merged branches checked out in tool-managed worktrees
   (`worktree/calm-meadow-4329` (herdr), `opencode/hidden-circuit`,
   `worktree-block-editing-followups` (locked), the light-DOM refactor
   branch at `~/intent/workspaces/light-refactor`) — remove the worktrees
   first if they are done; and the remote branches `origin/split-project`,
   `origin/style-boundary`.

Derived working artifact deleted after folding.
