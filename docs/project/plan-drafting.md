# Plan drafting

Process notes for how executable specifications in [`plans/`](../../plans/)
get written. Narrow and process-focused; broader project commitments live in
[core-beliefs.md](./core-beliefs.md), and the plan lifecycle contract lives in
[`plans/README.md`](../../plans/README.md).

## Research checkpoint for problems without a straightforward solution

When a plan addresses a problem that doesn't have an obvious solution or an established best practice — anything that requires inventing vocabulary, committing to a shape, or making a judgement call about how to approach a fuzzy domain — treat external research as a gate before locking in. But *after* the strawman, not before.

The order matters in both directions:

1. *Strawman first, from internal reasoning.* Write the approach from the project's own framing and what's already in the repo. Forming a view before reading external traditions is what lets the project diverge from them when divergence is warranted. Anchoring on others' framings prematurely is a real cost — some of the project's strongest deliberate differences from contemporary practice came from not having read the literature first.
2. *Then research before commit.* Survey how the field — or adjacent fields — currently handle the same problem. Frame it as "what would I be wrong about?" rather than "what should I copy?" The goal is stress-testing the strawman, not adoption. Most findings will confirm the strawman; the valuable ones are the surprises.
3. *Record what was deliberately not adopted.* Differences that survive the research pass are choices, and worth naming as such — in the plan itself and in any vocabulary, doc, or convention the plan touches. Future readers should be able to see that an alternative was considered, not assume it was missed.

The trigger is the *shape of the problem*, not the size of the change. Apply when:

- the plan reaches for a vocabulary or classification that doesn't yet exist in the repo
- the plan commits to a structure that would be hard to revise (extraction shapes, schemas, storage conventions, naming systems)
- the problem is one where "what does good look like?" isn't obvious from the requirements alone
- the work is in a domain the project hasn't engaged with before, even if the change is small

Skip for: pure feature work with a clear target, bug fixes, refactors with a known destination, mechanical follow-ups to an already-researched plan. The [`/research`](../../.claude/skills/research/SKILL.md) skill and [`references/`](../../references/) directory are the standing infrastructure for this checkpoint.
