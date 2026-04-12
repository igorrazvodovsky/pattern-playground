# Reorganise the story tree around Activity Theory

## Context

The current `src/stories/` tree inherits from Atomic Design: *primitives → components → compositions → patterns*, plus *foundations*, *qualities*, and a few extras. This hierarchy organises by compositional complexity — what things are made of. It serves builders well but doesn't match how the project actually works: an interaction design repertoire where the interesting question is *what role does this pattern play in human activity?*

Activity Theory (Leontiev, Engeström) offers an alternative organising principle based on *where attention lives* during activity:

- *Operations* — unconscious, condition-driven, automatic. Things that should work without demanding attention.
- *Actions* — conscious, goal-directed. Things users deliberately engage with to achieve specific goals.
- *Activities* — motive-driven, strategic. Things that shape how work unfolds over time, involving coordination of multiple actions.

This maps surprisingly well onto the existing content. The hypothesis is that reorganising around this hierarchy changes how you *think about* the patterns when navigating and working with the project — foregrounding the experiential level rather than the implementation level.

Crucially, this is *not a replacement* of the Atomic Design categorisation — it's an *alternative projection* of the same underlying space (see `resources/semilattice.md`). The semilattice argument says every tree is lossy; the answer isn't a better tree but *multiple projections*. The AT hierarchy becomes the default sidebar projection because it foregrounds experiential altitude. The Atomic Design categories (primitive, component, composition, pattern) persist as metadata — queryable via tags, visible in the graph, available as an alternative projection. No classification is discarded; the question is which one gets the privileged position of the sidebar default.

This is an experiment. The goal is to try it and see whether it shifts how the project is used day-to-day.

## The proposed tree

Three primary levels, replacing the current eight top-level categories:

### Operations (automatic, infrastructural)

Things that mediate activity without requiring conscious attention. The user doesn't *decide* to use these — they're the substrate.

From current *primitives*:
- Button, Badge, Callout, Checkbox, Counter, Details, Input, Keyboard key, Popover, Spinner, Tag, Textarea, Toast, Avatar, Deep linking, Overflow, Reference

From current *components* (the more infrastructural ones):
- Breadcrumbs, Tabs, Progress indicator, Inline confirmation

From current *patterns* (operational-level):
- Good defaults, Status feedback, States (empty, disabled, morphing, unavailable), Undo

### Actions (conscious, goal-directed)

Things users deliberately invoke to accomplish specific goals. The user knows they're doing something. Sub-grouped by intent lifecycle stage (see `src/stories/foundations/Interaction.mdx`) for scanability — not as a second taxonomy. Items straddle stages; the tree picks one, tags and graph edges capture the rest.

*Seeking & access* — retrieving and gathering relevant information:
- Searching, Filtering, Sorting, Command menu, Progressive disclosure, Data view, Dynamic hyperlinks, Item view

*Evaluation & relevance* — assessing relevance and value:
- Table, List, Timeline, Focus and context, Semantic zoom, Text lens, Chart types, Elements, Bar chart

*Sense-making & integration* — synthesising and organising insights:
- Card, Grouping, Annotation, Explanation, View, Needs-based view, Block-based editor, Tag

*Application & enactment* — taking decisions, completing tasks:
- Form, Data entry, Dialog, Drawer, Wizard, Data operations (deletion, saving, consequences), Settings, Suggestion, Template

*Coordination* — multi-actor alignment:
- Messaging, Commenting, Toolbar, Nav bar, Notification, Bubble menu, Dropdown, Priority+

*Conversation primitives* — conscious moves in dialogue (see special case below):
- Opening, closing, disengage, and other deliberate conversational acts

*Navigation structures* dissolve as a group — individual structures (Flat navigation, Multilevel tree, Hub and spoke, Fully connected, Step by step, Pyramid, Pan and zoom, Overview and detail, Hybrid patterns) are assigned to the lifecycle stage they primarily serve and share a `navigation-structure` tag for graph clustering.

### Activities (motive-driven, strategic)

Things that shape how work unfolds over time, coordinating multiple actions and actors. These are about *why* and *how*, not *what*.

From current *patterns*:
- Activity feed, Activity log, Bot, Collaboration, Conversation (pattern-level), AI tuning, Embedded intelligence, Generated content, Help, Living document, Localization, Mastery, Onboarding, Transparent reasoning, Workspace, Prompt

From current *compositions*:
- Toolbar (as workspace orchestration — may belong in both Actions and Activities)

From current *concepts*:
- Collection, Comment, Event, Event log, Item, Notification, Reference
- Conversation concepts (Commitment, Conversation, Delegation, Domain, Interpretation, Intervention, Planning, Task, Trigger)
- Agentic systems (Continuous operation)

### Cross-cutting (not part of the hierarchy)

These don't belong at any single level — they *describe* the levels. They stay as separate top-level entries:

- *Foundations*: Principles, Intent & Interaction, Information architecture, Collaboration, Data & Information — these provide the theoretical grounding. They inform all three levels.
  - *Foundations/Material*: Color, Iconography, Layout, Motion, Typography — the perceptual substrate through which all three AT levels are expressed. These aren't operations (they were never actions that became automatic); they're the *medium of mediation* (Bødker) that pervades every level. Placed under Foundations rather than as a standalone category for now — the scope of "material" may expand (e.g., AI as design material) but that question can be answered later.
- *Qualities*: Agency, Conversation, Adaptability, Malleability, Shareability, Temporality, Privacy, Learnability, Density, Formality, Accessibility — cross-cutting attributes, used as tags (see `quirky-giggling-creek.md`).

### Conversational primitives: a special case

The conversational primitives (`src/stories/primitives/conversation/`) are currently under *primitives* but they're not operational in the AT sense — they're conscious, deliberate moves in dialogue. They sit better under *Actions* as a subcategory, or possibly under *Activities* if you consider conversation management as activity-level coordination.

Proposed: move to *Actions/Conversation primitives*. The management moves (opening, closing, disengage) are action-level. The sequence management moves (repair, abort, completion) are operational. This is a split worth testing.

## What changes

### Tree depth and nesting

Current: 2 levels (category → item, occasionally category → subcategory → item).
Proposed: *one nesting level maximum within AT levels*, used for scanability rather than classification.

The semilattice argument (see `resources/semilattice.md`) applies here directly: sub-groupings within AT levels would reintroduce a second taxonomy, forcing semilattice relationships back into a tree. The tree's job is *scanability* — chunking long lists for visual scanning — not classification. Classification lives in tags and graph edges.

*Operations* (~20 items) and *Activities* (~15 items) stay flat — short enough to scan without sub-groups.

*Actions* (~40 items) needs lightweight grouping. The Intent & Interaction lifecycle (see `src/stories/foundations/Interaction.mdx`) is the natural candidate: actions are conscious and goal-directed, and the lifecycle describes stages of goal resolution. Same dimension. Sub-groups within Actions orient by *where in the resolution arc* the action typically appears:

- *Seeking & access* — Searching, Filtering, Sorting, Command menu, Progressive disclosure, Data view, Dynamic hyperlinks
- *Evaluation & relevance* — Table, List, Timeline, Focus and context, Semantic zoom, Text lens, Chart types, Elements, Bar chart
- *Sense-making & integration* — Card, Grouping, Annotation, Explanation, View, Needs-based view, Block-based editor
- *Application & enactment* — Form, Data entry, Dialog, Drawer, Wizard, Data operations (deletion, saving, consequences), Settings, Suggestion, Template
- *Coordination* — Messaging, Commenting, Toolbar, Nav bar, Notification, Bubble menu, Dropdown, Priority+

These aren't strict bins — many items straddle stages (that's the semilattice reality). The tree picks one position; lifecycle-stage tags and graph edges capture the overlaps. An item filed under "Seeking" can be tagged with evaluation and sense-making stages, and the graph will show those connections.

The current *compositions/structure* group (Flat navigation, Multilevel tree, Hub and spoke, etc.) dissolves — its items scatter across lifecycle stages depending on which stage they primarily serve. Their structural kinship is captured by a shared tag (e.g., `navigation-structure`) and graph clustering, not by a folder.

Conversational primitives (see special case below) become a sub-group under Actions — *Actions/Conversation primitives* — since they're conscious, deliberate moves that don't map cleanly onto a single lifecycle stage.

### Storybook sidebar

The three AT levels become the primary sidebar groups. Actions uses lifecycle-stage sub-groups for scanability. Operations and Activities are flat.

### What gets harder

- Finding things by *implementation type* (all components, all compositions) requires the tag system or the graph. The tree no longer answers "show me all compositions."
- Some items genuinely straddle levels. Toolbar is both an operational affordance and an action container. The tree forces a choice; the tags and graph handle the overlap.

### What gets easier

- Answering "what do I need to think about for [this kind of work]?" — browsing *Activities* when thinking strategically, *Actions* when designing task flows, *Operations* when refining details.
- The levels mirror how design work actually proceeds: start with activity-level intent, decompose into actions, rely on operations to handle the rest.

## Two audiences, two problems

The tree serves a human browsing a sidebar. But an LLM agent consuming these patterns — to advise on design, generate implementations, or compose patterns for a task — navigates differently. It doesn't browse; it retrieves. The tree hierarchy is nearly irrelevant to an LLM. What matters is:

- *Tags* — queryable attributes for filtering ("find patterns involving agency and temporality")
- *Graph edges* — typed relationships for traversal ("read Notification, then follow its links")
- *Definitions* — the one-line sentence after each `# Title` is the primary relevance signal for retrieval
- *Intent lifecycle mapping* — which lifecycle stages (trigger, seeking, evaluation, sense-making, application, sharing) each pattern serves. This is the most natural entry point for an LLM starting from "the user wants to do X"
- *Concepts* — Daniel Jackson's concept vocabulary (Collection, Event, Task, Delegation...) functions as a compositional API. An LLM reasons: "this feature involves a Collection of Items, coordinated through Delegation" and retrieves the relevant patterns

The AT hierarchy is useful to an LLM not as a filing system but as a *reasoning heuristic*: "are we working at the operational, action, or activity level?" helps select the right altitude of advice. It belongs in the metadata, not necessarily in the directory structure.

This means the tree restructure (Phase 2 below) is primarily a *human-experience* question. The LLM-experience question is answered by Phase 1's metadata layer — `activity-levels.json` combined with quality tags, intent-lifecycle annotations, and typed graph edges.

## Implementation approach

### Phase 1: hand-authored metadata (non-destructive, scaffolding) ✓ complete

~~Don't move files yet. Build the queryable layer that serves both audiences.~~ Done. Phases 1 and 2 were collapsed — the classification was stable enough to move directly to restructuring without a separate metadata-only phase.

Key deviations from plan:
- Skipped the intermediate hand-authored `activity-levels.json`. Went straight to co-located tags in `<Meta>` and generated JSON via `scripts/extract-graph-data.ts`.
- PatternGraph AT colouring mode was implemented (5-category spatial layout by AT level) but the toggle between projection modes (atomic vs AT vs lifecycle) was not — the graph now exclusively shows the AT projection.

### Phase 2: stories own their metadata + restructure the tree ✓ complete (March 2026)

Both sub-phases collapsed into a single migration pass.

#### What was done

**2a. Metadata in story files:**
- All story files tagged with `activity-level:*`, `atomic:*`, and (for actions) `lifecycle:*` via `<Meta tags={[...]}>`.
- `scripts/extract-graph-data.ts` extended to read tags and generate both `src/pattern-graph.json` and `src/stories/data/activity-levels.json`. The JSON files are now derived, not authored.

**2b. Tree restructure:**

New directory structure (replacing primitives / components / compositions / patterns / visual-elements):
- `operations/` — flat; ~25 items including `operations/conversation/` sub-group with three nested categories (Conversational activities, Sequence management, Conversation management)
- `actions/seeking/`, `actions/evaluation/`, `actions/sense-making/`, `actions/application/`, `actions/coordination/` — lifecycle-stage sub-groups
- `actions/navigation/` — pragmatic addition not in original plan; navigation model pages (flat, hub-and-spoke, multilevel, etc.) collected here rather than scattered across lifecycle stages
- `activities/` — flat; ~18 items
- `foundations/material/` — visual-elements migrated here (Color, Typography, Layout, Motion, Iconography)
- `data-visualization/` — kept as special case rather than absorbed into actions/evaluation; treated as a placeholder pending fuller development
- `qualities/` and `concepts/` — unchanged

**Deviations from plan:**
- Conversational primitives ended up in `operations/conversation/` (not `actions/conversation/` as proposed). The sequence management moves (repair, abort, completion) were judged operational; the management moves (opening, closing) could be either, but co-location with the sequence moves was prioritised over AT purity.
- Navigation structures got their own `actions/navigation/` sub-group rather than dissolving into lifecycle stages. A `navigation-structure` tag captures their kinship; the sub-group aids scannability.
- Data visualization stayed as a top-level special case — not collapsed into actions/evaluation.
- Old Atomic Design directories (`primitives/`, `components/`, `compositions/`, `patterns/`, `visual-elements/`) fully cleared of stories and mdx files. Residual `.md` stub files (Autofill, Checklist, etc.) remain in `patterns/` — not served by Storybook, low priority.

**Graph:** 123 nodes, 645 edges. Categories: Actions, Activities, Data Visualisation, Foundations, Operations, Qualities. `PatternGraph.tsx` `CATEGORY_TARGETS` updated to 5-category AT spatial layout.

### Phase 3: evaluate

After living with the new structure for a month:
- Does the AT framing change how you navigate the project? (human question)
- Does the generated `activity-levels.json` improve pattern retrieval when working with an LLM? (agent question)
- Does the operations/actions/activities framing influence how you *write* new patterns?
- Are the level assignments stable, or do things keep wanting to move?
- Does the AT framing compose well with the quality tags and the graph?
- Does co-located metadata actually reduce drift? Are new stories getting classified at authoring time?
- Is the generated JSON staying in sync, or does the extraction step get forgotten?
- Do the multiple projections (AT level, atomic category, lifecycle stage) get used, or does one dominate?

If the metadata layer works but the tree restructure doesn't earn its keep, keep the tree as-is. The AT classification still serves as a graph projection and retrieval dimension.

## Edge cases and open questions

- *Data visualisation*: currently its own category. Chart types and elements are action-level (conscious data reading). Bar chart is arguably operational (a standard encoding). Collapse into Actions with a subcategory?
- *Hooks*: empty directory, ignore for now.
- *Concepts*: these are from Daniel Jackson's concept design methodology. They describe *what the system knows about*, not what the user does. They might deserve their own cross-cutting category like foundations, rather than folding into Activities. Or they could be the *objects* in Engeström's triangle — the things that activity transforms.
- *Conversation at three levels*: conversation currently exists as a quality, a pattern, and a set of concepts. The AT framing might clarify this: conversation-as-quality is cross-cutting, conversation-as-pattern is activity-level, conversational primitives are action-level. That's actually cleaner than the current spread.
- *The Engeström triangle*: this plan uses only the activity/action/operation hierarchy, not the full subject–tool–rules–community–division-of-labour model. The full model could inform a future projection or tagging dimension, but adding it now would overload the experiment.
- *Richer semantic encoding* (separate topic, noted here for connection): Park et al.'s "Bridging Gulfs in UI Generation through Semantic Guidance" (CHI '26, see `resources/papers/Bridging Gulfs.md`) demonstrates that explicit semantic layers between intent and artifact improve both expression and evaluation. Their four-level framework (Product → Design System → Feature → Component) describes *what information is needed to generate/understand a UI*. This has a potential parallel for pattern files: each pattern could declare which semantic levels it primarily operates at, what semantic slots it fills or constrains, and how it relates to other semantic levels. This would enrich the metadata layer beyond AT levels and Atomic Design categories — adding a *generative semantics* dimension that describes how patterns participate in UI specification. This is out of scope for this plan but connects directly to the metadata-first approach of Phase 1.

## Files

| Phase | Action | File |
|-------|--------|------|
| 1 | Create | `src/stories/data/activity-levels.json` (hand-authored, scaffolding) |
| 1 | Modify | `src/components/PatternGraph.tsx` (add AT colouring mode) |
| 1 | Modify | `src/styles/pattern-graph.css` (AT colour palette) |
| 2a | Modify | All MDX files (add metadata to frontmatter/Meta tags) |
| 2a | Modify | `scripts/extract-graph-data.ts` (extend to extract classification metadata and generate `activity-levels.json`) |
| 2a | Derive | `src/stories/data/activity-levels.json` (now generated, no longer hand-authored) |
| 2b | Rename | All MDX files (new directory structure + Meta titles + cross-reference URLs) |

## References

- Leontiev, A. N. (1978). *Activity, Consciousness, and Personality.* Prentice-Hall.
- Engeström, Y. (1987). *Learning by Expanding.* Orienta-Konsultit.
- Kaptelinin, V. & Nardi, B. (2006). *Acting with Technology: Activity Theory and Interaction Design.* MIT Press.
- Bødker, S. (1991). *Through the Interface: A Human Activity Approach to User Interface Design.* Lawrence Erlbaum.
- Kuutti, K. (1996). Activity Theory as a Potential Framework for Human-Computer Interaction Research. In Nardi (Ed.), *Context and Consciousness*, MIT Press.
- https://assets.interaction-design.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed/activity-theory
- https://informationr.net/ir/12-3/paper311.html