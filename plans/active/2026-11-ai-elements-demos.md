---
title: "AI Elements in the demos"
status: active
kind: exec-spec
created: 2026-11-16
last_reviewed: 2026-11-16
area: components / pattern-site
---

# AI Elements in the demos

## Context

shadcn's AI Elements (ui.shadcn.com/docs/ai-elements) are compositions of a
few shadcn components: *Trace* (Reasoning, Chain of Thought, Plan, Task, Queue,
Tool, Sources, Subagent, Terminal, Stack Trace, Test Results), *Message* and
*Bubble* (Message, Chat), *Input Group* with *Attachment* (Prompt Input),
*Marker* (Checkpoint), *Item* (Confirmation), and *Hover Card* with
*Progress* (Inline Citation, Context). They reach the demos through the shadcn
registry (`packages/components/src/catalog/registries/shadcn/`), ported onto
Radix as the registry's other components are.

One element can serve several demos, and one demo can combine several
elements. Catalog types stay at component altitude, so an element enters as
the catalog type it renders, not under its AI Elements name.

## Done

Ported into the shadcn registry: Trace (`trace.tsx`), Message and Bubble
(`message.tsx`), a TraceLine assembly (`trace-step.tsx`), and Inline Citation
(`citation.tsx`). `shadcn.css` gained the `shimmer` utility Trace's running
line uses.

The shadcn `Message` renders as AI Elements' Message: the actor's text is a
muted Bubble at the end, and the reply sits on the Message without one. Every
conversation demo picks this up in the shadcn library (conversational-form,
input-output-mapping, inquiry-questionnaire, communicating-uncertainty and the
others built on Messages).

New catalog types, rendered in shadcn only: `Trace`, `TraceLine`, `Citation`.
The playground's own library says it has no such component. `CodeBlock`, for what
a tool call returned, renders in both. AI Elements' Tool carries a call's
status in its title (Running…, Ran…, Failed to run…), not in a badge. New icons:
`copy`, `edit`, `plan`, `regenerate`.

New specs:

| Spec | Pattern | Elements | Libraries |
| --- | --- | --- | --- |
| `plan-preview` | plan-preview | Message, Plan (Trace) | shadcn |
| `tool-approval` | approval-gate | Message, Reasoning, Confirmation (Item), Tool | shadcn |
| `citation-chips` | citation (Chip with popover) | Message, Inline Citation | shadcn |
| `citation-sources` | citation (Source list) | Message, Sources | shadcn |
| `prompt-suggestions` | suggestion (Conversation) | Message, Suggestion, Prompt Input | both |
| `regenerate-reply` | regeneration (borrowed by generated-content) | Message with actions | both |
| `working-plan` | working-plan | Message, Queue, Prompt Input | shadcn |
| `work-trail-in-chat` | work-trail | Message, Reasoning, Tool | shadcn |
| `work-trail-run` | work-trail (Dedicated run views) | Chain of Thought, Sources | shadcn |
| `prompt-editing` | prompt (borrowed by branching) | Message with actions, Prompt Input | both |

## Remaining demos

Each pairs a pattern with elements that fit it. Outlines, to be worked out
per sitting.

Several Trace-based elements are one composition under different names.
Reasoning, Chain of Thought and Subagent are each a collapsible line with
lines or text nested inside, and what the nesting holds does not change the
interface. In the catalog they are all `TraceLine` with children, so none of
them needs a type of its own. A demo picks between them by what the run is
about, not by which element it uses.

- *delegation* or *handoff*: a run handed to another agent, shown as a
  `TraceLine` whose nested lines are that agent's steps. The demo turns on
  the handoff brief, which no AI Element covers.
- *waiting*: a Task line while it runs, using the running status.
- *version-history*, *session* or *branching*: Checkpoint, a marker after a
  turn with Restore, which drops the turns after it. Which pattern owns it is
  undecided: restoring drops later turns, which is version-history's move,
  while branching keeps both lines.
- *reference-material* and *prompt*: Prompt Input's attachments, shown as
  chips above the field. The `Composer` would need an attachments slot.

## Gaps

AI Elements with no good match in the project:

- *Terminal*, *Test Results*, *Stack Trace* and *File Tree* belong to coding
  agents. The language has no pattern for a command an agent runs, a test
  run, a failure's stack, or the set of files a run changed. File Tree comes
  closest to change review, which works at the level of changes, not files.
  `CodeBlock` can show their output, without highlighting.
- *Context*, the share of the model's context window a conversation has used,
  has no pattern. Session and cost transparency are near it but are about
  other limits.
- *Model Selector*, choosing the model and how hard it thinks, has no pattern.
  It is a setting on the request rather than part of what is asked.
- *Chat*'s Message Scroller keeps the place while a reply streams. No demo
  streams, so `Messages` stays a plain column.

Gaps on the project side, found while building:

- The catalog's `Item` has no outlined form, so Confirmation reads as a plain
  row rather than AI Elements' outlined Item.
- `Timeline` and `Trace` overlap: both are steps in order. Timeline is for a
  history, with who and when; Trace is for an agent's run, with status. The
  work trail's run view moved from `reasoning-trace` to `work-trail-run`, on
  Trace; `reasoning-trace` stays on Timeline for activity-log, where the run
  is read as a history. Giving the playground's own library a Trace would make
  the shadcn-only specs switchable.
