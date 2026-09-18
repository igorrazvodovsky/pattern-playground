# Sequences

A sequence is an authored, named ordered walk of decision steps over the
corpus — an authored projection over the graph, not a new content kind. It
stores exactly what edges cannot carry: the preferred order of same-scale
steps, step-versus-constituent status, unordered clusters, and choice-point
markings. The graph remains the single source of structure; `precedes` chains
are evidence for a sequence, and a sequence is never stored as edges.

The theoretical ground — what Alexander's generative sequence is, and how the
pattern language, the sequences, and the component substrate divide his
method — is in [design-theory.md](../language/design-theory.md) §Living
process. The system-level map (which sequences exist or are missing, their
ordering, their interconnections) is
[2026-08-sequence-map.md](../../plans/active/2026-08-sequence-map.md).

## What a sequence is

- One coherent stretch of design work, walked as steps. The order is authored
  and fixed, but approximate: each step keeps latitude to respond to what is
  already made, and the order is revised as authoring and use teach.
- The *step* is the unit: a decision written as a verb, invoking a pattern as
  its rule, or opening a choice point that delegates to a decision tree. A
  step is not called a move — in this corpus a move is what a pattern names,
  and a step invokes a pattern rather than being one.
- A sequence orders *decisions*, not construction: steps taken in order may be
  realised together, and each decision remains to be tested in the adopting
  product's own material. The sequence stores the order; the actor still
  checks each step.
- Order over the steps is a partial order, and numbering flattens it into a
  line. Where the partial order does not say which of several steps comes
  first, the file does not guess: those steps stand as an unordered cluster
  sharing one number.
- Steps draw only from `role: pattern` nodes. Foundations are material, not
  steps: a foundation-sourced `precedes` edge stays valid in the graph but
  renders in a sequence as part of an initiating situation, never as a step.
  Qualities are reading dimensions, never steps.
- Constituents (`enables`-only patterns) ride inside steps, not as steps.
- A sequence decomposes into *sub-sequences* of roughly five to twenty steps,
  each with its own initiating situation and adoptable singly, because small
  sequences get adopted and large indivisible ones do not.
- Sequences connect three ways: a sequence *calls* another mid-course when
  the centers it makes need supporting centers; it *hands off* when its
  results set up another's starting conditions; two sequences *interleave*
  when their steps must alternate.
- A sequence takes no process-register steps. What a design team does to
  ground the work (task analysis, posture decisions, scope judgement) is
  stated at sequence heads as *presuppositions* — initiating-situation
  prose — and discharged upstream. A presupposition that nothing discharges
  shows where work is missing.

## The collection

Sequence files live in `apps/patterns/src/content/sequences/`, a second
zod-gated collection in `content.config.ts`. The filename stem is the sequence
id, the same identity rule the patterns collection follows.

One file carries two layers, following the Consequences precedent — one
authored home, two renders. Frontmatter is the formal layer and is
authoritative for order and membership; the body is the lead and never
contradicts it. The lead compresses the situation the walk starts from, says
what the walk leaves, and states the facts that hold across regions and so
have no other home — the rate the sequence is walked at, its position among
the other sequences, its governing principle where it has one. It stops
there: the regions and steps narrate themselves from frontmatter, and a
sentence that could move into a region's `initiating` or a step's `gloss`
belongs there instead.

What the fields mean:

- `order` — the sequence's place in the default reading order (the
  scale-following arrangement in the sequence map). Approximate, like every
  order here: sequences sharing a number are an unordered cluster and render
  alphabetically within it. This orders listings of sequences; it is not the
  system's one order — per-product entry differs, and no field claims
  otherwise.
- `presupposes` — the head's initiating situation: what must already hold for
  the sequence to apply, and the process-register work that settles it
  upstream. Process-register work enters only here, as presupposition prose,
  never as a step. It carries nothing else — the rate the sequence is walked
  at, its position among the others, and its governing principle belong to
  the lead, which is not folded away behind a disclosure.
- `enacts` — quality slugs the sequence chiefly enacts. Node metadata; sequences
  are not graph nodes, so no edge is emitted.
- `sub-sequences` — each with an `id`, its own `initiating` situation (the
  head sub-sequence omits it, `presupposes` covers it), ordered `steps`, and an
  optional `resulting` context. Each is meant to be adoptable singly.
- A `step` (verb phrase) invokes a pattern as its `rule`, optionally one
  `aspect` of it. Steps are required by default; `optional` marks a skippable
  step, with the skip condition in the gloss. A step with no `rule` is the
  weak form and is legitimate but marked by its absence. The same rule may be
  invoked at more than one step.
- `constituents` ride inside steps, never as steps. Their edges stay
  `enables`/`hosts`; step-versus-constituent status is not derivable from edge
  type, which is why the sequence layer stores it.
- A `cluster` takes one number for the several `steps` it holds. Nothing
  orders a cluster's steps among themselves, and any order they are listed in
  elsewhere is for readability and claims nothing.
- A `choice` opens alternatives that combine unless `exclusive: true`;
  `tree` names the pattern page whose decision tree owns the judgement.
- `connections` are cross-sequence links, typed `calls` (mid-course, the
  centers made need supporting centers), `hands-off` (results set up another
  sequence's starting conditions), or `interleaves` (steps must alternate).
  `at` names the step on this side; `to`/`from` the far sequence, which may
  not be authored yet — forward references are allowed and mark work still to
  do. A call to a
  step of the same sequence is narrated in the calling step's gloss instead.

## Authoring

A sequence clears the following bar before it lands, drawn from the method it
descends from (grounding: `research/sequence-map/2026-08-28-sources.md` and
`research/sequence-map/2026-08-28-living-process.md`):

- *One invocation per step.* A step's decision content is one pattern
  invocation; the invoked pattern's inner dimensions belong to its own page,
  not to further steps. A step that would decide more than its rule covers is
  two steps; a step that would decide less than its rule covers is a
  dimension, not a step.
- *The gloss binds the step to the walk.* It does not explain the pattern. A
  gloss says what of the walk's
  accumulated product this invocation acts on and what larger thing it
  serves — the binding that keeps a pattern from being applied as a
  cut-and-paste image. In a cluster, the cluster gloss may carry the binding
  and leave its members thin; a thin gloss outside a cluster is an omission.
- *Record only what is decided.* Glosses state decision dimensions, not
  outcomes; where the order is not known, the cluster declines it. An
  optional step names its skip condition.
- *Reshaping is not backtracking.* Later steps are expected to reshape earlier
  steps' products — a rule re-invoked at a later site through `aspect`, an earlier
  grading revised once. A sequence fails only when a later step forces an
  earlier *decision* to be revoked; test walks record those as backtracks.
- *Obligations are recorded when created.* When a step creates a debt a later
  step must pay (an exit owed, a contract to keep resolving), the creating
  step's gloss names it and the discharging step collects it.
- *Two tests before it lands.* The read-aloud test: read the walk aloud and
  check no step contradicts what the steps before it built. And at least two
  test walks through concrete products, recording every backtrack. Corpus
  changes the authoring surfaces (reorders, promotions, splits, candidate
  edges) are recorded as findings in the sequence's plan file, not executed in
  the sitting.

Each sequence is authored in its own sitting with its own plan file holding
the authoring trace, test walks, and findings; the sequence file is the
authoritative home.

## Rendering

A sequence is served at `/sequences/<id>` and hosts the stacked-notes stack as
pane 0, so following a step opens the pattern beside the sequence, which stays
on screen ([pattern-site.md](pattern-site.md) §Stacked-notes navigation).
Pane 0 is the only pane that can be something other than a pattern; the store
carries its path for that reason, and panes 1+ stay pattern-only. Sequences
reach the nav as their own group, outside the projections: a projection is a
grouping function over the pattern corpus, and a sequence is a walk over those
entries rather than one of them. The group sits between the shared role groups
(foundations, qualities) and the active projection's groups, listed in the
default reading order (`order`).

The page follows the pattern page's shape — the body first, then the layers
rendered from frontmatter, never authored as body sections. Four points the
render has to hold to:

- *A sub-sequence is one of the page's own sections.* Its heading takes the same
  rank as any other section of the article, so the table of contents lists the
  sub-sequences alongside Connections. The heading carries the sub-sequence id,
  so a `connections.at` address survives a retitling, where an id derived from
  heading text would not.
- *The numbering is referenced data.* `connections.at` addresses a numbered
  step as `<sub-sequence>/<n>`, one-based within the sub-sequence, and a cluster
  or choice point takes one number for the several steps it holds. The markup is
  one `<ol>` per sub-sequence with a cluster's steps as a nested unordered list
  inside their single item — which is also how the cluster reads as unordered
  rather than as a serialisation.
- *A step with no `rule` renders with no pattern link.* That absence is the
  marking of the weak form; nothing is added to announce it.
- *Forward references stay legible.* A connection naming a sequence nobody has
  authored yet renders as plain text marked unauthored, never as a dead link.

The rendered labels are not the field names. `presupposes`, `initiating`, and
`resulting` read on the page as *Prerequisites*, *Applies when*, and *Leaves*,
where the field names are the schema's terms. The first two label the same kind
of thing at two scales — a condition gating entry to what follows — so both
render folded, as a line the reader opens ahead of the walk. `resulting` is read
on the way past and stays open.

Read in reverse, the same frontmatter gives each pattern page an "Appears in"
block naming the sequences that invoke it — as a step's rule, as a constituent, or
as the pattern whose decision tree owns a choice point. It renders between
Consequences and Related patterns and, like both, is machine-rendered from the
one authored home.

## Validation

The site build resolves every pattern slug a sequence names (`rule`,
`constituents`, `tree`, a connection's `via`) and every internal `at` address,
and fails on a slug or step number that does not resolve
(`integrations/validate-cross-references.ts`). A connection's `to`/`from` is
deliberately exempt, because forward references are allowed. Checking that
within-sub-sequence order never reverses a `precedes` edge stays deferred
tooling; the schema gate checks shape only.

Origin and rationale: [2026-08-sequence-map.md](../../plans/active/2026-08-sequence-map.md)
(the representation decision),
[2026-08-composing-views-sequence.md](../../plans/active/2026-08-composing-views-sequence.md)
(the pilot whose authoring produced the shape), and
`research/sequence-map/` (the primary-source and literature grounding).
