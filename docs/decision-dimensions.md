# Decision-dimension inventory

A snapshot of what dimensions the library currently uses to discriminate between patterns, extracted from the 8 active decision trees in `src/stories/`. The list is descriptive: these are the questions the trees actually branch on, not a normative claim about which dimensions matter.

This is a *current frame*, not an absolute one. The dimensions below are choices, past and accumulating, made by whoever drafted each tree. The absences listed at the end are also choices — places the library hasn't yet found it useful to discriminate. Making both legible is the point. Over time the inventory becomes a map of the library's conceptual reach and a prompt for where to extend it.

The vocabulary is left raw. No mapping to a controlled list, no cross-linking between trees, no canonicalisation of phrasing. The same dimension may appear under different names across trees; that variance is data, not noise.

## Per-pattern dimensions

### BarChart — `src/stories/data-visualization/BarChart.mdx`

A list-shaped tree (no flowchart) discriminating on *what the data is and what the reading is for*:

- *Data shape*: discrete categories vs. continuous vs. hierarchical vs. temporal/trend
- *Relationship being shown*: comparison, ranking, part-to-whole, distribution
- *Precision need*: whether exact values need to be readable

Notable: orientation choice (vertical vs. horizontal, by label length) is drafted but commented out — the tree currently stops at "use bar charts vs. consider alternatives" and doesn't reach into bar-chart variants.

### Overflow — `src/stories/operations/Overflow.mdx`

- *Content criticality*: is the overflowing content essential to the task?
- *Container flexibility*: can the container expand to fit?
- *Content traversability*: can the content be scrolled, or truncated with a recoverable affordance?

The tree ends at "consider redesign/priority" when none of these dimensions yield a workable move — making absence of a fit visible is itself a result.

### Notification — `src/stories/actions/coordination/Notification.mdx`

- *Action requirement*: does the user need to do something?
- *Urgency*: is immediate attention required?
- *Communicative intent*: status update vs. alert vs. confirmation
- *Dismissibility*: can the alert be cleared by the user, or must it persist?

### Navigation overview — `src/stories/actions/navigation/navigation-overview.mdx`

The richest tree; branches on the *shape of the space being navigated* and then offers refinement axes:

Primary branches:

- *Spatial continuity*: is the space a single continuous canvas (map, timeline, diagram) or a discrete graph of locations?
- *Prescribed sequence with dependencies*: must steps be done in order?
- *Ordering strictness*: strict vs. flexible
- *Hierarchy depth and volume*: 3+ levels and 50+ pages?
- *Workspace richness*: a single workspace with a rich toolset, or many destinations?
- *Cross-section workflow frequency*: how often do users move between sections?

Refinement axes (orthogonal to the primary branches):

- *User intent*: locate / browse / focused task / monitor
- *Agency level*: maximum user control vs. balanced vs. system-guided
- *Content scale*: < 10, 10–50, 50+

Hybrid combinations are listed explicitly — an acknowledgement that the dimensions don't always pick out a single move.

### Form — `src/stories/actions/application/Form.mdx`

Two trees, picking a different facet each.

*Choosing an input* (linear):

- *Option basicness and search need*: bounded, basic options vs. needing a searchable dropdown vs. open-ended search

*Choosing a control* (the library's most-branched tree):

- *Selection cardinality*: single vs. multi
- *Filtering function*: does the control filter or swap visible content?
- *Option count*: 1, 2–5, >5 (different controls per band)
- *Confirm-need*: does the action need an explicit confirm?
- *Label uniformity*: are labels short and consistent?
- *Visual emphasis*: do options need to read as prominent choices?

### Deletion — `src/stories/actions/application/Deletion.mdx`

- *Reversibility*: can the deletion be undone?
- *Recreation latency*: if not undoable, how long would recreating take? (seconds / minutes)
- *Impact scope*: single user / multiple users / system-wide

### Localization — `src/stories/activities/Localization.mdx`

- *Language boundaries*: used across languages?
- *Cultural context*: same cultural context, or different (with `en-GB` vs. `en-US` as a borderline case)
- *Regional boundaries*: used across regions?
- *AI/bot presence*: does the experience involve AI or bot output that needs contextual adaptation?

The tree is layered — each "yes" enables a deeper question. This makes the localization tree a *generative sequence* (linguistic, then cultural, then regional, then contextual) rather than a flat decision.

## Cross-cutting observations

### Dimensions that recur

- *Reversibility / recoverability* (Deletion, Overflow indirectly via "is content critical")
- *Cardinality / scale* (Form's option count, Navigation's content scale)
- *User intent or attention* (Navigation's behaviour-and-agency refinements, Notification's urgency)
- *Sequence / ordering* (Navigation's prescribed-sequence branch, Localization's layered structure)

### Dimensions the library doesn't (yet) reason about

Notable absences across the 8 trees:

- *Persistence*: no branch reasons about whether state is ephemeral, session-scoped, or durable.
- *Multi-user / collaborative state*: only Deletion's "impact scope" gestures at multi-user concerns. Concurrent editing, presence, conflict resolution, and shared selection are not factored into any tree.
- *AI-specific concerns*: only Localization brushes "AI/bot present", and it does so as a layering trigger rather than a substantive dimension. Trust, hallucination, agency-handoff, model uncertainty, and prompt-as-input are absent.
- *Trust and consequence asymmetry beyond Deletion*: Deletion treats irreversibility, but other consequential actions (publishing, sharing, granting access) don't have trees of their own.
- *Information density and signal-to-noise*: BarChart touches "precision need" but no tree branches on attention budget, scanability, or the cost of a wrong glance.
- *Accessibility-first dimensions*: e.g., screen reader linearisation, motion sensitivity, modality fallback. Present in prose elsewhere; not in any tree.

These are not gaps to be filled mechanically. They are openings — places where future decision trees would extend the library's reach.

## How the questions behave as situational hints

Decision-tree questions become *situational hints* on `recommends` edges (see [relationship-vocabulary.md](./relationship-vocabulary.md)) — context an actor weighs, not predicates to be matched. Reading the inventory through that lens, three properties of the material stand out.

*Most questions read naturally as situational context.* "Is the deletion reversible? → Yes" describes the situation, not the proposed solution, and is phrased in terms an actor recognises in the moment of designing. This is the easy case and accounts for the bulk of the trees.

*A few questions describe design state more than situation.* "Does the control filter or swap visible content?" partly describes what's already been decided about the surrounding structure. They still function as hints — situational hints can include design-state context — but they lean on prior decisions rather than on user/data/system context.

*Hybrid leaves are not single recommendations.* Navigation's hybrid-combination block already acknowledges that some leaves are "and", not "or". A consumer treating each `recommends` edge as a single-target suggestion needs to recognise when several edges share the same hints — that shared provenance is the signal that the leaf was hybrid.

*The questions are heterogeneous in kind.* Some describe data (BarChart), some user state (Notification's urgency), some system state (Overflow's container flexibility), some design state (Form's filtering function). They're collected as a single bag of "context an actor weighs", which is the right move under suggestion-not-matching but means any consumer wanting to organise hints by kind has to add that structure itself.
