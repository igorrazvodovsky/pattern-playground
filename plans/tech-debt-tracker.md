# Tech debt tracker

Known rough edges. One line per item, linked to a plan or file where relevant.

## Active

- *117 TODO/FIXME comments across 61 files*. No ownership or dates on most. Quarterly review process recommended but not yet established.
- *Residual Atomic Design stubs in `src/stories/patterns/`* — `.md` stub files (Autofill, Checklist, etc.) left behind after AT reorg. Not served by Storybook. Low priority. See `plans/completed/2026-03-activity-theory-reorg.md`.
- *CSS TODO comments* — inline TODOs in CSS files noted in `plans/completed/2025-codebase-review-recommendations.md` §5.
- *`no-explicit-any` eslint-disable in 4 files* — `Reference.tsx` (Tiptap types), `useDragToCreate.ts`, `nodeTypes.tsx`, `NodeShapeUtil.tsx` (tldraw types). Added 2026-04-12 during harness refactor ESLint enforcement.
- *`no-unused-vars` pre-existing errors (36)* — scattered across tldraw, components, and services. Not introduced by harness refactor. See `npm run test` output.
- *2 inline `style` prop eslint-disables* — `CommentComposer.tsx` (flex layout), `OnCanvasComponentPicker.tsx` (dynamic width). Added 2026-04-12.
- *Dual listbox needs a project example* — `src/stories/actions/coordination/DualListbox.mdx` is a seed stub. Add a motivating example (e.g. "assign labels to tasks" bulk dialog, or "grant roles to users" screen) when the use case surfaces. TODO is marked in the file.

## Resolved

- *Dropdown positioning glitch* — fixed via improved Shadow DOM traversal and proper popup property declarations. `plans/paused/2025-dropdown-improvements.md` Phase 1. PR #19.
- *Submenu hover broken, cloneNode reactivity, duck-cast `any`, duplicate aria-live announcers, non-idempotent `init()`* — all fixed in `dropdown.ts`, `list.ts`, `list-item.ts`; shared singleton extracted to `src/utility/announce.ts`. 2026-05-08, PR #19.
- *`no-explicit-any` eslint-disable in `dropdown.ts`* — removed; all `as any` casts replaced with typed public methods. 2026-05-08, PR #19.
