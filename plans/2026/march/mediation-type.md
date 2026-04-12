# Add mediation type as a metadata dimension

## Context

The Activity-Driven ISD model (Mursu et al., 2007; building on Engeström) identifies three distinct *mediation functions* that information technology serves within a work activity system:

1. *Individual work* — the person and their tool, mediating between subject and object. The pattern helps a single actor transform a work object.
2. *Coordination* — mediating between multiple actors within the same activity. The pattern enables shared awareness, turn-taking, or aligned action.
3. *Networking* — mediating between separate activity systems. The pattern carries objects, outcomes, or context across organisational or temporal boundaries.

This is orthogonal to the AT hierarchy (operation/action/activity) already captured in `activity-levels.json`. The AT level answers *at what altitude of consciousness does this pattern operate?* Mediation type answers *what kind of relationship does this pattern mediate?* A pattern can be an operation-level, individual-work mediator (input field) or an action-level, coordination mediator (commenting), or an activity-level, networking mediator (activity feed).

### Why this matters

- It answers a design question the AT level and lifecycle stage don't: "I'm designing for a team coordinating around shared objects — which patterns are relevant?" vs "I'm designing a single-user analytical workflow."
- It connects directly to the project's stated focus on professional work-support systems, where coordination and networking are central concerns.
- For the LLM audience, mediation type is a strong retrieval signal. An agent reasoning about a collaborative feature can filter to coordination and networking patterns without manually scanning all 80+ entries.
- It surfaces an interesting structural observation: the current "coordination" lifecycle stage under Actions conflates two things — patterns that coordinate actors *within* an activity (messaging, commenting) and patterns that coordinate *navigation of the interface* (toolbar, nav bar, dropdown). Mediation type would disambiguate these.

## Proposed values

| Value | Definition | Examples |
|-------|-----------|----------|
| `individual` | Mediates between a single actor and their work object | Input, Form, Data entry, Table, Filtering, Sorting, Text lens, Semantic zoom |
| `coordination` | Mediates between multiple actors within the same activity | Commenting, Messaging, Notification, Collaboration, Toolbar (as shared workspace orchestration) |
| `networking` | Mediates between separate activity systems | Activity feed, Activity log, Deep linking, Dynamic hyperlinks, Living document |

Some patterns are *primarily* one type but *participate* in others. A form is individual-work tooling until it's embedded in a workflow that hands off to another actor — then it's a networking interface. The metadata should capture the *primary* mediation function; the semilattice reality (patterns straddling types) is handled by tags and graph edges, same as with AT levels.

### Ambiguous cases

- *Nav bar, Toolbar, Breadcrumbs* — these mediate between the user and the *system's structure*, not between actors or activities. They're individual-work mediators (helping one person navigate), though toolbar can shift to coordination when it orchestrates shared workspace state.
- *Bot, Conversation, Prompt* — these mediate a human-AI relationship. The human and the AI are arguably two actors coordinating within an activity (→ coordination). But the AI isn't a peer in the Engeström sense — it's a tool. This is an interesting boundary case. For now, classify these as `individual` (the AI is a means of work, not a co-worker) and note the tension.
- *Onboarding, Help, Mastery* — these mediate between the user and the *activity system itself* (learning to participate). They're meta-level. Classify as `individual` since they serve one actor's relationship to the work.
- *Dashboard, Workspace* — containers that *compose* multiple mediation types. Classify by the dominant function the pattern describes, not by what can appear inside it.
- *Conversational primitives* — Opening, repair, closing etc. are coordination moves by definition (they manage a two-party interaction). Even though they're operation-level in the AT hierarchy, their mediation function is coordination.

## Implementation

### Scope

Add `mediation` as a field to each node in `activity-levels.json`, alongside the existing `activity-level`, `lifecycle-stage`, and `atomic-category` fields. The extraction script (`scripts/extract-graph-data.ts`) and `PatternGraph.tsx` already support AT-level colouring; extend both to handle mediation type.

### Steps

1. **Add to story Meta tags** — extend the existing `<Meta tags={[...]}>` arrays to include `mediation:individual`, `mediation:coordination`, or `mediation:networking`. Story files already carry `activity-level:*`, `atomic:*`, and `lifecycle:*` tags (added during the Phase 2 migration); mediation tags go in the same array.

2. **Extend `scripts/extract-graph-data.ts`** — the script already reads `activity-level:*`, `atomic:*`, and `lifecycle:*` tags via `extractMetaTags()`. Add `mediation:*` parsing with the same pattern and emit a `mediation` field in `activity-levels.json`.

3. **Update `activity-levels.json` schema** — each node gains a `mediation` field:
   ```json
   "actions-coordination-commenting": {
     "activity-level": "action",
     "lifecycle-stage": "coordination",
     "atomic-category": "composition",
     "mediation": "coordination"
   }
   ```

4. **Add graph colouring mode** — extend `PatternGraph.tsx` to support a "by mediation type" colouring mode, alongside the existing AT-level and atomic-category modes.

5. **Add colour palette** — three colours in `pattern-graph.css` for the mediation types. Suggest a warm-cool scheme: individual (neutral/grey-blue), coordination (warm/amber), networking (cool/teal) — visually distinct from the AT-level palette.

6. **Cross-cutting items** — foundations, qualities, and concepts get `mediation: null` (same convention as `lifecycle-stage: null` for non-action items). They describe dimensions of mediation rather than performing it.

### Assignment sketch

A first pass at classifying existing patterns. To be reviewed and adjusted during implementation.

**Individual:**
Badge, Breadcrumbs, Button, Callout, Checkbox, Counter, Deep linking, Details, Good defaults, Input, Keyboard key, Morphing controls, Overflow, Popover, Progress indicator, Reference, Spinner, Disabled state, Empty state, Status feedback, Tag (primitive), Textarea, Toast, Unavailable actions, Undo, Avatar — Form, Data entry, Dialog, Drawer, Wizard, Saving, Deletion, Action consequences, Settings, Suggestion, Template — Table, List, Timeline, Focus and context, Semantic zoom, Text lens — Searching, Filtering, Sorting, Command menu, Progressive disclosure, Data view, Item view — Card, Grouping, Annotation, Explanation, View, Block-based editor, Tag (sense-making) — Bar chart — Onboarding, Help, Mastery, Workspace, Prompt, Bot, AI tuning, Embedded intelligence, Generated content, Transparent reasoning, Localization

**Coordination:**
Commenting, Messaging, Notification, Toolbar, Nav bar, Bubble menu, Dropdown, Priority+ — Collaboration, Conversation — all conversational primitives (opening, closing, repair, inquiry, abort, etc.) — Dashboard (arguable)

**Networking:**
Activity feed, Activity log, Dynamic hyperlinks, Living document

### What this doesn't do

- It doesn't introduce the full Engeström triangle (subject, tool, rules, community, division of labour). That remains a possible future projection but would overload this experiment.
- It doesn't resolve the human-AI mediation question definitively. The classification treats AI as a tool (individual mediation) for now. If the project develops a stronger position on AI-as-co-worker, the assignments can shift.
- It doesn't create new sub-groups in the sidebar. Mediation type is metadata and graph colouring only — it doesn't affect the directory structure or Storybook tree.

## Evaluation

After living with the classification for a few weeks:
- Does the mediation lens reveal patterns that are missing? (e.g., are there networking patterns the project should have but doesn't?)
- Does it help when designing for multi-actor scenarios — does filtering by mediation type surface the right patterns?
- Does the graph colouring by mediation type show interesting clustering or surprising distributions?
- Is the three-way split sufficient, or do cases like "human-AI coordination" and "system-structure navigation" demand a fourth type?

## References

- Mursu, A., Luukkonen, I., Toivanen, M., & Korpela, M. (2007). Activity Theory in information systems research and practice. *Information Research*, 12(3), paper 311. https://informationr.net/ir/12-3/paper311.html
- Engeström, Y. (1987). *Learning by Expanding.* Orienta-Konsultit.
- Kaptelinin, V. & Nardi, B. (2006). *Acting with Technology: Activity Theory and Interaction Design.* MIT Press.
