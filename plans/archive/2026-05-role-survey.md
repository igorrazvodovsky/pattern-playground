---
title: "Role survey"
status: "completed"
kind: "research-gate"
created: "2026-05"
last_reviewed: "2026-05-02"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Role survey

Survey notes for [`2026-05-role-metadata.md`](./2026-05-role-metadata.md).
The survey covered emitted graph nodes from MDX, story-only CSF pages that lack
co-located MDX, and story-only CSF pages that currently do not emit graph nodes.

## Verdict

The role split holds for the current corpus without adding `role:control`.
Contract-bearing controls are real edge cases, but the useful distinction is
still page-level: a page is `role:component` when it primarily documents a
control/mechanism surface, and `role:pattern` when it primarily frames a
generative move. Controls such as Tabs, Input, Checkbox, Select, and Dialog are
therefore component-roled in this pass; patterns such as Autocomplete, Toast,
Sections, and Inline confirmation are pattern-roled because the current pages
read as interaction moves.

Five umbrella pages were confirmed because they gather a territory rather than
define a single move: Assisted task completion, Bot, Cognitive forcing
functions, Navigation overview, and Status feedback.

No multi-role page required a list-valued role. Where a page carried both a
component and pattern reading, the dominant authoring role won. Page splits can
still happen later if a control's implementation contract and interaction move
both need full treatment.

## Story-only CSF notes

- Emitted story-only nodes: List (`component`), Counter (`component`), Details
  (`component`), Inline confirmation (`pattern`), Tabs (`component`).
- Story-only sources tagged but not emitted because they are currently
  unconnected: Workflow (`component`), Avatar (`component`), Spinner
  (`component`).
- MDX sources tagged but not emitted because they are currently unconnected:
  Chart types (`component`) and Elements (`component`).
- `src/stories/actions/seeking/DynamicHyperlinks/DynamicHyperlinks.stories.tsx`
  duplicates the docs title owned by `DynamicHyperlinks.mdx`; the MDX page owns
  the `role:pattern` tag.
- `src/stories/actions/evaluation/SemanticZoom.stories.tsx` is tagged
  `role:component`, but the current extractor reads an inner sample title
  (`Introduction`) before the meta title, so it remains non-emitted. Retitling or
  fixing CSF title parsing is outside this role-metadata pass.

## Emitted graph classification

### Components

Badge; Bar chart; Breadcrumbs; Bubble menu; Button; Callout; Checkbox; Context
menu; Counter; Details; Dialog; Drawer; Dropdown; Input; Keyboard key; List;
Overflow; Popover; Priority+; Progress indicator; Range; Reference; Select;
Table; Tabs; Tag; Textarea; Timeline.

### Patterns

AI completion; AI tuning; Abort; Action bar; Action consequences; Activity
feed; Activity log; Annotation; Autocomplete; Autofill; Block-based editor; Bot
repair; Capability & scope; Card; Checklist; Closing; Collaboration;
Command menu; Commenting; Conversation; Data entry; Data view; Deep linking;
Deletion; Disabled state; Disengage without closing; Dynamic hyperlinks;
Embedded intelligence; Empty state; Explanation; Extended telling; Filtering;
Flat navigation; Focus and context; Form; Fully connected; Generated content;
Good defaults; Grouping; Help; Hub and spoke; Human goes first; Hybrid patterns;
Inline confirmation; Inquiry (Bot); Inquiry (User); Item view; Living document;
Mastery; Messaging; Morphing controls; Multilevel tree; Nav bar; Needs-based
view; Next-best action; Notification; Onboarding; Open request; Opening (Bot);
Opening (User); Overview and detail; Pan and zoom; Progressive disclosure;
Prompt; Pyramid; Saving; Searching; Sections; Selection; Sequence completion;
Settings; Sorting; Step by step; Suggestion; Tag; Template; Text lens; Toast;
Toolbar; Transparent reasoning; Unavailable actions; Undo; User repair; View;
Wizard; Workspace.

### Umbrellas

Assisted task completion; Bot; Cognitive forcing functions; Navigation
overview; Status feedback.

### Folder-inferred roles

Qualities are inferred from `src/stories/qualities/`: Accessibility,
Adaptability, Agency, Conversation, Density, Formality, Learnability,
Malleability, Privacy, Shareability, Temporality.

Foundations are inferred from `src/stories/foundations/`: Assistance,
Collaboration, Color, Data & Information, Delegation, Iconography, Information
architecture, Intent & Interaction, Layout, Localization, Modality, Motion,
Prose, Typography.

## Coverage after extraction

`npm run extract-graph` reported:

- Processed sources: explicit 124, inferred 26, unset 0.
- Emitted graph nodes: explicit 119, inferred 25, unset 0.
