---
title: "Sidebar (shadcn base-ui port)"
status: active
kind: exec-spec
created: "2026-05"
last_reviewed: "2026-05-15"
area: "src/components/sidebar"
promoted_to: ""
superseded_by: ""
---

# Re-implement shadcn base-ui Sidebar in pattern-plgrnd

## Context

The brief is to bring the shadcn base-ui Sidebar (`https://ui.shadcn.com/docs/components/base/sidebar`) into this project, _"structurally and behaviourally exactly the reference, with this project's styling setup"_ — the React composition tree, prop API, data-attribute surface, cookie/keyboard/breakpoint behaviour, and every sub-component name must match the reference. Only the visual layer is translated: shadcn's Tailwind utility soup becomes plain CSS in `src/styles/sidebar.css`, driven by the same `data-*` attributes shadcn already emits.

The project today uses radix (`@radix-ui/react-dialog` and `@radix-ui/react-visually-hidden` as direct deps; `@radix-ui/react-hover-card`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip` etc. as transitives via the `radix-ui` meta-package). Per the user's confirmed choice, the sidebar introduces `@base-ui/react` as a _new_ first-class dep — this is the first base-ui consumer in the project. Existing radix usage stays as-is.

## Architecture at a glance

```
SidebarProvider (Context + cookie + keyboard shortcut + Tooltip.Provider)
├── if !isMobile:
│   └── Sidebar
│       ├── data-state, data-collapsible, data-variant, data-side on outer + container
│       ├── SidebarRail (toggle handle)
│       └── children: Header / Content (Group → GroupLabel / GroupAction / GroupContent → Menu → MenuItem → MenuButton+MenuAction+MenuBadge / MenuSub → MenuSubItem → MenuSubButton) / Footer / Separator / Input
├── if isMobile (≤767px):
│   └── Dialog.Root (base-ui) → Portal / Backdrop / Popup with data-mobile="true"
└── useSidebar() hook → consumers (e.g. SidebarTrigger) read state/toggle

useRender/mergeProps (base-ui) is the slot primitive on the 5 sub-components
that accept `render` props:
  SidebarGroupLabel, SidebarGroupAction,
  SidebarMenuButton, SidebarMenuAction, SidebarMenuSubButton

SidebarMenuButton additionally wraps its rendered element in
  Tooltip.Root → Tooltip.Trigger(render=) → Tooltip.Positioner → Tooltip.Popup
when a tooltip prop is provided; the popup is hidden unless state==="collapsed" && !isMobile.

Styling flows entirely through data-* attribute selectors in sidebar.css.
The token block (--sidebar, --sidebar-foreground, etc.) is scoped under
[data-slot="sidebar-wrapper"] and mapped to the existing oklch palette.
```

## Reference fidelity targets (non-negotiable)

- **23 named exports**: `Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, plus `useSidebar` hook.
- **Constants verbatim**: `SIDEBAR_COOKIE_NAME = "sidebar_state"`, `SIDEBAR_COOKIE_MAX_AGE = 60*60*24*7`, `SIDEBAR_WIDTH = "16rem"`, `SIDEBAR_WIDTH_MOBILE = "18rem"`, `SIDEBAR_WIDTH_ICON = "3rem"`, `SIDEBAR_KEYBOARD_SHORTCUT = "b"`.
- **Data attributes**: `data-state ∈ {expanded, collapsed}`, `data-collapsible ∈ {offcanvas, icon, ""}`, `data-variant ∈ {sidebar, floating, inset}`, `data-side ∈ {left, right}`, `data-slot="sidebar-*"`, `data-sidebar="*"`, `data-active`, `data-size`, `data-mobile`.
- **base-ui primitives**: `useRender({ render, props })` from `@base-ui/react/use-render`, `mergeProps` from `@base-ui/react/merge-props`, `Tooltip` from `@base-ui/react/tooltip`, `Dialog` from `@base-ui/react/dialog`.
- **Behaviour**: Cmd/Ctrl+B on `window`, `document.cookie` write on every `setOpen`, controlled/uncontrolled props (`open`, `defaultOpen`, `onOpenChange`), mobile breakpoint 768px (`matchMedia('(max-width: 767px)')` + `innerWidth < 768`).
- **Tooltip on `SidebarMenuButton`**: `hidden={state !== "collapsed" || isMobile}`, side `right`.

## New dependency

`@base-ui/react` (v1.4.1+). Subpath imports `/use-render`, `/merge-props`, `/tooltip`, `/dialog`.

## Files

### New

- `src/components/sidebar/Sidebar.tsx` — all 23 sub-components, `SidebarContext`, `useSidebar`, constants, mobile Sheet built inline from `Dialog.Root/Portal/Backdrop/Popup`, tooltip composition with base-ui `Tooltip`. Direct port of the shadcn reference, with the substitutions table below.
- `src/components/sidebar/index.ts` — re-export of the public API.
- `src/components/sidebar/use-is-mobile.ts` — `useIsMobile()` hook, `MOBILE_BREAKPOINT = 768`, `matchMedia('(max-width: 767px)')` listener + `innerWidth < 768` initial read.
- `src/styles/sidebar.css` — plain CSS in `@layer components`. Token block scoped under `[data-slot="sidebar-wrapper"]`. Mobile Sheet animations under `@media (prefers-reduced-motion: no-preference)`, reusing `--animation-slide-in-*` / `--animation-slide-out-*` from `src/styles/animation.css` (same approach `src/styles/drawer.css:95-113` already uses).
- `src/stories/actions/navigation/Sidebar.stories.tsx` — stories exercising every variant matrix (sidebar/floating/inset × left/right × offcanvas/icon/none), header/footer/group/menu/sub-menu composition, controlled-open demo, mobile-viewport demo. Title `Actions/Navigation/Sidebar` per `docs/specs/storybook-taxonomy.md`. Tag set matches `src/stories/actions/application/Drawer.stories.tsx`. Mock data via `@faker-js/faker`.

### Modified

- `package.json` — add `@base-ui/react` to `dependencies`.
- `src/styles/main.css` — add one line `@import url(sidebar.css);` near the other component imports.

### Not modified

- No changes to `src/components/register-all.ts`.
- No changes to `src/styles/variables.css`.
- No `.mdx` companion (story-only per user voice preference; tracked under "Out of scope").

## Substitution table (reference → this project)

| shadcn reference symbol | This project |
|---|---|
| `cn` from `lib/utils` | `clsx` from `clsx` (already in `dependencies`) |
| `useIsMobile` | `useIsMobile` from `./use-is-mobile` |
| `Button` (only in `SidebarTrigger`) | `<button is="pp-button" className="button button--plain">` — same as `src/stories/operations/Button.stories.tsx` |
| `Input` (only in `SidebarInput`) | native `<input className="sidebar-input">` |
| `Separator` | inline `<div role="separator" className="sidebar-separator-line">` |
| `Skeleton` | inline `<div className="sidebar-skeleton-bar">` |
| `Sheet*` (mobile) | inline base-ui `Dialog.Root/Portal/Backdrop/Popup` + visually-hidden `Dialog.Title` |
| `Tooltip*` | base-ui `Tooltip.Provider/Root/Trigger/Portal/Positioner/Popup` |
| `IconPlaceholder` | `<iconify-icon icon="ph:sidebar-simple">` |
| `cva` variant strings | `data-variant` / `data-size` attributes set via `useRender`'s `state`; CSS keys off those attributes |
| Class names with `cn-` prefix | drop prefix — selectors target `data-slot` directly |

## Sidebar.tsx specifics

- `SidebarContext` shape: `{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }`.
- `SidebarProvider` props: `defaultOpen?: boolean`, `open?: boolean`, `onOpenChange?: (open: boolean) => void`, plus passthrough `React.ComponentProps<"div">`. Controlled/uncontrolled rule: `const open = openProp ?? _open`.
- `setOpen` writes the cookie on every call: `document.cookie = \`${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}\``.
- Keyboard shortcut effect: `window.addEventListener('keydown', ...)` checking `event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)`.
- Mobile branch: `<Dialog.Root open={openMobile} onOpenChange={setOpenMobile}>` with `Dialog.Portal`, `Dialog.Backdrop` (`data-slot="sidebar-mobile-backdrop"`), `Dialog.Popup` (`data-slot="sidebar"` + `data-mobile="true"` + inline `style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}`), and a visually-hidden `Dialog.Title` / `Dialog.Description`.
- Tooltip composition inside `SidebarMenuButton`: `useRender({ render: !tooltip ? render : <Tooltip.Trigger render={render} />, ... })`, then wrap with `<Tooltip.Root>{comp}<Tooltip.Portal><Tooltip.Positioner side="right" align="center"><Tooltip.Popup hidden={state !== "collapsed" || isMobile}>{tooltipContent}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root>`. `<Tooltip.Provider>` wraps the whole `SidebarProvider` tree.

## sidebar.css specifics

- Token block under `[data-slot="sidebar-wrapper"]`: `--sidebar: var(--c-neutral-0)`, `--sidebar-foreground: var(--c-neutral-800)`, `--sidebar-primary: var(--c-accent-500)`, `--sidebar-primary-foreground: var(--c-neutral-0)`, `--sidebar-accent: var(--c-neutral-50)`, `--sidebar-accent-foreground: var(--c-neutral-800)`, `--sidebar-border: var(--c-border)`, `--sidebar-ring: var(--c-accent-600)`. Widths set inline by `SidebarProvider`; mobile width set on the Sheet popup as `--sidebar-width: 18rem`.
- Translation patterns: utility classes → `data-*` attribute selectors.
- Transitions: `transition: left 200ms linear, right 200ms linear, width 200ms linear;` on the container; `transition: width 200ms linear;` on the gap.
- Mobile Sheet animations: reuse `--animation-slide-in-right`, `--animation-slide-in-left`, `--animation-slide-out-left`, `--animation-slide-out-right` from `src/styles/animation.css` under `@media (prefers-reduced-motion: no-preference)`.
- Existing tokens used: `--shadow-l`, `--radius-m`, `--layer-drawer` (mobile Sheet z-index), `--focus-ring`, `--focus-ring-color`.

## Story specifics

Stories under `Actions/Navigation/Sidebar`:

1. _Default_ — `variant="sidebar"`, `collapsible="offcanvas"`, left side.
2. _Icon collapsible_ — `collapsible="icon"`; tooltips appear when collapsed.
3. _Floating_ — `variant="floating"`.
4. _Inset_ — `variant="inset"`.
5. _Right side_ — `side="right"`.
6. _Controlled_ — story args drive `open` and `onOpenChange`.
7. _Mobile viewport_ — `parameters.viewport.defaultViewport = 'mobile1'`.

## Verification

1. **Lint and types**
   - `npm run test` — eslint passes.
   - `npm run test styles` — stylelint passes on `sidebar.css`.
2. **Storybook flow** (`npm run storybook`, open _Actions / Navigation / Sidebar_)
   - _Default_: sidebar renders, content area gets the gap. Click `SidebarTrigger` → `data-state` flips, layout reacts within ~200ms. Cmd/Ctrl+B → same toggle. DevTools: `sidebar_state=true|false` cookie with `max-age=604800` appears. Refresh → state restores via `defaultOpen` derivation.
   - _Icon collapsible_: collapse, hover a menu button → tooltip appears right; expand → tooltip suppressed.
   - _Floating_ / _Inset_: ring/rounded styling applies via `data-variant` selectors.
   - _Mobile viewport_ (≤767px): sidebar mounts as a base-ui Dialog, slides in from `side`, backdrop dismisses.
3. **Behavioural fidelity check**
   - `SidebarContext.Provider` value matches `{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }`.
   - Every sub-component emits its `data-slot`/`data-sidebar` attributes; `SidebarMenuButton` emits `data-active`/`data-size`.
   - Controlled `open={false}` + `defaultOpen` cookie → internal `_open` does not override.

## Out of scope (deliberately)

- No reusable React `Sheet`/`Tooltip`/`Skeleton`/`Separator`/`Input`/`Button` components in `src/components/` — inline only.
- No `IconPlaceholder` multi-pack icon switcher — single icon via `iconify-icon`.
- No RTL flip helper.
- No `.mdx` companion (story-only per user voice preference; revisit if sidebar graduates into the pattern repertoire properly).
- No migration of existing radix usage.
- No changes to global `variables.css`.
