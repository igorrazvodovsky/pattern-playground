# Create Delegation.mdx as a foundation

## Context

Christopher Noessel's *Designing Agentive Technology* describes a relationship structure that the pattern library currently has no consolidated home for: *delegation*. In delegation, the human offloads sustained work to a system, the system runs in the background, and the human re-enters at discrete moments rather than attending continuously. This is the relationship structure that agentive systems — investment robo-advisors, smart thermostats, scheduling agents, recommendation engines that act on your behalf — depend on.

The library has scattered pieces of this concept. Bot.mdx names "ambient" mode and lists workflow automation and full-autonomy bots. Agency.mdx is being edited (in `agency-attentional-coupling.md`) to add coupling as a fourth distribution dimension. Activities like Activity log and Notification touch the supervisory side. But the library has no foundation that *names delegation as its own relationship structure* and organises the patterns around it.

The earlier integration plan tried to put the delegated-mode material into Interaction.mdx as a parallel section. That was wrong: the agentive lifecycle is its own coherent framework, large enough and distinct enough to deserve its own foundation. The corrected architecture creates Delegation.mdx as a sibling to Interaction.mdx (the substrate) and Assistance.mdx (the assistant-mode counterpart). Three foundations, one substrate, two refinements.

This plan parallels [`assistance-foundation.md`](./assistance-foundation.md) for the assistant-mode counterpart and depends on [`interaction-see-think-do-reframe.md`](./interaction-see-think-do-reframe.md) for the substrate vocabulary it builds on.

## What Delegation.mdx is and isn't

*Is*:
- A foundation page about delegation as a relationship structure
- A frame-specific refinement of the see-think-do substrate, where the system runs the loop in the background and the human re-enters at touchpoints
- A home for the agentive lifecycle (ramp-up → smooth operation → exception handling → handoff & takeback → disengagement) and the touchpoint inventory
- The conceptual anchor for trust-as-through-line in agentive systems

*Is not*:
- A pattern catalogue. Touchpoints get named here but the pattern pages for them are a follow-up, not part of this plan.
- A theory of autonomous agents or the AI safety literature. Delegation is a *design relationship*, not an account of agent capability.
- A substitute for Bot.mdx. Bot is the activity-level pattern category for AI-mediated interaction; Delegation is the foundation that names the relationship structure some bots embody.
- An advocacy piece. Delegation is one frame; assistance is another. The page should be even-handed about when delegation is appropriate and when it isn't.

## Proposed structure

```
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Foundations/Delegation" />

> [Fun meter]

# Delegation

[One-sentence relational definition: Delegation is the relationship structure where the human offloads sustained work to a system, the system runs the see-think-do loop in the background, and the human re-enters at discrete moments rather than attending continuously.]

## See-think-do, redistributed

[~6–10 sentences. Picks up the substrate from Interaction.mdx. Names the move: in delegation, the system runs the loop autonomously and the human's role becomes supervisory. The same see-think-do phases happen — the system is "perceiving" (monitoring), "thinking" (interpreting and choosing), and "doing" (acting) — but the human is not continuously attending. The human re-enters at touchpoints. Cross-references the sibling foundation Assistance.mdx for what happens when the human stays in the loop.]

## The agentive lifecycle

[Brief intro: ~2–4 sentences. The lifecycle is the temporal arc of the delegation relationship from first use through disengagement. Five stages, each with characteristic concerns and touchpoints.]

### Ramp-up
[The period where the human is establishing what the system can and can't do, articulating goals and preferences, and beginning to build trust. Touchpoints: goals and preferences, capabilities and constraints, tuning triggers. Cross-reference exemplar patterns.]

### Smooth operation
[The system runs in the background; the human's role is periodic supervision. Touchpoints: problem notifications, completion notifications, suggestion notifications, activity log, a hood to look under. Cross-reference exemplar patterns.]

### Exception handling
[When the system hits something it can't handle, it must return the human to the loop without losing context. Touchpoints: problem notifications with actionable context, rollback affordances, escalation paths. Cross-reference exemplar patterns.]

### Handoff and takeback
[Authority transfers in either direction — the system hands back because it can't proceed, the human takes back to intervene. Touchpoints: simple manipulations, tuning behaviors. Cross-reference.]

### Disengagement
[The human stops using the system entirely, deliberately or by neglect. Touchpoints: graceful shutdown, data portability. Cross-reference.]

## Touchpoints

[~1 paragraph framing: touchpoints are the discrete moments at which the human re-enters a delegated relationship. Noessel inventories about 14 of them across the lifecycle. Below is a brief listing grouped by lifecycle stage. Each touchpoint is named here; full pattern pages for them are a follow-up.]

[Listing: 14 touchpoints organised by lifecycle stage. Each one-line: name + one-sentence purpose. Cross-references to existing pattern pages where they exist.]

## Trust as the through-line

[~2 paragraphs. Trust is the design through-line of delegated relationships. It gets *established* during ramp-up (the human is figuring out whether the system is competent and aligned). It gets *validated* during smooth operation (every successful run is a tiny piece of evidence). It gets *repaired* during exception handling (how the system fails determines whether trust survives). It gets *transferred* during handoff (each transfer is a re-negotiation of who's responsible). It gets *withdrawn* during disengagement (often quietly, without explicit termination). Cross-reference appropriate reliance in Agency.mdx — appropriate reliance is the calibrated middle that delegation needs to land in.]

## When delegation is the right frame

[~2 paragraphs. Names the conditions under which delegation — the system running the loop in the background — is the appropriate design choice rather than assistance. Conditions where delegation works: well-bounded problems, stable goals, low-stakes individual decisions or aggregated decisions where the average matters more than the individual case, contexts where continuous human attention is impractical or costly. Conditions where delegation fails: high-stakes individual decisions, novel or contested goals, contexts where the human needs to maintain skill, contexts where accountability cannot be transferred. Cross-reference coupling in Agency.mdx.]

## Relationship to other parts of the design system

[Brief notes — sentence each, prose paragraph not bullets.]
- Interaction (substrate)
- Assistance (sibling — assistant-mode counterpart)
- Agency (Delegation is a configuration of agency where coupling is loose)
- Bot (the activity-level pattern category that often embodies delegation)
- Activity log, Notification (action-level patterns that exemplify supervisory touchpoints)

## Resources & references
[Noessel + agentive systems literature.]
```

Total length target: 200–300 lines of MDX. Larger than Assistance.mdx because the agentive lifecycle has more internal structure (five stages, ~14 touchpoints) than the five assists.

## Touchpoint inventory

Drawn from `concepts/Touchpoints common to agentive systems.md`. The canonical source organises touchpoints into Noessel's four clusters (Setup / Running / Problems / Disengagement), which is *not* the same axis as the five-stage agentive lifecycle the foundation page uses. The lifecycle is a temporal arc from first use to disengagement; the touchpoint clusters group by the situation the touchpoint addresses. Most touchpoints sit cleanly under one cluster, but a few (Tuning tools, Notifications) recur across stages — keep that recurrence visible rather than forcing each touchpoint into a single home. The foundation page should name both axes and explain that they're parallel views of the same material.

The "Existing pattern" column records whether the library already has a home for the touchpoint (good / partial / missing). See [`6-agentive-touchpoint-patterns.md`](./6-agentive-touchpoint-patterns.md) for the follow-up plan that closes the missing-pattern gaps.

### Setup touchpoints
- *Capabilities and constraints* — the user learns what the agent can and can't do, so trust begins with bounded scope rather than vague intelligence theatre. Existing pattern: partial (`operations/conversation/CapabilityAndScope.mdx`, conversational only).
- *Goals and preferences* — the agent learns what outcome the user wants and how it should be shaped. Existing pattern: partial (`actions/application/Settings.mdx`).
- *Permissions and authorization* — the system requests data access and delegated authority it needs to act on the user's behalf. Existing pattern: missing.
- *Test drive* — the user rehearses the agent's likely behaviour before real stakes begin. Existing pattern: missing.
- *Tuning tools (setup-time role)* — the user inspects or edits the rules that govern when the agent acts. Existing pattern: good (`activities/AITuning.mdx`).
- *Launch* — the system goes live and must show both liveness and a retained stop control. Existing pattern: missing.
- *Distributed customization* — lower-priority setup work is deferred into early use rather than front-loaded. Existing pattern: partial (`activities/Onboarding.mdx`).

### Running touchpoints
- *Pause and restart* — the user temporarily suspends the agent or resumes it when conditions change. Existing pattern: partial (`operations/conversation/Abort.mdx`, conversation-scoped).
- *Monitoring* — the user checks status, trends, and next triggers without constant babysitting. Existing pattern: good (`activities/ActivityFeed.mdx`, `actions/sense-making/Dashboard.mdx`).
- *Routine notifications* — periodic contact that keeps the agent legible while it works out of sight. Existing pattern: good (`actions/coordination/Notification.mdx`).
- *Suggestion notifications* — the agent surfaces opportunities it believes will help. Existing pattern: good (`actions/application/Suggestion.mdx`, `NextBestAction.mdx`).
- *Performance notifications* — the system reports whether it is actually saving effort or improving outcomes. Existing pattern: missing.
- *Completion notifications* — the agent quietly confirms a task finished and value was delivered. Existing pattern: partial (sub-mode of Notification.mdx, not its own pattern).
- *Exposed false negatives* — the system reveals near-misses or rejects so the user can inspect what the agent failed to catch. Existing pattern: missing.
- *Play alongside* — the user works beside the agent to compare results, preserve skill, or demonstrate nuance. Existing pattern: partial (`activities/Mastery.mdx`).
- *A hood to look under* — the affordance to inspect the system's current state and reasoning. Existing pattern: good (`activities/TransparentReasoning.mdx`, `ActivityLog.mdx`).

### Problems touchpoints
- *Resource notifications* — the agent warns early when it is running low on something it needs. Existing pattern: partial (sub-mode of Notification.mdx).
- *Concern notifications* — the system reports troubling trends before they become full failures. Existing pattern: partial (sub-mode of Notification.mdx).
- *Problem notifications (actionable)* — the agent signals that a real issue now needs intervention or escalation, with enough context for the human to decide. Existing pattern: partial (sub-mode of Notification.mdx).
- *Simple manipulations* — direct mid-stream controls so the user can correct an autonomous system without taking over wholesale. Existing pattern: partial (`actions/coordination/ActionBar.mdx`, `Selection.mdx`).
- *Tuning tools (repair-time role)* — the user repairs triggers, behaviours, or methods when the agent misfires. Existing pattern: good (`activities/AITuning.mdx`, second lifecycle role).
- *Handoff* — control temporarily shifts away from the agent because it cannot safely continue. Existing pattern: partial (`concepts/conversational/Intervention.mdx` is a concept note, not a pattern).
- *Takeback* — control returns to the agent once stability is restored, with readiness signalling and low-friction re-engagement. Existing pattern: missing.
- *Practice* — the user keeps recovery skills fresh enough for takeover to be meaningful. Existing pattern: missing (adjacent to Mastery but distinct).
- *Rollback affordances* — undoing recent agent actions when they were wrong. Existing pattern: good (`operations/Undo.mdx`).

### Disengagement touchpoints
- *Disengagement check-ins* — the agent checks whether a persistent task is still worth continuing. Existing pattern: partial (`operations/conversation/DisengageWithoutClosing.mdx`, conversation-scoped).
- *Graceful shutdown* — how a human turns the system off without losing context. Existing pattern: partial (`operations/conversation/Closing.mdx`, conversation-scoped).
- *Data portability* — what the human takes with them when they leave. Existing pattern: missing.
- *Death / succession* — in higher-stakes domains, the system shifts from ordinary service to successor or estate handling when the user dies. Existing pattern: missing (undertheorised everywhere; honest acknowledgement is the move).

The inventory may shift during drafting if the source notes have been updated, but the four-cluster structure and the recurrence of Tuning tools / Notifications across stages should be preserved.

## Risks and trade-offs

- *Touchpoints without pattern pages*. The plan names ~14 touchpoints but doesn't create pattern pages for any of them. The cross-references will mostly point at the local notes (`concepts/touchpoints/*.md`) rather than at Storybook pages. Mitigation: be explicit about this in the foundation page — "these touchpoints are named here as the vocabulary of delegated interaction; pattern pages are a follow-up." Forward references to non-existent patterns are acceptable as long as they're flagged.
- *Risk of becoming a Noessel summary*. Same risk as Assistance.mdx. Mitigation: design-repertoire voice. Frame each lifecycle stage from the human situation inward.
- *Distinguishing Delegation from Bot*. There's overlap. Bot is the activity-level pattern category for AI-mediated interaction; Delegation is the foundation that names the relationship structure that some (but not all) bots embody. Chatbots are not delegated — they're assisted. Workflow-automation bots are delegated. Mitigation: a clear paragraph in the foundation page distinguishing the two, and a corresponding cross-reference back from Bot.mdx noting that some bots embody delegation.
- *Trust as through-line vs trust as everything*. The trust-arc framing is powerful but risks subsuming everything else into a trust narrative. Mitigation: trust is *one* design through-line. The lifecycle stages have other concerns too (capability discovery in ramp-up, error containment in exception handling, etc.). Don't let trust eat the structure.
- *Forward references to Assistance.mdx*. Same as the parallel risk in `assistance-foundation.md`. Mitigation: draft both sibling foundations together.
- *Disengagement is often invisible*. Real-world delegation often ends through neglect rather than explicit termination, and the design literature undersupplies this stage. Mitigation: write the section honestly, including the observation that disengagement is undertheorised. Don't fake completeness.
- *Page length*. With five lifecycle stages plus ~14 touchpoints plus the trust section plus the framing material, Delegation.mdx is at risk of being too long. Mitigation: keep each stage description tight (3–6 sentences); use the touchpoint inventory as a list rather than expanding each one; let the reader navigate by structure rather than reading every paragraph.

## Implementation approach

### Phase 1: read source notes

Re-read the local notes for each lifecycle stage and each touchpoint:
- `concepts/Agentive lifecycle.md`
- `concepts/Ramp-up.md`, `Smooth operation.md`, `Exception handling.md`, `Handoff and takeback.md`, `Disengagement.md`
- `concepts/Touchpoints common to agentive systems.md`
- `concepts/touchpoints/A hood to look under.md`, `Goals and preferences.md`, `Tuning triggers.md`, `Problem notifications.md`, `Capabilities and constraints.md` (and any others present)
- The Designing Agentive Technology chapter notes for each lifecycle stage

Confirm the touchpoint inventory and check whether the project library already has equivalents for any of them (likely: Notification covers some forms of problem notifications; Activity log covers the supervisory record).

### Phase 2: draft the foundation

Write Delegation.mdx in design-repertoire voice. Lead each lifecycle stage with the situation it addresses (e.g., "the moment when the human first hands work to the system and doesn't yet know whether it will hold up") rather than with Noessel's stage name.

For each lifecycle stage, write:
- One-sentence definition of what's happening at that stage
- 3–6 sentence elaboration of the design concerns the stage raises
- Touchpoint listing (named, with one-sentence purpose each)
- Cross-references to existing exemplar patterns

For the touchpoint inventory section, write a brief framing paragraph and then list all ~14 touchpoints grouped by stage. One line each.

For the trust section, write 2 paragraphs covering establishment, validation, repair, transfer, withdrawal. Cross-reference appropriate reliance in Agency.mdx.

For the "when delegation is the right frame" section, write 2 paragraphs covering when it works and when it fails.

### Phase 3: cross-references back from existing patterns

For each existing pattern that exemplifies a touchpoint, add a one-sentence cross-reference back to Delegation.mdx noting which touchpoint role it serves and which lifecycle stage the touchpoint sits in.

Patterns to update (drafted from the touchpoint inventory; confirm during writing):
- `actions/coordination/Notification.mdx` — routine, completion, suggestion, resource, concern, and problem notification modes (delegation gives Notification its richest set of subtypes)
- `activities/ActivityLog.mdx` — supervisory record / a hood to look under
- `activities/ActivityFeed.mdx` — monitoring touchpoint
- `activities/TransparentReasoning.mdx` — a hood to look under
- `activities/Bot.mdx` — distinction between assisted and delegated bot modes
- `activities/AITuning.mdx` — tuning tools (recurs across setup and problem stages)
- `activities/Onboarding.mdx` — distributed customization
- `activities/Mastery.mdx` — play alongside (with note that the practice touchpoint is adjacent but distinct)
- `actions/application/Settings.mdx` — goals and preferences
- `actions/application/Suggestion.mdx` — suggestion notifications
- `actions/application/NextBestAction.mdx` — suggestion notifications
- `actions/sense-making/Dashboard.mdx` — monitoring touchpoint
- `actions/coordination/ActionBar.mdx` — simple manipulations
- `actions/coordination/Selection.mdx` — simple manipulations
- `operations/Undo.mdx` — rollback affordances (the agentive framing: undoing actions you didn't take)
- `operations/conversation/CapabilityAndScope.mdx` — capabilities and constraints (note: currently conversation-scoped; flag the asymmetry)
- `operations/conversation/Abort.mdx` — pause and restart (same asymmetry)
- `operations/conversation/DisengageWithoutClosing.mdx` — disengagement check-ins (same asymmetry)
- `operations/conversation/Closing.mdx` — graceful shutdown (same asymmetry)

The "conversation-scoped, needs an agentive counterpart" patterns are flagged in the follow-up plan ([`6-agentive-touchpoint-patterns.md`](./6-agentive-touchpoint-patterns.md)) as candidates for either generalisation or paired delegation-mode patterns.

### Phase 4: regenerate graph

Run `npx tsx scripts/extract-graph-data.ts`.

### Phase 5: review

Check that:
- Delegation.mdx reads as a foundation, not a Noessel summary
- The lifecycle stages each carry their own design concerns
- The touchpoint inventory is complete (or honestly flagged as the current best inventory)
- The trust through-line is named without subsuming everything
- Cross-references resolve in both directions
- The relationship to Interaction.mdx, Assistance.mdx, Agency.mdx, and Bot.mdx is each named explicitly

## Files

| Phase | Action | File |
|-------|--------|------|
| 2 | Create | `src/stories/foundations/Delegation.mdx` |
| 3 | Modify | `src/stories/actions/coordination/Notification.mdx` (six notification subtypes cross-referenced) |
| 3 | Modify | `src/stories/activities/ActivityLog.mdx` (supervisory record / hood) |
| 3 | Modify | `src/stories/activities/ActivityFeed.mdx` (monitoring) |
| 3 | Modify | `src/stories/activities/TransparentReasoning.mdx` (hood to look under) |
| 3 | Modify | `src/stories/activities/Bot.mdx` (assisted vs delegated distinction) |
| 3 | Modify | `src/stories/activities/AITuning.mdx` (tuning tools, recurring touchpoint) |
| 3 | Modify | `src/stories/activities/Onboarding.mdx` (distributed customization) |
| 3 | Modify | `src/stories/activities/Mastery.mdx` (play alongside) |
| 3 | Modify | `src/stories/actions/application/Settings.mdx` (goals & preferences) |
| 3 | Modify | `src/stories/actions/application/Suggestion.mdx` (suggestion notifications) |
| 3 | Modify | `src/stories/actions/application/NextBestAction.mdx` (suggestion notifications) |
| 3 | Modify | `src/stories/actions/sense-making/Dashboard.mdx` (monitoring) |
| 3 | Modify | `src/stories/actions/coordination/ActionBar.mdx` (simple manipulations) |
| 3 | Modify | `src/stories/actions/coordination/Selection.mdx` (simple manipulations) |
| 3 | Modify | `src/stories/operations/Undo.mdx` (rollback affordances) |
| 3 | Modify | `src/stories/operations/conversation/CapabilityAndScope.mdx` (capabilities and constraints, asymmetry flag) |
| 3 | Modify | `src/stories/operations/conversation/Abort.mdx` (pause/restart, asymmetry flag) |
| 3 | Modify | `src/stories/operations/conversation/DisengageWithoutClosing.mdx` (disengagement check-ins, asymmetry flag) |
| 3 | Modify | `src/stories/operations/conversation/Closing.mdx` (graceful shutdown, asymmetry flag) |
| 4 | Run | `npx tsx scripts/extract-graph-data.ts` |

## Open questions

- *Touchpoint count and grouping*. The inventory now lists ~25 touchpoints across Noessel's four clusters (Setup / Running / Problems / Disengagement), confirmed against `concepts/Touchpoints common to agentive systems.md`. The clusters are *not* the same axis as the five-stage agentive lifecycle the foundation page uses; the page should name both axes and treat them as parallel views. Tuning tools and Notifications recur across stages and the recurrence should stay visible.
- *Should the foundation include a section on when delegation fails?* Parallel to the question for Assistance.mdx. Recommendation: yes, but fold it into "When delegation is the right frame" rather than making it a separate section.
- *Whether to link forward to specific touchpoint pattern pages*. Most don't exist yet. The cross-references can point at the local notes for now and switch to pattern pages when those are written. Acceptable forward debt.
- *Naming the foundation*. "Delegation" is the working title. Alternatives: "Delegated work", "Agent interaction", "Background work". Leaning: "Delegation" — shortest, most direct, parallel to "Assistance" as the sibling.
- *Whether to include a brief case study*. Investment robo-advisors are a clean example of full delegation. Smart thermostats are a partial example. Including one short case study (~1 paragraph) might ground the abstract framework. Optional; decide during drafting.

## References

- Noessel, C. (2017). *Designing Agentive Technology.*
  - Chapters 5–8 covering the lifecycle and touchpoints
- Local concept notes:
  - `concepts/Agentive lifecycle.md`
  - `concepts/Ramp-up.md`, `Smooth operation.md`, `Exception handling.md`, `Handoff and takeback.md`, `Disengagement.md`
  - `concepts/Touchpoints common to agentive systems.md`
  - `concepts/touchpoints/*.md`
- Plans this one interacts with:
  - `plans/2026/april/interaction-see-think-do-reframe.md` (substrate established here)
  - `plans/2026/april/assistance-foundation.md` (sibling foundation)
  - `plans/2026/april/agency-attentional-coupling.md` (relationship to coupling, trust, appropriate reliance)

## Status

Pending — no changes made yet.
