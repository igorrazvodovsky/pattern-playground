# Plans as executable specifications

`plans/` holds executable specifications for changing the repository. A plan is
a living work packet: it describes intent, implementation shape, validation,
discoveries, decisions, and outcomes well enough that a person or agent can
resume the work from the file.

A plan is not the source of truth after implementation. When stable behaviour,
vocabulary, or structure emerges from a plan, promote that residue into
`docs/specs/`, another durable doc, a schema, a script, generated data, a lint
rule, or source code. Once the residue has landed, most plans are deleted. The
code, the pattern page, and `git log` on their paths are the record of what was
built and how.

## Residue

A closing plan leaves residue of four kinds, each with its own home:

1. *Rules* — conventions, vocabulary, schema fields, ownership rules that future instances must follow. Promote into a settled spec, a language doc, a `.claude/rules/` file, a check script, or code. Usually a sentence or two in an existing spec, not a new document.
2. *State* — changes to what is true about the artifact now. Land in the operative-image docs via the reconciliation loop.
3. *Content* — pages, edges, components, stories the plan produced. The artifact is its own residue; nothing to promote.
4. *Judgment* — one-off decisions that don't generalise. If they explain why the project is shaped as it is, the plan is kept for them; otherwise they go with the plan.

The closing question for every plan: did it create any rules, and did they
land where the next instance will find them?

## Closing a plan

Closing has three steps: promote the rule and state residue, answer the
closing question, then decide whether the plan file stays.

A closed plan stays, in `completed/`, only when it carries rationale the
repository would otherwise lose:

- a decision between live alternatives, with the alternatives and the reasons
  (a `decision-record`, or an exec-spec whose context argues a direction);
- a research gate whose digest a later decision relies on;
- a retrospective whose observations are recorded nowhere else;
- a worked instance that a doc, rule, or skill points at by path.

Everything else is deleted at close: implementation plans for a specific
pattern, component, demo, or sweep; work queues; audits whose verdicts were
executed; plans whose rationale already lives in the spec they were promoted
to. Before deleting, unwrap or redirect any links that point at the file.

A plan replaced by a later plan or a settled spec is deleted the same way. The
replacing document names what it replaced; the replaced file does not need to
stay for that.

## Lifecycle folders

- `active/` — work that is in flight or still expected to guide implementation.
- `paused/` — plausible work that is not currently being executed.
- `completed/` — closed plans kept for their rationale (see §Closing a plan).
- `archive/` — review runs, one directory per reviewed branch, written by the
  move-review skill.

Keep the date in the filename (`YYYY-MM-title.md` or `YYYY-title.md`) so the
lifecycle folder answers the current role while the filename preserves
chronology.

## Frontmatter

Plans carry:

```yaml
---
title:
status: active | completed | paused
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
exist. Use `superseded_by` on an active or paused plan that a later plan has
replaced, until the replaced plan is deleted.

## Authority rule

If a completed plan disagrees with a settled spec, the settled spec wins unless
the plan explicitly says it supersedes that spec. If an agent still needs a
completed plan to understand current behavior, promote the stable part into a
settled spec or enforcement mechanism.
