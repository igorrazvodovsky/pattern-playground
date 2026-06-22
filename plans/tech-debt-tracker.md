# Tech debt tracker

- *117 TODO/FIXME comments across 61 files*. No ownership or dates on most. Quarterly review process recommended but not yet established.
- *Residual Atomic Design stubs in `src/stories/patterns/`* — `.md` stub files (Autofill, Checklist, etc.) left behind after AT reorg. Not served by Storybook. Low priority. See `plans/completed/2026-03-activity-theory-reorg.md`.
- *CSS TODO comments* — inline TODOs in CSS files noted in `plans/completed/2025-codebase-review-recommendations.md` §5.
- *`no-explicit-any` eslint-disable in 4 files* — `Reference.tsx` (Tiptap types), `useDragToCreate.ts`, `nodeTypes.tsx`, `NodeShapeUtil.tsx` (tldraw types). Added 2026-04-12 during harness refactor ESLint enforcement.
- *`no-unused-vars` pre-existing errors (36)* — scattered across tldraw, components, and services. Not introduced by harness refactor. See `npm run test` output.
- *4 inline `style` prop eslint-disables* — `CommentComposer.tsx` (flex layout), `OnCanvasComponentPicker.tsx` (dynamic width). Added 2026-04-12.
- *`[cmdk-item]` item sub-parts use `.combobox-item__*` naming, `pp-list-item` uses `.list-item__*`* — `list-item-shared.css` was intended to align both but `cmdk.css` imports it without using it. Renaming `.combobox-item__prefix/label/suffix/check` → `.list-item__*` in the combobox React wrappers and removing the duplicate item rules from `cmdk.css` lines 106–144 would make the shared file genuinely serve both. Natural follow-on to `plans/active/2026-05-combobox-primitives-extraction.md`.
- *Dual listbox needs an implementation* — `packages/components/src/stories/DualListbox.mdx` is a seed stub. Add component + Storybook story
