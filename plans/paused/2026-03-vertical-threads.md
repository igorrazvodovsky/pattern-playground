---
title: "Vertical threads: cross-level relationships in the AT hierarchy"
status: "paused"
kind: "exec-spec"
created: "2026-03"
last_reviewed: "2026-05-01"
area: "graph"
promoted_to: ""
superseded_by: ""
---
# Vertical threads: cross-level relationships in the AT hierarchy

## Context

The AT reorganisation (see `activity-theory-reorg.md`) sorts patterns by *where attention lives* — operations, actions, activities. The framing audit (`at-framing-audit.md`) checks whether individual patterns describe themselves appropriately for their level. Neither addresses a third question: *do the relationships between patterns make the AT hierarchy visible and generative?*

The current relational structure — Related sections in MDX files, edges in `pattern-graph.json` — captures which patterns link to which. But edges are untyped. A link from Button to Iconography and a link from Form to Data entry look identical in the graph. More importantly, there's no vocabulary for relationships that *cross AT levels in a structured way* — where the same design concern manifests differently at each altitude.

## The idea: vertical threads

A *vertical thread* is a design concern that appears at all three AT levels, with different characteristics at each:

| Level | What changes | Design question |
|-------|-------------|-----------------|
| Operation | Condition-triggered, no conscious engagement | Can the system act correctly without asking? |
| Action | Actor invokes, evaluates, steers | How does the actor judge and direct the system's contribution? |
| Activity | Shapes which tasks happen next, across sessions | Does the system understand enough about broader goals to guide the arc of work? |

### Motivating example: assisted task progression

Not yet in the system, but illustrative:

- *Operation*: autocomplete / autofill — the system infers a likely completion from partial input and offers it inline. The actor accepts or ignores without breaking flow. The design question is accuracy: can the system guess well enough that the assist doesn't become noise?
- *Action*: AI completion — the actor consciously invokes a generation (or evaluates an unsolicited one) that fills a larger unit of work — a paragraph, a code block, a form section. The design question shifts to evaluation: how does the actor assess quality, edit the result, and maintain authorship?
- *Activity*: next-best-action / workflow suggestion — the system proposes what to do *next*, not just what to type *here*. It operates across task boundaries, suggesting the next document to review, the next person to contact, the next step in a process. The design question is goal alignment: does the system's model of what matters match the actor's?

Same underlying move (system assists progression), three altitudes of attention, three different design tensions. The thread makes visible that designing "AI assistance" isn't one problem — it's three, and getting the altitude wrong (treating an activity-level concern as an operation, or vice versa) produces characteristic failures.

### Other candidate threads

These are hypotheses to validate against the existing pattern inventory:

*Feedback and awareness*
- Operation: status indicators, progress bars, spinners — system state made ambient
- Action: notification, confirmation dialog — actor consciously attends to system communication
- Activity: activity feed, activity log — sustained awareness of what has happened and is happening across a scope of work

*Navigation and orientation*
- Operation: breadcrumbs, deep linking, overflow — wayfinding cues that work without demanding attention
- Action: navigation models (hub-and-spoke, multilevel tree, etc.) — conscious movement between locations
- Activity: workspace — structuring the space of work itself, deciding what's in scope

*Conversation*
- Operation: sequence management (repair, abort, completion) — automatic moves that maintain conversational coherence
- Action: conversational activities (inquiry, telling, open request) — conscious, deliberate dialogue moves
- Activity: conversation as sustained engagement — managing an evolving dialogue relationship over time

This one is already partially visible in the system — the plan noted conversation as existing at three levels (quality, pattern, primitives), and the AT reorganisation distributed conversation across operations and activities. But the vertical relationship isn't made explicit.

*Structure and organisation*
- Operation: tag (as a UI element that displays a classification) — visible label, no conscious engagement
- Action: tag (as an act of classifying), grouping, annotation — actor deliberately organises content
- Activity: living document, workspace — sustained curation and structural evolution of a knowledge space

*Disclosure and complexity management*
- Operation: morphing controls, unavailable actions — the interface adapts what's visible based on conditions
- Action: progressive disclosure, semantic zoom, focus and context — the actor consciously navigates between levels of detail
- Activity: mastery — the system's complexity surface evolves as the actor's expertise deepens over time

## What the system currently captures

### Existing infrastructure

The relational layer consists of:

1. *Related sections in MDX files* — informal subcategories (Precursors, Follow-ups, Complementary, or unlabelled lists). Links cross AT levels freely but the *nature* of the cross-level relationship isn't named.

2. *Pattern graph* (`pattern-graph.json`) — 123 nodes, 645 untyped directed edges extracted from inline Storybook links. No edge metadata: relationship type, strength, and cross-level significance are all invisible.

3. *Tags* — `activity-level:*`, `atomic:*`, `lifecycle:*` in `<Meta>` elements. These classify individual nodes but say nothing about relationships between them.

4. *Extraction script* (`scripts/extract-graph-data.ts`) — reads MDX/TSX files, extracts links via regex, builds the edge set. Could be extended to extract relationship type from Related section headers.

### What's missing

- *No edge types.* The graph treats all links as equivalent. A "this pattern uses that primitive" edge is indistinguishable from a "this pattern is the activity-level counterpart of that operation."
- *No thread concept.* There's no way to say "these three patterns at different AT levels are manifestations of the same design concern." The kinship is visible only if you happen to read all three and notice it.
- *No vertical navigation.* The sidebar organises by level. The graph shows everything at once. Neither offers a view that says "show me how [concern X] plays out across operations, actions, and activities."

## What this plan proposes

### Phase 1: identify and document threads

Audit the existing pattern inventory for vertical threads. For each candidate thread:

1. Name the thread (e.g., "assisted progression", "feedback and awareness")
2. Identify which existing patterns participate at each AT level
3. Describe how the design concern shifts across levels — what question changes, what tension changes
4. Note gaps: levels where no pattern exists yet (like "assisted task progression" which has no patterns in the system currently)

Output: a reference document mapping threads to patterns, similar in spirit to `activity-levels.json` but oriented around cross-level kinship rather than individual classification.

This phase is research — reading patterns, talking to the inventory, not moving files.

### Phase 2: encode threads in metadata

Extend the tagging system so that vertical thread membership is queryable. Options:

*Option A: thread tags on individual patterns.*
Add `thread:feedback`, `thread:navigation`, `thread:conversation`, etc. to `<Meta>` tags alongside existing `activity-level` and `lifecycle` tags. Simple, co-located, works with existing extraction. Downside: the thread concept lives only in tag values — there's no place to describe what the thread *is* or how the concern shifts across levels.

*Option B: thread descriptor files + tags.*
Each thread gets a short descriptor file (like a mini-pattern) that names the concern, describes how it shifts across levels, and lists participating patterns. Individual patterns get `thread:*` tags that point back. The descriptor provides the narrative; the tags provide the queryability.

*Option C: typed edges in the graph.*
Extend `pattern-graph.json` edges with a `type` field — at minimum distinguishing "uses" / "alternative" / "vertical-thread" relationships. Requires changes to `extract-graph-data.ts` and `PatternGraph.tsx`. More expressive but heavier.

These aren't mutually exclusive. Option B for human comprehension + Option A for machine queryability seems like the minimum. Option C is valuable but can follow.

### Phase 3: make threads visible

Once threads are encoded, surface them:

- *Graph visualisation*: highlight vertical threads as a viewing mode in `PatternGraph.tsx` — when a pattern is selected, show its thread siblings across levels
- *Pattern pages*: in the Related section, distinguish "same-level relatives" from "vertical thread siblings" — make the cross-level kinship explicit in prose
- *Navigation aid*: when browsing an operation, a subtle pointer to its action-level and activity-level counterparts (and vice versa) helps the reader move between altitudes

### Phase 4: use threads to find gaps

Threads reveal structural gaps. If a thread has strong patterns at the operation and activity levels but nothing at the action level, that's either a genuine gap (no pattern needed) or an unexplored design space. The "assisted task progression" thread is entirely a gap right now — none of its levels exist as patterns in the system.

Gaps are not necessarily problems — not every thread needs to be complete. But they're worth surfacing as design hypotheses: "if we have patterns for X at the operation and activity level, what would the action-level version look like?"

## Relationship to framing audit

The framing audit (`at-framing-audit.md`) asks: does each pattern describe itself correctly for its level? Vertical threads ask: do patterns acknowledge their cross-level siblings? These are complementary:

- A pattern with AT-aligned *framing* but no vertical thread awareness describes its own altitude well but doesn't help the reader move between altitudes.
- A pattern with thread *tags* but misaligned framing points at its siblings but doesn't explain why it belongs at its own level.

Both are needed for the AT hierarchy to be genuinely generative rather than just classificatory.

## Relationship to the semilattice argument

The AT reorg plan cites the semilattice argument (`resources/semilattice.md`): every tree is lossy, the answer is multiple projections. Vertical threads are a *third projection* — not by AT level (the sidebar), not by atomic category (tags), but by design concern across levels. They cut orthogonally to both existing projections. The graph is the natural home for this projection since it doesn't require a tree structure.

## Open questions

- *How many threads are there?* The candidates above are hypotheses. Some may dissolve on closer inspection; others may emerge from the audit. The number should be small enough to be useful (5–10?) rather than exhaustive.
- *Are threads stable?* A thread is a claim that patterns at different levels share a design concern. If the claim doesn't hold up — if the connection is superficial — the thread shouldn't exist. Threads should earn their place.
- *Can a pattern belong to multiple threads?* Almost certainly yes (Button participates in "feedback" via its states and in "navigation" via its link role). This is fine — it's the semilattice again.
- *Do threads imply a sequence?* The "assisted task progression" example has a natural gradient (autocomplete → AI completion → next-best-action). Not all threads will — "conversation" at three levels isn't a progression, it's three simultaneous manifestations. The thread concept shouldn't assume directionality.
- *How do threads relate to the lifecycle stages within Actions?* A thread crosses AT levels vertically; lifecycle stages organise within the action level horizontally. A thread might touch multiple lifecycle stages at the action level (e.g., "feedback" appears in seeking, evaluation, and application stages). This is fine but worth noting to avoid overloading the tag system.

## Files

| Phase | Action | File |
|-------|--------|------|
| 1 | Create | Thread inventory document (format TBD — could be markdown or JSON) |
| 2A | Modify | All participating MDX files (add `thread:*` tags to `<Meta>`) |
| 2B | Create | Thread descriptor files (one per thread, location TBD) |
| 2C | Modify | `scripts/extract-graph-data.ts` (extract thread tags, optionally type edges) |
| 2C | Modify | `src/pattern-graph.json` (extended edge structure if Option C pursued) |
| 3 | Modify | `src/components/PatternGraph.tsx` (thread visualisation mode) |
| 3 | Modify | Participating MDX files (update Related sections to distinguish thread siblings) |
