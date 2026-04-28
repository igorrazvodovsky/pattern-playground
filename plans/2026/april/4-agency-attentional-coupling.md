# Add attentional coupling and appropriate reliance to Agency.mdx

## Context

`src/stories/qualities/Agency.mdx` currently describes agency distribution along three dimensions (locus, dynamics, granularity) and a five-level spectrum (passive → co-operative). It also contains Wu/Zhang's six activity types (perceive / think / express / collaborate / build / test) as a cross-cutting note.

Reading Christopher Noessel's *Designing Agentive Technology* and *Designing Assistant Technology* alongside the current Agency.mdx surfaces two gaps:

1. *Attentional coupling is missing as a dimension.* The current three dimensions describe *where* control sits (locus), *when* it shifts (dynamics), and *at what grain* it operates (granularity). They don't describe how tightly the human stays in the loop while the system acts. This is precisely the dimension that distinguishes Noessel's two books: assistant mode is tight-coupling (the human attends continuously while the system helps at each stage), agent mode is loose-coupling (the system acts in the background and the human returns at discrete touchpoints). Both exist on the same spectrum and the same system can move between them, but the current Agency.mdx has no vocabulary for this.

2. *Appropriate reliance has no home.* The existing "Balancing system and user agency" section gestures at the problem — it mentions delegation-vs-control, preserving expertise, cognitive engagement paradox — but doesn't name *appropriate reliance* as the emergent outcome multiple qualities are jointly trying to produce. Appropriate reliance is the space between blind rejection and blind trust: a user who accepts system suggestions when they're right and overrides them when they're wrong. It emerges from the interaction of agency, transparency, learnability, temporality, and the system's calibration — no single quality owns it, but agency is the closest natural anchor because reliance is fundamentally a question about distribution of decision-making.

The two gaps are related. Attentional coupling affects reliance calibration: looser coupling means fewer opportunities for the user to catch errors, so loose-coupled systems need stronger pre-commitment safeguards. Tight-coupled systems can rely on live correction.

## What this plan does not do

- *Does not touch Wu/Zhang's six activity types.* They describe distribution of work across a task and have a different job from Noessel's five assists (which describe stages of the cognitive loop). The two are related but serve different purposes; merging them would cost more clarity than it would gain.
- *Does not restructure the existing locus/dynamics/granularity section.* The three dimensions stay as they are. Attentional coupling is added as a fourth dimension.
- *Does not create new qualities.* Appropriate reliance becomes a section within Agency.mdx, not its own quality page.
- *Does not rewrite the spectrum section.* The five-level passive → co-operative spectrum describes *how much* the system acts. Attentional coupling describes *how tightly the human attends while it acts*. These are independent axes and both stay.

## Proposed additions

### Addition 1: Attentional coupling as a fourth distribution dimension

Add a fourth sub-section under `## Distribution`, after Granularity:

```
### Coupling

How tightly the human stays in the loop while the system acts:
- Tight coupling: the human attends continuously; the system helps at each step. Work proceeds as a conversation, with many opportunities for live correction. Associated with assistant-mode interaction.
- Loose coupling: the human disengages while the system works; attention returns at discrete touchpoints (ramp-up, problem notifications, completion cues, handoff). Work proceeds as delegation, with correction happening at reentry rather than continuously. Associated with agent-mode interaction.
- Variable coupling: coupling shifts based on the situation. The same system may run loose-coupled during smooth operation and switch to tight-coupled when something needs judgment.
```

Plus a short explanatory paragraph tying this to the attended/delegated distinction in `Interaction.mdx`:

> Coupling is the dimension along which Noessel's two modes of AI interaction diverge. *Designing Assistant Technology* describes tight-coupled work, where assistance enters the user's cognitive loop at each stage. *Designing Agentive Technology* describes loose-coupled work, where the system runs the loop in the background and the user re-enters at touchpoints. See the attended and delegated expressions in [Intent & Interaction](../?path=/docs/foundations-intent-interaction--docs) for how coupling shapes the temporal flow of each.

This lands the concept, names the two books, and cross-references the Interaction.mdx reframe without duplicating its content.

### Addition 2: Appropriate reliance as an outcome section

Add a new top-level section, placed after `## Control patterns` and before `## Relationships to different levels of design system` (or after Balancing — the exact position is a judgment call, but thematically it bridges controls-in-practice with balance-as-goal).

```
## Appropriate reliance

Appropriate reliance is the calibrated middle between rejecting useful system help and deferring to system output that's wrong. A user exhibits appropriate reliance when they accept system suggestions that are correct and override them when they're not. It is not a single quality; it emerges from the interaction of several.

- *Agency distribution* determines whether the user *can* override. No override, no reliance calibration.
- *Transparency* determines whether the user *knows* whether to override — whether the system is making its reasoning, confidence, and uncertainty legible.
- *Temporality* determines whether the user has *time* to override. Systems that commit too fast remove the opportunity.
- *Learnability* determines whether the user can tell right from wrong in the domain at all. Without competence, reliance defaults to trust-by-necessity.
- *Coupling* (see above) determines *when* the override opportunities occur. Tight coupling offers live correction; loose coupling requires pre-commitment safeguards or post-hoc review.

When reliance calibration fails, it fails in two directions. *Under-reliance* means rejecting useful assistance — the user ignores correct suggestions, often because they don't trust the system or find its output costly to verify. *Over-reliance* means accepting incorrect assistance — the user rubber-stamps output without catching errors, a failure mode that's especially dangerous when the system is confident but wrong. Over-reliance is the harder failure because users often can't tell they're doing it. See [cognitive forcing functions](../?path=/docs/actions-application-cognitive-forcing-functions--docs) for patterns that deliberately create friction to prevent over-reliance.

Appropriate reliance is not itself a pattern; it is the effect patterns at multiple levels try to produce jointly. Design for it by thinking about which qualities dominate the current interaction and where the reliance failure modes are most likely to bite.
```

The cross-reference to `cognitive forcing functions` is a forward reference to the pattern family created in `plans/2026/april/cognitive-forcing-functions.md`. It's explicit here because that's the natural upstream anchor for those patterns.

### Addition 3: Note on Wu/Zhang vs Noessel in the activity types section

Add one short paragraph to the existing `## Agency across activity types and intent resolution` section, clarifying the relationship between the six activity types (already documented) and Noessel's five universal assists (introduced in the revised Interaction.mdx):

> The six activity types above describe *what kind of work is happening* in human-AI co-creation. They're close but not identical to the five universal assists (perceive, know, plan, perform, reflect) introduced in [Intent & Interaction](../?path=/docs/foundations-intent-interaction--docs). The assists describe stages of the cognitive loop a system can help with; the activity types describe the work itself. They overlap on "perceive" but diverge elsewhere: Wu/Zhang's "express," "build," and "test" decompose Noessel's "perform," and Wu/Zhang's "collaborate" captures a coordination dimension that the individual cognitive loop of the five assists doesn't address. Use the assists when reasoning about *where assistance can enter*; use the activity types when reasoning about *how work divides between human and system across a task*.

This closes the loop for readers who see both frameworks and want to know why both exist.

## What gets removed or changed

Nothing is removed. Two small tweaks to existing text:

1. The "Balancing system and user agency" bullet list already mentions "Delegation vs control" and "Preserving expertise." These bullets stay, but the newly-added *Appropriate reliance* section makes them more coherent as parts of a named concept rather than scattered bullets. Optional small edit: add a parenthetical at the top of the Balancing list noting that these bullets are the concrete considerations that the *Appropriate reliance* section frames at a higher level.

2. The `## Components` section currently lists "Autonomy, Adaptability, Interactivity" as sub-qualities of agency. Coupling could arguably be added there too, but it's cleaner to introduce coupling as a *distribution dimension* rather than a *component*. Leave Components unchanged.

## Risks and trade-offs

- *Adding a fourth dimension to a three-dimension structure*. The Distribution section has a rhythm (three dimensions, roughly parallel). Adding a fourth breaks the rhythm slightly. Acceptable cost; coupling is important enough to name at this level.
- *Appropriate reliance as an outcome, not a property*. Framing it as "emerges from multiple qualities" is honest but less operationally useful than framing it as a single lever. This is the right trade-off — faking it as a single quality would mislead — but the writing needs to land the "so what do I do" implication, which is: *identify which of the contributing qualities is weakest in your system and strengthen that one*.
- *Forward reference to cognitive forcing functions*. The link depends on that pattern family being created (see related plan). If execution order goes Agency-first, the link will be dead until the CFF family exists. Mitigation: either execute the CFF plan first, or add the link with a `TODO` comment and fill it in after the family is written.
- *Vocabulary overlap between "appropriate reliance" and "calibrated trust"*. The literature uses both. Noessel's books don't use "appropriate reliance" directly; it's a term from the over-reliance literature (Buçinca et al., Bansal et al.). Using it here grounds the concept in its literature but introduces a term users may not recognise. Mitigation: the opening sentence of the section defines it plainly.
- *The "coupling" term is polysemous*. Software engineers hear "coupling" and think of module dependencies. The attention-sense of coupling is distinct but the word is the same. Consider alternative framings: "attentional coupling" (more precise, slightly clunky), "attention mode" (vaguer), "engagement density" (vaguer still). Leaning toward *coupling* or *attentional coupling* — will decide when drafting.

## Implementation approach

### Phase 1: attentional coupling dimension

Add the fourth sub-section under Distribution. Keep it proportional to the existing three sub-sections (3–5 bullet-backed lines).

### Phase 2: appropriate reliance section

Write the new section. This is the largest net-new content in this plan. Draft standalone, then fit into the flow of the file.

### Phase 3: activity types note

Add the short clarifying paragraph to the existing `## Agency across activity types and intent resolution` section. This is the smallest change and depends on the Interaction.mdx reframe having landed (so the cross-reference to the five assists is live).

### Phase 4: cross-reference audit

After the additions are in, check whether existing patterns that should reference Agency's new sections actually do. Likely candidates:

- Suggestion, NextBestAction, AiCompletion — appropriate reliance applies directly.
- TransparentReasoning, Explanation — contribute to transparency's role in reliance calibration.
- Notification — reentry-point pattern, connects to loose-coupling.
- ActivityLog — post-hoc review affordance, connects to reliance in loose-coupled mode.

These don't need wholesale rewrites; a single sentence cross-reference in each would suffice. This is an enrichment step, not a structural change.

### Phase 5: regenerate graph

Run `npx tsx scripts/extract-graph-data.ts` to pick up the new edges.

## Files

| Phase | Action | File |
|-------|--------|------|
| 1 | Modify | `src/stories/qualities/Agency.mdx` (add Coupling sub-section under Distribution) |
| 2 | Modify | `src/stories/qualities/Agency.mdx` (add Appropriate reliance section) |
| 3 | Modify | `src/stories/qualities/Agency.mdx` (add activity-types clarification paragraph) |
| 4 | Modify | `src/stories/actions/application/Suggestion.mdx`, `NextBestAction.mdx`, `AiCompletion.mdx` (reliance cross-references) |
| 4 | Modify | `src/stories/actions/sense-making/Explanation.mdx`, `src/stories/activities/TransparentReasoning.mdx` (transparency-in-reliance cross-references) |
| 4 | Modify | `src/stories/actions/coordination/Notification.mdx` (reentry-point cross-reference) |
| 5 | Run | `npx tsx scripts/extract-graph-data.ts` |

## Open questions

- *Coupling term*. "Coupling", "attentional coupling", or something else? Leaning *coupling* for the sub-section header and *attentional coupling* in the prose to disambiguate.
- *Execution order with cognitive-forcing-functions plan*. CFF-first avoids dead links; Agency-first lets CFF cross-reference a finished reliance section. Dependency is mutual. Recommendation: do Agency Phase 1–2 first, then CFF family, then Agency Phase 4 (cross-references), so the dependency direction flows forward.
- *Appropriate reliance as its own page*. Could `Reliance.mdx` be a standalone foundation? Arguments against: no single quality owns it; it's the emergent outcome of several. Arguments for: it would give a single destination for the concept and be linkable from anywhere. Leaning: keep it as a section inside Agency for now. Revisit if the section grows past ~15 paragraphs or if other qualities start needing to reference it as a unit rather than as parts.
- *Whether to update the "Balancing" bullet list*. The overlap between the existing bullets and the new Appropriate reliance section is meaningful but not redundant. Leaving both; the bullets are concrete, the section is framing.

## References

- Noessel, C. (2017, 2024). *Designing Agentive Technology* and *Designing Assistant Technology*.
- Buçinca, Z., Malaya, M. B., & Gajos, K. Z. (2021). To trust or to think: cognitive forcing functions can reduce overreliance on AI in AI-assisted decision-making. *CSCW*.
- Bansal, G. et al. (2021). Does the whole exceed its parts? The effect of AI explanations on complementary team performance. *CHI*.
- Parasuraman, R. & Riley, V. (1997). Humans and automation: Use, misuse, disuse, abuse. *Human Factors*.
- Plans this one interacts with:
  - `plans/2026/april/interaction-see-think-do-reframe.md`
  - `plans/2026/april/cognitive-forcing-functions.md`

## Status

Complete — all five phases implemented on 2026-04-10. Cognitive forcing functions cross-reference left as a TODO comment pending that plan's execution.
