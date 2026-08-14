# Plans as executable specifications

`plans/` holds executable specifications for changing the repository. A plan is
a living work packet: it describes intent, implementation shape, validation,
discoveries, decisions, and outcomes well enough that a person or agent can
resume the work from the file.

Plans are not automatically the current source of truth after implementation.
When stable behavior, vocabulary, or structure emerges from a plan, promote that
residue into `docs/specs/`, another durable doc, a schema, a script, generated
data, a lint rule, or source code. The completed plan remains useful as an
execution trace and rationale.

## Residue

A closing plan leaves residue of four kinds, each with its own home:

1. *Rules* — conventions, vocabulary, schema fields, ownership rules that future instances must follow. Promote into a settled spec, a language doc, a `.claude/rules/` file, a check script, or code. Usually a sentence or two in an existing spec, not a new document.
2. *State* — changes to what is true about the artifact now. Land in the operative-image docs via the reconciliation loop.
3. *Content* — pages, edges, components, stories the plan produced. The artifact is its own residue; nothing to promote.
4. *Judgment* — one-off decisions that don't generalise. They stay in the plan as the execution trace.

The closing question for every plan: did it
create any rules, and did they land where the next instance will find them?

## Lifecycle folders

- `active/` — work that is in flight or still expected to guide implementation.
- `completed/` — work that landed, closed, or produced a finished research
  artifact.
- `paused/` — plausible work that is not currently being executed.
- `superseded/` — work replaced by a later plan or settled specification.
- `archive/` — older historical plans kept for reference.

Keep the date in the filename (`YYYY-MM-title.md` or `YYYY-title.md`) so the
lifecycle folder answers the current role while the filename preserves
chronology.

## Frontmatter

Migrated or newly authored plans should carry:

```yaml
---
title:
status: active | completed | paused | superseded | archived
kind: exec-spec | research-gate | work-queue | decision-record | retrospective
created:
last_reviewed:
area:
promoted_to:
superseded_by:
---
```

`promoted_to` is required on completed plans: the paths where rule and state
residue now live (a parenthetical note may name the section or mechanism), or
`none — <reason>` when the plan left only content or judgment residue.
`scripts/check-plan-promotions.mjs` verifies the field is filled and its paths
exist. Use `superseded_by` when a plan is no longer the right frame.

## Authority rule

If a completed plan disagrees with a settled spec, the settled spec wins unless
the plan explicitly says it supersedes that spec. If an agent still needs a
completed plan to understand current behavior, promote the stable part into a
settled spec or enforcement mechanism.
