---
title: "Platform variance: floor-then-variance on nine pages, as a falsification pilot"
status: "active"
kind: "exec-spec"
created: "2026-08"
last_reviewed: "2026-08-06"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Platform variance: floor-then-variance on nine pages, as a falsification pilot

Research gate: `research/platform-variance/` (2026-08-06).

## Context

There is no shared vocabulary for platform variance. Device and input concerns
appear as ad-hoc prose in about a dozen of 136 pattern pages, and nothing in the
schema carries them — not the relationship vocabulary, not `situation.initiating`
/ `.resulting`, not the decision trees.

The audit found three distinct kinds of claim already present, none labelled:

*Capability absence*, where the move is suppressed or needs a second channel —
`link-preview.mdx:55` ("On touch devices the preview is suppressed... there is
no hover channel to exploit"), `link-preview.mdx:26`, the anti-pattern at
`link-preview.mdx:78`, `selection.mdx:130` ("Doesn't work on touch"),
`drag-and-drop.mdx:84`, `editing-in-place.mdx:78` and `:98`, `citation.mdx:30`.

*Capability difference*, where the same move gets a different invocation —
`selection.mdx:58` already lists "pointer / keyboard / touch / assistive
technology" as a named dimension; also `settings.mdx:117`, `pan-and-zoom.mdx:88`,
`mastery.mdx:56`.

Two pages have already converged on the shape this plan proposes, independently
and without a vocabulary to name it. `selection.mdx:58` invented the input-modality
dimension locally. `editing-in-place.mdx` goes further: its forces name the
trade-off as capability rather than device ("revealing controls on approach...
hands the feature to pointer users. Touch has no hover, and keyboard access has
to be built deliberately rather than inherited"), and its *on approach* variant
states the floor as a condition of the variant existing at all — "a workable
compromise for pointer input that needs an explicit equivalent for touch and
keyboard, or it does not exist for those actors at all". `drag-and-drop.mdx:84`
does the same with the two-obligation twin (WCAG 2.1.1 plus SC 2.5.7). That
convergence is the main reason to think the vocabulary is discovered rather than
imported — three pages, three authors' sittings, one shape.

*Screen real estate*, where a different pattern is chosen —
`navigation-overview.mdx:120` routes a decision-tree leaf to hub *on mobile* and
tree *on desktop*; `hub-and-spoke.mdx:56`; `modality.mdx:38`;
`overview-detail.mdx:81`.

The strawman taken into the research was that input capability, not screen size,
is the real axis, and that it belongs on `situation.initiating`. The research
broke the positive and left the negatives standing. Shipping systems that killed
device-class encoding replaced it with available *window* size, and their
argument was window dynamism — split-screen, folding, orientation, resizable
windows — not hover. Capability predicates turn out not to be booleans: a user
agent may report `hover: none` on capable hardware for accessibility reasons,
and two of the four proposed predicates (keyboard-present, reach-constrained)
are not expressible at all. WCAG, taken into the research as evidence that
standards model this as capability, turns out to model it as an *unconditional
floor* with no capability branch anywhere.

*Two evidence gaps shape how much this plan may claim.* The design-system
comparison rests on Material and Android, which are one lineage — every Apple
HIG claim was voted down, and Fluent, Polaris, Atlassian, Carbon and Spectrum
produced nothing verifiable. And the angle that would have supplied a historical
base rate — pattern languages that added mobile and either held or fragmented —
returned nothing at all. So the central structural bet below, that a
functional-equivalence fence keeps one corpus from forking, has Material's
current practice behind it and no post-mortem evidence whatsoever.

That is why this is a pilot whose job is to falsify, not a rollout.

## The provisional shape

*Floor, then variance.* A pattern page states an unconditional floor before it
states any variance. The floor: the move works with a single pointer, with no
drag dependency and no hover dependency. This is WCAG's architecture, and the
media-query evidence is what makes it more than borrowed style — because the
platform may deny hover on capable hardware, a hover dependency is a provision
gap rather than a device case.

*The equivalence fence.* Only what survives the floor is a variance case, and
only if the adaptation is a functionally equivalent swap. If the adaptation is a
genuinely different move, it is a different pattern joined by an edge. This is
the fence that is supposed to keep one corpus instead of two, and it is the
thing the pilot tests.

*Name what changes, not what it changes on.* Material's five kinds —  reveal,
divide, resize, reposition, swap — as the variance section's internal vocabulary.

*Three condition families, as prose terms only.* Surface: compact / medium /
expanded, always phrased as window, never device. Input: hover channel, pointer
precision, single-pointer path, keyboard — of which only the first two are
machine-queryable. Situation: divided attention, one-handed, glanceable,
interruption-prone, phrased as ability-in-context rather than as device
attributes.

No new schema field, no node type, no edge type, no parallel corpus. Not on
`situation.initiating` — the condition is a runtime property of the surface that
changes within a session, so a static field would encode something that flips
underneath it. Note that this argument is thinner than it reads: the convenient
supporting claim, that grip posture flips within seconds, was refuted 0-3. What
survives is window dynamism, which is about the surface rather than the actor.
Enough to defer a typed field; not enough to rule one out.

## Work

### 1. Four rewrites that test the vocabulary cheaply

These four lines are where the vocabulary either does work or visibly does not.

- `link-preview.mdx:55` and `selection.mdx:130` reclassify from variance to
  *floor*. Both currently read as device cases ("suppressed on touch", "doesn't
  work on touch") and both are provision gaps wearing device clothing. If the
  rewrite reads as a loss of information rather than a clarification, the floor
  framing is wrong.
- `navigation-overview.mdx:120` and `hub-and-spoke.mdx:56` are the "say window,
  never device" rewrites. `hub-and-spoke.mdx:56` currently gives its own reason
  in real-estate terms ("where screen space is limited"), so the rewrite should
  be nearly free; if it is not, the window vocabulary is not carrying what the
  page means.

### 2. The fork the pilot exists to find

`navigation-overview.mdx:120` and `hub-and-spoke.mdx:56` are the same claim in
two places, and they are the case where the shape above may break.

Hub-and-spoke on a narrow window is plausibly *not* a functionally equivalent
swap for a tree — it is a different move. The equivalence fence therefore routes
it out of the variance frame and into a separate pattern plus an edge. But
`navigation-overview.mdx:120` already routes hub-vs-tree inside a decision tree,
which means the corpus has already answered this question a different way.

So there are two readings and the pilot has to pick one:

- The fence is right, and category-C cases belong in *decision trees*, not in
  variance sections. Window size becomes a decision-tree dimension —
  `navigation-overview.mdx:120` is the existing precedent to formalise — and
  variance sections carry only categories A and B.
- The fence is too strict, and functional equivalence is the wrong test for
  moves that share a purpose but not a shape.

Resolve this against the nine pages before touching anything else. It decides
whether the surface family is a prose condition or a decision-tree dimension,
and those are different pieces of work.

### 3. Rewrite the remaining pages and check the partition

The set: `link-preview`, `selection`, `drag-and-drop`, `editing-in-place`,
`hub-and-spoke`, `modality`, `navigation-overview`, `settings`, `pan-and-zoom`,
`mastery`, `citation`. Plus `overview-detail.mdx:81`, which is a real-estate
claim that may or may not be in frame.

Two checks, not one rewrite pass:

- Does the equivalence fence actually partition these cases, or does it leave a
  residue that is neither a floor nor an equivalent swap?
- Do the three pages that already converged on the shape — `selection`,
  `editing-in-place`, `drag-and-drop` — get *better* or merely *renamed*? They
  are the control cases, and `editing-in-place` is the strictest: it was written
  recently, it already reads well, and it already says what the vocabulary would
  say. If naming the shape makes that page worse, the vocabulary is overhead
  rather than a tool.

Only if the vocabulary survives all three does it earn a typed schema field.
That is a separate plan, not this one.

### 4. The library floor (secondary)

The audit of `packages/components/src/styles/` found 18 container queries, 16
`prefers-reduced-motion`, 4 `prefers-contrast`, 8 width media queries — and zero
uses of `hover`, `any-hover`, `pointer`, or `any-pointer`. The library adapts to
space and to stated preferences, and has no channel at all for input capability.

Given the floor-first shape, that gap matters less than it first appears. The
library's contribution is mostly the floor — components ship a pointer-operable,
drag-free, hover-independent path unconditionally — plus width-keyed swaps for
genuinely equivalent cases. Container queries already carry the second.

Open: how to express the floor as something testable rather than a documentation
note. Media queries cannot enforce it, and what can was not researched.

## Open questions

- Does any design system carry platform variance as a typed condition field
  rather than prose plus a hand-maintained swap table? No verified evidence
  survived for the six systems outside Google's lineage. If none does, that
  absence is worth establishing deliberately rather than inheriting by default.
- How did pattern languages that added mobile handle it across editions —
  Tidwell in particular — and is there documented failure literature on
  fragmentation into per-platform corpora? The historical base rate for this
  plan's central bet is currently unknown.
- Does the situation family (divided attention, one-handed, glanceable) earn
  separate naming from the input family, or is it redundant? Ability-Based
  Design keeps context separate from performance for a stated reason —
  anticipation — and that reason may not transfer to a corpus that describes
  moves rather than adaptive systems.
- Is `overview-detail.mdx:81` in frame at all, or is it a density claim that
  happens to mention layout?
