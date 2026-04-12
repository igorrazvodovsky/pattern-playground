# Tech debt tracker

Known rough edges. One line per item, linked to a plan or file where relevant.

## Active

- *117 TODO/FIXME comments across 61 files* — identified in `plans/2025/codebase-review-recommendations.md` §2.2. No ownership or dates on most. Quarterly review process recommended but not yet established.
- *Residual Atomic Design stubs in `src/stories/patterns/`* — `.md` stub files (Autofill, Checklist, etc.) left behind after AT reorg. Not served by Storybook. Low priority. See `plans/2026/march/activity-theory-reorg.md`.
- *Legacy directories `components/`, `compositions/` in `src/stories/`* — cleared of stories but directories still exist.
- *Cognitive forcing functions cross-reference* — `TODO` comment in Agency pattern pending CFF plan execution. See `plans/2026/april/4-agency-attentional-coupling.md`.
- *Dropdown positioning glitch* — mentioned in `plans/2025/dropdown-improvements.md` TODO items.
- *CSS TODO comments* — inline TODOs in CSS files noted in `plans/2025/codebase-review-recommendations.md` §5.
- *`no-explicit-any` eslint-disable in 5 files* — `Reference.tsx` (Tiptap types), `dropdown.ts` (event handling), `useDragToCreate.ts`, `nodeTypes.tsx`, `NodeShapeUtil.tsx` (tldraw types). Added 2026-04-12 during harness refactor ESLint enforcement.
- *`no-unused-vars` pre-existing errors (36)* — scattered across tldraw, components, and services. Not introduced by harness refactor. See `npm run test` output.
- *2 inline `style` prop eslint-disables* — `CommentComposer.tsx` (flex layout), `OnCanvasComponentPicker.tsx` (dynamic width). Added 2026-04-12.

## Resolved

(Move items here when fixed, with date and commit/PR reference.)
