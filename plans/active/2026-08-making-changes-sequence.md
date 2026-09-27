---
title: Making changes — the third sequence
status: active
kind: exec-spec
created: 2026-08-28
last_reviewed: 2026-09-27
area: language / organisation
promoted_to:
superseded_by:
---

# Making changes — the third sequence

Phase 5 of [the sequence-map plan](2026-08-sequence-map.md): the second sequence authored after the pilot. The sequence's authoritative home is `apps/patterns/src/content/sequences/making-changes.mdx`; this document is the authoring trace — the sequence as first written, the read-aloud walk, the test walks with their backtracks, and the corpus changes the authoring surfaced. The corpus changes are recorded here, not executed — each is judgment work for its own sitting.

Steps are decisions, written as verbs, each invoking a pattern as its rule. Constituents ride inside steps in parentheses. The trunk's second position is a routing choice point taken per kind of change, not once per product; unlike structuring the space's choice point, no decision tree owns its judgement — the criteria are scattered across the arms' pages (finding 1).

## Presupposition (the head)

Material is framed and in front of the actor: composing views has run, so a framed population makes designating items cheap, and a surface exists for the change to appear on. The operations themselves are named — what can be created, changed, and removed, and what each is called — naming work the information-architecture foundation records. A product that cannot state this presupposition is not ready for this sequence; the naming work is process-register and is discharged upstream.

The sequence enacts one quality per region, near enough: *malleability* at the trunk (the display becomes its own control), *formality* at the collection surface (every field is a decision about how much structure the input must carry), *temporality* at committing and the safety pass (when a change counts, and how far back it can be taken).

## The sequence

### A. Designating and routing the change — the trunk

1. *Decide the designation grammar.* How the actor stakes what an act applies to: one item, a set, or a span; items, sub-items, or content inside them; whether a designation survives sorting, filtering, and paging; how the affordance shows. Every later act consumes this grammar. Creation is the empty designation and skips it. Rule: [selection].
2. *Route each kind of change to its surface.* A choice point, taken per kind of change — the same product routes a title edit and a record import differently. No decision tree owns the judgement (finding 1). The arms:
   - *Change it where it is shown* — the display is also the control; the change is seen in its final context as it is made. Commits one at a time, which takes part of the committing decision with it: no pending state to cancel from, so taking things back falls to the safety pass. Rule: [editing-in-place]. (Constituent: block-based-editor — reading and changing happen on the same blocks.)
   - *Gather it on a surface of its own* — fields that only make sense together, input that needs room, a change that describes a set rather than a thing being looked at, or a review before committing. Rule: [form]. Shaping the surface is sub-sequence B.
   - *March it through dependent steps* — only when early entries genuinely determine later options and the actor does the task rarely; Back has to walk without discarding, an obligation the safety pass collects. Without real dependencies this is a long form with pagination — the previous arm structured, not this one. Rule: [wizard].

*Resulting context.* Every kind of change has a surface: designation is cheap and follows one grammar, routine changes happen where the material is shown, the ones needing room or review have a surface of their own. Not yet decided: when a change counts, and what it costs to take back. Hands off: the conversational third surface — fields asked and answered turn by turn — is the encounter's territory ([form]'s continuum with conversation).

### B. Shaping the collection surface

*Initiating situation.* The routing sent some changes to a surface of their own — one page, or fragmented across a wizard's steps. Either way the surface is made of fields, and each field is a question put to the actor.

1. *Make every field earn its place.* Ask only what the system needs and cannot infer; every question costs entry effort and abandonment risk. The weak form of a step — it names no pattern; the question protocol is its working method.
2. *Shape each field's entry.* Forgiving format where expressions vary and the system can interpret — with its reading shown back before it counts as agreed; structured format where ambiguity is dangerous or the format is strict. Rule: [data-entry].
3. *Settle the answers* — two moves over the shaped fields, unordered between themselves *(parallel)*:
   - *constrain* — where the value must come from a set the actor did not author, trade freedom for validity by construction; a set the actor cannot characterise escalates into search. Rule: [bounded-choice].
   - *pre-fill* — the system's best static guess resolves a field before the actor engages; where the system holds the value or joins the work, the assistance ladder picks up. Rule: [good-defaults].
4. *Structure the length.* A long surface divides into a small, stable set of named parts, disclosed by whichever affordance the context calls for; a short form skips it. Rule: [sections]. Optional.
5. *Respond to input that does not fit.* At the field, saying what is wrong and what would fix it, persisting until corrected; reward early, punish late, and reverse the rule once a field has failed. Rule: [validation].

### C. Committing the work

*Initiating situation.* Changes flow through the surfaces, and the medium keeps nothing on its own: work exists in the running program until the system writes it. Part of the decision is already taken — the in-place arm committed its changes piecemeal when it was chosen, and a form holds its fields pending until submitted (finding 2).

1. *Work out what each save is for.* Separate the technical necessity from the acts riding the same button — committing a version, discarding an attempt, marking work done — and give each a home. Rule: [saving].
2. *Reconcile the arrangements.* Automatic for open-ended work, manual where a real constraint or transaction boundary demands pending state; the routing arms arrive with arrangements of their own, so the free choice lives at the boundaries, and mixed arrangements are marked. The actor is owed the state of their work either way. Rule: [saving], its arrangements. Interleaves with *working together*: two actors editing the same thing find out at the save boundary.
3. *Separate ready-for-others from stored.* When storage is continuous and the artefact shared, a working copy with a deliberate publishing act marks readiness, and gives review, versioning, and notification a point to attach. Rule: [draft-and-publish]. Optional — no readers, no step.

### D. The safety pass

*Initiating situation.* The sequence has accumulated acts that change, remove, and publish the material, and they do not cost alike. Guarding every act equally punishes the routine ones; guarding none leaves the expensive ones one slip away. A pass over the acts already built, not a tail about deletion alone (finding 3).

1. *Grade each act's consequences.* Time to recover, scope of impact, cascade — with the reducers already in hand counted in (pending state, staging, drafts). The heaviest acts are not always removals; publishing to external readers often outweighs a delete. Rule: [action-consequences].
2. *Match removal to its grade.* The framework projected onto one act; the decision tree walks the ladder — nothing but undo, inline confirmation, a modal that explains, a typed phrase. The scope of a removal is staked by the designation grammar from step A1. Rule: [deletion].
3. *Build the reverse path.* Recovery after the act removes confirmation before it, so each act given a reverse path drops a rung on the ladder just graded — the grading is revised once, not walked again. Three routes drain here: a completed deletion, in-place edits with no pending state, a wizard's Back. Depth and reach: single or multi-level, and whether the path survives the session. Rule: [undo].

## The read-aloud walk

The test from Book 2 ch. 11 §5: read aloud, the design should form stepwise, no step contradicting what previous steps built.

> Material is framed and in front of the actor; the operations on it have names. First the designation grammar is decided — how an act's target is staked: one item, a set, a span, at which granularity, surviving which view changes. Then each kind of change is routed to its surface: the routine ones happen where the material is shown, so the display is also the control; the ones whose fields belong together, or that describe a set, get a surface of their own; the rare dependent task is marched through steps that prune as they go. Where a surface of its own was chosen, it is shaped field by field — every field earning its place, each entry forgiving or strict, vocabulary answers constrained while guessable ones are pre-filled, a long surface divided into named parts, and misfit input answered at the field that produced it. Then the work is committed: each save examined for what it is actually for, the arrangements the surfaces brought with them reconciled, and readiness separated from storage where others read the result. Last, a pass over every act the sequence built: consequences graded, removal matched to its grade, and a reverse path built so that recovery after the act stands in for confirmation before it.

Verdict: passes. Every step's material exists when the step arrives; nothing built is contradicted later.

## Test walks

Recorded per ch. 11 §7: a sequence fails where a later step forces undoing an earlier step's product. Rationalisations — steps really parallel, or recognised after the fact — are findings, not failures.

*Walk 1 — the team's issue tracker (continuing the pilot's walk 1).* A1: rows and cards take single and multi selection, content selection inside the description; selections live with the data, operations apply to the visible intersection. A2 per change kind: title, status, and assignee in place (the board drag that composing views made writable lands on this arm); new issue and full edit on a form; importing issues from another tracker is the one genuine wizard — the source chosen early determines the mapping options later. B: half the drafted fields failed the question protocol (severity and environment could be inferred or asked later); the date field forgiving; project, assignee, and priority bounded; project and reporter pre-filled; the form short enough to skip sections; validation on the one required field. C: the form is a transaction, the import wizard holds state to its summary step, and the mixed arrangements are marked. D: an issue delete grades at minutes and takes the undo toast; a project delete grades at organisation scope and takes the typed phrase; board moves need no machinery — dragging back is the reverse path. *Backtrack found:* the first draft's committing step was a free arrangement choice, per saving's own page. Reaching it, the walk had already committed the in-place route piecemeal at A2 — editing-in-place's resulting clause takes that decision with the arm — so choosing "manual" for the product would have undone the arm's product. The step was rewritten from choosing the arrangement to reconciling the arrangements the arms arrive with; its real freedom is at the boundaries (finding 2).

*Walk 2 — the knowledge base (continuing the pilot's walk 2).* A1: content selection is central — blocks and spans on the editor; item selection in the notes list. A2: nearly everything in place, since the document is the surface; but the note's properties landed on a panel that is neither arm — it stays open, acts on the current selection, and applies immediately. Editing-in-place's own to-do already names the inspector as homeless; the walk confirms it from the routing side — the choice point has no arm to hand it to (finding 6). B ran thin but real for that panel: entries shaped, tags bounded, defaults pre-filled — the steps applied even though the surface itself has no node. C: storage automatic; C1 found the old Save button carrying *this version counts*, which is not persistence — the act wants version history, and no node holds it (finding 7); draft-and-publish central for the public articles. D: notes archive with a retention period rather than deleting; the editor takes multi-level undo. *Backtrack found:* the first draft scoped the safety sub-sequence to removal, per the map's "safety tail". Grading the knowledge base's acts put publishing to public readers above every delete — and a removal-scoped tail could not reach an act that lives in C3. The sub-sequence was rewritten as a pass over all acts, with removal as the worked case (finding 3).

*On the transfer question:* the trend from the first two sittings continues — guidance concentrates at the joints, and the routing choice point carries most of it. Two things are new. The arms of a choice point can bind decisions in *later sub-sequences* (the in-place arm takes part of the committing decision with it), which neither earlier sequence showed. And the safety pass is the first genuinely late sub-sequence — a pass over what exists rather than a stage that builds — which is the shape *finishing the whole* will have throughout.

## Findings — corpus changes the authoring forces

Recorded for their own sittings; none executed here.

1. *The routing judgement has no owner.* In place versus a surface of its own versus a corridor versus a conversational exchange is the change-side twin of the navigation-model choice, but where navigation-overview's tree owns that judgement, this one is scattered: editing-in-place's "when the change belongs elsewhere" list, form's complements notes, wizard's alternative notes. Candidate: author the decision tree — editing-in-place's page holds the criteria today, but whether it, form, or a new owner hosts the tree is judgment for that sitting. Same shape as the map's open question on the collaboration-posture choice.
2. *A choice-point arm can bind a later sub-sequence's decision.* Choosing in-place also takes the saving decision for that route (piecemeal, no pending state — the arm's resulting clause spends part of C2). The committing step is therefore authored as reconciliation, not choice. Sequence-layer knowledge only — no edge can carry "this arm decides that later step"; same evidence class as the pilot's finding 2.
3. *The safety region is act-scoped, not removal-scoped.* The map's "safety tail: deletion → undo…" under-describes it: grading reaches every act the sequence built, publishing included, and in shared products publish often grades heaviest. The map's sequence entry is corrected. Candidate for its own sitting: draft-and-publish's publish act carries no relating edge to action-consequences — whether that wants a `related` edge or a resulting clause on draft-and-publish is the judgment.
4. *Candidate edge: selection enables editing-in-place.* The head's product is spent unevenly: deletion consumes the designation through a typed edge (`composed-of: selection`), but the in-place arm consumes it with no edge — activating a display to edit it stakes a target for an act, which is selection's move, not focus's, by selection's own distinction. Caveat before minting: selection's single-selection section argues click-to-reveal is focus, and click-to-edit sits between the two cases; check the claim survives that section.
5. *Shared station confirmed: undo.* Three routes drain into it from inside one sequence — deletion, editing-in-place, a wizard's Back — matching the map's listing. First sequence to confirm a shared station from an authored walk rather than from edge counting.
6. *Gap confirmed from two directions: the inspector.* Editing-in-place's to-do names the property panel as homeless between that pattern and form; walk 2's routing step could not hand it an arm. No node proposed here — the gap is now legible from the sequence side as well as the pattern side, the same double-sighting shape as the pilot's finding 8.
7. *Gap confirmed: version history.* Undo's to-do names it; walk 2's C1 needed it the moment *this version counts* moved off the Save button; and memory and continuity will want it as a step. Feeds that sequence's spine hunt, as hub-and-spoke → purpose-keyed-view fed making sense at scale's.


## Revision to the step-length rules (2026-09-27)

The sequence was revised under the step-length rules in docs/specs/sequences.md §Authoring, in the plain wording of the earlier revisions. The file went from about 1,655 words to about 1,360. No step title, rule, order, or connection changed, and sub-sequence ids are unchanged, so the walks and every incoming `at` address still stand.

Where the removed text went:

- The lead restated the presupposition and listed the regions. It now states the situation and the fact that holds across regions: an earlier routing arm settles later decisions for its route (finding 2).
- The routing arms keep their criteria, since no page owns the routing judgement (finding 1); the remark saying so moved out of the choice gloss. The wizard arm's "long form with pagination" became an instruction to use a form with sections.
- Pattern reasons already on the pattern pages: the final context of in-place edits (editing-in-place), the corridor removing peripheral vision (wizard), freedom traded for valid input (bounded-choice), the save step kept from convention or removed on principle (saving), continuous storage leaving no ready point (draft-and-publish), severity reducers (action-consequences), and recovery removing the need for confirmation (undo, via action-consequences).
- The weak step's "working method" remark was authoring status; the missing `rule` marks it.
- The routing `resulting` restated the next `initiating` and was removed.
- Connection notes lost their typed-edge and substrate remarks.

Nothing was lost that is not on a pattern page, in the findings, or in the lead.

Step-list test: the step lines, with the choice, the cluster, and their members, read as a walk without their glosses.

[selection]: ../../apps/patterns/src/content/patterns/selection.mdx
[editing-in-place]: ../../apps/patterns/src/content/patterns/editing-in-place.mdx
[form]: ../../apps/patterns/src/content/patterns/form.mdx
[wizard]: ../../apps/patterns/src/content/patterns/wizard.mdx
[data-entry]: ../../apps/patterns/src/content/patterns/data-entry.mdx
[bounded-choice]: ../../apps/patterns/src/content/patterns/bounded-choice.mdx
[good-defaults]: ../../apps/patterns/src/content/patterns/good-defaults.mdx
[sections]: ../../apps/patterns/src/content/patterns/sections.mdx
[validation]: ../../apps/patterns/src/content/patterns/validation.mdx
[saving]: ../../apps/patterns/src/content/patterns/saving.mdx
[draft-and-publish]: ../../apps/patterns/src/content/patterns/draft-and-publish.mdx
[action-consequences]: ../../apps/patterns/src/content/patterns/action-consequences.mdx
[deletion]: ../../apps/patterns/src/content/patterns/deletion.mdx
[undo]: ../../apps/patterns/src/content/patterns/undo.mdx
