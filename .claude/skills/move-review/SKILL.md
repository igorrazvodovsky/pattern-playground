---
name: move-review
description: Design-layer review of a branch, organised by design move rather than file. Produces a walkthrough (or, past ~a dozen moves, an episode map plus per-episode walkthroughs) whose sections end in questions the author answers with accept / fix / reframe verdicts. Run in a fresh session, never the session that authored the changes. Use before merging a branch, when a plan completes on a long branch, or with `compose <branch>` once verdicts are written. Code correctness is not this skill's job — that stays with /code-review.
argument-hint: "[branch] | compose <branch>"
---

# Move review (Loop 1)

Review of the *design layer* of a branch: does each move cohere with the
language, and what did making it reveal? The walkthrough presents *moves and
backtalk* — what question each change asked of the situation and what the
situation answered — not "what changed and why". Verdicts have three outcomes,
not two: *accept*, *fix*, and *reframe* (the change violated the plan because
the plan's problem statement was wrong, and the violation is a discovery).

Defined by `plans/active/2026-07-review-practice.md` (or its completed
successor). This loop exercises *navigational* judgment per episode and
*compositional* judgment in the composition pass; framing judgment belongs to
`/reconcile-image`.

## Preconditions

- *Fresh session.* If this session authored any of the changes under review,
  stop and tell the user to re-run in a new session. Self-preference bias is
  the documented failure this rule guards against.
- *No attribution.* Subagent prompts say "evaluate these changes", never who
  or what authored them. The orchestrator constructs every prompt, so the
  reviewing context never learns the diff's provenance — keep it that way.
- *Grounding, not taste.* Judgments cite checkable documents:
  `docs/project/vision.md`, `docs/language/vision.md`,
  `docs/project/operative-image.md`, `docs/language/operative-image.md`,
  `docs/project/core-beliefs.md`, `docs/language/pattern-definition.md`,
  `docs/specs/`. A claim that cannot point at one of these (or at the diff)
  is an impression, and the walkthrough labels it as such.

## Orchestration: validate before spawning

The orchestrator does the fail-fast work itself, so a bad ref fails once
rather than inside several parallel reviews:

1. Resolve the branch (argument, or current branch). Pin the merge-base:
   `git merge-base main <branch>`. Record the exact SHA — every subagent
   prompt carries it.
2. Validate the diff: `git diff --stat <merge-base>...<branch>` must be
   non-empty and the endpoint must build-relevant paths. Note total size.
3. Collect the plan trail: plans added to `plans/completed/` or
   `plans/archive/` on the branch (`git diff --name-status` over `plans/`),
   plus any active plans the diff answers to.
4. Gauge scale. A walkthrough holds about a dozen moves. Under that
   threshold, run the *single-walkthrough form*; past it, run the
   *recursive form*. Two levels is the ceiling — a branch that would need
   three is a merge-cadence failure to report, not a deeper recursion.

## Single-walkthrough form

Spawn one review subagent with a self-contained prompt (a subagent sees
nothing the prompt doesn't carry):

- the merge-base SHA and branch, and how to take the diff;
- the plan trail, as file paths to read;
- the grounding-document paths;
- the section template and verdict checklist below, pasted in full;
- the output path and bound.

The subagent extracts *design moves* from the diff — conceptual units
(a vocabulary change, a doc restructure, a component split), not files.
Ordering is by *stakes descending*: reviewer attention declines with
position, so the moves that could damage the language come first. Moves
that answer to no plan are findings in themselves.

Output: `plans/reviews/<branch>/walkthrough.md`, bounded to roughly 300
lines.

## Recursive form

### 1. Episode map first

Segment by *plan trail, not by size*: each completed plan (or tight arc of
plans, e.g. a split and its closure) is one episode; commits answering to no
plan cluster into unplanned episodes by theme and proximity. An unplanned
episode is a finding before its review even runs.

Write the map to `plans/reviews/<branch>/00-episode-map.md`: one row per
episode with its plan(s), commit range or theme, diff territory (path
scopes), stakes rank, and calibrated depth (a config-hygiene episode does
not get the scrutiny a vocabulary change gets). Number episode files by
stakes rank (`01-…`, `02-…`) so the reading order is the attention order.

### 2. One episode per context

Spawn parallel subagents, one per episode, each with a self-contained
prompt: its diff scope (merge-base SHA + path territory), its plan file(s),
the grounding-document paths, the section template and verdict checklist
pasted in full, its output path (`plans/reviews/<branch>/NN-<episode>.md`),
and a bound (roughly 200 lines; fewer for low-depth episodes). Episodes are
judged independently — no subagent sees another's findings.

*Review the endpoint, read the trajectory*: the object is the endpoint diff
scoped to the episode's territory; the commit trail and plan are read for
backtalk, not re-adjudicated. Reversals already resolved in-branch are
learning material, not findings.

### 3. Author sittings (not the agent's job)

Verdicts are read and written one episode per sitting, stakes descending
across sittings as well as within walkthroughs. The skill's run ends when
the walkthroughs exist; it does not write verdicts.

### 4. Composition pass — `compose <branch>`, after the verdicts

Run only once every episode has written verdicts. Spawn one subagent that
reads the walkthroughs and verdicts — *not* the full diff — and asks the
compositional question: do the episodes compose, or merely coexist? Does the
branch pull the language in one direction or several? Same section template,
same verdict discipline. Output: `plans/reviews/<branch>/composition.md`.
If verdicts are missing, stop and say which episodes are unjudged.

## Section template (paste into every subagent prompt, verbatim)

```markdown
## Move N: <name>

*The move.* <What changed, described neutrally — no evaluation words.
Description precedes interpretation precedes judgment.>

*Answers to.* <Plan / spec / vision direction this serves, as a path or
quote. If nothing: "Answers to nothing on record" — that is a finding.>

*Backtalk.* <What making the move revealed: strain against existing
structure, surprises, things that got easier or harder downstream. Cite
the diff or a grounding document for every claim.>

*Question.* <Questions the author must answer — about coherence with
the language, not about correctness. Never a summary. Not 1:1 with
moves: a trivial move's question may be skipped entirely (write "No
question — <why it is trivial>"), and a loaded move may carry several.
A deviation from a recorded decision is never merely narrated: either
resolve it in backtalk with the reasoning shown, or raise it as a
question — an unadjudicated deviation is the failure mode.>

*Verdict:* ☐ accept / fix / reframe — <author writes a sentence here;
one verdict per move, covering all its questions>
```

## Verdict checklist (paste at the top of every walkthrough, verbatim)

```markdown
## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | <name> | ☐ |
```

## Boundaries

- *Correctness is out of scope.* `/code-review` and the quality gates own
  it. When both run on a branch, findings stay side by side — never merged
  into one ranked list; one axis masking the other is the failure the
  separation prevents.
- *No verdict ghost-writing.* Sections end in questions; the author's
  written sentence is the comprehension check. Pre-filled verdicts defeat
  the loop's purpose.
- *Housekeeping.* `plans/reviews/<branch>/` persists across sittings and
  moves to `plans/archive/` when the branch merges.
