# Review routing

Two review axes, deliberately separate. When both run on the same branch,
their findings stay side by side — never merged into one ranked list.

## Correctness → `/code-review`

After completing any implementation or change to code, run the built-in
`/code-review` skill (or let the standing quality gates catch it — see
[testing-strategy.md](./testing-strategy.md)). It covers quality, security,
maintainability, errors, and best-practice violations. Address the findings
before considering the implementation complete.

## Design layer → `/move-review`

Correctness review does not ask whether a change coheres with the pattern
language. That is Loop 1 of the review practice: `/move-review`, run in a
fresh session before a branch merges (or per episode on a long branch). It
produces a walkthrough organised by design move, with accept / fix / reframe
verdicts written by the author. Companion loops: `/reconcile-image` per plan
completion or large merge, `/drift-review` monthly.

The practice is specified in
[plans/active/2026-07-review-practice.md](../../plans/active/2026-07-review-practice.md).
