---
title: "Reframe Interaction.mdx around see-think-do"
status: "active"
kind: "exec-spec"
created: "2026-04"
last_reviewed: "2026-05-01"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Reframe Interaction.mdx around see-think-do

## Context

`src/stories/foundations/Interaction.mdx` currently presents *intent lifecycle* as the central framework. The lifecycle traces how an actor's engagement with a goal forms, sharpens, commits, and reflects across six stages (trigger → seeking → evaluation → sense-making → application → sharing). The framing is tied tightly to *intent* — to the actor having a goal that the system can help resolve.

The gap became visible while integrating Christopher Noessel's *Designing Agentive Technology* and *Designing Assistant Technology*. Noessel grounds both books in the *see-think-do loop* — the basic cognitive cycle of noticing, interpreting, deciding, acting. From that common substrate, two distinct interaction frames emerge:

- *Assistant mode* — the human runs the loop and the system helps at each stage. Noessel refines see-think-do into *five universal assists* (perceive, know, plan, perform, reflect).
- *Agent mode* — the system runs the loop in the background and the human returns at *touchpoints* (ramp-up, smooth operation, exception handling, handoff, disengagement).

The earlier version of this plan tried to put both of those refinements directly into Interaction.mdx as inline vocabulary and a parallel section. That was a mistake: it would have collapsed Interaction.mdx into "the foundation for AI-mediated work," when its job is to be the frame-agnostic foundation about how interaction structures itself in time and space.

The corrected architecture splits the work across three foundations:

- *Interaction.mdx* — frame-agnostic. Substrate-level. Establishes see-think-do as the underlying cycle and keeps the lifecycle stages as a temporal expression of how engagement unfolds, decoupled from any specific frame.
- *Assistance.mdx* — new sibling foundation. The five universal assists. Refines see-think-do for the assistant frame (human in the loop, system helps at each stage). Plan: `assistance-foundation.md`.
- *Delegation.mdx* — new sibling foundation. The agentive lifecycle and touchpoints. Refines see-think-do for the agent frame (system runs the loop, human re-enters at discrete moments). Plan: `delegation-foundation.md`.

This plan covers only the changes to Interaction.mdx. The two sibling foundations have their own plans.

## What this plan changes in Interaction.mdx

Three things:

1. *Add see-think-do as a substrate section* at the top of the file, naming the underlying cycle that all interaction frames share. This is the only piece of Noessel's vocabulary that belongs in Interaction.mdx, because see-think-do itself is frame-agnostic — cybernetics, Boyd's OODA, Norman's action cycle all sit at this level.
2. *Loosen the intent-centring of the lifecycle stages.* The six stages stay; the framing softens. They become "how engagement unfolds over time," with intent named as one of several motivations rather than as the centring frame. The stage descriptions stay structurally intact.
3. *Add cross-references to Assistance.mdx and Delegation.mdx* as the two frame-specific refinements of the substrate. Brief — one paragraph after the substrate section, naming both foundations and noting that they describe two distributions of the same underlying loop.

What this plan does *not* do:

- *Does not add the five assists vocabulary inline to lifecycle stages.* That was the worst part of the earlier version because it bound Interaction.mdx to the assistant frame. The assists move to Assistance.mdx in their entirety.
- *Does not add an agentive lifecycle section.* That moves to Delegation.mdx in its entirety.
- *Does not rename the page.* "Intent & Interaction" stays as the title and the Meta title for now. The bigger question of whether intent should be the centring frame is real, but a rename has knock-on effects on every cross-reference and is a separate decision.
- *Does not move navigation.* Now that Interaction.mdx is staying smaller, the navigation section can stay where it is. The earlier "extract or stay" question is closed in favour of staying.

## Proposed structure for the revised file

```
# Intent & Interaction

[Opening paragraph, lightly revised to soften intent's centrality and introduce the substrate.]

## See-think-do: the underlying cycle
[New section. ~6–10 sentences. Establishes the substrate. Notes that two refinements live in sibling foundations.]

## How engagement unfolds over time
[Existing intent lifecycle section, retitled and lightly reframed. The six stages stay structurally intact; the prose softens "intent" from sole framing to one motivation among several.]
### Trigger & need recognition
### Seeking & access
### Evaluation & relevance construction
### Sense-making & integration
### Application & behavioural enactment
### Sharing, feedback, & iterative learning

## Activity types and agency
[Existing cross-reference to Wu/Zhang's six activity types in Agency.mdx. No structural change.]

## Navigation
[Existing navigation section. Stays in place. No movement.]

## Resources & references
[Existing references plus Noessel's two books, plus brief lineage references for see-think-do (cybernetics, OODA, Norman).]
```

Net change: one new top-level section (substrate), one section retitled and lightly reframed (lifecycle), no removed sections, no moved sections. The file gets slightly longer but stays coherent and frame-agnostic.

## Layer 1: the substrate section

A new section that establishes see-think-do as the basic interaction cycle: perceive a situation, interpret what it means, decide what to do, act. Two things flow from this substrate:

- *How* each loop phase can be assisted — broadened, split, augmented. This is the work of [Assistance](../?path=/docs/foundations-assistance--docs).
- *Who* runs the loop at any given moment, and what that distribution feels like. This is the work of [Delegation](../?path=/docs/foundations-delegation--docs) and its sibling property in [Agency](../?path=/docs/qualities-agency--docs).

This section should cite Noessel's *Designing Agentive Technology* and *Designing Assistant Technology* as the direct provocation for naming the substrate, and point at the broader see-think-do literature (cybernetics, Boyd's OODA, Norman's action cycle) as older and parallel formulations — without digressing into any of them.

The substrate section is short by design. Its job is to name the underlying cycle and hand off to the two sibling foundations, not to elaborate either of them.

## Layer 2: loosening the intent-centring of the lifecycle

The existing six stages stay structurally intact. Each stage's prose gets a small, targeted edit to:

- Name the stage in terms of *what kind of work the actor is doing*, not what state the actor's intent is in.
- Replace "intent emerges/decomposes/sharpens/integrates/commits/reflects" with descriptions of the work itself (recognition, retrieval, evaluation, synthesis, enactment, reflection).
- Retain the existing pattern cross-references and the existing prose about what kinds of patterns help at each stage.

The section's heading changes from "Intent lifecycle" to something less intent-centric — candidates: *How engagement unfolds over time*, *Stages of engagement*, *The arc of working through something*. Final wording can be decided during drafting.

What stays:
- The six stages and their order
- The existing pattern cross-references
- The existing prose about what each stage feels like and which patterns serve it

What changes:
- The framing language that puts intent at the centre
- The section heading

This is the smallest possible edit to address the user's concern that intent is tied to specific frames. It doesn't remove intent; it removes intent's *exclusivity* as the framing.

## Cross-references to the two sibling foundations

After the substrate section, a brief paragraph naming Assistance.mdx and Delegation.mdx as the two frame-specific refinements. Something like:

> The substrate cycle expresses itself differently depending on who runs the loop at any given moment. When the human stays in the loop and the system helps at each stage, the relevant framing is [Assistance](../?path=/docs/foundations-assistance--docs) — the kinds of help a system can offer at each phase of the user's cognitive loop. When the system runs the loop in the background and the human returns only at discrete moments, the relevant framing is [Delegation](../?path=/docs/foundations-delegation--docs) — the lifecycle and touchpoints of agentive systems. Both refine the same substrate, with different distributions of attention.

This is the only place in Interaction.mdx where Assistance and Delegation are named. Their content lives entirely in their own foundation pages.

## What changes for existing patterns

Almost nothing through this plan. Cross-references from existing patterns to Interaction.mdx still resolve (Meta title is unchanged). The main downstream effects come from the sibling-foundation plans, not from this one:

- *Patterns that exemplify one of the five assists* will be cross-referenced from Assistance.mdx, not from Interaction.mdx. That's covered by `assistance-foundation.md`.
- *Patterns that exemplify delegated-mode touchpoints* will be cross-referenced from Delegation.mdx. Covered by `delegation-foundation.md`.
- *Patterns at specific lifecycle stages* keep their existing cross-references to Interaction.mdx without change.

## Risks and trade-offs

- *Loosening intent without removing it*. The half-step framing — keeping the "Intent & Interaction" title while softening intent in the prose — risks reading inconsistent: a foundation page named after intent that downplays intent in its content. Mitigation: name the tension explicitly in the open question section below; flag a future rename as a possible follow-up if the half-step feels unstable.
- *Three foundations covering closely-related ground*. With Interaction, Assistance, and Delegation all naming see-think-do, readers may be unsure which to read when. Mitigation: each foundation's opening paragraph should explicitly say what it does *not* cover and point at the sibling. Interaction is the substrate; Assistance is for the assistant frame; Delegation is for the agent frame. The cross-references should be load-bearing.
- *The substrate section being too short to feel useful*. If see-think-do is just a name dropped at the top of Interaction.mdx with no elaboration, readers may bounce off it. Mitigation: the substrate section must include enough concrete detail (one sentence per phase, one example) to land as a real concept, even though it then hands off to siblings.
- *Heading rename for the lifecycle section*. "Intent lifecycle" is currently used by other pattern pages and possibly by anchor links. A heading rename will break some inbound links. Mitigation: search the codebase for `#intent-lifecycle` anchor references before renaming, and either preserve the anchor with a comment or update the inbound references in the same pass.

## Implementation approach

### Phase 1: substrate section

Write the new "See-think-do: the underlying cycle" section. Place it after the opening paragraph. ~6–10 sentences plus the cross-reference paragraph to Assistance and Delegation.

Review check: does the substrate section stand on its own without the sibling foundations existing yet? If not, write the sibling foundations first (or in parallel).

### Phase 2: loosen the lifecycle prose

For each of the six stages, edit the framing language to remove "intent X-es" and replace with descriptions of the work itself. Rename the section heading.

Review check: does each stage still feel coherent? Are pattern cross-references still accurate?

### Phase 3: cross-reference audit

Search for inbound links to Interaction.mdx anchors that may have been affected by the heading rename. Update or preserve as needed.

### Phase 4: regenerate graph

Run `npx tsx scripts/extract-graph-data.ts` to pick up any changed cross-references.

## Files

| Phase | Action | File |
|-------|--------|------|
| 1 | Modify | `src/stories/foundations/Interaction.mdx` (add substrate section + sibling cross-refs) |
| 2 | Modify | `src/stories/foundations/Interaction.mdx` (loosen lifecycle prose, rename heading) |
| 3 | Audit | Inbound anchor links across the codebase |
| 4 | Run | `npx tsx scripts/extract-graph-data.ts` |

## Open questions

- *Should "Intent & Interaction" be renamed?* The half-step (loosen the prose, keep the title) is the smallest viable move. A full rename to something like "Interaction" or "Engagement" would be more honest about the new framing but creates broader churn. Leaning: half-step now, revisit after the three foundations have settled in.
- *What replaces "Intent lifecycle" as the section heading?* Candidates: *How engagement unfolds over time*, *Stages of engagement*, *The arc of working through something*. Decide during drafting.
- *Substrate section length*. ~6–10 sentences feels right but could be 4–5 if it's tight enough. Decide during drafting.
- *Order of execution across the three foundations*. Interaction.mdx can be edited first (independent), or all three can be drafted together so the cross-references resolve. Leaning: draft Assistance and Delegation first as new files (no existing dependencies), then edit Interaction.mdx with live cross-references to point at.

## References

- Noessel, C. (2024). *Designing Assistant Technology.* Chapter 4 — The Five Universal Assists.
- Noessel, C. (2017). *Designing Agentive Technology.*
- Boyd, J. (1976). *Destruction and Creation.* (OODA loop.)
- Norman, D. (1988). *The Design of Everyday Things.* (Action cycle.)
- Plans this one interacts with:
  - `plans/active/2026-04-assistance-foundation.md`
  - `plans/active/2026-04-delegation-foundation.md`
  - `plans/active/2026-04-agency-attentional-coupling.md`
  - `plans/active/2026-04-cognitive-forcing-functions.md`

## Status

Pending — no changes made yet.
