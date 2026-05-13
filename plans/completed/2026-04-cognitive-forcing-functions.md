---
title: "Cognitive forcing functions as a pattern family"
status: "active"
kind: "exec-spec"
created: "2026-04"
last_reviewed: "2026-05-01"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Cognitive forcing functions as a pattern family

## Context

Reading Christopher Noessel's *Designing Assistant Technology* alongside the over-reliance literature (Buçinca et al. 2021, Bansal et al. 2021) surfaces a family of interaction patterns the library doesn't yet name as a group: *cognitive forcing functions*. These are deliberate interventions that add analytical friction at the moment of accepting a system recommendation, with the goal of preventing users from rubber-stamping system output when it's wrong.

The library already has a gesture in this direction: `src/stories/actions/application/Suggestion.mdx` has a "Fixation risk" section that mentions "delay suggestions until after initial ideation" as a mitigation. That's one cognitive forcing function, and it's currently a bullet inside a broader pattern rather than a named technique. Several other forcing functions exist in the literature — each a distinct interaction structure — and none of them are currently represented:

- *Wait before reveal* — the system computes a recommendation but withholds it for a fixed interval, forcing the user to form their own initial judgment first.
- *On-demand reveal* — the recommendation is available but hidden behind a user action. The user must actively ask for help rather than having it pushed.
- *Update after initial judgment* — the user records their judgment first, then the system reveals its recommendation and gives the user a chance to revise.
- *Human goes first* — in high-risk domains, the human always acts before the system weighs in, so their first-pass judgment isn't contaminated by the system's anchoring.
- *Checklist* (in the anti-overreliance sense) — a structured list of considerations the user must address before accepting, forcing systematic review.
- *Partial explanations* — the system shows only part of its reasoning, requiring the user to complete the logic themselves and therefore engage with the content.
- *Rationale logging* — the user must record why they accepted or rejected the recommendation, creating friction and an audit trail.

The unifying mechanism is the same across all of them: *deliberately preserve the user's judgment by interposing a moment of active cognition between system output and user acceptance*. The cost is friction, by design. The trade-off is that the friction is load-bearing — without it, users accept wrong answers at higher rates.

The literature calls these "cognitive forcing functions" (Buçinca et al.), a name borrowed from human-factors engineering's "forcing function" tradition. The name is jargon-heavy but established; the user has indicated a preference for keeping established names even when imperfect.

## Where this fits

### AT level

*Action*. Cognitive forcing functions are conscious, deliberate moves — both by the system (in designing the friction) and by the user (in responding to it). They're not operations (they're not invisible; they're deliberately visible) and they're not activities (they don't shape work over time; they shape a single moment of decision).

### Lifecycle stage

*Application* primarily, with secondary *evaluation*. The friction is interposed right at the evaluation→application boundary — the moment where the user is about to accept (or reject) a system suggestion. This is also where the existing Suggestion, NextBestAction, AiCompletion, and Template patterns live, so the new family clusters naturally with its neighbours.

### Atomic category

*Pattern*. These are compositional interactions, not primitives or components. Each one coordinates at least two moves (system output, user response) and usually involves state (what was the initial judgment, what did the system say, what did the user revise to).

### Mediation

*Individual* for most. *Collaborative* for rationale-logging when the log is shared with teammates or an audit trail review process.

## Structure: umbrella + children

A *standalone umbrella* (see `.claude/skills/pattern-classifier/SKILL.md`'s umbrella taxonomy). The umbrella has its own design concerns — when friction helps vs harms, who bears the cost, measurement difficulty, equity considerations (friction is harder for some users than others) — that are separate from any single child pattern. Sub-patterns are distinct enough to warrant their own pages because they have different neighbourhoods and different implementation concerns.

### Umbrella page: `Cognitive forcing functions`

`src/stories/actions/application/CognitiveForcingFunctions.mdx`

Meta title: `Actions/Application/Cognitive forcing functions`

The umbrella covers:
- The mechanism: why deliberate friction works (interrupting the automatic acceptance loop; forcing System 2 engagement; preventing anchoring)
- The trade-offs: friction costs (time, annoyance, user dislike); friction benefits (accuracy, preserved skill, caught errors); the asymmetry (users often dislike the interventions that help them most)
- The preconditions: when cognitive forcing is warranted (high-stakes decisions; unreliable or imperfectly-calibrated systems; domains where the user has the competence to second-guess the system) and when it isn't (low-stakes decisions; well-calibrated systems; when users lack the competence to evaluate the system's output)
- The measurement problem: appropriate reliance is hard to measure; interventions that users dislike can still improve performance
- The equity concern: friction is regressive — it costs users with time/cognitive budget less and costs time-pressured or cognitively-loaded users more
- Cross-references to the family of children below and upward to the *Appropriate reliance* section in [Agency](../?path=/docs/qualities-agency--docs)

### Child patterns

All children live under `src/stories/actions/application/cognitive-forcing-functions/` to create a Storybook folder grouping. Each gets a Meta title like `Actions/Application/Cognitive forcing functions/Wait before reveal`.

| File | Meta title | One-line definition |
|------|-----------|---------------------|
| `WaitBeforeReveal.mdx` | `.../Wait before reveal` | Delaying system output so the user forms an initial judgment before seeing the recommendation. |
| `OnDemandReveal.mdx` | `.../On-demand reveal` | Making system recommendations available only when the user actively requests them. |
| `UpdateAfterJudgment.mdx` | `.../Update after initial judgment` | Recording the user's first-pass judgment, then showing the system's view and allowing revision. |
| `HumanGoesFirst.mdx` | `.../Human goes first` | Sequencing interaction so the user acts before the system offers any assistance. |
| `OverrelianceChecklist.mdx` | `.../Checklist` | A structured list of considerations the user must address before accepting system output. |
| `PartialExplanations.mdx` | `.../Partial explanations` | Withholding part of the system's reasoning so the user must complete the logic themselves. |
| `RationaleLogging.mdx` | `.../Rationale logging` | Requiring the user to record why they accepted or rejected a system recommendation. |

### Why these get separate pages and not just bullets in the umbrella

The umbrella-vs-children question is about graph topology (see `.claude/skills/pattern-classifier/SKILL.md` §2). Each of these:

- Has a distinct implementation cost and a distinct user experience, so designers will want to compare them
- Connects to different complementary patterns — *Wait before reveal* touches Temporality; *On-demand reveal* touches Progressive disclosure; *Partial explanations* touches Explanation and TransparentReasoning; *Rationale logging* touches ActivityLog
- Has been studied as a distinct intervention in the empirical literature, so its name is a named entity with its own references
- Can be linked *to* from other patterns — Suggestion's fixation-risk section, for example, should be able to link to Wait before reveal specifically, not just to the umbrella

The test from the skill file: *"could this be meaningfully linked to from other patterns?"* Yes, repeatedly. That tips the decision toward separate pages.

The children are short — each one's page is maybe 40–80 lines of MDX. The umbrella is where the mechanism, trade-offs, and meta-considerations live; the children are where the concrete interaction structures live.

## Enrichment of existing patterns

Several existing patterns need cross-references to the new family. These are the enrichment edits that make the new nodes discoverable from the existing graph:

### `actions/application/Suggestion.mdx`

Current state: has a "Fixation risk" section with a few mitigation bullets. The section becomes a short paragraph naming the phenomenon and cross-referencing the cognitive forcing functions umbrella. Individual mitigations (delay suggestions, show partial reasoning, require rationale) link to the specific child patterns.

### `actions/application/NextBestAction.mdx`

NextBestAction is closer to the "system recommends, user accepts or overrides" loop than almost any other action pattern. Add a paragraph noting that when the stakes are high or the system is imperfectly calibrated, NextBestAction should be paired with one or more cognitive forcing functions to preserve the user's judgment. Link to the umbrella.

### `actions/application/AiCompletion.mdx`

AI completion (autocomplete-for-generative-text) has a well-known over-reliance problem — users accept generated text without fully evaluating it. Add a cross-reference to the CFF family, and specifically to Wait before reveal and Partial explanations as candidates.

### `actions/sense-making/Explanation.mdx`

Partial explanations is a specific child of the cognitive forcing functions family that directly depends on Explanation. Add a cross-reference from Explanation noting that explanations can be deliberately partial to prevent over-reliance, linking to the Partial explanations child page.

### `activities/TransparentReasoning.mdx`

Related to Explanation. Add a note that transparent reasoning's trade-offs include the over-reliance finding: full reasoning can actually increase over-reliance by giving users a plausible justification they don't need to think through. Link to the CFF umbrella's section on this trade-off.

### `activities/ActivityLog.mdx` (if it exists; check)

Rationale logging is a form of activity log focused on decisions. Add a cross-reference if ActivityLog exists.

### `qualities/Agency.mdx`

The *Appropriate reliance* section (added by the `agency-attentional-coupling.md` plan) should link forward to the cognitive forcing functions umbrella. That's a cross-reference in the other direction — Agency points at CFF as the pattern family that addresses the over-reliance side of appropriate reliance.

## Risks and trade-offs

- *"Cognitive forcing functions" is jargon*. The user has said to keep the established name. Acceptable; the umbrella's opening sentence can define it plainly in design-repertoire voice so the jargon isn't the only entry point.
- *These patterns are controversial*. The empirical evidence is genuine but the interventions are often disliked, and there's a live debate about whether friction is ethical or paternalistic. The umbrella must present both sides honestly; it shouldn't advocate for the patterns uncritically. The framing should be: *these exist, here's how they work, here are the contexts where they help, here are the contexts where they don't, here are the fairness concerns*.
- *Some of the children are thin*. Rationale logging, for example, is barely distinct from a normal decision log — the "cognitive forcing" twist is just that it's required rather than optional. If a child can't sustain its own page (less than ~30 lines of substance), consider folding it into the umbrella as a named sub-technique rather than giving it a page. Leaning: start with all seven children as pages, and collapse any that come out too thin during drafting.
- *Depends on the Agency reframe landing first*. The cross-reference to *Appropriate reliance* assumes that section exists in Agency.mdx. Execution order matters: Agency's Appropriate reliance section should land before CFF's umbrella cross-references it.
- *Depends on the Interaction reframe for framing vocabulary*. The umbrella's discussion of *where in the loop the friction sits* is cleaner if it can say "at the evaluation→application boundary" with reference to the intent lifecycle vocabulary. The Interaction reframe is not a hard blocker, but the CFF family reads better after it lands.
- *Placement under actions/application*. These live at the evaluation→application boundary but the primary lifecycle stage is application (the friction is interposed *before* acceptance, which is application's concern). If review says they're primarily evaluation, they should move. Leaning application; flagging for user judgment.
- *Folder grouping vs sibling patterns*. The plan puts children in a sub-folder with a hierarchical Meta title (`Actions/Application/Cognitive forcing functions/Wait before reveal`). This creates a Storybook folder. The alternative is sibling patterns with `Actions/Application/Wait before reveal` as the title and cross-references binding them. Folder grouping is cleaner for a tight family; sibling placement scatters them. Leaning folder; flagging.
- *"Checklist" naming collision*. The library may already have or expect a Checklist pattern in the generic "structured list" sense. The cognitive-forcing Checklist is specifically the anti-overreliance use, not generic task-step listing. Consider disambiguation: `OverrelianceChecklist.mdx` in the file name with Meta title `Cognitive forcing functions/Checklist` — the folder context disambiguates. Alternative: rename to something like "Deliberation checklist" or "Review checklist." Leaning: file name `OverrelianceChecklist.mdx`, Meta title just "Checklist" under the folder, prose clarifies the scope.

## Implementation approach

### Phase 1: umbrella page

Write `CognitiveForcingFunctions.mdx`. This is the most substantive page and needs research:

- Buçinca et al. 2021 (the paper that names the concept)
- Bansal et al. 2021 (explanations can increase over-reliance)
- Vasconcelos et al. 2023 (on when explanations help vs hurt)
- Parasuraman & Riley 1997 (the classic humans-and-automation paper)
- Related HCI work on calibrated trust

Draft in design-repertoire voice: frame from the human situation inward. Do not open with "a pattern that..." or "an umbrella containing..." — open with the situation it addresses (users accepting wrong answers from confident systems).

Review-check: is the page honest about the trade-offs? Does it avoid advocacy? Does it reference the fairness concern?

### Phase 2: child pages

Write the seven child pages. Each follows the documentation standards in `.claude/rules/documentation.md`:
- Meta title
- Fun meter
- Title + one-sentence definition
- Core content (mechanism, variants, when it works, when it doesn't, design considerations)
- Related patterns section
- Resources & references

Draft order (easiest to hardest, roughly):
1. Wait before reveal
2. On-demand reveal
3. Human goes first
4. Update after initial judgment
5. Partial explanations
6. Rationale logging
7. Checklist

Review-check after each: is the child distinct enough from the others to justify its own page? If no, collapse into the umbrella.

### Phase 3: enrichment of existing patterns

Add cross-references to Suggestion, NextBestAction, AiCompletion, Explanation, TransparentReasoning, Agency (Appropriate reliance section links forward), and ActivityLog if it exists.

Each edit is small — a paragraph or a couple of sentences. No structural changes to the existing patterns.

### Phase 4: tags and metadata

Each new page gets:
- `activity-level:action`
- `atomic:pattern`
- `lifecycle:application` (primary), `lifecycle:evaluation` (secondary, via additional tag)
- `mediation:individual` (or `mediation:collaborative` for rationale-logging variants)
- Domain tag: consider `ai` (these patterns are especially relevant to AI-assisted decisions) and something like `reliance` as a new domain cluster tag if we're tracking over-reliance-adjacent patterns

### Phase 5: graph regeneration

Run `npx tsx scripts/extract-graph-data.ts` to extract the new nodes and edges into `src/pattern-graph.json` and `src/stories/data/activity-levels.json`.

### Phase 6: review

Scan the graph for:
- Orphan nodes (did any of the new pages end up without inbound edges?)
- Cluster clarity (do the CFF nodes form a recognisable cluster, or do they scatter?)
- Missed cross-references (any existing pattern that obviously should reference a CFF child but doesn't?)

## Files

| Phase | Action | File |
|-------|--------|------|
| 1 | Create | `src/stories/actions/application/CognitiveForcingFunctions.mdx` (umbrella) |
| 2 | Create | `src/stories/actions/application/cognitive-forcing-functions/WaitBeforeReveal.mdx` |
| 2 | Create | `src/stories/actions/application/cognitive-forcing-functions/OnDemandReveal.mdx` |
| 2 | Create | `src/stories/actions/application/cognitive-forcing-functions/UpdateAfterJudgment.mdx` |
| 2 | Create | `src/stories/actions/application/cognitive-forcing-functions/HumanGoesFirst.mdx` |
| 2 | Create | `src/stories/actions/application/cognitive-forcing-functions/OverrelianceChecklist.mdx` |
| 2 | Create | `src/stories/actions/application/cognitive-forcing-functions/PartialExplanations.mdx` |
| 2 | Create | `src/stories/actions/application/cognitive-forcing-functions/RationaleLogging.mdx` |
| 3 | Modify | `src/stories/actions/application/Suggestion.mdx` (fixation risk → CFF cross-refs) |
| 3 | Modify | `src/stories/actions/application/NextBestAction.mdx` (reliance note) |
| 3 | Modify | `src/stories/actions/application/AiCompletion.mdx` (reliance note) |
| 3 | Modify | `src/stories/actions/sense-making/Explanation.mdx` (partial explanations cross-ref) |
| 3 | Modify | `src/stories/activities/TransparentReasoning.mdx` (over-reliance trade-off note) |
| 3 | Maybe modify | `src/stories/activities/ActivityLog.mdx` (if exists) |
| 5 | Run | `npx tsx scripts/extract-graph-data.ts` |

## Open questions

- *Folder vs sibling placement for the children*. Leaning folder grouping under `cognitive-forcing-functions/` with hierarchical Meta titles. Flagged for user judgment.
- *All seven children, or fewer*. Leaning all seven initially, collapse during drafting if any come out thin.
- *Checklist disambiguation*. File name `OverrelianceChecklist.mdx`, Meta title `Checklist` under the folder. If there's a collision with an existing or planned Checklist pattern, rename to `Deliberation checklist` or `Review checklist`.
- *Execution order with the other two plans*. The dependencies flow:
  1. `interaction-see-think-do-reframe.md` — introduces the attended/delegated vocabulary
  2. `agency-attentional-coupling.md` Phase 1–2 — introduces appropriate reliance as the anchor
  3. `cognitive-forcing-functions.md` (this plan) — populates the pattern family
  4. `agency-attentional-coupling.md` Phase 4 — adds forward cross-references from Agency to the new CFF family
  This order minimises dead links.
- *The `resources/overreliance.md` file that git status mentioned*. User has said to ignore it. Not pursuing.

## References

### Primary empirical sources

- Buçinca, Z., Malaya, M. B., & Gajos, K. Z. (2021). To trust or to think: cognitive forcing functions can reduce overreliance on AI in AI-assisted decision-making. *Proceedings of the ACM on Human-Computer Interaction, 5(CSCW1), 1–21.*
- Bansal, G., Wu, T., Zhou, J., Fok, R., Nushi, B., Kamar, E., Ribeiro, M. T., & Weld, D. S. (2021). Does the whole exceed its parts? The effect of AI explanations on complementary team performance. *CHI '21.*
- Vasconcelos, H., Jörke, M., Grunde-McLaughlin, M., Gerstenberg, T., Bernstein, M. S., & Krishna, R. (2023). Explanations can reduce overreliance on AI systems during decision-making. *Proceedings of the ACM on Human-Computer Interaction, 7(CSCW1), 1–38.*
- Parasuraman, R. & Riley, V. (1997). Humans and automation: Use, misuse, disuse, abuse. *Human Factors, 39(2), 230–253.*

### Contextual

- Noessel, C. (2024). *Designing Assistant Technology.* (The framing that brought this pattern family into view while synthesising assistant/agent distinctions.)

### Local notes to draw from

- `atomics/Cognitive forcing functions deliberately add analytical friction to reduce assistant overreliance.md`
- `atomics/Partial explanations can reduce overreliance by making users complete the reasoning.md`
- `atomics/Anti-overreliance interventions may improve performance even when users dislike them.md`
- `atomics/High-risk assistants should occasionally let humans go first, then compare results and teach the miss.md`
- `atomics/Appropriate reliance on assistants sits between rejection and blind trust.md`
- `concepts/Checklist.md`
- `concepts/Human Goes First.md`
- `concepts/On-demand recommendation reveal.md`
- `concepts/Partial explanations.md`
- `concepts/Rationale logging.md`
- `concepts/Update after initial judgment.md`
- `concepts/Wait before recommendation reveal.md`

### Plans this one interacts with

- `plans/active/2026-04-interaction-see-think-do-reframe.md` — introduces the attended/delegated framing used in the umbrella
- `plans/active/2026-04-agency-attentional-coupling.md` — introduces the appropriate-reliance concept the umbrella anchors on

## Status

Complete — all phases implemented on 2026-04-10. 8 new pages (umbrella + 7 children), cross-references added to Suggestion, NextBestAction, AiCompletion, Explanation, TransparentReasoning, ActivityLog, and Agency (appropriate reliance TODO resolved). All CFF nodes have inbound edges; 143 nodes, 909 edges total.
