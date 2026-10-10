---
title: "Commenting: open questions"
status: "active"
kind: "exec-spec"
created: "2026-10"
last_reviewed: "2026-10-10"
area: "commenting"
promoted_to: ""
superseded_by: ""
---
# Commenting: open questions

Outline, needs iteration.

## Context

Commenting in `packages/components` follows the mark-first, quote-later model recorded in [the closed commenting plan](../completed/2026-10-commenting.md). A comment marks its passage, and the mark is the thread's only anchor. Turning a commented passage into a quote keeps the words under a quote mark and moves the thread to the quote. The wiring is described in `packages/components/src/services/commenting/README.md`. The closed plan's "Risks of mark anchors" section lists what editing can do to an anchor and what is already fixed.

Most items below are decisions for the author. Styling changes need the author's approval before any style is added.

## Decisions

- *Telling quotes from comments.* A quoted passage uses the plain `mark` style, so it looks the same as a commented one, and it lacks the pointer cursor.
- *Reaching the quote object.* A quoted passage opens the quote's thread, while a quote reference opens the quote's own view. Should a quoted passage also offer the quote's view?
- *Whether a quote follows its passage.* Typing inside a quoted passage extends the quote mark, but the quote object keeps the words it was created with, so the two disagree. This goes with the previous item.
- *Undoing a quote.* Nothing turns a quote back into a plain comment. [Incremental formalisation](/patterns/incremental-formalisation) says every promotion stays reversible, and `commenting.mdx` states that the demo falls short of this. A failed quote step already restores the comment mark (`unquotePassage`), which a deliberate reversal could build on.
- *Threads whose passage was deleted.* Deleting or retyping a whole passage removes its mark, and its comments stay in storage, unlisted and unreachable. The thread list could keep them as detached entries, or they could be removed.
- *Active-thread styling.* Scrolling into view plus the existing highlight may be enough.
- *Composer inside the popover.* The reply box has no visible border and never shows its placeholder text. The same composer in the drawer has a border.

## Work

- *Resolution.* The service can resolve threads, and the mark carries a resolved attribute, but no interface offers resolving.
- *Marks across reloads.* The demo loads its document from fixtures on every mount, while comments persist in localStorage, so marked passages lose their threads on reload. Seeding the fixture with a commented passage would show both kinds of entry in the thread list.
- *Thread ids in copied text.* Copied HTML carries `data-comment-id` and `data-quote-id` out of the editor. Pasting into this editor already drops ids it has never held.
