---
title: Mine the fifteen properties from the corpus
status: active
kind: research-gate
created: 2026-08-05
last_reviewed: 2026-08-05
area: language
promoted_to:
superseded_by:
---

# Mine the fifteen properties from the corpus

[docs/language/vision.md](../../docs/language/vision.md) Track 1 assumes the
route to the Nature of Order register is *discovery*: find interaction-design
analogues of Alexander's structural properties from first principles, one at a
time, the way [levels-of-scale.md](../../docs/levels-of-scale.md) was done. It
calls this "the long horizon, and it is not close."

Alexander offers a cheaper route and never takes it. *The Nature of Order* Book
2 ch. 13 §13 claims the properties are **already inside** well-made patterns:

> "Deep inside the elements of the pattern language there are references to, and
> hints of, the fifteen transformations… the fifteen properties are embedded,
> sometimes loosely, sometimes precisely, in the patterns."

The claim is testable against a published corpus of 253 patterns. Nobody has
ever run it — not Alexander, not the secondary literature. This project has 96
`role: pattern` pages written to a definition that demands situation, forces,
invariant move, and produced centre. That is a corpus the claim can be run
against, and running it is cheaper than deriving fifteen analogues.

This plan is research-gated. It mines, it reports, and it does **not** mint an
edge type or a facet until the mining says there is something to encode.

## What this settles that the project has already asked

Two of the vocabulary doc's open questions are in scope, and they currently
disagree with each other.

*Open question 6* ([relationship-vocabulary.md](../../docs/language/relationship-vocabulary.md)):

> "A structural-property layer underneath qualities? The use qualities are
> experiential dimensions, not structural properties — but there may eventually
> be a vocabulary for *structural* properties of interaction that sits
> underneath them, in the same way that 'the building feels welcoming' sits
> above 'the entrance has levels of scale, strong centres, and thick
> boundaries.'"

*Open question 5's addendum* ([research/pattern-foundation-serves/2026-07-12.md](../../research/pattern-foundation-serves/2026-07-12.md)),
recording author calibration at review:

> "this project's foundations … are not the same kind of thing as Alexander's
> fifteen properties; the *qualities* are the closer analogue"

Those cannot both hold. If the properties **are** the qualities, there is no
layer underneath and OQ6 dissolves. If a structural layer sits underneath the
qualities, the properties are not the qualities and the 2026-07-12 calibration
needs revising.

Ch. 13 §13 arbitrates, and against both: the properties are embedded in the
**moves**. Not a lens above them, not a substrate beneath them — *inside* them,
as the structural content of the transformation the move performs. On that
reading a property is neither a quality nor a foundation but the answer to *what
does this move do to the field*, where the quality is the answer to *what does
that read as*.

That is a third position, it is checkable, and checking it is what this plan
does.

## Strawman

Held loosely; the calibration batch exists to break it.

- The properties are recoverable from the corpus at better-than-chance
  legibility, but **fewer than fifteen** survive the medium change. Expect the
  configurational ones (strong centres, boundaries, levels of scale, positive
  space, not-separateness, contrast, gradients) to transfer and the
  visual-geometric ones (alternating repetition, echoes, roughness, the void,
  good shape) to transfer weakly or not at all.
- Property assignment will be **partially independent** of `enacts` — enough
  that it is not a re-encoding, not so much that the two layers are unrelated.
- The interesting output is not the assignments but the **misses**: a property
  no page embodies is a claim about the medium, and a property every page
  embodies is a claim about the property's uselessness as a discriminator.

## Verdicts the gate can return

Three, and all three are publishable findings.

1. *Re-encoding.* Property assignment correlates strongly with existing `enacts`
   edges and adds no independent structure. The fifteen are the qualities under
   different names; OQ6 dissolves; the 2026-07-12 calibration was right. **Stop
   here** — do not mint anything, record the negative in the vocabulary
   changelog.
2. *Independent layer.* Property assignment is largely independent of `enacts`,
   and configurations of properties correlate with quality effects across the
   corpus. That is [design-theory.md](../../docs/language/design-theory.md)'s
   own stated bar — "if certain structural configurations consistently correlate
   with certain quality effects, those configurations become candidates for
   properties." OQ6 answered yes. **Proceed to an encoding decision**, taken
   through the vocabulary changelog like any other.
3. *Medium failure.* Assignment is arbitrary, inter-pass agreement is at chance,
   or most patterns embody nothing. The fifteen do not survive the translation
   from geometry to a psychosemiotic medium, and Track 1's per-property
   derivation route is the only one available — which is worth knowing before
   spending years on it. **Stop, and revise vision.md Track 1** to say so.

Verdict 3 is a real possibility and the plan is built so that reaching it is not
a failure.

## Method

### The medium problem, and the trap in solving it

Alexander's properties are geometric. This project's centres are
*psychosemiotic* — "identified by the distinction they introduce rather than by
visual form" ([conceptual-glossary.md](../../docs/language/conceptual-glossary.md)).
So each property needs a translation before it can be mined, and the translation
step is where the exercise can quietly fail:

- **Pre-translate carefully** and the mining returns the translations. You find
  what you defined into existence.
- **Mine against the raw geometric definitions** and every assignment is a
  metaphor, agreement collapses, and verdict 3 arrives for the wrong reason.

This is Book 2 ch. 13 §6's own dilemma in miniature — derive from what exists
and you reiterate it, depart from it and you have no warrant. Alexander's own escape was procedural, not conceptual: four observers
working independently, and anything not reported by all four gets discarded.

The analogue here is **blinded independent derivation**. Two passes over the
same pages, run without sight of each other's assignments or of the page's
existing `enacts` edges; only assignments both passes reach independently enter
the finding set; single-pass assignments are logged separately as the near-miss
list. Same shape as the blinded-derive arm in
[review-loop-workflows](./2026-07-review-loop-workflows.md), and the reason to
script it there applies here: blinding has to be structural or it does not hold.

### Verb form, not noun form

Mine against the **transformations** (Book 2 ch. 2 §8's operator restatement),
not the properties (Book 1 ch. 5's adjectives). A move is a transformation; the
question asked of a page is *what does this move do to the field*, which the
verb form can answer and the adjective form cannot.
[design-theory.md](../../docs/language/design-theory.md) already names the dual
noun-verb character as the thing the qualities lack. Record the noun as the
result of the verb.

### Glosses: thin on purpose, revised as the primary output

Write a deliberately thin operational gloss per transformation before starting —
one sentence, no examples, no interaction-design vocabulary smuggled in. Treat
**revision of the gloss** as a first-class output, logged per batch with what
forced the revision.

A gloss that never needed revising across the batch is suspicious: it either
did no work or was written to fit what the corpus already says.

### Batches

1. *Calibration batch — 20 pages.* Stratified across `activityLevel` (the
   corpus is 17 activity / 51 action / 29 operation) and across the seam that
   matters most: pages named for a move (`bounded-choice`,
   `disengage-without-closing`, `human-goes-first`) against pages named for a
   thing (`command-menu`, `multilevel-tree`, `activity-feed`,
   `block-based-editor`). If the properties are structural content of the
   *move*, thing-named pages should mine worse — which is a second, independent
   test of the role model's own naming rule.
2. *Gate.* Read agreement rate, independence from `enacts`, gloss-revision log,
   and the miss list. Decide: continue, adjust the glosses and re-run
   calibration, or return verdict 3.
3. *Full sweep — remaining 76 patterns*, only if the gate says continue.
4. *Interdependence check.* Record property co-occurrence per page and compare
   the resulting structure against Alexander's own interdependence matrix
   (*The Phenomenon of Life* p. 238), already filed in
   [research/pattern-foundation-serves/2026-07-12.md](../../research/pattern-foundation-serves/2026-07-12.md).
   If the corpus's co-occurrence structure resembles his dependence structure,
   that is the strongest available evidence the properties transferred rather
   than being projected. Cheap, falsifiable, and the reference material is
   already in the repo.

### Recording

`research/property-mining/` — persistent `query.yml`, dated per-run syntheses,
per-batch assignment tables. A run folder is a durable citation; failed runs
stay ([docs/research/README.md](../../docs/research/README.md)).

Assignments live in the research folder, **not** in frontmatter, until a verdict
lands. Nothing touches `apps/patterns/src/content/patterns/` in this plan.

## Named risks

- *The checklist relapse.* The fifteen degrade into an annotation checklist
  every time anyone uses them for labelling — Alexander does it himself in Book
  2 chs. 3, 5, 9 and 11, annotating finished work retrospectively and calling it
  evidence. Retrospective annotation of a corpus is exactly that operation. The
  guard is that **misses are the finding**: a batch that assigns properties to
  every page and reports no absences has run the checklist, not the mine.
- *Contamination from `enacts`.* If the miner can see the quality edges, the
  independence test is dead. Blinding is the whole design; if it cannot be made
  structural, the plan is not worth running.
- *The corpus is not neutral evidence.* It was written by one person, in one
  medium (work-support tools), to a definition that already borrows Alexander's
  vocabulary — `pattern-definition.md` requires a pattern to produce "a centre
  or affordance". Finding centres in a corpus that was told to produce them is
  not a discovery. State this in the synthesis; it caps how strongly verdict 2
  can be read.
- *Suggestion-grade drift.* Whatever gets encoded later must stay hint-grade
  under the [epistemic stance](../../docs/language/relationship-vocabulary.md)'s
  consumer contract. A property assignment is not a predicate, and no pipeline
  step may route on one. Worth restating at encoding time because a structural
  layer is precisely the kind of thing that tempts a rule engine.

## Discovery already made

*The one existing worked translation targets a different medium than the corpus
does.* [levels-of-scale.md](../../docs/levels-of-scale.md) translates the
property into **repository legibility** — documentation strata, specificity
gradient, what an agent can see from repository-local artifacts. Its worked
example is `CLAUDE.md` and the docs stack. That is a translation into *software
as a system to be understood*, not into *interaction as a medium to be
designed*, and the corpus is entirely the second.

vision.md calls it "the first worked translation of one property into software"
and Track 1 treats it as the precedent for the rest. It is a good document; it
is not a precedent for mining the corpus, and it sits at `docs/` root rather
than under `docs/language/`, which may be the filing system already knowing
this.

Either the project has two property programmes — repo-legibility and
interaction-medium — and should say so, or levels-of-scale.md is a foundations
document that Track 1 has been miscounting as progress. Not this plan's call;
recorded here because the gate's verdict changes which answer is comfortable.

## Out of scope

Three other challenges from the same chapter were considered and deliberately
left out, so a later reader knows they were seen and not missed:

- *Provenance and the latency test* (§§6, 12) — the minimum pattern test asks
  what a page must contain, never where the pattern came from or whether it was
  already half-happening in the field. Only 52 of 119 pages carry `evidence:`.
- *Project language as an artefact* (§3, claim 12) — "for any new building
  project it is necessary to **construct** such a language"; a general
  repertoire is raw material, never the deliverable. There is no notion here of
  instantiating a selected, ordered, locally-extended language for one context.
- *Replication and the fitness lens* (§4, note 10) — "patterns which are good
  for profit are easy to define. And they spread easily." Reframes prevalence
  and anti-patterns: common because it works, or common because it is cheap to
  copy and pays?

## Source

*The Nature of Order*, Book 2, ch. 13 "Patterns: Generic Rules for Making
Centers" — §13 for the embedding claim, §3 for patterns as rules for making
centres, §12 for latency as the essentiality criterion. Reading notes and the
open question this plan acts on are in the author's Nature of Order vault
(`Reading notes/Book 2/13 Patterns — Generic Rules for Making Centers — notes`,
open question 3).
