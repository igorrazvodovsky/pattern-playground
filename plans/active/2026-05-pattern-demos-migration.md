---
title: "Migrate pattern demos from Storybook to pattern site"
status: "active"
kind: "exec-spec"
created: "2026-05-17"
area: "pattern-site"
depends_on: "plans/archive/2026-05-embed-components.md"
---

# Migrate pattern demos from Storybook to pattern site

> _Superseded in part._ The demos home is now `packages/components/src/demos/`,
> not `packages/components/src/demos/` — see
> [workspace-layout](../../docs/specs/workspace-layout.md) (Shared demos). Path
> references below have been corrected. Two model assumptions also predate the
> realised tree and should be revisited before executing the remaining phases:
> (a) demos are keyed by the _component_ they wire and shared across pattern
> pages, not one file per pattern×story, so the `<PatternName><StoryName>Demo.tsx`
> naming in Phases 3–4 no longer fits; (b) a demo that several pattern pages share
> belongs in the components package by the spec's shared-consumption rule, which
> blurs the A/B/C-per-story framing. The classification still holds as a _verdict
> shape_ (Storybook-native vs migrate, and the gap-registry byproduct); the file
> destinations and naming need reconciling with the component-keyed tree.

## Context

Many pattern MDX files in `packages/components/src/stories/` reference `.stories.tsx` siblings via `<Story of={...} />`. These are the primary demo surface for patterns today. With the pattern site live and the embed substrate in place (see `plans/archive/2026-05-embed-components.md`), those demos need new homes.

The guiding policy: Storybook stories keep only the parts that benefit from Storybook's specific affordances — controls panel, accessibility checker, canvas isolation, args-based variant generation. Everything else migrates to the pattern site.

This plan also surfaces a byproduct: a *component gap registry* — a global list of missing components whose absence is only legible once you try to migrate the bespoke story code that stands in for them.

## Two questions per story

Every `<Story of={...} />` reference gets two verdicts:

1. *Does this demo benefit from Storybook?* If controls panel, a11y checks, or args-driven variants are the point, it stays. If the story exists purely to illustrate the pattern, it migrates.

2. *Does migrating this demo require a component that doesn't exist yet?* If yes, the missing component is logged in the gap registry. Migration proceeds anyway — the bespoke story JSX becomes a temporary island, annotated as a gap placeholder.

## Classification

The verdicts above produce four classes:

- *Storybook-native* — stays. Pattern page links to it via `<ComponentRef>`. This is the right home for any demo where the controls panel or a11y check is genuinely informative.
- Class A — pure composition of registered `pp-*` elements. Migrates as `<Example>` markup in the pattern MDX. Trivial; no island needed.
- Class B — composition with a thin shell (sample data, local state, layout container). Shell migrates as a named component in `packages/components/src/demos/`, used inside `<Example>`.
- Class C — bespoke JSX because the underlying reusable component doesn't exist yet. Migrates as a demo island in `packages/components/src/demos/`, annotated with a `// gap:` comment. Missing component logged in the gap registry.

Class D (APG-split entries) is inherited from the workspace-split audit: demos for those entries are gated on the move/mechanism split for that pattern and are not classified or migrated here.

## Gap registry

A standing file at [`plans/component-gaps.md`](../component-gaps.md), sibling to the tech debt tracker. One row per missing component, populated as a side effect of the audit:

```md
| Component | Pattern(s) needing it | Story context | Notes |
|---|---|---|---|
| ActivityEntry | Activity log | LLMReasoning | Renders bot-event rows with reasoning chain |
```

The registry is a byproduct of the audit, not a deliverable in itself. It doubles as a components-library backlog: any entry here is a signal that a pattern is illustrating something the library can't yet compose from parts.

## Sequencing with Phase D (MDX migration)

The preferred approach is *interleaved*: when a pattern page migrates from Storybook MDX to the pattern site in Phase D of the workspace-split plan, its story demos are classified and migrated at the same time. This avoids a second full pass over every file.

The audit (Phase 1 below) can run before the MDX migration is complete — it operates on the existing Storybook MDX and stories files. The per-class migration work (Phases 2–4) produces the demo islands that land alongside the migrated MDX.

## Phase 1 — Audit

Walk every pattern MDX in `packages/components/src/stories/` that has at least one `<Story of={...} />` reference.

For each story reference:
- Read the `.stories.tsx` implementation.
- Apply the Storybook-benefit test: does this demo need controls, a11y, or args-driven variants? Mark *Storybook-native* if yes.
- If migrating: classify A, B, or C.
- For Class C: name the implied missing component(s) and add to the gap registry.
- For Class D: mark as deferred (APG-split gate); skip.

Output: `apps/patterns/src/data/story-audit.md` — a table with columns: pattern path, story name, class, migration status, notes. The gap registry is populated as a side effect.

## Phase 2 — Class A migrations

For each Class A story:
- Translate the story render output into `<Example>` markup in the corresponding pattern MDX on the pattern site.
- Add `storyId` to the `<Example>` if a Storybook-native version of the same story exists (controls, a11y).
- If the Storybook story has no Storybook-native reason to remain, remove the `<Story of={...} />` from the Storybook MDX. If the `.stories.tsx` entry has no remaining stories used by Storybook, remove it.

## Phase 3 — Class B migrations

For each Class B story:
- Extract the wrapper into a named component in `packages/components/src/demos/`. Naming convention: `<PatternName><StoryName>Demo.tsx` (e.g. `FilteringLLMFilterDemo.tsx`).
- Use the wrapper inside `<Example>` in the pattern MDX.
- Same removal logic as Phase 2 for the Storybook MDX reference.

## Phase 4 — Class C migrations

For each Class C story:
- Migrate the bespoke JSX as a component in `packages/components/src/demos/`.
- Add a comment at the top: `// gap: [ComponentName] — replace once real component exists`.
- Add the missing component to the gap registry if not already present.
- The corresponding Storybook story may remain: it serves as a reference implementation for whoever eventually builds the real component.

## Phase 5 — Storybook cleanup

After all pattern stories are classified and migrated or explicitly kept:
- Storybook MDX files for `role:pattern` / `role:umbrella` entries that had all their `<Story>` references handled: collapse to a stub or remove (per the cross-surface reference scheme decided in the embed-components plan).
- `.stories.tsx` files with no remaining Storybook-native stories: remove.
- The Storybook tree should contain only: `role:component` entries, Storybook-native pattern stories (kept by verdict), and material foundations.

## Out of scope

- Class D (APG-split) entries — gated on the workspace-split move/mechanism split decisions.
- Unmigrated foundations/material subtree (Color, Typography, Motion) — those MDX pages don't exist yet.
- Authoring new demos for patterns that have no story today — author discretion applies; this plan only migrates existing stories.
- Filling the component gaps — building the missing components is a components-library task. This plan identifies the gaps and keeps the demos running in the interim.
- PatternGraph island (separate plan).

## Verification

- Every pattern in the audit table has a class verdict and a migration status.
- All Class A and B demos render correctly in the pattern site; custom elements behave as expected.
- All Class C demos render with approximate fidelity; each has a corresponding gap-registry entry.
- The gap registry is committed and non-empty.
- Storybook-native stories continue to work and pass a11y checks.
- `npm run build` in both `apps/patterns/` and `packages/components/` exits cleanly.
- No dangling `<Story of={...} />` references in Storybook MDX — every reference is either a Storybook-native verdict or has been removed.
