---
title: "Author the missing agentive touchpoint patterns"
status: "active"
kind: "exec-spec"
created: "2026-04"
last_reviewed: "2026-05-01"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Author the missing agentive touchpoint patterns

## Context

[`2-delegation-foundation.md`](./2026-04-delegation-foundation.md) names ~25 touchpoints from Noessel's inventory and maps them to the existing pattern library. The mapping found two kinds of gap:

1. *Genuinely missing patterns* — touchpoints with no library home at all.
2. *Asymmetric patterns* — touchpoints whose only existing home is conversation-scoped (e.g. `operations/conversation/CapabilityAndScope.mdx`) and which need either a generalisation or a paired delegation-mode pattern.

The delegation foundation forward-references these gaps so it can ship without waiting on them. This plan is the follow-up that closes them.

The work splits into three tiers by urgency. Tier 1 covers patterns whose absence is a real hole in the library independent of delegation (Permissions, Launch, Performance notifications, Data portability). Tier 2 covers delegation-specific patterns the foundation will lean on (Test drive, Takeback, Exposed false negatives). Tier 3 covers smaller or more specialised patterns that can wait or stay as concept notes (Practice, Death/succession, agentive-mode disengagement check-ins).

This plan is *not* a rewrite of the existing conversation-scoped patterns. The asymmetric ones get addressed by a lighter intervention: either a section added to the existing pattern that names the agentive-mode counterpart, or — if the divergence is too big — a sibling pattern. That decision is per-pattern and made during drafting.

## What this plan is and isn't

*Is*:
- An enumeration of the missing/asymmetric touchpoint patterns with brief sketches of what each should cover
- A tiered ordering so the most foundational gaps land first
- A scoping decision per pattern (new pattern vs. section added to existing vs. concept note only)

*Is not*:
- A drafting guide for each pattern. Each tier-1 and tier-2 entry deserves its own focused drafting pass; this plan is the inventory and the prioritisation, not the writing.
- A commitment to ship all of these. Some entries (Death, Practice) may stay as concept notes indefinitely if the design literature doesn't yet support a useful pattern page.
- A replacement for the touchpoint inventory section in the delegation foundation. That section names the gaps; this plan closes them.

## Tier 1 — foundational gaps

These patterns are absent from the library and their absence is felt outside delegation as well. Worth authoring as full pattern pages.

### Permissions and authorization
- *Touchpoint stage*: Setup
- *Situation*: the system needs data access or delegated authority and must ask for it in a way that the user can evaluate, scope, and revisit.
- *What the pattern should cover*: granularity of permission requests, just-in-time vs. up-front, scope review and revocation surfaces, the relationship to OS-level permission UIs (which the application can't override), what to do when a permission is denied.
- *Likely location*: `actions/application/Permissions.mdx`
- *Cross-cutting*: relevant to any pattern that touches user data, not just delegation. The library has been getting away without this.

### Launch
- *Touchpoint stage*: Setup
- *Situation*: the agent goes from "configured" to "live" and the human needs to see both that it's running and how to stop it.
- *What the pattern should cover*: the liveness signal (something the user can glance at and trust), the always-available stop control, the moment of transition from setup to running, the relationship to the first notification.
- *Likely location*: `activities/Launch.mdx` or `actions/application/Launch.mdx` — TBD by activity-vs-action call during drafting.

### Performance notifications
- *Touchpoint stage*: Running
- *Situation*: the user needs to know whether the delegated system is *actually* saving them effort or improving outcomes — not just whether it ran.
- *What the pattern should cover*: distinguishing performance from completion (a thing finished vs. a thing was worth doing), aggregation windows, baseline comparison, what to do when the answer is "no, it isn't helping". Sits alongside Notification.mdx but is its own pattern because the framing inverts — it's the system being measured, not the work.
- *Likely location*: `actions/coordination/PerformanceReport.mdx` or as a sibling to Notification.mdx.

### Data portability
- *Touchpoint stage*: Disengagement
- *Situation*: the user is leaving and needs to take their data, history, learned preferences, and trained state with them.
- *What the pattern should cover*: export formats, what counts as the user's data vs. the system's, partial vs. full export, the relationship to graceful shutdown, the honest acknowledgement that "trained state" is rarely portable in practice.
- *Likely location*: `actions/application/DataPortability.mdx`
- *Cross-cutting*: like Permissions, this is foundational beyond delegation.

## Tier 2 — delegation-specific patterns

These patterns are specific enough to delegated relationships that they wouldn't make sense in the library without the delegation foundation. Author after Delegation.mdx ships.

### Test drive
- *Touchpoint stage*: Setup
- *Situation*: the user needs to rehearse what the agent will do *before* committing to real stakes.
- *What the pattern should cover*: time-compression (showing a week of agent behaviour in a minute), exposing the reasons behind actions during the rehearsal, the difference between a simulation and a dry run, what to carry forward from the test drive into live operation.
- *Likely location*: `activities/TestDrive.mdx`
- *Adjacent existing*: `activities/Onboarding.mdx` (different — onboarding is about teaching the user, test drive is about the user evaluating the agent).

### Takeback
- *Touchpoint stage*: Problems
- *Situation*: control returns to the agent after a handoff. The user needs to signal readiness, the agent needs to re-engage gracefully, and trust needs to rebuild.
- *What the pattern should cover*: readiness signalling (how the agent shows it's ready to resume), low-friction agreement (the user shouldn't have to recommit to everything), the trust-rebuilding interaction in the first few minutes after takeback, the failure mode where the user never takes back.
- *Likely location*: `activities/Takeback.mdx` or `actions/application/Takeback.mdx`
- *Adjacent existing*: `concepts/conversational/Intervention.mdx` is a concept note covering the inverse direction (handoff). The pair could become a single pattern covering both directions, or two siblings; decide during drafting.

### Exposed false negatives
- *Touchpoint stage*: Running
- *Situation*: most failures of an agent are invisible because they're things it *didn't* catch. The user can't trust an agent whose misses they can't see.
- *What the pattern should cover*: the reject-review surface (showing the user what was filtered out), whitelisting affordances, the cognitive cost of reviewing rejects (and how to keep it bounded), the relationship to trust validation in the foundation page.
- *Likely location*: `actions/sense-making/RejectReview.mdx` or similar
- *Adjacent existing*: nothing close. This is a genuinely new category for the library.

## Tier 3 — smaller or more specialised

These can stay as concept notes, become brief sections in adjacent patterns, or wait until there's evidence the library needs them. Decide per-pattern; don't force them.

### Practice
- *Touchpoint stage*: Problems
- *Situation*: the user keeps recovery skills fresh enough for takeover to be meaningful.
- *Recommendation*: add a section to `activities/Mastery.mdx` rather than authoring a separate pattern. Mastery already covers skill preservation; the agentive-takeover framing is a sub-case.

### Disengagement check-ins (agentive mode)
- *Touchpoint stage*: Disengagement
- *Recommendation*: extend `operations/conversation/DisengageWithoutClosing.mdx` with an agentive-mode section covering "is this persistent task still worth running?" — the conversational and agentive forms are similar enough to share a pattern, with the asymmetry called out explicitly.

### Graceful shutdown (agentive mode)
- *Touchpoint stage*: Disengagement
- *Recommendation*: same approach as above with `operations/conversation/Closing.mdx`. Add an agentive-mode section rather than a sibling pattern.

### Capabilities and constraints (agentive mode)
- *Touchpoint stage*: Setup
- *Recommendation*: borderline. The conversational `CapabilityAndScope.mdx` covers the "what can you do?" question for chatbots; the delegation case is "what can this background system do, and what won't it do without asking me?" That's a different enough situation that it might want its own pattern. Defer the call until after Delegation.mdx is drafted and the asymmetry is felt concretely.

### Pause and restart (agentive mode)
- *Touchpoint stage*: Running
- *Recommendation*: same as capabilities — the conversational Abort pattern is close but not the same. Defer the call.

### Death / succession
- *Touchpoint stage*: Disengagement
- *Recommendation*: keep as concept note (`concepts/touchpoints/Death.md`). The design literature doesn't yet support a useful pattern page. Honest acknowledgement in the delegation foundation is the appropriate move; a pattern page would be premature.

## Implementation approach

### Sequencing

1. *After Delegation.mdx ships*: author tier-1 patterns (Permissions, Launch, Performance notifications, Data portability). These are independent of each other and can be drafted in any order or in parallel. Each gets its own focused drafting plan if non-trivial.
2. *Concurrent with or after tier 1*: author tier-2 patterns (Test drive, Takeback, Exposed false negatives). These will lean on Delegation.mdx more directly, so drafting them refines the foundation's forward references.
3. *Tier 3*: handled opportunistically. The "add a section to existing pattern" entries can be done as small edits whenever the adjacent pattern is being touched anyway. The deferred-decision entries (Capabilities, Pause/restart) get revisited after a few months of using Delegation.mdx in practice.

### Per-pattern drafting

Each tier-1 and tier-2 pattern follows the standard pattern page conventions for the library. Lead with the human situation, not the implementation. Cross-reference Delegation.mdx (and the relevant lifecycle stage) explicitly. Where the pattern has asymmetric coverage in conversational mode, name the asymmetry rather than pretending the existing coverage doesn't exist.

### Cross-references

Each new pattern needs a cross-reference *from* Delegation.mdx (replacing the "missing" forward reference in the touchpoint inventory) and *to* Delegation.mdx (locating the touchpoint in the lifecycle). The delegation foundation's touchpoint inventory should be updated to flip the "missing" markers as patterns land.

### Graph regeneration

Run `npx tsx scripts/extract-graph-data.ts` after each pattern lands.

## Risks and trade-offs

- *Scope creep*. The list is long. Mitigation: tier 1 is the commitment; everything else is conditional. Don't treat the full list as a single deliverable.
- *Forced uniformity*. Touchpoints differ in how much they deserve a pattern page. Some (Permissions, Launch) want full pages; others (Practice) want a section in an adjacent pattern. Mitigation: respect the tier 3 "section in existing" recommendations rather than authoring stub pattern pages.
- *Conversation/delegation duplication*. If every conversation-scoped pattern gets a delegation-mode sibling, the library doubles in places. Mitigation: prefer adding sections to existing patterns over creating siblings unless the divergence is large enough to justify the split. Decide per-pattern during drafting.
- *Tier-2 dependency on the foundation*. Tier-2 patterns will read awkwardly if drafted before Delegation.mdx exists, because they assume the lifecycle vocabulary. Mitigation: respect the sequencing.
- *Death and succession is undertheorised*. Mitigation: keep it as a concept note. Don't fake a pattern page.

## Files

| Phase | Action | File |
|-------|--------|------|
| 1 | Create | `src/stories/actions/application/Permissions.mdx` |
| 1 | Create | `src/stories/activities/Launch.mdx` (or `actions/application/Launch.mdx`, TBD) |
| 1 | Create | `src/stories/actions/coordination/PerformanceReport.mdx` (or sibling to Notification, TBD) |
| 1 | Create | `src/stories/actions/application/DataPortability.mdx` |
| 2 | Create | `src/stories/activities/TestDrive.mdx` |
| 2 | Create | `src/stories/activities/Takeback.mdx` (or paired with Intervention as Handoff/Takeback) |
| 2 | Create | `src/stories/actions/sense-making/RejectReview.mdx` (name TBD) |
| 3 | Modify | `src/stories/activities/Mastery.mdx` (add practice section) |
| 3 | Modify | `src/stories/operations/conversation/DisengageWithoutClosing.mdx` (add agentive section) |
| 3 | Modify | `src/stories/operations/conversation/Closing.mdx` (add agentive section) |
| 3 | Modify | `src/stories/foundations/Delegation.mdx` (flip "missing" markers as patterns land) |
| each | Run | `npx tsx scripts/extract-graph-data.ts` |

## Open questions

- *Activity vs. action classification*. Several tier-1 and tier-2 entries (Launch, Test drive, Takeback) could plausibly be activities or actions. The call depends on whether the touchpoint is best understood as a sustained mode of work (activity) or a discrete moment (action). Defer per-pattern until drafting.
- *Whether Performance notifications wants its own pattern or a section in Notification*. Notification.mdx already carries six subtypes from the inventory; adding a seventh might overload it. But Performance notifications has a different framing (measuring the system, not reporting work). Recommendation: own pattern, with a cross-reference from Notification. Confirm during drafting.
- *Handoff/Takeback as one pattern or two*. Conceptually paired but the design concerns differ (handoff = surrendering control safely; takeback = re-engaging trust). Recommendation: two patterns linked, but revisit if the second one feels thin.
- *Whether to fold Capabilities-and-constraints into a single pattern across modes*. The conversational and delegation cases have enough overlap that one pattern with two sections might be better than two patterns. Defer until both are felt concretely.
- *Naming for "Exposed false negatives"*. The Noessel phrase is accurate but ugly for a pattern title. Alternatives: "Reject review", "Miss inspection", "Filter audit". Decide during drafting.

## References

- [`2-delegation-foundation.md`](./2026-04-delegation-foundation.md) — the foundation this plan supports
- `concepts/Touchpoints common to agentive systems.md` — canonical inventory
- `concepts/touchpoints/*.md` — per-touchpoint local notes
- Noessel, C. (2017). *Designing Agentive Technology*, chapters 5–8

## Status

Pending — depends on `2-delegation-foundation.md` shipping first.
