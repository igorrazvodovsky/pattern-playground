---
title: "Operations"
role: collection
description: "Automatic, infrastructural interactions that should just work — the reliable substrate beneath conscious action."
---
Automatic, infrastructural interactions that should just work. Operations are the reliable substrate beneath conscious action — well-established patterns with standardised implementations that actors use without deliberation.

>The boundary between operations and [actions](/patterns/actions) is fluid. An action practised enough becomes operational; an operation in an unfamiliar context demands conscious attention.

## Data entry

Capturing information from actors.

- <ComponentRef id="primitives-input--docs">Input</ComponentRef>
- <ComponentRef id="primitives-textarea--docs">Textarea</ComponentRef>
- <ComponentRef id="primitives-select--docs">Select</ComponentRef>
- <ComponentRef id="primitives-checkbox--docs">Checkbox</ComponentRef>
- <ComponentRef id="components-combobox--docs">Combobox</ComponentRef> — combining a text input with a selectable list
- [Bounded choice](/patterns/bounded-choice) — committing a value from a set
- [Autocomplete](/patterns/autocomplete) — real-time query narrowing as the actor types
- [Autofill](/patterns/autofill) — pre-populating fields from prior or inferred data

Input operations combine into [forms](/patterns/form) and other compositions.

## Metadata & categorisation

Labelling and organising information — adding semantic layers to content.

- <ComponentRef id="primitives-tag--docs">Tag</ComponentRef> — categorisation labels
- <ComponentRef id="primitives-badge--docs">Badge</ComponentRef> — status indicators and counts
- <ComponentRef id="primitives-reference--docs">Reference</ComponentRef> — citations and source tracking
- [Deep linking](/patterns/deep-linking) — direct access to specific states
- [Sections](/patterns/sections) — grouping content into named regions

## Navigation infrastructure

Structural elements that enable movement through information.

- <ComponentRef id="primitives-breadcrumbs--docs">Breadcrumbs</ComponentRef> — location awareness within hierarchy
- <ComponentRef id="components-tabs--docs">Tabs</ComponentRef> — switching between parallel views
- <ComponentRef id="primitives-details--docs">Details</ComponentRef> — collapsible content sections

## Controls & affordances

Communicating interactive possibilities and triggering actions.

- <ComponentRef id="components-button--docs">Button</ComponentRef> — primary action trigger
- <ComponentRef id="primitives-keyboard-key--docs">Keyboard key</ComponentRef> — documenting keyboard interactions
- <ComponentRef id="components-morphing-controls--docs">Morphing controls</ComponentRef> — controls that adapt their form to context
- [Inline confirmation](/patterns/inline-confirmation) — lightweight commitment before destructive actions

## Display & feedback

Conveying system state and contextual information.

- <ComponentRef id="primitives-popover--docs">Popover</ComponentRef> — temporary contextual information
- [Transient feedback](/patterns/transient-feedback) — brief self-dismissing status messages, typically delivered as a <ComponentRef id="primitives-toast--docs">toast</ComponentRef>
- <ComponentRef id="operations-callout--docs">Callout</ComponentRef> — contextual alerts and guidance
- <ComponentRef id="primitives-progress-indicator--docs">Progress indicator</ComponentRef> — visualising ongoing processes
- [Status feedback](/patterns/status-feedback) — communicating system state

## States

Addressing specific system states that cut across other categories.

- [Empty state](/patterns/state-empty) — guiding actors when nothing exists yet
- [Disabled state](/patterns/state-disabled) — communicating unavailable options
- [Unavailable actions](/patterns/unavailable-actions) — explaining why actions aren't possible

## Recovery

- [Undo](/patterns/undo) — reversing actions
- [Good defaults](/patterns/good-defaults) — reducing the need for recovery by starting right

## Conversation building blocks

Primitives for constructing conversational flows. These form the turn-taking substrate that [conversation](/patterns/conversation) as an activity is built from.

### Conversational activities

Core interaction moves: the actor asking a question through [inquiry](/patterns/inquiry-user), making an [open request](/patterns/open-request), the agent doing [extended telling](/patterns/extended-telling), and the agent asking a question through [inquiry](/patterns/inquiry-agent).

### Sequence management

Handling breakdowns and transitions within a sequence: [agent repair](/patterns/agent-repair), [user repair](/patterns/user-repair), [sequence completion](/patterns/sequence-completion), and [abort](/patterns/abort).

### Conversation management

Initiating and ending encounters: the [agent opening](/patterns/agent-opening), [user opening](/patterns/user-opening), establishing [capability & scope](/patterns/capability-and-scope), [closing](/patterns/closing), or [disengaging without closing](/patterns/disengage-without-closing).
