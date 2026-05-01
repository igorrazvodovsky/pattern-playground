# Agent harness specification

This repository uses a thin-map harness: short entry points route agents to
durable, topic-specific sources of truth instead of putting the whole project
manual in one prompt.

## Current contract

- `AGENTS.md` is the canonical agent entry map.
- `docs/index.md` is the sectioned knowledge-base map for humans and agents.
- `ARCHITECTURE.md` names the tech stack, major directories, and structural
  tensions.
- `.claude/rules/` holds path-activated coding guidance and should not be read
  eagerly.
- `docs/specs/` holds settled specifications: current truth about project
  structure, graph semantics, taxonomy, and role distinctions.
- `plans/` holds executable specifications: living work packets for changing
  the repo.
- `plans/tech-debt-tracker.md` records known rough edges that are not currently
  executable plans.

## Promotion rule

When a plan lands, promote stable commitments into `docs/specs/`, another
durable doc, code, generated data, a schema, a script, or a lint rule. Leave the
plan as the execution trace: what was attempted, what changed, what surprised
the implementer, and where the current truth now lives.

## Enforcement

The harness prefers small, inspectable checks over broad autonomy. Existing
checks include the agent stub check, taxonomy sync check, classification health
scan, ESLint, and Stylelint. New enforcement should be added only when a rule is
stable enough to keep applying without human reinterpretation.
