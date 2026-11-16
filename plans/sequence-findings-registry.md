# Sequence findings registry

The corpus changes proposed while authoring the thirteen sequences of August 2026, collected from their plan files and checked against the content files on 2026-11-15, together with two left by the simplification of the sequence format on the same day. Each finding is a judgement about a pattern or a sequence that waits for its own sitting; nothing here has been acted on.

The findings of the standing-agent sequence, now titled *delegating standing work*, stay in [2026-11-standing-agent-patterns.md](active/2026-11-standing-agent-patterns.md) §Findings, because that plan is still open.

## How to read an entry

An entry names the finding by plan and number, for example *composing views 5*. The plans are:

- composing views, structuring the space, making changes, the encounter, delegating work (the sequence is now titled *delegating a task*), governing autonomy, calibrating reliance, assistance escalation, learning, memory and continuity, attention and tempo, making sense at scale, working on the same thing.

The plans were closed on 2026-11-15. [Composing views](completed/2026-08-composing-views-sequence.md) is kept as the pilot. The other twelve were deleted; read one with `git show 9c27a32e:plans/active/2026-08-<name>-sequence.md`, where `<name>` is the sequence's slug.

Memory and continuity's findings 10–15 are in its 2026-11-04 section. "Revision" points to a plan's 2026-09-27 step-length section, and "sighted" to delegating work's *Sighted, not claimed* list.

Statuses:

- *Live*: not done, and still makes sense against the current pages.
- *Partly overtaken*: a later change settled part of it; the entry states only what is left.
- *Done*, *overtaken*, *observation*, *dropped*: closed; listed under §Closed with the evidence. *Dropped* means the triage sitting decided against the change.

One flag:

- *(form)*: the finding proposes a `sets-up` clause or an edge note. Since 2026-10-10 a shaped page writes this as a sentence in its `situation.resulting` prose with a `precedes` edge in `relationships`, and edge notes retire on shaped pages (relationship-vocabulary.md §Situations). Where the target page is still unshaped, the clause form applies until it is shaped.

Since 2026-11-15 a sequence reaches another only through a prose link in a gloss or a `resulting` clause, and steps carry no `aspect` ([sequences.md](../docs/specs/sequences.md)). Findings written as connections or aspects are restated below in that form.

## Live: pattern pages

- *change-review*: whether `seed: true` comes off, and whether the [change-review verdict](active/2026-08-change-review-verdict.md) plan moves to `completed/`. Partly overtaken: the rest of the verdict's edit set was carried out on 2026-10-20 and 2026-11-15. Delegating work 10.
- *comparing*: its classification sitting, since it is still `seed: true`. The sitting also decides whether it belongs in composing views' framing cluster beside sorting, grouping and filtering, or in making sense at scale's lens region; the question is in its To-do. Deferred at triage on 2026-11-15. Making sense at scale 3, 4.
- *incremental-formalisation*: its classification sitting, since it is still `seed: true`. The sitting types the edges from block-based-editor, tag's merge line and formality's §Two strategies; block-based-editor now links the page in prose. Deferred at triage on 2026-11-15. Making sense at scale 3, 5.
- *notification*: the page's own sitting. Still to add: the grading axis (interruption levels, importance) and arrival as a negotiation, which the arrival/3 gloss carries in full meanwhile; its decision tree's leaves are components. Partly overtaken: the revocation clause was added on 2026-11-15. Attention and tempo 5, and its revision.
- *sharing, presence, reconciliation*: classification sittings; all three are still `seed: true`. Deferred at triage on 2026-11-15. Working on the same thing 5.
- *status-feedback*: a clause saying that awareness which must be authored goes unfed, and that a set report form includes and excludes by design. The page has no `situation` block and no section on reports between colleagues, so this waits for the page's own sitting. Deferred at triage on 2026-11-15. Working on the same thing 9, and its revision.
- *text-lens*: a decision for the author. The page's To-do says a summary across many documents is generated content with citations, not a text lens, but the "Generate summaries at several levels" gloss in making sense at scale still sends collection overviews to text-lens. Either the gloss is re-routed to generated-content with citation, or a grounded-summary page is seeded. The citation edge exists from citation's side. Making sense at scale 6.
- *Patterns the sequences used for one side*: until 2026-11-15 the sequences invoked 23 patterns through an `aspect`, naming one side of the pattern. The list is in §Aspects removed. Each entry is evidence for that pattern's sitting on whether it is too broad, most of all where one pattern carried several aspects: deep-linking (three), and data-view, handoff, mastery, remembered-state and status-feedback (two each).

## Live: sequence files and the map

- *learning*: a note for the sequence on finishing the whole, which is not authored yet. When it is, it takes state-empty's degraded face (the filter that excluded everything, the permission boundary), not the first-run face learning walks. Deferred at triage on 2026-11-15. Learning 2.

## Live: territory no page owns

Classification-sitting candidates. A step without a rule is not evidence of a gap (sequences.md §Authoring), so each needs its own case.

- *Holding execution to the approved plan*: deviation pauses the run as a crossed bound. plan-preview's To-do names it; the gate/4 step has no rule. Governing autonomy 4.
- *The record of how offers are used*: what was offered, accepted, dismissed and corrected, per surface and level. climb/1 has no rule. Assistance escalation 5.
- *Choosing which skills stay practised*: partly overtaken. mastery §Skills handed over now holds the principle; learning's upkeep/1 still has no rule. Learning 4.
- *The catch-up*: what changed while the actor was away, scoped to the material that is open rather than to a restored filter. Slack Catch Up and Gemini Catch Me Up are shipping forms. Memory and continuity 3, 4, 10, 13.
- *Recording the reason for a change when it is made*: attribution owns who made it, and nothing owns why. Memory and continuity 4.
- *Retention of the record itself*: log retention, redaction, and the record outliving its subjects. Memory and continuity 9.
- *Attention stations*: the protected stretch (focus modes, allowed hours), the breakthrough valve, the delivery moment (breakpoint deferral, escalate-only-if-unseen, coarse batching), the generated digest (whose opt-in bar was set by the public failure of default-on summaries), and the way back after an interruption. resuming is a candidate rule for the last one (arrival/4). Attention and tempo 3, 4, 6.
- *The deferred act*: scheduled send, remind-me, snooze. Partly overtaken: the automating concept holds a standing request tied to an occasion, and nothing owns the one-off deferral. It may be one pattern with the delivery moment's deferral. Attention and tempo 3; delegating work sighted.
- *Working and showing*: declaring per kind of material how much unfinished work others see. Working on the same thing 4.
- *The handable shared view*: follow and spotlight live, the view's address later. Working on the same thing 4.
- *Asking for a higher access tier*: sharing mentions it and its disclosure says it is unworked; permissions covers what the artifact asks of the actor, not a viewer asking up. Working on the same thing 4.
- *The agent's performance report*: the agent showing its own value, bad news included, to feed the re-judgement of whether the work is worth delegating. The limit on disuse in bounded-autonomy covers the check-in, and ending is an action of the automating concept. Delegating work 12; delegating work sighted.
- *Distributed customisation*: still without a page; the standing-agent plan chose not to pursue it. Delegating work sighted.
- *The landing surface*: what the actor meets first in a region laid out as a tree or as fully connected sections. No step in structuring the space decides it and no page owns it. Structuring the space 9.
- *Signposting*: showing the actor where they are, whatever the topology; breadcrumbs and section markers are its components. Structuring the space 9, 14.
- *Contextual links*: the authored cross-link that cuts across a hierarchy. focus-and-context's contextual navigation covers inferred nearness. Structuring the space 14.
- *A place with no navigation*: the full-screen player, the lightbox, reader mode. Entered, used for one thing, left by closing. A pattern, or a fifth kind on the recognition step. Structuring the space 11.
- *Judgements nobody owns*: choosing a lens (how focus and context are separated or blended, and what each costs) is carried by the lens choice gloss in making sense at scale. Making sense at scale 7, partly overtaken: its route through a decision tree lapsed with the `tree` field.
- *Gaps already named on pattern pages*: results presentation and pagination (data-view's To-do; composing views 8) and the inspector (editing-in-place's To-do; making changes 6). steering-surface now lists an inspector as an instance, which may house it.

## Closed

Evidence is from the working tree on 2026-11-15.

| Finding | Status | Evidence |
| --- | --- | --- |
| Composing views 1 | done | Map entry 2; framing/1 is item-view. |
| Composing views 2 | done | framing/1 "Build the item's ladder", `rule: item-view`. |
| Composing views 3 | done | pan-and-zoom absent from composing-views; structuring the space's pan-and-zoom arm links to its splitting region. |
| Composing views 4 | done | Cluster "Let the actor rearrange and narrow the collection" after the attribute step. |
| Composing views 5 | done | Triaged 2026-11-15. The pair is one `complements` edge declared by searching: refining a search with facets and searching from a filter's dead end both run along it, so a `precedes` from filtering would record only one of the two directions. The hand-over to an agent stays a prose link in the LLM-assisted section. |
| Composing views 6 | overtaken | Making sense at scale's curation/1 saves the view on data-view; data-view keeps §Saved views. No split. |
| Composing views 7 | done | Triaged 2026-11-15. link-preview says the preview of an entity is its item view's summary level and that a page-shaped destination has none; `complements item-view` carries it. |
| Composing views 8 | observation | Gap listed under §Live: territory no page owns. |
| Structuring the space 1 | done | Map entry 1; layout/1 is workspace. |
| Structuring the space 2 | done | hub-and-spoke rides layout/1 as a constituent. |
| Structuring the space 3 | done | Triaged 2026-11-15. pan-and-zoom's addressability clause has `sets-up: [deep-linking]` in place of the `complements` edge; deep-linking's opening already names a position and scale in a pan and zoom space. |
| Structuring the space 4 | done | Triaged 2026-11-15. fully-connected's chrome-budget clause has `sets-up: [hybrid-patterns]`, and the `complements` note with the condition in it is gone. |
| Structuring the space 5 | observation | Map interconnection inventory records the dissolution. |
| Structuring the space 6 | observation | hub-and-spoke `precedes purpose-keyed-view`; map records it. |
| Structuring the space 8 | done | Executed 2026-09-24; recognition choice; navigation-overview §Kinds of space. |
| Structuring the space 9 | done | Executed 2026-09-25. Of its listed candidates, the conversational-surface placement was left out in the finding itself, the third walk was run, and *Applies when* renders open (sequences.md). Wayfinding and landing surface are carried above. |
| Structuring the space 10 (pattern half) | done | Triaged 2026-11-15. deep-linking §Which changes deserve a Back step says the decision is made for each history the platform keeps. The gloss half is carried above. |
| Structuring the space 14 (hub-and-spoke) | done | Triaged 2026-11-15. hub-and-spoke's resulting prose calls a persistent tab bar the usual phone form of fully connected, in line with navigation-overview, and describes the hybrid separately. Signposting and contextual links are carried above. |
| Structuring the space 10 (gloss half) | dropped | Triaged 2026-11-15. The per-history decision is on deep-linking's page, and the addressing gloss is already long; a gloss does not repeat its pattern. |
| Structuring the space 12 | done | Triaged 2026-11-15. The partition step's gloss decides a switcher for each axis the contexts divide on. |
| Structuring the space 13 | done | Triaged 2026-11-15. The growth choice's gloss says an arm is taken at layout where the genre makes its pain foreseeable. |
| Making changes 1 | done | Triaged 2026-11-15. The routing choice in making-changes.mdx owns the judgement, with each arm's rule supplying its condition. editing-in-place's edge to form is retyped from `complements` to `alternative`, and the To-do asking for that is gone. |
| Making changes 2 | done | Committing `initiating` and the lead state it. |
| Making changes 3 (map half) | done | Map entry 3; safety `initiating` "not only deletion". |
| Making changes 3 (pattern half) | done | Triaged 2026-11-15. draft-and-publish has a resulting clause with `sets-up: [action-consequences]`; the graph carries `draft-and-publish precedes action-consequences`. |
| Making changes 4 | dropped | Triaged 2026-11-15. By selection's own distinction, activating one displayed value to edit it is focus, not the designation of a target from a set. The bulk case reaches editing through selection's existing payload edges. |
| Making changes 5 | observation | Map lists undo; safety/3. |
| Making changes 6 | observation | Gap listed above. |
| Making changes 7 | done / overtaken | version-history seeded 2026-10-19; the undo gloss links named versions to memory and continuity's return region. Memory and continuity 10 carried above. |
| The encounter 1 | done | Business step "Put controls into the messages", optional. |
| The encounter 2 | done | "Deliver long content in parts the actor controls"; map entry 4. |
| The encounter 3 (sequence half) | done | Cluster "Design both ending and pausing". |
| The encounter 3 (pattern half) | done | Triaged 2026-11-15. disengage-without-closing's note on closing no longer calls it preferred; the cluster gloss in the sequence keeps the judgement of which ending is usual. |
| The encounter 4 | done | Triaged 2026-11-15. capability-and-scope has a third resulting clause: the statement is true for one encounter and is stated again on return where it changed. |
| The encounter 5 | done | Map lists plan-preview. |
| The encounter 6 | done | Triaged 2026-11-15. abort has a resulting clause with `sets-up: [undo]` in place of the `related` edge; the graph carries `abort precedes undo`. |
| The encounter 7 | done | Triaged 2026-11-15. conversation's stages section links to the encounter; the interaction-types stub moved to its To-do; the dialogue-form chooser stays, because the forms are described only on that page. |
| The encounter 8 | done | Attention and tempo's budget/2 gloss links to the encounter for an event that needs a decision. |
| The encounter 9 (sequence half) | done | The footing/1 gloss links to learning's arrival region. |
| The encounter 9 (pattern half) | dropped | Triaged 2026-11-15. The claim is about the first run, which the sequence link to learning's arrival region states; onboarding's page has nothing for a pattern edge to act on. |
| Delegating work 1–5 | done | framing/1 prompt, framing/2 reference-material; receive and iterate choices; iterate/2 standing-instructions with `follows: instructed-revision`; watch/1 optional. |
| Delegating work 6 | done | regeneration and instructed-revision both `precedes: undo` in shaped prose. The map's missing-links paragraph now says so. |
| Delegating work 7 | overtaken | permissions and trial-run seeded; permissions is an optional step of the sequence's first region, and trial-run a step of delegating standing work. |
| Delegating work 8 | done | Triaged 2026-11-15. The note on `agent precedes generated-content` says it is the path for a run nobody watched, with live-presentation as the watched one. |
| Delegating work 9 | observation | Map lists activity-log. |
| Delegating work 10 (edit set) | done | Triaged 2026-11-15. change-review gained the absent-author sentence with `complements transparent-reasoning`, `related activity-log`, the position caution and its source. The seed flag is carried above. |
| Delegating work 11 | overtaken | watch/2 `rule: status-feedback`, shown on the session or item the work already has. |
| Delegating work 12 | partly overtaken | check-in is bounded-autonomy's limit on disuse, shutdown an action of automating; performance report carried above. |
| Delegating work 13, 14 | overtaken | holding and resuming are actions of the automating concept; keeping what was passed over is part of case-correction. |
| Delegating work 15, 16 | done | Discharged 2026-08-29 by [2026-08-rule-composition.md](active/2026-08-rule-composition.md). |
| Delegating work sighted: tuning by demonstration, practice against atrophy, escalation to another person, staged pre-warning | overtaken | tuning-by-demonstration seeded; staged pre-warning folded into notification and status-feedback; mastery §Skills handed over; handoff's person-to-person section and reaching-a-person. |
| Governing autonomy 1 | done | Map entry. |
| Governing autonomy 2, 6, 8, 10 | observation | Edges and map list as the findings say. settings now has two make-time edges plus the `sets-up: notification` clause. |
| Governing autonomy 3 | done | Triaged 2026-11-15. plan-preview §Forms says a standing run's granted limits take the plan's place, previewed once at grant time. |
| Governing autonomy 5 and revision | done | handoff §Actor takeback mid-run, §Returning the work to the agent. |
| Governing autonomy 7 | done | standing-instructions names the regrant as bounded autonomy's side of the escalation. |
| Governing autonomy 9 | done | handoff region in working on the same thing; the stale connection note went with the `connections` block. |
| Governing autonomy 11 | done | Triaged 2026-11-15. bounded-autonomy §Learned and risk-based thresholds says a threshold that lowers autonomy needs a notice and a log entry, and one that raises it is an offer the actor accepts. |
| Calibrating reliance 1 (edge half) | dropped | Triaged 2026-11-15. Explanation does not act on what citation produces, so the order fails the dependency test for `precedes`. Citation's prose and the sequence state the order, and the pair stays `complements`. |
| Calibrating reliance 2 | done | provenance-marking and expressed-uncertainty no longer seeds. |
| Calibrating reliance 3 | done | Triaged 2026-11-15. transparent-reasoning's lead says the pattern applies to output reached in several steps and names single-move output as the case with no trail. |
| Calibrating reliance 4, 6 | done | Map entry; map lists citation. |
| Calibrating reliance 5 | observation | cognitive-forcing-functions `sets-up: activity-log`. |
| Calibrating reliance 7; assistance escalation 6 | done | Triaged 2026-11-15. Recorded as open question 9 in relationship-vocabulary.md; activity-log's resulting clause tells it on the pattern side. |
| Calibrating reliance 8 | done | Triaged 2026-11-15. activity-log has a fourth resulting clause on recurring corrections as the evidence later changes are made on. No edge: case-correction already carries `precedes standing-instructions`. |
| Calibrating reliance 9 | done | learning's upkeep region; mastery §Skills handed over. |
| Assistance escalation 1 | done | offer/1–3; map entry. |
| Assistance escalation 2 | done | Triaged 2026-11-15. assisted-task-completion's body gives the offer-and-decide loop to suggestion and links the climb region; its first resulting clause now states the level a surface sits at. |
| Assistance escalation 3 | done | Triaged 2026-11-15. embedded-intelligence's `initiating` names stated intent as the case where the pattern is skipped. |
| Assistance escalation 4 | done | Triaged 2026-11-15. autocomplete's narrowing and expanding bullet equates them with looked-up and inferred candidates. |
| Assistance escalation 7; learning 7 | done | Triaged 2026-11-15. The lead of delegating a task names the encounter and learning as leading in, without a count; assistance escalation's handed-over procedure leads into delegating standing work, whose lead names it. |
| Assistance escalation 8 | done | Triaged 2026-11-15. delegating a task's "Present the result for judgement" gloss links to assistance escalation's forward region. |
| Assistance escalation 9 | done / overtaken | Map lists action-consequences; the arrival count left the acceptance gloss. |
| Learning 1, 6 | done | Arrival choice gloss; command-menu `sets-up: unavailable-actions`. |
| Learning 3 | done | mastery §Skills handed over; the glosses linking to learning's upkeep region do not say "maintenance". |
| Learning 8 | done | Triaged 2026-11-15. help has a resulting clause with `sets-up: [agent]` in place of the bare `related` edge; the clause states the difference between embedded and conversation-first surfaces. |
| Learning revision (mastery) | done | Triaged 2026-11-15. mastery has a resulting clause on picking up the optional routes from someone working alongside. |
| Learning 5, 9 | observation | Memory and continuity keeping/1 gloss; map lists onboarding and mastery. |
| Memory and continuity 1 | done | Three regions; keeping/1 activity-log. |
| Memory and continuity 2 | overtaken | Revised by the 2026-11-04 section; keeping/4 remembered-state. |
| Memory and continuity 5 | overtaken | The write face moved to attribution; map residue carried above. |
| Memory and continuity 6, 12, 14 | observation | As stated in the findings. |
| Memory and continuity 7 | done | memory's resulting covers removal reaching standing instructions. |
| Memory and continuity 8 | done | Triaged 2026-11-15. deletion has a section on what removal leaves behind. |
| Memory and continuity 10 (rule) | done | Triaged 2026-11-15. "Let the actor return to named versions" has `rule: version-history`. |
| Memory and continuity 11 | done | Triaged 2026-11-15. The forgetting cluster's gloss says the kept arrangement is cleared with what is remembered about the actor. |
| Memory and continuity 15 | done | Both to-dos resolved. |
| Attention and tempo 1, 2, 8 | done | Three regions; budget/4; map open question closed. |
| Attention and tempo 5 (revocation clause) | done | Triaged 2026-11-15. notification has a resulting clause on the overspent channel being turned off. The rest of the finding is carried above. |
| Attention and tempo 7 | observation | settings `sets-up: notification`. |
| Attention and tempo 9 | done | Triaged 2026-11-15. notification has a resulting clause making a kind of event the actor keeps muting the evidence for regrading it. On notification, not settings, because the grade is notification's decision. |
| Making sense at scale 1, 9, 10 | done | Map entries; `order: 3`. |
| Making sense at scale 8 | done | Triaged 2026-11-15. annotation's commenting clause says few private marks are shared and sharing one means rewriting it and its anchor; the source is in its references. |
| Making sense at scale, step order | done | The optional commenting step already stands ahead of incremental-formalisation in the marking region. |
| Sequence map lists | done | Triaged 2026-11-15. The shared-station list gains deep-linking and notification and loses provenance-marking; the missing-links paragraph and the working-together entry state the current pages. |
| Making sense at scale 2, 11 | observation | tag `sets-up: filtering`; the curation/2 gloss links to attention and tempo. |
| Making sense at scale 3 | done | Seeds created; hardening carried above. |
| Working on the same thing 1, 2, 3, 6 | done | Map entry; handoff region; grant/2; change-review's opening names any proposer. |
| Working on the same thing 7 | done | Triaged 2026-11-15. handoff §Person-to-person handoff adds the sender's subscription and their view of whether the handover was received, looked at and acted on. |
| Working on the same thing 8 | done | Triaged 2026-11-15. selection's To-do points to presence's cursor-and-selection grade and names what neither page covers. |
| Working on the same thing revision (approval link) | done | Triaged 2026-11-15. "Review the returning changes" links to governing autonomy's gate region. |
| Working on the same thing 10 | observation | All six arrivals present. |
| Working on the same thing 11 | overtaken | attribution owns signing among people; visibility/1 `rule: attribution`. |

## Aspects removed

The 23 aspects as they stood before 2026-11-15, with the step lines of that date. The steps have since been reworded, and the structuring the space addressing steps and the making changes saving steps merged.

| Sequence | Step | Pattern | Aspect |
| --- | --- | --- | --- |
| attention and tempo | Show status where the actor already looks | status-feedback | its indication shape |
| calibrating reliance | Answer why on demand | explanation | its AI explanations |
| calibrating reliance | Move the friction on evidence | cognitive-forcing-functions | where it is spent |
| composing views | Decide which edits pass through the view | data-view | its writable dimension |
| composing views | Keep the search reversible | searching | its stability obligation |
| governing autonomy | Hand the work back to the agent | handoff | its takeback direction |
| governing autonomy | Adjust the limits based on the record | bounded-autonomy | its incremental regrant |
| keeping a standing agent | Keep the actor able to take over | mastery | its retention of skills handed over |
| keeping a standing agent | Check the changed rule before it runs | trial-run | its replay over past cases |
| learning | Re-expose what would fade | mastery | its retention face |
| making changes | Choose between automatic and manual saving | saving | its arrangements |
| making sense at scale | Save the view that answered the question | data-view | its saved-views dimension |
| memory and continuity | Record who made each change and why | attribution | recording who or what made a change |
| memory and continuity | Keep the arrangement the actor leaves | remembered-state | what is kept and for whom |
| memory and continuity | Restore the arrangement | remembered-state | restoring |
| memory and continuity | Let the actor remove what is remembered | memory | its forgetting controls |
| memory and continuity | Decide what removal leaves behind | deletion | what remains after removal |
| structuring the space | Decide which changes deserve a Back step | deep-linking | its history dimension |
| structuring the space | Expose the link | deep-linking | its sharing surface |
| structuring the space | Keep named states resolving | deep-linking | its contract |
| working on the same thing | Review the returning changes | change-review | its person-to-person face |
| working on the same thing | Pass the work on with its context | handoff | its person-to-person face |
| working on the same thing | Answer the handoff openly | status-feedback | its typed-answer shape |

## Count

151 items: 138 numbered findings across the thirteen plans, 5 *Sighted, not claimed* items, 5 candidates inside structuring the space 9, 2 points lost in revisions, and 1 candidate hand-off in a revision. The sequence map's figure of about 117 counted the original numbering, before structuring the space gained findings 9–14 and memory and continuity gained 10–15, and it excluded findings executed in-sitting.

The live sections hold 28 entries: 8 on pattern pages, 1 on sequence files and the map, and 19 on territory no page owns. Two of them came from the simplification of the sequence format rather than from the thirteen plans. Some entries gather several findings, and some findings are split between a closed half and a live remainder. The rest are closed: done, overtaken, dropped, or observations with nothing to change.
