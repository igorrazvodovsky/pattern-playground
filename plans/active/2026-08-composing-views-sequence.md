---
title: Composing views — the pilot sequence
status: active
kind: exec-spec
created: 2026-08-28
last_reviewed: 2026-09-27
area: language / organisation
promoted_to:
superseded_by:
---

# Composing views — the pilot sequence

Phase 2 of [the sequence-map plan](2026-08-sequence-map.md): the first sequence authored end-to-end. The sequence's authoritative home is `apps/patterns/src/content/sequences/composing-views.mdx`, the representation phase 3 settled (docs/specs/sequences.md); this document is the authoring trace — the sequence as first written, the read-aloud walk, the test walks with their backtracks, and the corpus changes the authoring surfaced. The corpus changes are recorded here, not executed — each is judgment work for its own sitting.

Steps are decisions, written as verbs, each invoking a pattern as its rule. Constituents ride inside steps in parentheses. A step marked *(parallel)* belongs to an unordered cluster: the decisions are taken in whatever order the work suggests, and the serial presentation is a readable rationalisation, not a claim. The order of the sequence is the order of decisions, not of construction — steps taken in order are often realised together.

## Presupposition (the head)

The space is structured. The actor's objects and activities are named, the collection exists as a named thing with settled attributes and labels (the information architecture foundation records this — part of the initiating situation, not a step), and a surface exists to host the views (the workspace, handed off from structuring the space). A product that cannot state this presupposition is not ready for this sequence; the naming work it points at is process-register and is discharged upstream.

The sequence chiefly enacts *malleability* (the framing, the attribute set, and the view arrangement all end up in the actor's hands) and *density* (every representation choice is a decision about how the screen budget is spent).

## The sequence

### A. Framing the collection — the trunk

1. *Build the item's ladder.* Decide how the entity renders at each level of detail — glyph, reference, summary, detail, full — and what keeps it recognisable as itself at every rung. Rule: [item-view]. (Constituent: progressive-disclosure — movement down the ladder is staged disclosure.)
2. *Frame the collection as a named view.* Choose the query (which items), the representation (which of the ladder's compressed rungs the items wear — row, card, pin), and the arrangement; set the defaults an actor meets before touching anything. Rule: [data-view]. The representation choice spends step 1's product. (Constituent: good-defaults — the framing owns its defaults.)
3. *Decide the labelling layer.* Where items belong to several categories at once, or the vocabulary describing them is still moving, let items carry labels rather than forcing a filed place. Rule: [tag]. Optional — a collection with settled single-valued categories skips it.
4. *Decide what each view carries.* The attribute set of the compressed rendering, per view: the designed subset as a starting point, the set itself handed to the actor. Labels from step 3 are among the attributes. Rule: [attribute-visibility]. (Constituent: drag-and-drop — the strongest surfacing control.)
5. *Open the arrangement and the query.* Three moves over the visible attributes and labels, an unordered cluster — nothing orders them among themselves, and most products take them together *(parallel)*:
   - *sort* — hand the actor the order, persist their choice. Rule: [sorting]. (Constituent: drag-and-drop — manual order.)
   - *group* — give the collection visible structure along a chosen attribute. Rule: [grouping]. (Constituent: drag-and-drop — moving between groups is the write path.)
   - *filter* — narrow to items matching criteria, criteria kept on the surface. Rule: [filtering]. (Constituents: bounded-choice — each condition; embedded-intelligence — natural language into structured filters.)
   The real order claim in this region is *surface then operate*: step 4 before this cluster, because an attribute made visible becomes the key sorted by, the axis grouped along, the predicate filtered on.
6. *Decide which edits pass through the view.* Which representations take writes, what each write means through the projection, and every dragged write's drag-free twin. Rule: [data-view], its writable dimension — the trunk's second invocation of the pattern, this time its write side. (Constituent: drag-and-drop — a card dropped in a lane writes the grouping attribute.) Calls *making changes*: editing inside the projection is [editing-in-place]'s rule.

*Resulting context.* The collection reaches the actor framed — queried, represented, arranged — with the framing inspectable and adjustable. A framed population makes designating items cheap, which hands off to *making changes* ([selection] is its head). Framings accumulate: the naming, sharing, and pruning of saved views opens the curation question this sequence does not own (see finding 6).

### B. Adding search — the escalation

*Initiating situation.* Narrowing has stopped being enough: filtering leaves the actor at a dead end still holding their intent, or their criteria are not ones the attributes can express, or they know the item's name rather than its properties. The information architecture must be settled (a foundation condition, not a step — without it search is brittle), and step A3's labels, where present, are facets the search can narrow by.

1. *Give intent an entry.* Keyword or natural-language query, global or local scope, and the translation from the actor's language to the system's vocabulary. Rule: [searching]. (Constituents: autocomplete, suggestion.)
2. *Frame the result set.* A result set now exists, ordered by relevance rather than by the collection's own structure, and presenting it is a design problem of its own — this step *calls* A2: the results page is a data view, and the trunk's framing decisions run again over it. The `searching precedes data-view` edge is exactly this call.
3. *Keep the search reversible.* Returning from a search finds the actor's previous state — scroll position, framing — intact; search must not destroy the context it was launched from. Rule: searching's stability obligation.

### C. Cross-references in place — corpus collections

*Initiating situation.* The collection's items are documents, densely cross-referenced; authored links exist as structure. A collection of records without link density skips this sub-sequence entirely.

1. *Let links be sampled in place.* Hover or focus previews with a ladder of commitment — peek, open alongside, open fully — so triage happens at the link rather than after the navigation. Rule: [link-preview]. The preview surface is the entity ladder's summary rung reused (A1's product; see finding 7). (Constituent: progressive-disclosure — the lightest tier.)
2. *Surface the unauthored connections.* When the corpus outgrows what anyone linked by hand, present inferred connections as ranked suggestions, never as claimed structure. Rule: [dynamic-hyperlinks]. Its product re-enters step 1's rule: inferred links need previewing more, because nobody authored them and no prior expectation exists.

*Hands off:* link-preview's mechanism feeds [citation] — the entry into *calibrating reliance*.

### D. Splitting and coupling — the second view

*Initiating situation.* One view no longer serves both motions — scanning many candidates and verifying one — or several views of the model have each earned a place by showing a different aspect.

1. *Split the view.* One collection, two linked views: an overview rendering every item in the same compressed form, a detail rendering the current item in full, the current item carrying between them. Rule: [overview-detail]. Its material is A1's ladder (both sides are rungs of it) and A2's framing (the overview side is the data view).
2. *Decide the content dimension per view.* Which attributes live in which view; the overview's subset fixes what can be compared, sorted, and filtered, so hold it open to the actor. Rule: [attribute-visibility] applied per view — A4's rule invoked a second time at a new site.
3. *Decide layout and composition.* Side by side, in place, popover, or new page; how many of each and how they nest. A choice point inside overview-detail's own dimensions — the weak form of a step, since it names no second pattern.
4. *Couple the views.* Once views multiply past the pair, propagate designation between them so cross-view relationships arrive perceptually. Rule: [coordinated-views]. Guarded by its own parsimony: couple only where coupling demonstrably helps — two views linked by a current item do not need it. Calls *making changes* mid-course: the propagated payload is sometimes a staked [selection], sometimes mere focus (A1's current item).

*Adjacent:* the lens family — semantic-zoom, focus-and-context, text-lense — resolves the same force (detail without losing the whole) by varying representation rather than multiplying views. Those are *making sense at scale*'s steps; this station is where a walk would cross over.

## The read-aloud walk

The test from Book 2 ch. 11 §5: read aloud, the design should form stepwise, no step contradicting what previous steps built.

> The space is structured; a surface waits for views. First the item is given its ladder — the entity rendered at every level of detail, recognisable at each. Then the collection is framed as a named view: a query picks the items, a rung of the ladder renders them, an arrangement orders them, and the defaults are set. Where categories overlap or the vocabulary still moves, items take labels. Each view is then given its attribute set — what the compressed rendering carries, labels included, the set handed to the actor. Over the visible attributes the actor is given the arranging and narrowing moves: sort, group, filter, in whatever order the product needs. Then the view is made writable where writes are safe, each dragged write with its drag-free twin. When narrowing stops being enough, search enters, and its result set is framed the way any collection is. If the items are documents that cite one another, links become sampleable in place, and the connections nobody authored surface as suggestions. When one view stops serving both scanning and verifying, it splits into overview and detail along the ladder already built; and when views multiply past the pair, they are coupled so what is designated here lights up there.

Verdict: passes. Every step's material exists when the step arrives; nothing built is contradicted later. The walk reads as one design forming.

## Test walks

Recorded per ch. 11 §7: a sequence fails where a later step forces undoing an earlier step's product. Rationalisations — steps really parallel, or recognised after the fact — are findings, not failures.

*Walk 1 — a team's issue tracker (tool-shaped).* A1: row, card, peek panel, full page. A2: "Open issues" — query on status, table representation, arranged by update time. A3: taken — themes cut across the component hierarchy, so labels over categories. A4–A5: attribute set, then sort/group/filter; the three cluster moves were designed in one sitting with no internal order (rationalisation, recorded). A6: board drag writes status; the move menu is the twin. B: search by title and id; the results page reused the trunk's framing unchanged (the call in B2 held). C: skipped — records, not documents; the initiating situation correctly gates it. D: split into list plus detail pane; coupling (D4) never earned its place — two views linked by the current item needed no propagation machinery. *Backtrack found:* in the first draft the labelling decision sat after filtering; reaching the attribute-set step with labels not yet decided forced reopening it, since a label is an attribute the view must carry. Moving tag before attribute-visibility (A3 before A4) cleared it, and the order agrees with the corpus (`tag precedes filtering` via the facet clause).

*Walk 2 — a knowledge base (corpus-shaped).* A1: graph dot, wikilink reference, hover card, full note. A2: the notes list. A3: central — tags are the organising layer. A4–A6 as above; renaming in place is the writable edit. C: both steps, and central to the product. B: search is the primary seeking move here, and B's initiating situation ("knows the name rather than the properties") is the common case rather than the escalation — entry order differs per product, as the plan's ordering section predicts. D: list plus reading pane, then a third view (the graph), at which point coupling earned its place; the payload was focus. *Backtrack found:* C1 drafted as free-standing produced a preview card designed from scratch — duplicating the summary rung A1 had already built. The preview surface is the ladder's summary rung reused, so C depends on A1's product; the sub-sequence's material statement now says so. This also surfaced candidate finding 7 below.

*On the transfer question* (does an authored walk guide interaction design as it does building?): the read-aloud held, and both walks produced designs without undoing, but the guidance concentrated at the joints — what must exist before what, which sub-sequences a product skips — rather than in fine-grained order. The trunk's cluster (three parallel moves) and B's product-relative entry point say a view-composing sequence is coarser-grained than a construction sequence. That matches Siddle's account from software architecture and is worth carrying to the next sequence rather than treating as a defect of this one.

## Findings — corpus changes the authoring forces

Recorded for their own sittings; none executed here.

1. *The trunk's head is data-view, not searching.* The plan's candidate spine read `searching → data-view → filtering…` off the edge directions. Walking it, searching as step 1 has no material: nothing framed exists to escalate from, and its own initiating situation (narrowing has failed) presupposes the narrowing moves. The `searching precedes data-view` edge is correct and unchanged — it is B2's call, not the trunk's opening. No edge changes; the plan's sequence entry is corrected.
2. *item-view promoted from constituent to step.* Its product is consumed twice — A2's representation choice and both sides of D1's split — which is what distinguishes a step's deposit from a constituent's ride. The edges stay `enables`; step-ness is not derivable from edge type. This is direct evidence for phase 3: what the sequence layer stores (step vs. constituent, and the order of same-scale steps) is exactly what the graph cannot.
3. *pan-and-zoom leaves this sequence.* It is one arm of the navigation-model choice point in *structuring the space* (navigation-overview's tree owns the judgement; the pattern's own initiating situation defers to it). Its `precedes coordinated-views` edge is a handoff between sequences: choosing the continuous-space model upstream creates the conditions for D4's coupling here (the second viewport kept in step). The plan listed it among composing views' later steps; corrected.
4. *The sort/group/filter cluster is parallel.* No make-time order exists among the three; the corpus agrees (mutual `complements`, all three fed by the same `data-view precedes` edges). The sequence marks them one unordered cluster after the attribute-set step — the honest serialisation Zdun and Siddle both describe. The order claim worth keeping is *surface then operate* (A4 before the cluster).
5. *Candidate edge: filtering's dead ends set up searching.* Filtering's second resulting clause ("both are where narrowing stops being enough") is B's initiating situation in prose, but carries no `sets-up`. Candidate: `sets-up: [searching]` on that clause. The same page's LLM-assisted section describes delegating a failed filter to an agent — a call into *delegating work* with no typed edge; candidate `sets-up: [agent]` on the same clause, or a decision-tree row, whichever the sitting judges right.
6. *Candidate split: saved views.* Naming, sharing, and pruning framings — with its three authorship poles (developer defaults, role views, personal views) — reads in the walk as a decision of its own, but lives as a section of data-view. It is also the bridge toward the curation chain (`purpose-keyed-view`, `problem-curated-view`) that *making sense at scale* will want as material. Recorded, not decided; the making-sense-at-scale sitting is the right place to rule.
7. *Candidate relation: link-preview and item-view.* In entity-shaped corpora the preview surface is the ladder's summary rung (walk 2); link-preview's page currently reaches item-view only through a component citation. Caveat before authoring: for page-shaped destinations (title and opening paragraph) the preview is not an entity rendering, so the claim may hold only for the reference/entity case — check against the Reference component's escalation note before minting anything.
8. *Gap confirmed: results presentation.* B2's call re-surfaces what data-view's own to-do already names (pagination, result presentation). No new node proposed; the gap is now legible from two directions.


## Revision to the step-length rules (2026-09-27)

The sequence was revised under the step-length rules in docs/specs/sequences.md §Authoring, in the plain wording of the other revisions. It was already the shortest sequence; the file went from about 1,315 words to about 1,110. No step title, rule, order, or connection changed, and sub-sequence ids are unchanged, so the walks and every incoming `at` address still stand.

What changed:

- The three one-line glosses in the arrangement cluster were sentence fragments ("Persist their choice.", "Along a chosen attribute.", "Criteria kept on the surface."). They are now complete instructions.
- Authoring-status remarks left the glosses: the second invocation of data-view and attribute-visibility, the `searching precedes data-view` edge as the typed form of the results call, and the layout step as the weak form (its missing `rule` marks it).
- The framing `resulting` now points the curation of saved views to making sense at scale, which has authored it since finding 6 was recorded.
- The lead no longer lists the framing steps.
- Connection notes were rewritten as plain sentences.

Nothing was lost that is not on a pattern page, in the findings, or in the graph.

Step-list test: the step lines, with the cluster and its three members, read as a walk without their glosses.

[item-view]: ../../apps/patterns/src/content/patterns/item-view.mdx
[data-view]: ../../apps/patterns/src/content/patterns/data-view.mdx
[tag]: ../../apps/patterns/src/content/patterns/tag.mdx
[attribute-visibility]: ../../apps/patterns/src/content/patterns/attribute-visibility.mdx
[sorting]: ../../apps/patterns/src/content/patterns/sorting.mdx
[grouping]: ../../apps/patterns/src/content/patterns/grouping.mdx
[filtering]: ../../apps/patterns/src/content/patterns/filtering.mdx
[editing-in-place]: ../../apps/patterns/src/content/patterns/editing-in-place.mdx
[selection]: ../../apps/patterns/src/content/patterns/selection.mdx
[searching]: ../../apps/patterns/src/content/patterns/searching.mdx
[link-preview]: ../../apps/patterns/src/content/patterns/link-preview.mdx
[dynamic-hyperlinks]: ../../apps/patterns/src/content/patterns/dynamic-hyperlinks.mdx
[citation]: ../../apps/patterns/src/content/patterns/citation.mdx
[overview-detail]: ../../apps/patterns/src/content/patterns/overview-detail.mdx
[coordinated-views]: ../../apps/patterns/src/content/patterns/coordinated-views.mdx
