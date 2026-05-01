---
title: "AT framing audit"
status: "completed"
kind: "retrospective"
created: "2026-03"
last_reviewed: "2026-05-01"
area: "storybook"
promoted_to: "none"
superseded_by: ""
---
# AT framing audit

## Context

The Activity Theory reorganisation (see `activity-theory-reorg.md`) moved stories into three AT levels — *operations*, *actions*, *activities* — but many opening framings still carry Atomic Design / implementation-oriented language. This audit checks whether each pattern's opening sentence answers the right question for its level.

Each AT level implies a different framing question:

| Level | Question the opening should answer |
|-------|-------------------------------------|
| Operations | *What condition does this respond to, and what attention does it absorb?* |
| Actions | *What goal does the actor pursue, and what tension does the design navigate?* |
| Activities | *What motive or transformation does this support across time?* |

### Assessment scale

- *AT-aligned* — the framing answers the right question for its level
- *Partial* — some AT-appropriate language but mixed with structural/implementation framing
- *Misaligned* — primarily structural, implementation-focused, or silent

---

## Summary

| Assessment | Operations | Actions | Activities | Total |
|-----------|-----------|---------|-----------|-------|
| AT-aligned | 19 | 18 | 4 | 41 |
| Partial | 8 | 17 | 8 | 33 |
| Misaligned | 8 | 13 | 5 | 26 |

### Key findings

1. *Conversation operations are exemplary.* All 13 files use condition→response framing consistently. They could template the rest of the operations level.

2. *Actions/Application is the strongest action sub-group.* Wizard, Settings, Deletion, Template, Saving, Data entry, Action consequences all name both goal and tension.

3. *Activities is the weakest level.* Only 4 of 17 files are AT-aligned. AI-related activities (Bot, Prompt, AI tuning, Generated content, Transparent reasoning) read as feature definitions rather than motive-driven framings.

4. *The dominant failure mode is "feature description."* Patterns describe what they *are* or *do* rather than answering the AT-appropriate question. This is the Atomic Design legacy: the shelves changed but the labels didn't.

5. *Partial entries often have the right ingredients in later sections* (Forces, Behavioural position, When to use) but don't lead with them. The opening framing defaults to structural description.

---

## Operations

*Expected: condition → automatic response*

### Flat operations

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| Overview.mdx | Operations/Overview | AT-aligned | Clearly establishes automatic, non-deliberate nature |
| Button.mdx | Operations/Button | Misaligned | "Triggers an action or navigates to a destination" — generic component description |
| Badge.mdx | Operations/Badge | Misaligned | "A small label representing a status, property, count or some other metadata" — structural |
| Breadcrumbs.mdx | Operations/Breadcrumbs | Partial | "A breadcrumbs component shows…" leads with implementation; spatial context hint is there |
| Callout.mdx | Operations/Callout | Partial | "Display important information" — terse, hints at condition but no response described |
| Checkbox.mdx | Operations/Checkbox | Misaligned | "Styles only" — implementation notes |
| DeepLinking.mdx | Operations/Deep linking | Partial | "A primitive that makes any state addressable" — capability framing |
| GoodDefaults.mdx | Operations/Good defaults | AT-aligned | Condition (user faces choices) → response (intelligent pre-filling) |
| Input.mdx | Operations/Input | Misaligned | "Extends input with some useful extras" — implementation |
| KeyboardKey.mdx | Operations/Keyboard key | Misaligned | No framing text at all |
| MorphingControls.mdx | Operations/Morphing controls | AT-aligned | "Transforms in response to a state change" — clear condition→response |
| Overflow.mdx | Operations/Overflow | AT-aligned | "Governs how content responds when it exceeds its container" |
| Popover.mdx | Operations/Popover | Misaligned | Lists technical features — pure implementation spec |
| ProgressIndicator.mdx | Operations/Progress indicator | Partial | Communicative role described well but framed as component function |
| Reference.mdx | Operations/Reference | Misaligned | "References enable users to link to entities" — feature description |
| StateDisabled.mdx | Operations/Disabled state | Partial | Describes condition (unavailable features) but frames as anti-pattern discussion |
| StateEmpty.mdx | Operations/Empty state | AT-aligned | Condition (no content) → response (explanation and guidance) |
| StatusFeedback.mdx | Operations/Status feedback | Partial | Design guideline voice rather than condition→response |
| Tag.mdx | Operations/Tag | Misaligned | No framing text at all |
| Textarea.mdx | Operations/Textarea | Partial | Describes automatic resize — operational in spirit, framed as feature |
| UnavailableActions.mdx | Operations/Unavailable actions | AT-aligned | "Hide actions that are currently inaccessible" — concise condition→response |
| Undo.mdx | Operations/Undo | Partial | Mentions condition (mistakes) and what it absorbs (anxiety) but structured as feature |

### Conversation sub-group

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| Abort.mdx | Sequence management/Abort | AT-aligned | Condition (unsuccessful sequence) → response (clean exit) |
| AgentOpening.mdx | Conversation management/Opening (Bot) | AT-aligned | Condition (encounter start) → greeting and alignment |
| AgentRepair.mdx | Sequence management/Bot repair | AT-aligned | Condition (understanding trouble) → repair response |
| CapabilityAndScope.mdx | Conversation management/Capability & scope | AT-aligned | Condition (need for expectations) → scope statement |
| Closing.mdx | Conversation management/Closing | AT-aligned | Condition (encounter ending) → closing sequence |
| DisengageWithoutClosing.mdx | Conversation management/Disengage without closing | AT-aligned | Condition (party steps away) → state preservation |
| ExtendedTelling.mdx | Conversational activities/Extended telling | AT-aligned | Condition (complex info) → structured multi-part delivery |
| InquiryAgent.mdx | Conversational activities/Inquiry (Bot) | AT-aligned | Condition (missing info) → inquiry |
| InquiryUser.mdx | Conversational activities/Inquiry (User) | AT-aligned | Condition (user question) → direct response |
| OpenRequest.mdx | Conversational activities/Open request | AT-aligned | Condition (complex request) → multi-step clarification |
| SequenceCompletion.mdx | Sequence management/Sequence completion | AT-aligned | Condition (success signal) → acknowledgement and transition |
| UserOpening.mdx | Conversation management/Opening (User) | AT-aligned | Condition (user-initiated encounter) → alignment |
| UserRepair.mdx | Sequence management/User repair | AT-aligned | Condition (comprehension failure) → repair |

---

## Actions

*Expected: goal → conscious engagement → tradeoff*

### Seeking

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| Searching.mdx | Searching | AT-aligned | Goal (retrieve specific info), differentiates from other behaviours |
| Filtering.mdx | Filtering | Partial | Mentions actor but framed as feature capability |
| Sorting.mdx | Sorting | Partial | Mentions actor's task but terse feature description |
| CommandMenu.mdx | Command menu | Misaligned | "Provides quick access to commands" — generic feature |
| ProgressiveDisclosure.mdx | Progressive disclosure | AT-aligned | Goal (reduce cognitive load), tension (simplicity vs completeness) |
| DataView.mdx | Data view | Partial | Mentions actor goals but leads with "collection-scope representations within the view system" |
| ItemView.mdx | Item view | Partial | Mentions task needs but leads with "single-entity representation within the view system" |
| DynamicHyperlinks.mdx | Dynamic hyperlinks | Misaligned | "A pattern that layers inferred semantic connections" — pure technical |

### Evaluation

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| FocusAndContext.mdx | Focus and context | AT-aligned | Goal (complete focused tasks), tension (focus vs awareness) |
| TextLense.mdx | Text lens | Partial | Mentions actor perspective-switching but no tension named |
| Table.mdx | Table | Misaligned | "A lightweight wrapper component" — pure implementation |
| Timeline.mdx | Timeline | Misaligned | "Presents a chronological record of events" — bare structural |

### Sense-making

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| Tag.mdx | Tag | AT-aligned | Goal (classify for organisation), contrasts with hierarchical taxonomy |
| View.mdx | View | AT-aligned | Goal (make info legible for specific needs), tension (fixed vs fluid) |
| Dashboard.mdx | Needs-based view | AT-aligned | Goal (shape view to purpose), tension (purpose-driven vs convention-driven) |
| Annotation.mdx | Annotation | AT-aligned | Goal (add meaning), tension (preservation vs modification) |
| Explanation.mdx | Explanation | Partial | Mentions goal (transparency/trust) but framed as feature providing something |
| Grouping.mdx | Grouping | Partial | Structural lead; goal language appears in next paragraph |
| Card.mdx | Card | Misaligned | "Cards are used to group related subjects in a container" — structural |
| BlockBasedEditor.mdx | Block-based editor | Misaligned | Technical/structural description |

### Application

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| Wizard.mdx | Wizard | AT-aligned | Goal (handle complex processes), tension (clarity vs freedom) |
| Settings.mdx | Settings | AT-aligned | Goal (exercise control), tension (defaults vs individual needs) |
| Deletion.mdx | Deletion | AT-aligned | Goal (remove data), tension (confidence vs protection) |
| Template.mdx | Template | AT-aligned | Goal (create consistent items), tension (capability vs intent) |
| ActionConsequences.mdx | Action consequences | AT-aligned | Goal (evaluate and safeguard), tension (friction vs protection) |
| Saving.mdx | Saving | AT-aligned | Tension (friction vs control) named directly |
| DataEntry.mdx | Data entry | AT-aligned | Tension (human messiness vs system structure) |
| Form.mdx | Form | Partial | Mentions guiding users but no tension articulated |
| Suggestion.mdx | Suggestion | Partial | Mentions actors but no tension (e.g., automation vs agency) |
| Dialog.mdx | Dialog | Misaligned | No opening prose — jumps to Story |

### Coordination

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| Commenting.mdx | Commenting | Partial | Goals named (collaboration, knowledge sharing), tension hinted (interaction vs disruption) but feature-capability lead |
| BubbleMenu.mdx | Bubble menu | Partial | Goal (act on content) hinted, tension (acting vs maintaining flow) hinted |
| Toolbar.mdx | Toolbar | Partial | Mentions user goal (manage data) but feature description voice |
| Notification.mdx | Notification | Partial | Communicative function described but not as actor goal |
| PriorityPlus.mdx | Priority+ | Misaligned | "A low-level utility" — implementation-focused |
| Messaging.mdx | Messaging | Misaligned | "Real-time and asynchronous text-based conversations" — bare structural |
| NavBar.mdx | Nav bar | Misaligned | "A main navigation that provides links" — component description |

### Navigation

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| flat-navigation.mdx | Flat navigation | AT-aligned | Tradeoff: "where do I go?" becomes "which tool do I use?" |
| hub-and-spoke.mdx | Hub and spoke | AT-aligned | Tradeoff named explicitly (flexibility vs cognitive simplicity) |
| pan-and-zoom.mdx | Pan and zoom | AT-aligned | Tradeoff (eliminating transitions vs orientation challenges) |
| multilevel-tree.mdx | Multilevel tree | AT-aligned | Tension (freedom vs structure for deep hierarchies) |
| hybrid-patterns.mdx | Hybrid patterns | AT-aligned | Goal (balance competing needs) |
| navigation-overview.mdx | Overview | Partial | Mentions agency distribution but structural lead |
| OverviewDetail.mdx | Overview and detail | Partial | Structural model first, no explicit tension |
| pyramid.mdx | Pyramid | Partial | Structural description; flexibility implied not stated |
| step-by-step.mdx | Step by step | Partial | Structural lead; tension analysis deferred to later section |
| fully-connected.mdx | Fully connected | Partial | Structural model; cost of full connectivity deferred |

---

## Activities

*Expected: motive → coordination → transformation over time*

| File | Title | Assessment | Notes |
|------|-------|------------|-------|
| Overview.mdx | Activities/Overview | AT-aligned | Motive-driven, sustained, gives meaning to actions |
| Onboarding.mdx | Onboarding | AT-aligned | Transformation (person → active participant), temporal framing |
| Mastery.mdx | Mastery | AT-aligned | Motive (building proficiency over time), transformation (onboarded → expert) |
| Help.mdx | Help | AT-aligned | Motive (sensemaking), transformation (confused → capable) |
| Collaboration.mdx | Collaboration | Partial | Names goal (achieve common goals) and tensions but framed as feature |
| Conversation.mdx | Conversation | Partial | Describes scope and mechanism but not the motive for sustained engagement |
| Workspace.mdx | Workspace | Partial | Tension (separation vs coherence) but structural container framing |
| EmbeddedIntelligence.mdx | Embedded intelligence | Partial | Hints at motive (extending thinking) but no transformation over time |
| TransparentReasoning.mdx | Transparent reasoning | Partial | Describes what is presented but not the motive (trust, oversight) |
| LivingDocument.mdx | Living document | Partial | Mechanism (continuous updating) but motive not articulated |
| Localization.mdx | Localization | Partial | "Orchestration concern" — system concern voice, not motive-driven |
| Bot.mdx | Bot | Partial | Mediator role described but reads as action-level framing |
| ActivityFeed.mdx | Activity feed | Partial | Mechanism (continuous updates) but not *why* actors engage over time |
| GeneratedContent.mdx | Generated content | Misaligned | "Result of a bot's actions" — one-line structural |
| AITuning.mdx | AI tuning | Misaligned | "Instructions for a bot" — one-line structural |
| Prompt.mdx | Prompt | Misaligned | "An input for a bot" — one-line structural |
| ActivityLog.mdx | Activity log | Misaligned | "Who, what, and when — chronological list" — bare structural |

---

## Patterns worth noting

### What works

*Conversation operations* have the most consistent AT-aligned framing in the entire project. Every file follows the same pattern: name the condition, describe the automatic response. This came from writing them with AT in mind from the start, not migrating existing content.

*Actions/Application* is the strongest action sub-group because many of its patterns were already written around design tensions (deletion vs safety, friction vs control, capability vs intent). The AT framing question ("what tension does the design navigate?") maps naturally onto how these patterns were already conceived.

*Onboarding and Mastery* are the clearest activities because they describe *transformations in the actor's relationship to the system* — exactly what activity-level framing calls for.

### What doesn't work

*One-line definitions* that could appear in a glossary ("A small label", "An input for a bot", "Real-time text-based conversations") answer a *what is this?* question that AT framing doesn't ask. These worked under Atomic Design where the hierarchy already communicated the role; under AT the opening framing *is* the role.

*"A/The [noun] that [verb]s"* sentence structure almost always produces structural framing. Patterns that lead with a verb or with the actor's situation tend to land better: "Hide actions that are currently inaccessible" (Unavailable actions), "Pre-fill fields with intelligent guesses" (Good defaults).

*Partial entries* are often one edit away — the right language exists in a Forces section or a later paragraph but doesn't lead. Promoting it to the opening sentence would fix the framing without rewriting the pattern.

### The activities gap

Activities are the hardest to frame because they describe sustained engagement over time, not a single interaction moment. The question "what motive or transformation does this support?" requires articulating something that unfolds across sessions, not within a screen. The AI-related activities (Bot, Prompt, AI tuning, Generated content, Transparent reasoning) are especially sparse — they were likely created as placeholders or component specs and never reframed at the activity level.
