---
title: Open panes and stacked sequences
status: active
kind: exec-spec
created: 2026-09-27
last_reviewed: 2026-09-27
area: apps/patterns (stacked-notes navigation)
promoted_to:
superseded_by:
---

# Open panes and stacked sequences

## Context

The pattern site presents pages as a horizontal stack of panes
([pattern-site.md](../../docs/specs/pattern-site.md) §Stacked-notes navigation).
Following a pattern link inside a pane opens the target to the right of that
pane and keeps the panes to its left.

Sequences are an exception. A sequence page can only be pane 0
([sequences.md](../../docs/specs/sequences.md) §Rendering), and the click
handler in `lib/stack-store.ts` only stacks `/patterns/…` links. Any link to a
sequence falls through to a full navigation that replaces the whole stack.
Following an actor through the site shows where this breaks:

1. Pattern A → pattern B. B opens beside A.
2. B → sequence S (the "Appears in" block, or an inline link in the body). The
   stack is replaced; A and B are gone. The actor followed a link the same way
   as in step 1 and got a different result.
3. S → step pattern P. P opens beside S.
4. P → "Appears in" → S. The site reloads the page that is already on screen
   and closes P. A link to one of S's steps (`/sequences/S#step`) does the same
   instead of scrolling pane 0.
5. S → another sequence T. The stack is replaced again.

A second, smaller problem affects patterns too: a link to a page that is
already open adds a second copy of it (A → B → A gives `[A] [B] [A]`). With
sequences in the stack this would become common, because every step pattern
links back to its sequence.

## Goals

- A link to a sequence inside a pane behaves like a link to a pattern: the
  sequence opens to the right of the pane the link was clicked in.
- A link to a page that is already open in the stack scrolls to that pane
  instead of opening a copy. If the link carries a section anchor, the pane
  also scrolls to that section.
- Links to pages that are already open are marked, so the actor can tell
  before clicking that the link will move the view rather than open something.

## Non-goals

- Sidebar behaviour. Sidebar links still replace the stack (a jump, not a
  push), for patterns and sequences alike.
- Direct visits. Opening `/sequences/S` from the sidebar or a shared URL still
  puts S at pane 0.
- Step-in-sequence context on pattern panes (step 2 of 5, next step). This is
  easier to add once sequences stack, but it is a separate design question.

## Decisions

- *Every pane carries its path.* The pane-0-only `path` field on `Pane`
  becomes the pane's identity for all panes. Panes are compared, keyed, and
  deduplicated by path, not by slug.
- *URL encoding.* Pattern panes keep the bare slug in `stackedNotes`. Sequence
  panes take a prefix (`stackedNotes=seq:structuring-the-space`) so a sequence
  id cannot collide with a pattern slug. Existing shared URLs keep working.
- *Going to an open pane keeps the panes to its right.* Clicking a marked link
  moves the view to the target pane and closes nothing. Panes to the right are
  only closed when the actor follows an unmarked link from an earlier pane
  (the existing truncate-and-append rule).
- *The mark is a background tint.* A marked link takes a subtle tint of the
  accent colour, and the pane it goes to takes the same tint while the link is
  hovered or focused. Screen readers get the shared "Already open"
  description.
- *The single-pane layout does not stack.* At ≤768px, as on
  notes.andymatuschak.org on a phone, a link inside a pane is a plain
  navigation with its own history entry, Back walks the pages read, and no
  link is marked.
- *Marking applies to links inside panes only.* Links in the sidebar are not
  marked, because they jump rather than push.
- *A link to its own pane is not marked.* Table-of-contents links (`#…`) and
  links whose target is the pane they sit in are not marked. In-pane `#…`
  links are routed through the stack so their anchor is recorded on their own
  pane, not on the document fragment, which belongs to pane 0.

## Implementation shape

### Phase 1: sequences as panes

- Add `pages/sequences/[id]/pane.astro`, a partial rendering `SequenceArticle`
  the way `pages/patterns/[slug]/pane.astro` renders `PatternArticle`.
- Generalise `lib/pane-content.ts` to fetch by pane path (`/patterns/<slug>/pane/`
  or `/sequences/<id>/pane/`). The cache is keyed by path. The link-preview
  popover keeps working for patterns; covering sequences is optional.
- In `lib/stack-store.ts`, give every pane a `path` and a `kind`
  (`pattern | sequence`), update `buildURL` and `syncFromURL` for the `seq:`
  prefix, and let the click handler accept `/sequences/<id>` links against a
  build-time set of valid sequence ids (the same fall-through rule as
  `validSlugs`).
- In `components/StackManager.tsx`, key pane sections by path and take the
  aria-label prefix from the pane's kind instead of the hard-coded `Pattern:`.
- Check that everything a sequence page needs at runtime works in a fetched
  pane: step links, sub-sequence anchors, and any demos (`mountDemos` already
  runs on fetched panes).

### Phase 2: going to open panes

- In the click handler, before pushing, look for a pane whose path matches the
  target. If one exists, scroll the stack to it (`scrollToPane`), scroll its
  body to the anchor if the link has one, make it the active pane, and update
  that pane's anchor in the URL with `history.replaceState`.
- If a shared URL lists the same page twice, going to it picks the nearest
  pane to the left of the link, then the nearest to the right.

### Phase 3: marking open links

- When the set of open panes changes, `StackManager` walks the anchors inside
  `.stack` and sets `data-in-stack` on those whose target path matches another
  open pane.
- Styling lives in `styles/stack.css`: a background tint on the link (see
  Decisions).
- Each marked link gets an `aria-describedby` pointing at one shared
  description, so assistive technology announces what the click will do.
- Hovering or focusing a marked link tints the target pane, and the link
  preview is suppressed for it, since the page is already visible.
- Modifier clicks (open in a new tab) keep the browser's default behaviour.

### Spec updates

- `docs/specs/pattern-site.md` §Stacked-notes navigation: panes can be
  patterns or sequences; the `seq:` prefix; going to open panes; the mark.
- `docs/specs/sequences.md` §Rendering: remove the pane-0-only rule; a sequence
  is pane 0 on a direct visit and any pane when followed from a link.

## Verification

Walk the flows from Context in a browser at desktop width and at the 768px
single-pane breakpoint:

- B → S opens S beside B and keeps A and B.
- S → P → "Appears in" → S scrolls back to S, keeps P, and marks the link.
- A step anchor to an open sequence scrolls the sequence pane to that step.
- A → B → A scrolls back to A without a second copy.
- Reloading and sharing a stack with a sequence in it restores the same panes
  and anchors.
- Back and forward walk the stack as before.
- A screen reader announces marked links as open.

`npm run test` passes, including any unit tests added for `buildURL` and
`syncFromURL` with mixed pattern and sequence panes.

## Open questions

- Whether pattern panes opened from a sequence should show their place in the
  sequence. Out of scope here; record the answer in the sequences plans if it
  is taken up.
