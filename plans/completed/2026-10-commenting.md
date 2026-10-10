---
title: "Commenting: mark first, quote later"
status: "completed"
kind: "exec-spec"
created: "2026-10"
last_reviewed: "2026-10-10"
area: "commenting"
promoted_to: "packages/components/src/services/commenting/README.md"
superseded_by: ""
---
# Commenting: mark first, quote later

Bring the commenting system in `packages/components` in line with the Ink & Switch universal-comments model ([Patchwork notebook, entry 11](https://www.inkandswitch.com/patchwork/notebook/2024-version-control/11/)). Comments attach to pointers into a document. A shared layer owns the generic parts: writing comments, the thread list, replies and storage. Each surface supplies only the parts specific to it: the pointers it holds, the current selection, highlighting, and bringing a pointer into view.

This plan replaces six 2025 plans that described code since removed or rewritten: `2025-commenting`, `2025-commenting-next-steps`, `2025-commenting-system-refactor`, `2025-commenting-task-merge-impact`, `2025-custom-editor-for-commenting` and `2025-refactor-commenting`. They are in git history.

## Decision

When an actor comments on a passage, the passage stays as it is and gets a comment mark. The thread is stored under a text-range pointer named by the mark's thread id. Turning a commented passage into a quote, a standalone object other places can refer to, is a separate and deliberate step. The thread moves to the quote when that happens.

Quoting keeps the passage in the document. The comment mark becomes a quote mark linking the words to the new quote object. Replacing the passage with a quote reference was the alternative. It was rejected because it edits the document to formalise a remark, and because the reference showed only the first 50 characters.

Alternatives considered:

- *Quotes as the anchor.* Every comment creates a quote object, and the selection is replaced by a quote reference. This edits the content to raise a point, which the commenting pattern exists to avoid. The reference label is also cut to 50 characters, so a longer passage loses its text.
- *Marks only.* Comments mark the range, and quoting has no connection to commenting. This matches Patchwork most closely, but it drops the move from an informal remark to a formal object. That move is [incremental formalisation](/patterns/incremental-formalisation), and the language already describes it.

The chosen path is as close to Patchwork as marks-only for plain commenting, because Patchwork has no quote concept. The quote step adds to the model without contradicting it.

### Differences from Patchwork that remain

- *The anchor is stored in the document.* Patchwork stores comments separately, each holding a pointer, and leaves the document untouched. A ProseMirror mark is part of the document's structure, though the text itself does not change. Patchwork does not describe how its text anchors survive edits. This repository has no collaborative editing layer, such as Yjs or Automerge, to provide stable positions. A mark moves with the text as it is edited, which raw positions do not.
- *There is no host environment.* Patchwork's environment draws the thread list for every app. Here the list is a shared component that each editor host places, in a non-modal drawer.
- *Entity comments go beyond Patchwork.* Tasks, projects and quotes take comments as whole objects through `EntityPointer`. They sit beside text ranges without conflict.

## Responsibilities

Shared layer (`services/commenting`, `components/commenting`):

- `CommentService` and storage, keyed by `pointer.serialize()`.
- `CommentThread`: the comment list and composer for any pointer.
- The document thread list: renders the entries a surface reports, in the order it gives them, and shows the selected entry's thread.
- Moving a thread from one pointer to another, which the quote step needs.

Editor side (`components/editor-plugins/commenting`, the comment mark):

- The pointers in the document: comment marks and quote references, with excerpts, in document order.
- The current selection, already reported over the plugin event bus.
- Highlighting: the comment mark renders as `mark[data-comment-id]`, which existing styles cover.
- Bringing a pointer into view when its thread is selected.
- One shortcut, Mod-Shift-M, to comment on the selection.

## Work

All items are built.

1. [x] *Comment mark.* Allow overlapping comments, and stop the mark from growing when text is typed at its edge. Render it as `mark`, still parse `span[data-comment-id]`, and give it priority over Highlight, which also parses `mark`. Add and remove marks by thread id through the transaction, never `setMark` or `unsetMark`, because those merge into or clear every comment in the range. A story test checks that two overlapping comments keep separate ids and that removing one leaves the other in place. Comment and quote marks stay out of undo history, because undo does not reach the comment service and would leave a thread with nothing to point at.
2. [x] *Text-range pointer.* Add a `TextRangePointer(documentId, threadId)` class. It replaces the unimplemented `TiptapTextRangePointer` and `ItemViewSectionPointer` type labels.
3. [x] *Commenting flow.* Comment on the selection creates a pending thread and opens the popover over the selection. The first comment adds the mark. Closing without a comment leaves the document unchanged. The popover anchor and the Escape focus return read the mark's range, not a reference node.
4. [x] *Reopening.* Clicking a marked passage opens its thread in the popover. Clicking a quote reference keeps opening the quote's drawer.
5. [x] *Shortcut.* One commenting extension bundles the mark and the Mod-Shift-M keymap, and hosts add it to the editor. Plugin `getExtensions` is not called by the editor host, so the plugin cannot install them itself.
6. [x] *Thread list.* A non-modal right drawer lists the document's threads, both marked passages and quotes. The show-threads command, sent by the toolbar's Comments button, opens it. Selecting an entry shows its thread and scrolls the passage into view. The list subscribes to editor updates, because the drawer renders in a separate React root.
7. [x] *Service: move a thread.* A `reanchor(from, to)` method moves every comment from one pointer to another. Storage must handle comments restored from localStorage, whose pointers are plain objects without methods.
8. [x] *Quote step.* An open passage thread offers "Turn into quote". It creates a quote object from the passage, moves the thread to `EntityPointer('quote', id)`, and swaps the comment mark for a quote mark over the same words. The quote's stored content leaves comment and quote marks behind. Clicking a quoted passage opens the quote's thread, and the thread list shows it as a quote.
9. [x] *Remove leftovers.* Delete the following:
   - `QuotePointer`, because quotes use `EntityPointer('quote', id)`
   - the Zustand `comment-store` and the `storage/` modules that only it uses
   - the `useTipTapQuoteCommenting` → `useQuoteCommentUI` → `useTipTapQuoteIntegration` hook chain
   - the empty `setupQuoteReferenceHandlers`
   - unused barrel exports
   
   Leave `package.json` alone, even if zustand loses its last user.
10. [x] *Docs.* Update `services/commenting/README.md` to the new wiring.

## Open items

Carried to [Commenting: open questions](../active/2026-10-commenting-open-questions.md): telling quotes from comments, reaching the quote object, undoing a quote, whether a quote follows its passage, threads whose passage was deleted, marks across reloads, resolution, the composer inside the popover, active-thread styling and thread ids in copied text. Plugin hosts that cannot install a plugin's own extensions are in the tech-debt tracker.

## Risks of mark anchors

A scoped check of what breaks when a comment's anchor is a mark inside the document. `TextRangePointer` names a thread, not a range, so the mark is the only anchor, and nothing keeps the mark and its thread in step. Risks 1–3 follow from that. Each case was run against the commenting demo through ProseMirror's own transactions and paste path. Ordered by how much damage each does.

1. *Copying a commented passage duplicates its anchor.* Copy and paste within the document carries the mark, so one thread has two passages far apart. The thread's range then runs from the first copy to the last. The list excerpt reads "polar bears polar bears". Turning the passage into a quote captures all the text between the two copies. Cutting and pasting moves the mark correctly. *Fixed:* a paste rule in the `Commenting` extension drops a pasted comment or quote mark whose id is still in the document, unless a moving drag is about to remove the original.
2. *Copying text out carries thread ids.* The clipboard HTML holds `<mark data-comment-id="…">`. Pasting HTML with that attribute into this editor creates a passage that opens an empty thread under the foreign id, because the parse rule accepts any id. Pasting into a second commenting editor was not run; from the pointer code, it would behave the same. *Fixed for pasting in:* the same rule drops a mark whose id this editor has never held. Copied HTML still carries the ids out, which is an open question.
3. *Threads outlive their passages without notice.* This is the case actors will meet most, because rewriting the passage is the usual way a comment gets acted on. Deleting or retyping the whole passage removes the mark, but the comments stay in storage. The thread disappears from the list and can no longer be reached. Converting the paragraph to a code block, which allows no marks, does the same. Commenting inside a code block stores a thread that never gets a mark. *Partly fixed:* `canComment` stops the shortcut, the bubble button and `startThread` where no comment mark can go. A draft whose passage is deleted, or moved where no mark can go, closes before any comment is stored. Whether the thread list should keep threads whose passage was deleted is an open question.
4. *A quote drifts from its passage.* Typing inside a quoted passage extends the quote mark, and the list shows the edited text. The quote object keeps the words it was created with, so the two disagree. Whether a quote follows its passage is an open question, tied to reaching the quote object.
5. *The demo's document load is undoable.* The demo's `setContent` guard checks for text the fixture does not contain, so it always runs, and it runs as an undoable step. Undoing past it reloads the fixture and removes every mark, while their threads remain. An edit made within half a second of loading is grouped with the load. *Fixed:* the demo passes the document as initial content only; the same reload is gone from the explanation demo.
6. *A passage around an inline node left part of its mark behind.* References and other inline nodes take the comment mark too, but finding, removing and quoting a passage looked only at text, so a reference inside a quoted passage kept the old comment mark. *Fixed:* every inline node counts as part of the passage.
7. *A quote took in text that was never commented.* A passage split by text pasted into its middle was quoted from its first piece to its last. *Fixed:* the quote holds only the marked words.
8. *A failed quote step split the passage from its thread.* *Fixed:* the marks change first, and if the thread then fails to move, the passage goes back to its comment mark and the quote is deleted.

These behave correctly:
- Typing inside a passage extends it, and typing at either edge does not.
- Overlapping comments keep separate threads.
- Splitting a paragraph inside a passage gives two pieces under one thread, and joining it restores one piece.
- A heading or list conversion keeps the mark.
- Undoing a deletion brings the mark back with the text. Undoing the edit that typed a passage removes it with its mark, and redo brings both back.
- A passage across two paragraphs is one thread with two pieces.

*Background.* Peritext (Litt, Lim, Kleppmann and van Hardenberg, CSCW 2022, https://doi.org/10.1145/3555644) classes comment marks as overlapping and non-expanding, the same configuration as here, and reports that Word, Google Docs and Pages keep text typed at a comment's edge outside it. Peritext stores spans outside the text, anchored to character ids, because per-character formatting attributes fail to preserve intent when concurrent edits merge. That matters only once documents are edited by several people at once. Peritext also leaves moving and duplicating text as open questions, which touches on risk 1: Peritext asks about concurrent cut and paste followed by further edits, while risk 1 arises with a single actor.

## Discoveries

- The commenting demo's fixture already holds three quote references, two of them with comments. The thread list shows them beside marked passages.
- The formatting plugin's toolbar buttons fail the axe rule that a button's visible text must be part of its accessible name. Examples are "H1" labelled "Heading 1" and "1." labelled "Numbered list". The commenting demo turns the formatting toolbar off, so its toolbar row holds only the Comments button.
- Tiptap's focus command waits a frame before focusing. A test that focuses the editor and then presses keys must wait for focus first.
- A drawer listens for Escape on the whole document, even a non-modal one. The comment popover stops the Escape it handles, so closing a thread leaves an open thread list in place.
- Synthetic key events never trigger the platform's light dismiss for popovers. Tests press Escape from inside the popover, where its own handler closes it.

## Validation

- `npm run typecheck`
- `npm run test-unit`, including `comment-service.test.ts` for moving a thread in one storage write
- `npm run test-storybook -w @pattern-plgrnd/components -- --run`, including the test-only story `CommentingMarksPassages`. It covers overlapping comments, an unchanged text, removing one comment, discarding a draft and the thread list
- The test-only story `CommentingKeepsAnchorsUnique` covers pasted copies, foreign ids, cut and paste, moving and copying drags, code blocks and the demo's empty undo history at load
- The test-only story `CommentingSurvivesEdits` covers a draft whose passage is deleted, a passage around a reference, quoting a split passage, a failed quote step, and the thread list following an edit inside a passage
- Drive the commenting story at `/?path=/story/components-bubble-menu--commenting`. Check these flows: comment on a selection, close without commenting, comment twice on overlapping text, reopen a thread from its passage, open the list and select an entry, and use the shortcut.
