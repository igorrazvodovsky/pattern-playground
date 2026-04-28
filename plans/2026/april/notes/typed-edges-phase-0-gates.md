# Phase 0 gate notes

Working notes from the Phase 0 gates of [typed-edges.md](../typed-edges.md). The vocabulary changelog at [relationship-vocabulary.md](../../../../docs/language/relationship-vocabulary.md) records the decisions; this file keeps the deliberation that produced them.

## 0.B — Generative profile experiment (resistance log)

Profiles drafted blind to *Related patterns*. One observation per pattern that resisted, plus cluster findings.

- *Form*. Profile describes when a form is *needed*; the decision tree at [Form.mdx#L63](../../../../src/stories/actions/application/Form.mdx) discriminates *within* the category. Profile and tree are complementary at different layers.
- *Select / Checkbox / Autocomplete / Input*. Their `operates-on` slots recover Form's tree discriminators almost directly. Leaves recover the tree's dimensions even though Form's root doesn't.
- *Cluster A finding*. "A decision tree is a generative profile expressed as a diagram" is partly right (at the leaves) and clearly false (at the root). Trees discriminate within a category; profiles also identify when the category applies. Phase 3's situational-hints framing is unaffected — if anything it strengthens the case for leaving hints raw.
- *Checkbox*. Slots felt forced; `operates-on` and `produces` restate each other. Frame is at full strength on patterns with internal complexity; on irreducibly minimal primitives it's near-vacuous.
- *Notification*. Profile came out parallel to Notification's own decision tree in different words. Routing-shaped patterns may need different handling.
- *Toast*. Differentiates cleanly from Notification. Cluster B's `enacts` slots reach for distinct qualities (forgiveness / awareness / acknowledgement).
- *Conversation / Onboarding*. Frame stays non-vacuous at activity scale; the two stay distinct. Cluster C collapse worry doesn't materialise.
- *Enacts slot, mixed signal*. Where a move enacts a named library quality (Undo→forgiveness, Form→agency, Conversation→agency), the slot flows. Where it doesn't (Notification→"awareness", Onboarding→"learnability + safety + value"), the author reaches for everyday words. Research finding for the qualities side, not for this vocabulary.

Gate criteria, line by line: (a) Cluster A profiles run partly recovering, partly orthogonal to Form's tree — pass. (b) Cluster B profiles differentiate; `enacts` reaches for distinct qualities — pass. (c) Cluster C non-vacuous at activity scale — pass. (d) Frame fits some patterns better than others — pass with caveat. (e) No new relationship dimension surfaced.

## 0.B — Adversarial probe and reviewer reconciliation

Run after the friendly cluster passed: would we have caught a real failure? Patterns probed: Card, Bot, Mastery, Sections (adversarial); Status feedback, Assisted task completion (routing-shape probe). First-pass conclusions were then critiqued by an independent reviewer. Two did not survive review.

- *Card*. First-pass: profile collapses to tautology; structural containers don't admit profiles. *Reviewer*: collapse was drafter laziness. A collection-scale reading produces a non-tautological profile (operates on a heterogeneous collection to be browsed and compared; produces a uniformly bounded representation supporting cross-item comparison; enacts scannability, density-comparability, per-subject legibility). The transformation is *homogenisation for comparison*. *Reconciled*: Card profile written. The "pure structural containers" exemption is dropped. Lesson: apparent collapse should trigger a re-attempt at a different scale before being recorded as a structural exemption.
- *Bot*. First-pass: routing-shape problem at activity scale. *Reviewer*: Bot is not routing-shaped — it is an *umbrella term* covering four genuinely different patterns (chatbot, inline, workflow, full autonomy). *Reconciled*: Bot stays in the strain list as an umbrella. The honest reading is that Bot should probably be split.
- *Mastery*. First-pass: unbounded lifecycle stance, not a generative move. *Reviewer*: agreed — the page literally says "design for mastery by providing optional paths to expertise". Claim stands.
- *Sections*. First-pass: the only adversarial pick where the frame held. *Reviewer*: the profile is a near-rephrase of the page's opening sentence. *Reconciled*: kept but flagged as low-information. Frame doesn't strain, but doesn't add information either.
- *Status feedback*. First-pass: routing-shaped, profile re-encodes three approaches. *Reviewer*: the three approaches coexist on the same screen — *enumerative-coexisting*, not routing. *Reconciled*: claim withdrawn.
- *Assisted task completion*. First-pass: routing-shaped. *Reviewer*: closer to Bot's umbrella problem. *Reconciled*: re-categorised as umbrella.

Revised category list — patterns where the frame strains:

1. *Minimal primitives* (Checkbox). Profile slots restate each other because the move's definition exhausts its description.
2. *Unbounded stances* (Mastery). The pattern names a design posture rather than a discrete transformation.
3. *Umbrella patterns* (Bot, Assisted task completion). The pattern name covers heterogeneous moves; profile the constituent patterns, not the umbrella.

"Pure structural containers" is dropped. "Routing-shaped" survives only as *true* routing trees — Notification is the n=1 example. With n=1 it's not yet a category.

A third zone — *frame holds but profile is low-information* (Sections, Status feedback) — is distinct from "frame strains" and worth tracking separately.

*Verdict on the original gate*: did not close as cleanly as first-pass claimed. Two of five strain claims over-reached (Card, Status feedback). Three real strain categories survive. The good zone — transformative patterns with internal asymmetry between operates-on and produces — is real, but its perimeter is messier than first stated, and the frame is more sensitive to drafter ability than the first round acknowledged.

Phase 1 implications:

- Don't auto-extract profiles for everything. The proof-of-concept set (now 11) covers in-zone categories. Skip the three strain categories.
- Apparent collapse triggers re-attempt at a different scale (collection vs. instance, system vs. flow, motive vs. mechanism) before exemption.
- Umbrella patterns are *projection targets* (views organising information authored elsewhere), not *information origins*. Profiles belong on origins.
- Open question for after Phase 1: should nodes carry a `profileApplicability` indicator?

## 0.C — Decision-dimension inventory observations

Snapshot at [decision-dimensions.md](../../../../docs/language/decision-dimensions.md). The `recommends` shape (raw question/branch text, `extractedFrom: 'decision-tree:<id>'`) holds against the actual material — most questions read naturally as situational hints.

Observed drift, not yet acted on:

- *Heterogeneity of hint kinds.* Decision-tree questions mix data-shape, user-state, system-state, and design-state context. Under suggestion-not-matching this is fine; a future consumer that wanted to organise hints by kind would need to add that structure itself.
- *Hybrid leaves.* Navigation already acknowledges some leaves are "and" rather than "or". For hybrid leaves the Phase 3 extractor should emit one `recommends` edge per leaf with shared `situationalHints` payload.
- *Some questions describe design state more than situation.* Form's "Does the control filter or swap visible content?" leans on prior design decisions. Flagged for review during Phase 3 extraction.

Possible future revisions: dimensions the library doesn't reason about (latency/async, persistence, multi-user state, AI-specific concerns) are absences worth tracking.
