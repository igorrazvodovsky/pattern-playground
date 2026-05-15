# Plan: migrate from @radix-ui to base-ui

## Context

Switch the repo from Radix UI to Base UI (https://base-ui.com/, the MUI-maintained successor to Radix-style primitives). Scope is small — only 5 source files import `@radix-ui/*`, and only 2 Radix packages are listed in `package.json` (the other two are imported but currently resolved transitively). The goal is a clean cut: no `@radix-ui/*` imports remain, and `package.json` no longer lists Radix packages.

## Package changes

- Add: `@base-ui/react@^1.4.1` (canonical npm name today; the older `@base-ui-components/react@1.0.0-rc.0` points to the same MUI repo and is being deprecated by name change).
- Remove from `dependencies` in `/Users/igors.razvodovskis/Development/pattern-plgrnd/package.json`:
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-visually-hidden`
- No deps to remove for `@radix-ui/react-hover-card` or `@radix-ui/react-slot` — they are imported in source but not declared (currently resolved transitively, likely via `tldraw`). After this migration their imports disappear too.

## API mapping (decided)

| Radix | Base UI |
|---|---|
| `@radix-ui/react-dialog` Dialog.Root | `@base-ui/react/dialog` Dialog.Root |
| `Dialog.Content` | `Dialog.Portal` → `Dialog.Popup` (Backdrop optional) |
| `Dialog.Title` / `Dialog.Description` / `Dialog.Close` | same names under Base UI Dialog |
| `Dialog`'s `onFocusOutside` / `onPointerDownOutside` (preventDefault to stay open) | `onOpenChange(open, eventDetails)` — call `eventDetails.preventDefault()` when `eventDetails.reason` is `outside-press` / `focus-out` |
| `data-state="open"\|"closed"` (CSS hook) | `data-open` / `data-closed` (boolean attributes) |
| `@radix-ui/react-visually-hidden` | _new_ `.visually-hidden` CSS utility class (decided) |
| `@radix-ui/react-hover-card` HoverCard | `@base-ui/react/preview-card` PreviewCard |
| `HoverCard.Root openDelay closeDelay` | delay props move to `PreviewCard.Trigger`: `delay` / `closeDelay` |
| `HoverCard.Content side sideOffset align avoidCollisions` | `PreviewCard.Positioner side sideOffset align collisionAvoidance` wrapping `PreviewCard.Popup` |
| `HoverCard.Trigger asChild` | `PreviewCard.Trigger render={singleElement}` (default element is `<a>`, so always pass `render` to keep current behavior) |
| `HoverCard.Arrow` | `PreviewCard.Arrow` |
| `@radix-ui/react-slot` `<Slot>` used as `asChild` (combobox) | `React.cloneElement` with manual prop-merging — see note below |
| `<Slot slot="prefix">…</Slot>` prop-injection idiom (ai-fallback, filter) | `React.cloneElement(child, { slot: 'prefix' })` |

Note on the combobox `asChild` path: Base UI's idiomatic asChild replacement is the `useRender` hook, but `useRender`'s `defaultTagName` only accepts an HTML tag string — it does not fit when the "default" is a 3rd-party React component (`cmdk`'s `ComboboxPrimitive.Item`). For this single call site we use `React.cloneElement` with className-merging instead, which is a 3-line replacement and preserves the public `asChild` API of `ComboboxItem`. This still removes the `@radix-ui/react-slot` import.

## Files to change

### 1. `/Users/igors.razvodovskis/Development/pattern-plgrnd/package.json`
- Remove the two `@radix-ui/*` entries listed above.
- Add `@base-ui/react`.

### 2. `/Users/igors.razvodovskis/Development/pattern-plgrnd/src/tldraw/components/OnCanvasComponentPicker.tsx`
- Replace imports: `Dialog` from `@base-ui/react/dialog`; drop `VisuallyHidden` import.
- Rewrite the dialog body so `Dialog.Content` becomes `Dialog.Portal > Dialog.Popup`. The `ref={setContainer}` and `className` move to `Dialog.Popup`. The `style={{ width: NODE_WIDTH_PX }}` (kept inline because the file already has a lint-disable comment justifying it) moves to `Dialog.Popup` as well.
- Replace `<VisuallyHidden.Root><Dialog.Title>Insert Node</Dialog.Title></VisuallyHidden.Root>` with `<Dialog.Title className="visually-hidden">Insert Node</Dialog.Title>`.
- Replace `onFocusOutside` / `onPointerDownOutside` with logic in `onOpenChange` that inspects `eventDetails.reason` and calls `eventDetails.preventDefault()` for outside-press and focus-out reasons (verify exact reason strings against Base UI's Dialog docs at implementation time).

### 3. `/Users/igors.razvodovskis/Development/pattern-plgrnd/src/components/hover-card/HoverCard.tsx`
- Replace import with `PreviewCard` from `@base-ui/react/preview-card`.
- Keep the existing `PpHoverCard` public API (`openDelay`, `closeDelay`, `side`, `sideOffset`, `align`, `showArrow`, `avoidCollisions`, `content`, `children`) unchanged.
- Internally: pass `delay={openDelay}` and `closeDelay={closeDelay}` to `PreviewCard.Trigger`; wrap `children` with `<PreviewCard.Trigger render={children}>`; insert `<PreviewCard.Positioner side sideOffset align collisionAvoidance={avoidCollisions}>` around `<PreviewCard.Popup className="hover-card__content">`; arrow becomes `<PreviewCard.Arrow className="hover-card__arrow">`.
- Verify that passing a single React element as `render` is the right shape (Base UI accepts both element and callback).

### 4. `/Users/igors.razvodovskis/Development/pattern-plgrnd/src/styles/hover-card.css`
- Line 21: `.hover-card__content[data-state="open"]` → `.hover-card__content[data-open]`.
- Line 25: `.hover-card__content[data-state="closed"]` → `.hover-card__content[data-closed]`.
- No other selectors in this file need changes.

### 5. `/Users/igors.razvodovskis/Development/pattern-plgrnd/src/styles/main.css`
- Add a `.visually-hidden` utility class in the existing `utilities` cascade layer. Standard sr-only ruleset: `position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0`.
- This replaces `@radix-ui/react-visually-hidden` and is the only new CSS introduced.

### 6. `/Users/igors.razvodovskis/Development/pattern-plgrnd/src/components/combobox/combobox.tsx`
- Drop the `import { Slot } from "@radix-ui/react-slot"` line.
- Drop the local `Comp = asChild ? Slot : ComboboxPrimitive.Item` indirection.
- In the `if (asChild)` branch, replace the `<Slot ref className>{children}</Slot>` render with `React.cloneElement(children, { ref, className: <merged> })`, after `React.isValidElement(children)` guard. Merge classes with the child's existing `className`.
- The native HTML `slot="prefix"` / `slot="suffix"` usages on `<span>` (lines 187, 202) are unaffected — those are real HTML slot attributes, unrelated to Radix.

### 7. `/Users/igors.razvodovskis/Development/pattern-plgrnd/src/components/command-menu/ai-fallback-handler.tsx`
- Drop the `Slot` import.
- Replace every `<Slot slot="prefix">{element}</Slot>` and `<Slot slot="suffix">{element}</Slot>` with `React.cloneElement(element, { slot: 'prefix' })` / `'suffix'`. There are ~6 such sites; each wraps a single child (typically `<Icon>` or `<small>` / `<span>`), so cloneElement is a direct fit. Preserve existing `key` props.

### 8. `/Users/igors.razvodovskis/Development/pattern-plgrnd/src/components/filter/filter-components.tsx`
- Drop the `Slot` import.
- The only `<Slot slot="prefix">{filter.icon}</Slot>` at line 150 becomes `React.cloneElement(filter.icon as React.ReactElement, { slot: 'prefix' })`. The other `slot="prefix"` / `slot="suffix"` usages in this file are on raw JSX elements (not Slot) and need no change.

## Files to read before editing (referenced by the plan)

- `src/styles/main.css` (to locate the `utilities` layer for the new `.visually-hidden` rule).
- Base UI Dialog docs for the exact `eventDetails.reason` strings and the `onOpenChange` signature, before rewriting `OnCanvasComponentPicker.tsx`'s dismiss logic. The Base UI repo at `mui/base-ui` packages/react is the source of truth.

## Verification

End-to-end checks after the migration is implemented:

1. `grep -rn "@radix-ui" /Users/igors.razvodovskis/Development/pattern-plgrnd/src` returns no matches.
2. `grep -rn "@radix-ui" /Users/igors.razvodovskis/Development/pattern-plgrnd/package.json` returns no matches.
3. `npm install` succeeds; no peer dep warnings about React 19 from Base UI.
4. `npm run test` (eslint) passes.
5. `npm run storybook` and visually verify:
   - `src/stories/activities/Workflow.stories.tsx` — `PpHoverCard` opens on hover with the same delay, position, and animation as before; closes on mouseout; arrow renders when `showArrow` is true.
   - `src/stories/operations/Combobox.stories.tsx` and `src/stories/operations/Autocomplete.stories.tsx` — items render with prefix/suffix slots intact; the `asChild` code path renders a custom item without losing className or ref.
   - Filter dropdown (wherever it appears in stories) — prefix icons render inside combobox items.
6. In a real tldraw editor session, drag a connection handle to empty canvas: `OnCanvasComponentPicker` opens, stays positioned at the terminal during pan/zoom, does not dismiss on focus-out/pointer-down-outside, and dismisses on escape and on explicit `onClose`.
7. `grep -rn 'data-state' /Users/igors.razvodovskis/Development/pattern-plgrnd/src/styles` returns only the tldraw selectors in `tldraw.css` (which are tldraw editor state, not Radix).

## Risks

- Base UI's `Dialog.Root` dismiss control via `onOpenChange(open, eventDetails)` may not expose the exact `reason` values needed to suppress both pointer-down-outside and focus-out the way Radix did. If the equivalent is missing, the picker may dismiss on canvas click — to be verified in step 6 above, with a fallback of catching pointer events at the `Dialog.Popup` boundary.
- `PreviewCard.Trigger` defaults to an `<a>` element. We always pass `render={children}` to take over the rendered element, but verify the children passed by callers always satisfy "single valid React element" (otherwise `render` won't work and we'd need a wrapping `<span>`).
- `React.cloneElement` in the asChild path of `ComboboxItem` requires `React.isValidElement(children)` — callers passing `null`/arrays will need explicit handling. The current code does not guard this; the new code should.
