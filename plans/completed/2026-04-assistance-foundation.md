---
title: "Create Assistance.mdx as a foundation"
status: "active"
kind: "exec-spec"
created: "2026-04"
last_reviewed: "2026-05-01"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Create Assistance.mdx as a foundation

## Context

Christopher Noessel's *Designing Assistant Technology* refines the basic see-think-do loop into a vocabulary for *what kinds of help a system can offer when a human is running their cognitive loop*. The vocabulary is the *five universal assists*:

- *Perceive* — assistance aimed at noticing. The system raises signal over noise so the user can spot what matters.
- *Know* — assistance aimed at understanding. The system helps the user interpret what they're seeing, recover context, and grasp state, process, and stakes.
- *Plan* — assistance aimed at choosing what to do next. The system narrows the option space and previews consequences without taking the choice over.
- *Perform* — assistance aimed at action. The system coaches execution, shows boundaries, and keeps performance legible while the user acts.
- *Reflect* — assistance aimed at looking back. The system makes outcomes, history, and trajectory visible so the user can learn from what just happened.

These five sit at a useful level of abstraction: more general than any single pattern, less general than the substrate cycle they refine. They name the *kinds* of help, not the specific implementations, which makes them a good vocabulary for designers reaching for the right pattern at the right phase of someone's loop.

The pattern library currently has no consolidated home for this vocabulary. Patterns that exemplify each assist exist (Suggestion exemplifies plan; Explanation exemplifies know; ActivityLog exemplifies reflect; etc.) but they're not connected through the framework that names what they share. An earlier version of the integration plan tried to put the assists inline in `Interaction.mdx` as vocabulary attached to lifecycle stages — that bound Interaction.mdx to the assistant frame and was rejected. The corrected architecture creates a sibling foundation, Assistance.mdx, that holds the five assists in their own right.

The framing parallels [`delegation-foundation.md`](./2026-04-delegation-foundation.md), which creates Delegation.mdx for the agent-mode counterpart. Both refine the see-think-do substrate established in [`interaction-see-think-do-reframe.md`](./2026-04-interaction-see-think-do-reframe.md). Three foundations, one substrate, two refinements.

## What Assistance.mdx is and isn't

*Is*:
- A foundation page about how systems can help a human who is running their own cognitive loop
- A frame-specific refinement of the see-think-do substrate established in Interaction.mdx
- A vocabulary (the five assists) for naming the *kinds* of help a system offers
- A connecting tissue between the substrate (Interaction.mdx) and the patterns that exemplify each kind of assistance

*Is not*:
- A pattern catalogue. Patterns stay in their existing locations under actions/, activities/, etc.
- A substitute for Bot.mdx or Help.mdx — those are activity-level patterns; Assistance is the framework that names what they (and many other patterns) are doing.
- A property of the system in the way Agency or Learnability are. Assistance describes a *configuration of agency* (the configuration where the human stays in the loop), not an independent quality.
- A theory of cognition. See-think-do is the substrate; Assistance just names the places where help can enter that substrate.

## Proposed structure

```
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Foundations/Assistance" />

> [Fun meter]

# Assistance

[One-sentence relational definition: Assistance is the kinds of help a system can offer when the human is running their cognitive loop.]

## See-think-do, refined for assistance

[~6–10 sentences. Picks up the substrate from Interaction.mdx. Names the move Noessel makes: see broadens to perceive; think splits into know and plan; do becomes perform; reflect is added above the loop. Notes that the five assists are vocabulary for the assistant frame specifically — when the human stays in the loop. Cross-references the sibling foundation Delegation.mdx for what happens when the human doesn't.]

## The five universal assists

### Perceive
[Definition, ~3–5 sentences. Practical forms: summarise the situation, guide attention, extend the user's senses, prime them for possibilities. Cross-references to patterns that exemplify perceive-style assistance in the existing library.]

### Know
[Definition. Forms: answer questions, help understand state of things, aid recall, support deeper conceptual understanding. Cross-references.]

### Plan
[Definition. Forms: surface likely next actions, generate options, visualise outcomes, rank and recommend. Cross-references.]

### Perform
[Definition. Forms: help practice, keep on point during action, show benchmarks. Cross-references.]

### Reflect
[Definition. Forms: surface activity history, support post-hoc review, compare to goals. Cross-references.]

## When assistance is the right frame

[~1–2 paragraphs. Names the conditions under which assistance — keeping the human in the loop — is the appropriate design choice rather than delegation. Cross-references coupling in Agency.mdx.]

## Relationship to other parts of the design system

[Brief notes — 1 sentence each, prose paragraph not bullets.]
- Interaction (substrate)
- Delegation (sibling — agent-mode counterpart)
- Agency (Assistance is a configuration of agency where coupling stays tight)
- Bot, Help, Onboarding (activity-level patterns where assistance often lives)
- Suggestion, Explanation, NextBestAction, AiCompletion (action-level patterns that exemplify specific assists)

## Resources & references
[Noessel + cognitive science background.]
```

Total length target: 150–250 lines of MDX. Smaller than Interaction.mdx; comparable to or slightly larger than the smaller existing foundations.

## Outline new patterns

- Summarize situation: compress a large field of signals into a first-pass overview so the actor can grasp the overall state before inspecting details.
- Guide user's attention: highlight salient regions, anomalies, or cues so important signals stand out against distraction and clutter.
- Extend senses: translate otherwise hidden or imperceptible signals into forms the actor can notice and use.
- Prime for possibilities: prepare the actor to look for particular cues or conditions before scanning begins.

## Cross-references to existing patterns

Each of the five assists should link to existing patterns that relate to it.

## Risks and trade-offs

- *Foundation thinness*. Assistance.mdx may end up shorter than the other foundations because the five assists are conceptually clean and don't need elaborate sub-structure. Mitigation: lean into the cross-references to patterns; the foundation's value is partly as a connecting page, not as a long essay. Length is not the measure of utility.
- *Naming conflict with existing terms*. The library already uses words like "assistance" and "help" in scattered places. Assistance.mdx as a foundation page will sharpen the term — it specifically means "human in the loop, system helps at each cognitive stage." Mitigation: open the page with a clear definition that distinguishes it from casual usage of the word.
- *Risk of becoming a Noessel summary*. The five assists are Noessel's framework; without care, Assistance.mdx could read as a book summary rather than a project-native foundation. Mitigation: write in design-repertoire voice — frame each assist from the human situation inward, not from Noessel's chapter outline. Cite Noessel as the source but make the content the project's own.
- *Reflect being conceptually thinner than the other four*. Noessel adds reflect as a fifth category above the loop, but it's the least developed in the literature and has the fewest exemplar patterns. Mitigation: acknowledge this honestly. Reflect is real and useful, but the section can be shorter than the others without that being a problem.
- *Overlap with Wu/Zhang's six activity types in Agency.mdx*. Agency now houses Wu/Zhang's six activity types as a framework; Assistance houses Noessel's five. The relationship needs to be clear — the same clarification paragraph that's planned for Agency.mdx (in `agency-attentional-coupling.md`) should mirror in Assistance.mdx, naming the two frameworks and explaining what each is for. Wu/Zhang describes *what kind of work is happening*; Noessel describes *where assistance can enter the cognitive loop*. They overlap on perceive but diverge elsewhere.
- *Forward references to Delegation.mdx*. Assistance.mdx will reference Delegation.mdx as its sibling. If Delegation.mdx isn't written first or in parallel, the cross-reference will be dead. Mitigation: draft both foundations together as part of the same writing pass.

## Implementation approach

### Phase 1: read source notes

Re-read the local notes for each assist before drafting:
- `concepts/Perceive.md`, `Know.md`, `Plan.md`, `Perform.md`, `Reflect.md`
- `Designing Assistant Technology/Chapter 4 - The Five Universal Assists.md`
- `Designing Assistant Technology/Chapter 5 - Perceive.md` and the parallel chapter notes for know/plan/perform/reflect

Note the example patterns Noessel uses for each and check whether the project library already has equivalents.

### Phase 2: draft the foundation

Write Assistance.mdx in design-repertoire voice. Do not lead with Noessel's vocabulary — lead with the human situation each assist addresses, then name the assist as the design vocabulary for that situation.

For each of the five assists, write:
- One-sentence definition (relational, not implementation)
- 2–4 sentence elaboration of what the assistance does and why
- A brief paragraph on practical forms (2–4 examples)

### Phase 3: cross-references back from existing patterns

For each pattern that exemplifies an assist, add a cross-reference back to Assistance.mdx noting which assist(s) it exemplifies. This is small surgical edits — one sentence per pattern, in the Related patterns section or the description.

### Phase 4: regenerate graph

Run `npx tsx scripts/extract-graph-data.ts`.

### Phase 5: review

Check that:
- Assistance.mdx reads as a foundation
- Cross-references resolve in both directions
- The relationship to Interaction.mdx and Delegation.mdx is clear in the opening
- The relationship to Agency.mdx (Assistance as a configuration of agency, not a separate quality) is named explicitly

## Files

| Phase | Action | File |
|-------|--------|------|
| 2 | Create | `src/stories/foundations/Assistance.mdx` |
| 3 | Modify | Each of the exemplar pattern files (one-sentence cross-references) |
| 4 | Run | `npx tsx scripts/extract-graph-data.ts` |

## Open questions

- *Where to place Reflect's exemplar patterns when they're activities-level*. Activity log, activity feed, mastery — these are activity-level. Plan/Perform exemplars include action-level patterns. Is the cross-reference list mixing levels a problem? Probably not; Assistance is frame-cutting and patterns at any level can exemplify an assist. Flag for reader judgment when drafting.
- *Should the foundation have its own "When this fails" section?* Other foundations vary on this. Assistance fails when the help is mistimed, miscalibrated, or fixates the user (see also `5-cognitive-forcing-functions.md`). Could be a short section or could fold into the When assistance is the right frame section. Decide during drafting.
- *Whether to link forward to cognitive forcing functions*. CFFs are interventions that *deliberately constrain* assistance to prevent over-reliance. They're the response to a failure mode of the Plan and Perform assists. Linking forward to them from the Assistance foundation makes the connection explicit. Recommendation: yes, link, but briefly.
- *Naming the foundation*. "Assistance" is the working title. Alternatives: "Assistant interaction", "Assisted work", "Help frame". Leaning: "Assistance" — shortest, most direct, parallel to "Delegation" as the sibling.

## References

- Noessel, C. (2024). *Designing Assistant Technology.*
  - Chapter 4 — The Five Universal Assists
  - Chapter 5 — Perceive
  - Chapter 6 — Know
  - Chapter 7 — Plan
  - Chapter 8 — Perform
  - (Reflect is treated across chapters and synthesis material; no single chapter)
- Local concept notes:
  - `concepts/Perceive.md`, `Know.md`, `Plan.md`, `Perform.md`, `Reflect.md`
- Plans this one interacts with:
  - `plans/active/2026-04-interaction-see-think-do-reframe.md` (substrate established here)
  - `plans/active/2026-04-delegation-foundation.md` (sibling foundation)
  - `plans/active/2026-04-agency-attentional-coupling.md` (relationship to coupling and to Wu/Zhang's activity types)
  - `plans/active/2026-04-cognitive-forcing-functions.md` (forward link to interventions on failed assistance)

## Status

Pending — no changes made yet.
