---
title: "Review practice: moves, reconciliation, drift"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-01"
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
  listening, Schön's reflection-on-action given a surface.

## The three loops

Three review loops at three cadences, matching the three altitudes. All start
as skills (Håklev's own trajectory — prompt → skill → tool — argues for not
building UI until the prompt form proves insufficient).

### Loop 1 — Move review (per branch, before merge)

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
existing quality gates keep it. Loop 1 is the design layer above them. For a
rare code-heavy branch, ai-pr-review itself (`--local`) is usable as-is.

### Loop 2 — Reconciliation review (per plan completion or large merge)

Operationalises the dialectic the docs already define. Mechanics matter here:
the agent *re-derives* the operative image from the repository fresh — reading
the workspace, the built surfaces, the graph — without first reading
`docs/project/operative-image.md` or `docs/language/operative-image.md`. Then
it diffs its derived picture against the recorded ones and against the two
visions. Re-derive-then-compare makes this a measurement rather than
proofreading; an agent that reads the recorded image first will anchor on it.

Each divergence gets the three-way decision the docs already prescribe: the
vision should change, the operative image should catch up, or the gap becomes
a plan. This is where co-evolution is honoured on the record: reframes that
surfaced in Loop 1 verdicts get consolidated into actual edits to the vision
and operative-image documents, so the dialectic pages stay live instead of
decaying into aspiration.

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
  without attribution ("evaluate this change", never "review your work");
  ground judgments in checkable documents (vision, operative image,
  core-beliefs, pattern-definition) rather than taste.
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

1. Write `.claude/skills/move-review/` (Loop 1): fresh-session instructions,
   move extraction, stakes ordering, the four-part section template,
   verdict checklist. Update `docs/quality/code-review.md` — it currently
   points at a `code-reviewer` agent invocation that predates this practice —
   to route: correctness → `/code-review`, design layer → `/move-review`.
2. Write `.claude/skills/reconcile-image/` (Loop 2): the re-derive-first
   protocol, then the three-way decision list with proposed edits to the
   vision / operative-image docs.
3. Write `.claude/skills/drift-review/` (Loop 3): the five lenses, evidence
   gathering, questions-only output. Optionally a monthly cron once the
   manual cadence proves itself.
4. First application: run Loop 1 on `split-project`, then Loop 2 before it
   merges. The branch is the richest available test — if the practice earns
   its keep anywhere, it is there.

## Sources

- [How I keep accidentally building tools for thinking](https://networkedthought.substack.com/p/how-i-keep-accidentally-building) — Håklev
- [ai-pr-review](https://github.com/houshuang/ai-pr-review)
- [Not One to Rule Them All: Mining Meaningful Code Review Orders](https://arxiv.org/pdf/2506.10654) — position bias in review
- [Code Review Comprehension: Reviewing Strategies](https://arxiv.org/abs/2503.21455) — ICPC 2025, context-building then inspection
- [Self-Preference Bias in LLM-as-a-Judge](https://arxiv.org/abs/2410.21819); [Quantifying and Mitigating Self-Preference Bias](https://arxiv.org/pdf/2604.22891); [Self-Attribution Bias](https://arxiv.org/pdf/2603.04582)
- [Overconfidence without Understanding: AI Explanations Increase the Illusion of Explanatory Depth](https://sciety.org/articles/activity/10.31234/osf.io/8psgf_v1)
- [AI for Reflective Practice: Thoughts and Tensions](https://www.qmul.ac.uk/queenmaryacademy/educators/innovation-and-scholarship/innovative-pedagogies/centre-for-excellence-in-ai-in-education/blog/items/ai-for-reflective-practice-thoughts-and-tensions.html)
- [Increasing AI Explainability by LLM-Driven Standard Processes](https://arxiv.org/pdf/2511.07083) — QOC/rationale revival
- [Design critique handout](https://interactionculture.net/2018/08/15/handout-design-critique/) — Bardzell; crit genre structure
- Löwgren & Stolterman, *Thoughtful Interaction Design* — vision/operative
  image/specification, co-evolution, design as conversation (via the
  Concepts vault)
