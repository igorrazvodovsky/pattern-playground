---
name: reconcile-image
description: Reconciliation review (Loop 2) — re-derive the operative image from the repository via a blinded subagent, diff it against the recorded operative-image and vision documents, and produce the three-way decision list (vision changes / image catches up / gap becomes a plan). Run per plan completion or after a large merge; after a large merge it follows the /move-review composition pass. Exercises framing judgment.
argument-hint: "[project | language | both (default)]"
---

# Reconciliation review (Loop 2)

Operationalises the dialectic `docs/index.md` defines and the "How to use
this page" procedure in `docs/project/vision.md` prescribes. The mechanism
that makes it a *measurement* rather than proofreading: the operative image
is *re-derived from the repository fresh*, then compared against the
recorded documents. An agent that reads the recorded image first anchors
on it — so the deriving context never sees those documents at all.

Defined by `plans/completed/2026-07-review-practice.md`. This loop exercises *framing* judgment: were the boundaries and
problem statements right?

## Blinding is structural, not an instruction

Do not tell a subagent "don't read file X" — an agent told that still knows
the file exists and matters. Instead, the orchestrator (this session) writes
a derive prompt that simply *never mentions* the recorded documents, and the
orchestrator, not the deriver, runs the comparison.

The orchestrator must not paste recorded-image content into the derive
prompt, and must not run the derivation itself after having read the
recorded documents in this session. If this session has already read
`docs/project/operative-image.md`, `docs/language/operative-image.md`,
`docs/project/vision.md`, or `docs/language/vision.md`, that is fine — the
*subagent* is the blinded party.

## Procedure

### 1. Derive (blinded subagent)

Spawn one subagent per scope (project, language, or both in two subagents)
with a self-contained prompt along these lines — note it names only primary
sources:

> Survey this repository as it stands and write a working picture of
> [the project's surfaces, substrate, and tooling | the pattern language:
> its roles, relationship vocabulary, graph, and content organisation].
> Read the workspace layout (`package.json` workspaces, `apps/`,
> `packages/`), the built surfaces (`apps/patterns/`, Storybook config),
> the content collections and their frontmatter, the generated graph
> artifacts, `plans/index.md`, and whatever else the repository itself
> offers. Describe what *is*, including seams, half-finished states, and
> load-bearing conventions. Do not consult `docs/` — derive the picture
> from the territory, not the map. Write the result to
> `plans/reviews/reconciliation-<date>-derived-<scope>.md`, bounded to
> ~150 lines.

(The one allowed mention of `docs/` is the exclusion itself; it does not
name which documents record the image, and the deriver has no authoring
context to guess from.)

### 2. Compare (orchestrator)

Read the derived picture(s) alongside the recorded ones —
`docs/project/operative-image.md`, `docs/language/operative-image.md` — and
the two visions — `docs/project/vision.md`, `docs/language/vision.md`.
List divergences: things the repository has that the record lacks, things
the record asserts that the repository no longer supports, and directions
the visions name that neither territory nor record is moving toward.

### 3. Decide three ways

Each divergence gets exactly one of the three outcomes the docs already
prescribe, with a proposed edit or plan stub:

1. *The vision should change* — the current state revealed the direction is
   incoherent or pulls against the garden constraint
   (`docs/project/core-beliefs.md`). Propose the vision edit.
2. *The operative image should catch up* — the direction holds; the record
   lags. Propose the operative-image edit.
3. *The gap becomes a plan* — actionable enough for `plans/active/`.
   Propose a plan stub (title, problem statement, first step), not a full
   plan.

Where Loop 1 verdicts on the branch include *reframe* outcomes, consolidate
them here into actual edits to the vision and operative-image documents —
this is where co-evolution gets honoured on the record. Check
`plans/reviews/<branch>/` for verdict files before finishing.

### 4. Deliver

Present the divergence list with its three-way decisions and proposed edits
to the user; apply the document edits they accept. Write the decision list
to `plans/reviews/reconciliation-<date>.md` so it survives the session. The
derived-picture files are working artifacts; fold anything worth keeping
into the decision file and delete them once the reconciliation lands.

## Boundaries

- Adjacent to, not a substitute for, the `/move-review` composition pass:
  that judges the *branch* as a composed whole against the language; this
  re-derives the image from the *repository* as it now stands. For a large
  merge the order is episode reviews → composition pass → reconciliation.
- The three-way decision is the author's. Propose; do not edit vision or
  operative-image documents without the user accepting the specific edit.
