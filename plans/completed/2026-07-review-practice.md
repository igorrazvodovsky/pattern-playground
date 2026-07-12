---
title: "Review practice: moves, reconciliation, drift"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-12"
area: "process"
promoted_to: ""
superseded_by: ""
---
# Review practice: moves, reconciliation, drift

A review practice for a single-author project where an agent does much of the
making and the author's own thinking is part of what needs reviewing. Adapts
the mechanics of [Håklev's ai-pr-review](https://github.com/houshuang/ai-pr-review)
(described in [How I keep accidentally building](https://networkedthought.substack.com/p/how-i-keep-accidentally-building))
to this project's design-process frame: vision → operative image →
specification, problem–solution co-evolution, and design as conversation with
the situation.

## Design framing

Håklev's tool solves *comprehension of generated code*: an AI narrative
walkthrough ordered logically rather than alphabetically, progress tracking so
nothing is skipped, and comments flowing back to the PR. His diagnosis — the
bottleneck has shifted from production to comprehension — applies here, but
the object under review differs in two ways:

1. *Half the diff is thinking, not code.* On a branch like `split-project`,
   the consequential changes are conceptual: role models, relationship
   vocabularies, doc restructures. "Is this correct?" is the wrong first
   question for those. The right one is: *does this move cohere with the
   language, and what did making it reveal?*
2. *There is no second human.* The collaborative layer drops out, but so does
   the natural error-correction a colleague provides. The practice has to
   supply that adversarial distance artificially.

The design-process concepts say what review *is* in this setting:

- *Vision → operative image → specification* gives review its altitudes. Code
  review checks the specification level. Most of this project's risk sits
  higher: a change can be locally correct and still strain the operative
  image or pull against the vision. `docs/index.md` already runs this
  dialectic; the practice below operationalises the "How to use this page"
  procedure that `docs/project/vision.md` prescribes.
- *Problem–solution co-evolution* means a review verdict needs three outcomes,
  not two. Besides *accept* and *fix* there is *reframe*: the change violated
  the plan because the plan's problem statement was wrong, and the violation
  is a discovery. A review process that only knows accept/fix will silently
  suppress the project's main way of learning.
- *Design as conversation* recasts the walkthrough itself. Instead of "what
  changed and why" (a justification genre), the narrative should present
  *moves and backtalk*: what question each change asked of the situation, and
  what the situation answered — what got easier, what strained, what new
  possibilities or problems the move revealed. Review becomes structured
  listening, Schön's reflection-on-action given a surface. The fresh-session
  rule doubles as L&S's *retrospective reflection*: analysing a finished
  design backward, inferring the thinking that guided it, without access to
  the thinking itself.
- *Judgment has three forms* — framing, navigational, compositional — and the
  loops divide them rather than blur them. Loop 1 verdicts exercise
  navigational judgment (which directions to keep, which to abandon); its
  composition pass (below) exercises compositional judgment (do the parts
  form a whole or an aggregate); Loop 2 exercises framing judgment (were the
  boundaries and problem statements right). Naming the form each loop asks
  for keeps them from collapsing into one undifferentiated "review".

## The three loops

Three review loops at three cadences, matching the three altitudes. All start
as skills (Håklev's own trajectory — prompt → skill → tool — argues for not
building UI until the prompt form proves insufficient).

### Loop 1 — Move review (per branch before merge; per episode on a long branch)

A project skill (working name `/move-review`) run in a *fresh session*, not
the session that authored the changes.

Input: the branch diff plus the plan(s) it answers to. Output: a walkthrough
organised by *design move*, not by file. Each section:

1. *The move* — described neutrally before any judgment, following studio-crit
   genre (description precedes interpretation precedes judgment; see the
   [design critique literature](https://interactionculture.net/2018/08/15/handout-design-critique/)).
2. *Answers to* — which plan, spec, or vision direction this move serves.
   A move that answers to nothing is itself a finding.
3. *Backtalk* — what the move revealed: strain against existing structure,
   surprises, things that got easier or harder downstream.
4. *A question, not a summary* — each section ends with something the author
   must answer with a verdict: *accept / fix / reframe*, plus a sentence.

Ordering and coverage borrow directly from Håklev, grounded in the research
he cites: reviewer attention declines linearly with position and early files
get far more scrutiny ([Bouraffa et al., EASE 2025](https://arxiv.org/pdf/2506.10654)),
so the walkthrough orders moves by *stakes descending* — spend the attention
budget where the language could be damaged. A coverage checklist at the top
(every move needs a written verdict) replaces the viewer's progress counter.

Code correctness is not this loop's job: the built-in `/code-review` and the
existing quality gates keep it. Loop 1 is the design layer above them. When
both run on the same branch, their findings stay side by side, never merged
into one ranked list — the axes are deliberately separate, and one masking
the other is the failure the separation prevents (the same two-axis rule as
Pocock's code-review skill). For a rare code-heavy branch, ai-pr-review
itself (`--local`) is usable as-is.

#### Scale: recursive review

A walkthrough is a fixed attention budget; it holds perhaps a dozen moves.
`split-project` at merge time carries ~170 commits across ~1000 files — no
single walkthrough survives contact with that, and no single sitting produces
honest verdicts for it. Past that threshold Loop 1 recurses: episode reviews,
then a composition pass. This is *leaping between details and whole* given
procedural form — the review moves between altitudes the same way the design
work did.

1. *Segment by plan trail, not by size.* The branch's episodes are the plans
   it answered to: each completed plan is one episode; commits that answer to
   no plan cluster into unplanned episodes by theme and proximity. The
   episode map is the first review artifact, and an unplanned episode is a
   finding before its review even runs — the same rule as a move that
   answers to nothing.
2. *One episode per context.* Episode walkthroughs are generated by parallel
   subagents from a single fresh orchestrating session — each with a
   self-contained prompt (its diff scope, its plan, the section template
   pasted in full) and a bounded output written to `plans/reviews/<branch>/`.
   The isolation buys more than throughput: episodes get judged
   independently, without each other's findings in context, and the
   orchestrator validates the merge-base, the diff, and the episode map
   *before* spawning — a bad ref should fail once, not inside six parallel
   reviews. What stays serial is the author: verdicts are read and written
   one episode per sitting, stakes descending across sittings as well as
   within walkthroughs — the position-bias result applies to reviewer
   fatigue across days, not just files within a document.
3. *Review the endpoint, read the trajectory.* An episode's object is the
   endpoint diff scoped to its territory; its commit trail and plan are read
   for backtalk, not re-adjudicated. Nonmonotonic convergence means the trail
   contains reversals and re-groundings already resolved in-branch — the
   coherence question attaches to where the episode landed, the learning
   question to how it got there.
4. *Composition pass last — after the verdicts.* Walkthrough generation can
   be parallel, but composition reads judged episodes, not raw ones: it runs
   in its own isolated context once the author's verdicts are in, reading
   the walkthroughs and verdicts — not the full diff — and asking the
   compositional question: do the episodes compose, or merely coexist? Does
   the branch as a whole pull the language in one direction or several?
   Cross-episode strain is exactly what episode-level review cannot see.
   Same section template, same verdict discipline.

Two levels is the ceiling. A branch that would need three is a merge-cadence
failure, not a review problem — the steady-state fix is to run an episode
review whenever a plan completes, so the pre-merge run reduces to the
composition pass over reviews that already exist. Walkthroughs and verdict
checklists persist in `plans/reviews/<branch>/`, one file per episode plus
the composition file, so verdicts survive across sittings; the directory
moves to `plans/archive/` once the branch merges. Review
depth is calibrated per episode — adequate design applies to the review
itself; a config-hygiene episode does not get the scrutiny a vocabulary
change gets.

### Loop 2 — Reconciliation review (per plan completion or large merge)

Operationalises the dialectic the docs already define. Mechanics matter here:
the agent *re-derives* the operative image from the repository fresh — reading
the workspace, the built surfaces, the graph — without first reading
`docs/project/operative-image.md` or `docs/language/operative-image.md`. Then
it diffs its derived picture against the recorded ones and against the two
visions. Re-derive-then-compare makes this a measurement rather than
proofreading; an agent that reads the recorded image first will anchor on it.
The don't-read-first rule is fragile as an instruction — an agent told not to
read a file still knows the file exists and matters. Blinding by context
isolation is stronger: a subagent whose prompt simply never mentions the
recorded documents does the deriving, and the orchestrator, not the deriver,
runs the comparison.

Each divergence gets the three-way decision the docs already prescribe: the
vision should change, the operative image should catch up, or the gap becomes
a plan. This is where co-evolution is honoured on the record: reframes that
surfaced in Loop 1 verdicts get consolidated into actual edits to the vision
and operative-image documents, so the dialectic pages stay live instead of
decaying into aspiration.

For a large merge the sequence is: episode reviews → composition pass →
reconciliation. The composition pass and Loop 2 sit adjacent but ask
different questions: the first judges the *branch* as a composed whole
against the language ("do these moves cohere with each other?"), the second
re-derives the operative image from the *repository* as it now stands ("does
the record still match the territory?"). Neither substitutes for the other.

### Loop 3 — Drift review (monthly, feeding the working notes)

Reflection-on-action over the month, aimed at the author's thinking rather
than the artifact. Evidence: git log, plans delta, docs delta, vocabulary
changes in the language docs. The agent reads through fixed lenses derived
from the project's own commitments, not generic quality talk:

- *Garden constraint* — is anything drifting toward audience-serving product
  work (`docs/project/core-beliefs.md`)?
- *Abstraction-ladder coherence* — are qualities/foundations mixing rungs
  again (the January working note's complaint)?
- *Category dynamics* — splits and merges this month (agency keeps splitting):
  generative differentiation or classification entropy? Bowker & Star is the
  reference frame the project already uses.
- *Vocabulary drift* — terms whose meaning moved silently between docs.
- *Dropped threads* — things started and quietly abandoned. Direction changes
  are the project's method, but they should be chosen, not forgotten.

The lenses can run as one pass or as one subagent per lens; either way the
five reports stay separate — reranking observations across lenses into a
single list is exactly the flattening the fixed lenses exist to prevent.

Output: observations and *questions only — no verdicts*. The author's written
response becomes (or seeds) the monthly working-notes entry in
`apps/patterns/src/pages/index.astro`. The notes stay hand-written; the agent
supplies evidence and prompts, never the reflection itself.

## Safeguards, from the research

These are load-bearing, not hygiene. Each addresses a documented failure mode
of exactly this setup.

- *Self-preference bias.* LLM judges systematically favour their own outputs,
  and attribution modulates evaluation — models fix errors from external
  sources while missing identical errors in their own work
  ([Self-Preference Bias in LLM-as-a-Judge](https://arxiv.org/abs/2410.21819),
  [Self-Attribution Bias](https://arxiv.org/pdf/2603.04582)). Mitigations:
  review in a fresh session with no authoring context; present the diff
  without attribution ("evaluate this change", never "review your work") —
  subagent prompts constructed by the orchestrator make this structural
  rather than a phrasing discipline, since the reviewing context never
  learns who authored the diff; ground judgments in checkable documents
  (vision, operative image, core-beliefs, pattern-definition) rather than
  taste.
- *Illusion of explanatory depth.* Fluent AI explanations raise felt
  understanding without raising actual understanding
  ([Overconfidence without Understanding](https://sciety.org/articles/activity/10.31234/osf.io/8psgf_v1)).
  For a thinking tool this failure is fatal — the project's value *is* the
  author's understanding. Hence question-shaped review outputs and mandatory
  written verdicts: writing is the comprehension check reading cannot be.
- *Reflection outsourcing.* LLMs scaffold reflective practice well but tempt
  the practitioner to delegate the reflecting
  ([AI for Reflective Practice: thoughts and tensions](https://www.qmul.ac.uk/queenmaryacademy/educators/innovation-and-scholarship/innovative-pedagogies/centre-for-excellence-in-ai-in-education/blog/items/ai-for-reflective-practice-thoughts-and-tensions.html)).
  Loop 3's no-verdicts rule and the hand-written working notes are the
  guard.
- *Rationale-capture burden.* Classical design-rationale systems (IBIS, QOC)
  failed on capture intrusiveness. The practice adds *no* capture ceremony:
  plans, commits, and working notes are already the record, and the agent
  *reconstructs* rationale from them at review time — the LLM-era inversion
  of the capture problem ([LLM-driven rationale processes](https://arxiv.org/pdf/2511.07083)).
- *Ceremony creep.* The practice is itself subject to the garden constraint.
  Three loops is the ceiling; any loop that goes unused for two cycles gets
  dropped or merged, recorded in a retrospective.

## What not to build

Håklev's viewer — six layouts, comment sync, keyboard navigation, stale-review
detection — is team-scale code-comprehension machinery. This project's diffs
are prose-heavy and its reviewer is its author; the comprehension gap the
viewer closes mostly is not the gap here. No Preact app, no comment layer, no
analytics. If a Loop 1 walkthrough ever proves genuinely unnavigable as a
markdown document, that is the signal to revisit — not before.

## Implementation steps

All four steps are done. The three skills live under `.claude/skills/`
(`move-review`, `reconcile-image`, `drift-review`) and
`docs/quality/code-review.md` routes the two axes. The first application
ran on `split-project` in full recursive form: episode map, eight
walkthroughs, written verdicts, composition pass, then Loop 2 — the
reconciliation record is `plans/reviews/reconciliation-2026-07-11.md`,
and its decisions were applied before the branch merged (PR #24). The
review directory is archived at `plans/archive/split-project/`. Loop 3
awaits its first monthly cadence.

1. Write `.claude/skills/move-review/` (Loop 1) as an orchestrator: it pins
   the merge-base and validates the diff itself, then spawns review
   subagents with self-contained prompts — move extraction, stakes ordering,
   the four-part section template, and the verdict checklist pasted in full,
   since a subagent sees nothing the prompt doesn't carry. The scale gate:
   past roughly a dozen moves, segment into episodes, write the episode map
   to `plans/reviews/<branch>/`, and spawn one bounded-output subagent per
   episode, composition pass after. Update `docs/quality/code-review.md` —
   it currently
   points at a `code-reviewer` agent invocation that predates this practice —
   to route: correctness → `/code-review`, design layer → `/move-review`.
2. Write `.claude/skills/reconcile-image/` (Loop 2): a blinded derive
   subagent whose prompt never names the recorded documents, comparison in
   the orchestrator, then the three-way decision list with proposed edits to
   the vision / operative-image docs.
3. Write `.claude/skills/drift-review/` (Loop 3): the five lenses, evidence
   gathering, questions-only output. Optionally a monthly cron once the
   manual cadence proves itself.
4. First application: run Loop 1 on `split-project` in its recursive form.
   Derive the episode map from the plans the branch closed
   (workspace-split and its closure, typed relationships, relationship
   vocabulary, intra-site link validation, …) plus the unplanned clusters —
   the early reorganisation commits, the component moves, the Storybook/Astro
   surface work. Review the highest-stakes episodes in the first sittings,
   run the composition pass, then Loop 2, then merge. The branch is the
   richest available test — if the practice earns its keep anywhere, it is
   there.

## Sources

- [How I keep accidentally building tools for thinking](https://networkedthought.substack.com/p/how-i-keep-accidentally-building) — Håklev
- [ai-pr-review](https://github.com/houshuang/ai-pr-review)
- [Pocock's skills](https://github.com/mattpocock/skills) — subagent mechanics: parallel
  axis reviews in isolated contexts, aggregated without reranking;
  self-contained prompts; fail-fast orchestration; bounded reports
  ([code-review](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md))
- [Not One to Rule Them All: Mining Meaningful Code Review Orders](https://arxiv.org/pdf/2506.10654) — position bias in review
- [Code Review Comprehension: Reviewing Strategies](https://arxiv.org/abs/2503.21455) — ICPC 2025, context-building then inspection
- [Self-Preference Bias in LLM-as-a-Judge](https://arxiv.org/abs/2410.21819); [Quantifying and Mitigating Self-Preference Bias](https://arxiv.org/pdf/2604.22891); [Self-Attribution Bias](https://arxiv.org/pdf/2603.04582)
- [Overconfidence without Understanding: AI Explanations Increase the Illusion of Explanatory Depth](https://sciety.org/articles/activity/10.31234/osf.io/8psgf_v1)
- [AI for Reflective Practice: Thoughts and Tensions](https://www.qmul.ac.uk/queenmaryacademy/educators/innovation-and-scholarship/innovative-pedagogies/centre-for-excellence-in-ai-in-education/blog/items/ai-for-reflective-practice-thoughts-and-tensions.html)
- [Increasing AI Explainability by LLM-Driven Standard Processes](https://arxiv.org/pdf/2511.07083) — QOC/rationale revival
- [Design critique handout](https://interactionculture.net/2018/08/15/handout-design-critique/) — Bardzell; crit genre structure
- Löwgren & Stolterman, *Thoughtful Interaction Design* — vision/operative
  image/specification, co-evolution, design as conversation, leaping between
  details and whole, the three forms of judgment, nonmonotonic convergence,
  retrospective reflection, adequate design (via the Concepts vault)
